import React, { PureComponent, Fragment } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Form, Upload, message, Button, Icon, Table, Modal, Tooltip } from 'antd';
import XLSX from 'xlsx';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';


import { queryLoadgoodLocation, ImgUrl, getBase64 } from '../../utils/utils';
import { getUserToken,getSupplyId } from '../../utils/sessionStorage';
import { addGoods, addGoodsDetails, querynocodeGoodslocation } from '../../services/api';




@connect(({ goods, loading }) => ({
    goods,
    loading: loading.models.goods,
}))
@Form.create()
export default class UploadInventoryNoCode extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            dataSource1: [],
            dataSource2: [],
            sum1: 0,
            sum2: 0,
            sum3: 0,
            visible: false,
            suppliers: true,
            goods: true,
            batchno: true,
            area: true,
            location: true,
            tagno: true,
            weight: true,
            id: '',
            areas: '',
            material: '',
            tagnoList: []
        }
    }

    componentDidMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'goods/fetchSupplierArea',
            payload: `paging=false&terms[0].value=${getSupplyId()}&terms[0].column=supplyid&terms[1].value=1&terms[1].column=issupply`,
        });
    }

    handleChange = (file) => {

    }

    createDataSource1 = (arr) => {
        const { dispatch } = this.props;
        const { SupplierArea } = this.props.goods;
        const that = this;
        const datas = arr[1];
        const supplierCheck = false;
        let areaCheck = false;
        let goodss = false;
        let batchno = false;
        const areas = '';
        const data = [];

       

        for(let i=1;i<arr.length;i+=1){
            const vail = {
                key:i,
                colorname:arr[i][0]?arr[i][0]:'',
                productname:arr[i][1]?arr[i][1]:'',
                batchno: arr[i][2]?arr[i][2]:'',
                areaname:arr[i][3]?arr[i][3]:'',
                tagno:arr[i][4]?arr[i][4]:'',
                glossweight: (typeof arr[i][5] === 'undefined' ? 0 :  arr[i][5]),
                weight: (typeof arr[i][6] === 'undefined' ? 0 :  arr[i][6]),
                num: (typeof arr[i][7] === 'undefined' ? 0 :  arr[i][7]),
                location:arr[i][8]?arr[i][8]:'',
                remake:arr[i][9]?arr[i][9]:'',
                nobatchnostatus:true,
                locationstatus:false,
                notagnostatus:true,
                productid:'',
            }
            data.push(vail);
               
            
        }
        // let data = [{
        //     key: '0',
        //     colorname: datas[0] ? datas[0] : '',
        //     productname: datas[1] ? datas[1] : '',
        //     batchno: datas[2] ? datas[2] : '',
        //     // supplier: datas[3] ? datas[3] : '',
        //     area: datas[4] ? datas[4] : '',
        //     paperweight: (typeof datas[5] === 'undefined' ? 0 : datas[5]),
        //     wrapperweight: (typeof datas[6] === 'undefined' ? 0 : datas[6]),
        // }];
        // SupplierArea.supplierList.map(item => {
        //     if (item.name === data[0].supplier) {
        //         supplierCheck = true;
        //     }
        // })
        let colorTerms = `terms[0].column=colorname&terms[1].column=productname&terms[0].termType=in&terms[1].termType=in`;
        const batchnoMap =new Map();
        data.forEach(dataitem=>{
           
            SupplierArea.areaList.map(item => {
           
                if (item.key ===dataitem.areaname) {
                    areaCheck = true;
                    const tmp={
                        area:item.value,
                    }
                    Object.assign(dataitem,tmp);
                }
            });
            batchnoMap.set(`${dataitem.colorname-dataitem.batchno}`,dataitem);
            colorTerms += `&terms[0].value=${dataitem.colorname}&terms[1].value=${dataitem.productname}`;
        });
        
        
        dispatch({
            type: 'goods/nocodequeryGoods',
            payload: {
                colorTerms,
                batchnoMap,
                data,
            },
            callback: (goodData) => {
                message.success('载入完成');
                that.setState({
                    dataSource1: goodData,
                    area: true,
                })
            },
        });
    }

    createDataSource2 = (arr) => {
        const datas = arr.splice(3);
        let weight = true;
        const data = [];
        let sum1 = 0;
        let sum2 = 0;
        let sum3 = 0;
        const number = (num) => {
            if (num * 1 < 10) {
                return `00${num}`;
            } else if (num * 1 < 100) {
                return `0${num}`;
            } else {
                return num
            }
        }
        for (let i = 0, len = datas.length; i < len; i++) {
            if (datas[i][1] < datas[i][2]) {
                weight = false;
            }
            data.push({
                key: `${i}`,
                tagno: number(datas[i][0]),
                glossweight: datas[i][1],
                weight: datas[i][2],
                num: datas[i][3],
                location: datas[i][4],
            })
            sum1 += (typeof datas[i][1] !== 'number' ? 0 : datas[i][1]);
            sum2 += (typeof datas[i][2] !== 'number' ? 0 : datas[i][2]);
            sum3 += (typeof datas[i][3] !== 'number' ? 0 : datas[i][3]);
        }
        this.setState({
            dataSource2: data,
            sum1: sum1.toFixed(2) * 1,
            sum2: sum2.toFixed(2) * 1,
            sum3: sum3.toFixed(2) * 1,
            weight,
        });
    }

    footerContent = () => {
        const column = [{
            title: '',
            dataIndex: 'a1',
            key: 'a1',
            align: 'center',
        }, {
            title: '总毛重(Kg)',
            dataIndex: 'a2',
            key: 'a2',
            align: 'center',
        }, {
            title: '总净重(Kg)',
            dataIndex: 'a3',
            key: 'a3',
            align: 'center',
        }, {
            title: '总只数',
            dataIndex: 'a4',
            key: 'a4',
            align: 'center',
        }, {
            title: '',
            dataIndex: 'a5',
            key: 'a5',
            align: 'center',
            render: (val, record, index) => {
                return <Button type="primary" onClick={this.handleSave}>保存</Button>
            },
        }];
        const dataSource = [{
            key: '0',
            a1: '合计',
            a2: this.state.sum1,
            a3: this.state.sum2,
            a4: this.state.sum3,
            a5: ''
        }];
        return <Table columns={column} dataSource={dataSource} pagination={false} />
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    }

    handleCancel = () => {
        this.setState({
            visible: false,
        });
    }
    success=(reponse)=>{
     
    }
    uploadonchange =(info) =>{

        if (info.event  !==undefined) {
                console.log("info",info);
                 const that = this;
                const rABS = true;
                const f = info.fileList[0].originFileObj;
                const reader = new FileReader();
                reader.onload = (e) => {
                    let data = e.target.result;
                    if (!rABS) data = new Uint8Array(data);
                    const workbook = XLSX.read(data, {
                        type: rABS ? 'binary' : 'array',
                    });
                    const first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonArr = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
                    that.setState({ excelData: jsonArr });
                    that.createDataSource1(jsonArr);
                   // that.createDataSource2(jsonArr);
                };
                if (rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
                return false;
          }
       
    }

    handleSave = () => {
        message.config({
            top: 100,
          });
          const hide = message.loading(`正在提交...`, 0);
        const { dataSource1} = this.state;
        for(let i = 0;i<dataSource1.length;i+=1){
            if( dataSource1[i].notagnostatus === false|| dataSource1[i].locationstatus===false  || dataSource1[i].productid === ''){
                message.warn("有错误信息，请修正，重新导入");
                setTimeout(hide,100);
                return;
            }
        }
        this.putItem(0,dataSource1);
        setTimeout(hide,1000);
    }

    putItem = (i, dataSource1) => {
        const startTime = moment().format('YYYYMMDDHHmmss');
        const goodsParams = {
            area: `${dataSource1[i].area}`,
            deliverydate: '',
            deliveryid: `${dataSource1[i].batchno}_${startTime}`,
            purchaseid: `${dataSource1[i].batchno}_${startTime}`,
            type: 3,
        };
        const details = {
            batchno: dataSource1[i].batchno,
            material: this.state.material,
            totalgw: 0,
            totalnw: 0,
            allpiecenum: 0,
            remainnum: 0,
            piecenum: 0,
            productid: dataSource1[i].productid,
            supplyid: getSupplyId(),
            batchnostatus: 2,
            pieceroughweight:0,
            pieceweight:0,
            paperweight: 0,
            wrapperweight: 0,
        };
        const item = {
            glossweight: dataSource1[i].glossweight,
            location: dataSource1[i].location,
            productid: dataSource1[i].productid,
            weight:dataSource1[i].weight,
            num:dataSource1[i].num,
            supplyid: getSupplyId(),
            batchno: dataSource1[i].batchno,
            tagno: dataSource1[i].tagno,
            area: dataSource1[i].area,
            batchnostatus: 2,
        };
        
        const payloadItem ={
            goodsParams,
            details,
            item,
        }
        
        this.props.dispatch({
            type:'goods/addnocode',
            payload:payloadItem,
            callback:(res=>{
                if (res && res.status === 200) {
                    i += 1;
                    if (i !== dataSource1.length) {
                        this.putItem(i, dataSource1);
                    } else if (i >= dataSource1.length) {
                        message.success('录入成功');
                        this.props.dispatch(routerRedux.push(`/goods/goodsstock`));
                    }
                } else {
                    message.error('录入失败');
                }
            }),
        })


        // addGoodsLocations(list[idx]).then(res => {
        //     if (res && res.status === 200) {
        //         idx += 1;
        //         if (idx !== list.length) {
        //             this.putItem(idx, list);
        //         } else if (idx >= list.length) {
        //             message.success('录入成功');
        //             this.props.dispatch(routerRedux.push(`/goods/goodsstock`));
        //         }
        //     } else {
        //         message.error('录入失败');
        //     }
        // });
    }

    render() {
        const { locationList } = this.props.goods;
        console.log("locationList",locationList);
        const columns1 = [{
            title: '色号',
            dataIndex: 'colorname',
            key: 'colorname',
            align: 'center',
            render: (val,record) => {
                if (record.productid !== '') {
                    return (<p style={{ margin: 0 }}>{val}</p>);
                } else {
                    return (
                      <Tooltip placement='top' title='找不到该产品(色号或者色称错误)'>
                        <p style={{ color: '#f00', margin: 0 }}>{val}</p>
                      </Tooltip>
                    );
                }
            },
        }, {
            title: '色称',
            dataIndex: 'productname',
            key: 'productname',
            align: 'center',
            render: (val,record) => {
                if (record.productid !== '') {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else {
                    return (
                      <Tooltip placement='top' title='找不到该产品(色号或者色称错误)'>
                        <p style={{ color: '#f00', margin: 0 }}>{val}</p>
                      </Tooltip>
                    )
                }
            },
        }, {
            title: '缸号',
            dataIndex: 'batchno',
            key: 'batchno',
            align: 'center',
            render: (val,record) => {
                if (record.nobatchnostatus) {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else {
                    return (
                      <Tooltip placement='top' title='缸号已存在'>
                        <p style={{ color: '#f8df00', fontSize:17, margin: 0 }}>{val}</p>
                      </Tooltip>
                    )
                }
            },
        }, 
        // {
        //     title: '供应商',
        //     dataIndex: 'supplier',
        //     key: 'supplier',
        //     align: 'center',
        //     render: (val) => {
        //         if (this.state.suppliers) {
        //             return (<p style={{ margin: 0 }}>{val}</p>)
        //         } else {
        //             return (
        //               <Tooltip placement='top' title='供应商不存在'>
        //                 <p style={{ color: '#f00', margin: 0 }}>{val}</p>
        //               </Tooltip>
        //             )
        //         }
        //     },
        // }, 
        {
            title: '仓库',
            dataIndex: 'areaname',
            key: 'areaname',
            align: 'center',
            render: (val,record) => {
                if (record.area !== undefined) {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else {
                    return (
                      <Tooltip placement='top' title='仓库不存在'>
                        <p style={{ color: '#f00', margin: 0 }}>{val}</p>
                      </Tooltip>
                    )
                }
            },
        }, {
            title: '箱号',
            dataIndex: 'tagno',
            key: 'tagno',
            align: 'center',
            render: (val,record) => {
                if (record.notagnostatus) {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else {
                    return (
                      <Tooltip placement='top' title='箱号重复'>
                        <p style={{ margin: 0, color: '#f00' }}>{val}</p>
                      </Tooltip>
                    )
                }
            },
        }, {
            title: '毛重(Kg)',
            dataIndex: 'glossweight',
            key: 'glossweight',
            align: 'center',
            render: val => {
                if (typeof val !== 'number') {
                    return (
                      <Tooltip placement="top" title='值为数字'>
                        <p style={{ margin: 0, color: '#f00' }}>{val}</p>
                      </Tooltip>
                    )
                } else {
                    return (<p style={{ margin: 0 }}>{val}</p>);
                }
            },
        }, {
            title: '净重(Kg)',
            dataIndex: 'weight',
            key: 'weight',
            align: 'center',
            render: (val, record, index) => {
                if (val <= record.glossweight && val !== 0) {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else if (typeof val !== 'number') {
                    return (
                      <Tooltip placement="top" title='值为数字'>
                        <p style={{ margin: 0, color: '#f00' }}>{val}</p>
                      </Tooltip>
                    )
                } else {
                    return (
                      <Tooltip placement="top" title='净重不可大于毛重'>
                        <p style={{ margin: 0, color: '#f00' }}>{val}</p>
                      </Tooltip>
                    )
                }
            },
        }, {
            title: '只数',
            dataIndex: 'num',
            key: 'num',
            align: 'center',
            render: val => {
                if (typeof val !== 'number') {
                    return (
                      <Tooltip placement="top" title='值为数字'>
                        <p style={{ margin: 0, color: '#f00' }}>{val}</p>
                      </Tooltip>
                    )
                } else {
                    return (<p style={{ margin: 0 }}>{val}</p>);
                }
            },
        }, {
            title: '存放区域',
            dataIndex: 'location',
            key: 'location',
            align: 'center',
            render: (val,record) => {
                if (record.locationstatus) {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else {
                    return (
                      <Tooltip placement="top" title='区域不存在'>
                        <p style={{ margin: 0, color: '#f00' }}>{val}</p>
                      </Tooltip>
                    )
                }
            },
        
        },
        {
            title: '备注',
            dataIndex: 'remake',
            key: 'remake',
            align: 'center',
            
            
        }];

        const headers = {
            Authorization: `Bearer ${getUserToken()}`,
            // credentials: 'same-origin',
            // 'Content-Type': 'multipart/form-data', 
        };
        const property = {
            showUploadList: false,
            headers,
            name:"file",
            action: queryLoadgoodLocation(),
            accept: '.xls, .xlsx',
           // onChange: this.uploadonchange,
            beforeUpload: (file, fileList) => {
                const that = this;
                const rABS = true;
                const f = fileList[0];
                const reader = new FileReader();
                reader.onload = (e)=> {
                    let data = e.target.result;
                    if (!rABS) data = new Uint8Array(data);
                    const workbook = XLSX.read(data, {
                        type: rABS ? 'binary' : 'array',
                    });
                    const first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonArr = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
                    that.setState({ excelData: jsonArr });
                    that.createDataSource1(jsonArr);
                   // that.createDataSource2(jsonArr);
                };
                if (rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
                return false;
            },
        }

        return (
          <Fragment>
              <div>
                {/* <input type="file" onChange={(e,v)=>this.uploadonchange(e,v)}/> */}
                <Upload 
                //   headers={headers} 
                //   name="file" 
                //   action={queryLoadgoodLocation()}
                //   onSuccess={this.aaa}
                //   onChange={this.uploadonchange} 
                {...property}
                >
                  <Button>
                    <Icon type="upload" /> 上传文件
                  </Button>
                </Upload>
                <Button type="dashed" style={{ marginLeft: 15 }}><a href="http://www.nxcip.com/upload/20190409/14873503909886360.xls">Excel表格样式</a></Button>
                <Button type="primary" style={{ marginLeft: 15 }} onClick={this.handleSave}>保存</Button>
              </div>
              <Table
                dataSource={this.state.dataSource1}
                columns={columns1}
                pagination={false}
              />

              <Modal
                title='Excel表格'
                footer={false}
                visible={this.state.visible}
                onCancel={this.handleCancel}
                width={780}
              >
                <img alt="" src={`${ImgUrl}`} />
              </Modal>
          </Fragment>
        )
    }
}