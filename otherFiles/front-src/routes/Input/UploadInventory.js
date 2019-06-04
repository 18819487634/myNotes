import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { routerRedux } from 'dva/router';
import { Form, Upload, message, Button, Icon, Table, Modal, Tooltip } from 'antd';
import { getUploadStaticUrl, ImgUrl } from '../../utils/utils';
import { getUserToken } from '../../utils/sessionStorage';
import { addGoods, addGoodsDetails, addGoodsLocations } from '../../services/api';
import { getSupplyId } from '../../utils/sessionStorage';

import XLSX from 'xlsx';
import moment from 'moment';

@connect(({ goods, loading }) => ({
    goods,
    loading: loading.models.goods,
}))
@Form.create()
export default class UploadInventory extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            excelData: [],
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
            payload: `paging=false&terms[0].value=${getSupplyId()}&terms[0].column=supplyid&terms[1].value=1&terms[1].column=issupply`
        });
    }

    handleChange = (file) => {

    }

    createDataSource1 = (arr) => {
        const { dispatch } = this.props;
        const { SupplierArea } = this.props.goods;
        const that = this;
        let datas = arr[1];
        let supplierCheck = false;
        let areaCheck = false;
        let goodss = false;
        let batchno = false;
        let areas = '';
        let data = [{
            key: '0',
            colorname: datas[0] ? datas[0] : '',
            productname: datas[1] ? datas[1] : '',
            batchno: datas[2] ? datas[2] : '',
            supplier: datas[3] ? datas[3] : '',
            area: datas[4] ? datas[4] : '',
            paperweight: (typeof datas[5] === 'undefined' ? 0 : datas[5]),
            wrapperweight: (typeof datas[6] === 'undefined' ? 0 : datas[6]),
        }];
        SupplierArea.supplierList.map(item => {
            if (item.name === data[0].supplier) {
                supplierCheck = true;
            }
        })
        SupplierArea.areaList.map(item => {
            if (item.key === data[0].area) {
                areaCheck = true;
                areas = item.value
            }
        })
        dispatch({
            type: 'goods/queryGoods',
            payload: {
                colorname: data[0].colorname,
                productname: data[0].productname,
                batchno: data[0].batchno
            },
            callback: (goods, tagnoList, goodsDetails) => {
                let tagno = true;
                const datalist = [];
                if (goods.goodsList > 0 && goods.id !== '') {
                    goodss = true;
                }
                if (goods.batchno === 0) {
                    batchno = true;
                }
                this.state.dataSource2.map(item => {
                    datalist.push(item.tagno);
                });
                for (let j = 0, lens = datalist.length; j < lens; j++) {
                    if (tagnoList.indexOf(datalist[j]) !== -1) {
                        tagno = false;
                    }
                }
                that.setState({
                    id: goods.id,
                    dataSource1: data,
                    suppliers: supplierCheck,
                    area: areaCheck,
                    goods: goodss,
                    material: goodsDetails.yarn,
                    batchno,
                    tagnoList,
                    tagno,
                    areas
                }, () => {
                    if (this.state.area) {
                        const datalist = [];
                        let location = true;
                        let area = {};
                        SupplierArea.areaList.map(item => {
                            if (item.key === datas[4]) {
                                area = item;
                            }
                        })
                        this.state.dataSource2.map(item => {
                            datalist.push(item.location);
                        })
                        dispatch({
                            type: 'goods/queryAreaLocation',
                            payload: { locationList: datalist, area: area.value },
                            callback: (data) => {
                                for (let i = 0, len = data.length; i < len; i++) {
                                    if (datalist.indexOf(data[i]) === -1) {
                                        location = false;
                                    }
                                }
                                this.setState({
                                    location
                                })
                                message.success('载入完成');
                            }
                        })
                    } else {
                        message.success('载入完成');
                    }
                });
            }
        });
    }

    createDataSource2 = (arr) => {
        let datas = arr.splice(3);
        let weight = true;
        let data = [];
        let sum1 = 0;
        let sum2 = 0;
        let sum3 = 0;
        let number = (num) => {
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
            weight
        });
    }

    footerContent = () => {
        let column = [{
            title: '',
            dataIndex: 'a1',
            key: 'a1',
            align: 'center'
        }, {
            title: '总毛重(Kg)',
            dataIndex: 'a2',
            key: 'a2',
            align: 'center'
        }, {
            title: '总净重(Kg)',
            dataIndex: 'a3',
            key: 'a3',
            align: 'center'
        }, {
            title: '总只数',
            dataIndex: 'a4',
            key: 'a4',
            align: 'center'
        }, {
            title: '',
            dataIndex: 'a5',
            key: 'a5',
            align: 'center',
            render: (val, record, index) => {
                return <Button type="primary" onClick={this.handleSave}>保存</Button>
            }
        }];
        let dataSource = [{
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

    handleSave = () => {
        const { suppliers, goods, area, location, tagno, weight } = this.state;
        if (suppliers && goods  && area && location && tagno && weight) {
            const that = this;
            const startTime = moment().format('YYYYMMDDHHmmss');
            const goodsParams = {
                area: `${this.state.areas}`,
                deliverydate: '',
                deliveryid: `${this.state.dataSource1[0].batchno}_${startTime}`,
                purchaseid: `${this.state.dataSource1[0].batchno}_${startTime}`,
                type: 3,
            }
            const pieceroughweight = (this.state.dataSource2.reduce((total, currentValue) => {
                return total + currentValue.glossweight;
            }, 0) / this.state.dataSource2.length).toFixed(2);
            const pieceweight = (this.state.dataSource2.reduce((total, currentValue) => {
                return total + currentValue.weight;
            }, 0) / this.state.dataSource2.length).toFixed(2);
            const details = {
                batchno: this.state.dataSource1[0].batchno,
                material: this.state.material,
                totalgw: 0,
                totalnw: 0,
                allpiecenum: 0,
                remainnum: 0,
                piecenum: 0,
                productid: this.state.id,
                supplyid: getSupplyId(),
                batchnostatus: 1,
                pieceroughweight,
                pieceweight,
                paperweight: this.state.dataSource1[0].paperweight,
                wrapperweight: this.state.dataSource1[0].wrapperweight,
            }
            addGoods(goodsParams).then(res => {
                if (res && res.status === 200) {
                    const goodis = res.result;
                    details.goodid = goodis;

                    addGoodsDetails(details).then(res2 => {
                        if (res2 && res2.status === 200) {
                            const detailsid = res2.result;
                            const goodsList = [];
                            const tableList = that.state.dataSource2;
                            let check = true;
                            for (let i = 0, len = tableList.length; i < len; i++) {
                                if (tableList[i].glossweight < tableList[i].weight || typeof tableList[i].num !== 'number') {
                                    check = false;
                                    return;
                                } else {
                                    const item = {
                                        glossweight: tableList[i].glossweight,
                                        location: tableList[i].location,
                                        productid: that.state.id,
                                        weight: tableList[i].weight,
                                        num: tableList[i].num,
                                        supplyid: getSupplyId(),
                                        batchno: that.state.dataSource1[0].batchno,
                                        goodid: goodis,
                                        detailid: detailsid,
                                        tagno: tableList[i].tagno,
                                        area: that.state.areas,
                                        batchnostatus: 1,
                                    }
                                    goodsList.push(item);
                                }
                            }
                            if (check) {
                                that.putItem(0, goodsList);
                            } else {
                                message.error('录入错误');
                                return false;
                            }
                        }
                    })
                }
            });
        } else {
            message.error('提交失败');
        }
    }

    putItem = (idx, list) => {
        addGoodsLocations(list[idx]).then(res => {
            if (res && res.status === 200) {
                idx += 1;
                if (idx !== list.length) {
                    this.putItem(idx, list);
                } else if (idx >= list.length) {
                    message.success('录入成功');
                    this.props.dispatch(routerRedux.push(`/goods/goodsstock`));
                }
            } else {
                message.error('录入失败');
            }
        });
    }

    render() {
        const { locationList } = this.props.goods;
        const columns1 = [{
            title: '色号',
            dataIndex: 'colorname',
            key: 'colorname',
            align: 'center',
            render: (val) => {
                if (this.state.goods) {
                    return (<p style={{ margin: 0 }}>{val}</p>);
                } else {
                    return (
                        <Tooltip placement='top' title='色号错误'>
                            <p style={{ color: '#f00', margin: 0 }}>{val}</p>
                        </Tooltip>
                    );
                }
            }
        }, {
            title: '色称',
            dataIndex: 'productname',
            key: 'productname',
            align: 'center',
            render: (val) => {
                if (this.state.goods) {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else {
                    return (
                        <Tooltip placement='top' title='色称错误'>
                            <p style={{ color: '#f00', margin: 0 }}>{val}</p>
                        </Tooltip>
                    )
                }
            }
        }, {
            title: '缸号',
            dataIndex: 'batchno',
            key: 'batchno',
            align: 'center',
            render: (val) => {
                if (this.state.batchno) {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else {
                    return (
                      <Tooltip placement='top' title='缸号已存在'>
                        <p style={{ color: '#f8df00', fontSize:17, margin: 0 }}>{val}</p>
                      </Tooltip>
                    )
                }
            }
        }, {
            title: '供应商',
            dataIndex: 'supplier',
            key: 'supplier',
            align: 'center',
            render: (val) => {
                if (this.state.suppliers) {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else {
                    return (
                        <Tooltip placement='top' title='供应商不存在'>
                            <p style={{ color: '#f00', margin: 0 }}>{val}</p>
                        </Tooltip>
                    )
                }
            }
        }, {
            title: '仓库',
            dataIndex: 'area',
            key: 'area',
            align: 'center',
            render: (val) => {
                if (this.state.area) {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else {
                    return (
                        <Tooltip placement='top' title='仓库不存在'>
                            <p style={{ color: '#f00', margin: 0 }}>{val}</p>
                        </Tooltip>
                    )
                }
            }
        }, {
            title: '纸桶(Kg)',
            dataIndex: 'paperweight',
            key: 'paperweight',
            align: 'center',
            render: (val) => {
                if (val <= 0 || typeof val !== 'number') {
                    return (
                        <Tooltip placement='top' title='值不能为空'>
                            <p style={{ margin: 0, color: '#f00' }}>{val}</p>
                        </Tooltip>
                    )
                } else {
                    return (<p style={{ margin: 0 }}>{val}</p>);
                }
            }
        }, {
            title: '包装袋(Kg)',
            dataIndex: 'wrapperweight',
            key: 'wrapperweight',
            align: 'center',
            render: (val) => {
                if (val <= 0 || typeof val !== 'number') {
                    return (
                        <Tooltip placement='top' title='值不能为空'>
                            <p style={{ margin: 0, color: '#f00' }}>{val}</p>
                        </Tooltip>
                    )
                } else {
                    return (<p style={{ margin: 0 }}>{val}</p>);
                }
            }
        }];
        const columns2 = [{
            title: '箱号',
            dataIndex: 'tagno',
            key: 'tagno',
            align: 'center',
            render: val => {
                if (this.state.tagnoList.indexOf(val + '') === -1) {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else {
                    return (
                        <Tooltip placement='top' title='箱号重复'>
                            <p style={{ margin: 0, color: '#f00' }}>{val}</p>
                        </Tooltip>
                    )
                }
            }
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
            }
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
            }
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
            }
        }, {
            title: '存放区域',
            dataIndex: 'location',
            key: 'location',
            align: 'center',
            render: (val) => {
                if (locationList.indexOf(val) !== -1) {
                    return (<p style={{ margin: 0 }}>{val}</p>)
                } else {
                    return (
                        <Tooltip placement="top" title='区域不存在'>
                            <p style={{ margin: 0, color: '#f00' }}>{val}</p>
                        </Tooltip>
                    )
                }
            }
        }];

        const headers = {
            Authorization: `Bearer ${getUserToken()}`,
        };

        const property = {
            showUploadList: false,
            headers: headers,
            action: getUploadStaticUrl(),
            accept: '.xls, .xlsx',
            onChange: this.handleChange,
            beforeUpload: (file, fileList) => {
                let that = this;
                let rABS = true;
                console.log("fileList",fileList);
                const f = fileList[0];
                let reader = new FileReader();
                reader.onload = (e)=> {
                    let data = e.target.result;
                    if (!rABS) data = new Uint8Array(data);
                    let workbook = XLSX.read(data, {
                        type: rABS ? 'binary' : 'array'
                    });
                    let first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    let jsonArr = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
                    that.setState({ excelData: jsonArr });
                    that.createDataSource1(jsonArr);
                    that.createDataSource2(jsonArr);
                };
                if (rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
                return false;
            }
        }

        return (
            <Fragment>
                    <div>
                        <Upload {...property}>
                            <Button>
                                <Icon type="upload" /> 上传文件
                            </Button>
                        </Upload>
                        <Button type="dashed" style={{ marginLeft: 15 }} ><a href="http://www.nxcip.com/upload/20190409/14873967384375309.xls">Excel表格样式</a></Button>
                    </div>
                    <Table
                        dataSource={this.state.dataSource1}
                        columns={columns1}
                        pagination={false}
                    />
                    <Table
                        dataSource={this.state.dataSource2}
                        columns={columns2}
                        pagination={false}
                        footer={this.footerContent}
                    />
                    <Modal
                        title='Excel表格'
                        footer={false}
                        visible={this.state.visible}
                        onCancel={this.handleCancel}
                        width={780}
                    >
                        <img src={`${ImgUrl}`} />
                    </Modal>
            </Fragment>
        )
    }
}