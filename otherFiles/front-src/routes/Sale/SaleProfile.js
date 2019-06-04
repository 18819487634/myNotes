import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Row,
  Col,
  Select,
  Button,
  Table,
  Tabs,
  Input,
  message,
  Modal,
  Icon,
} from 'antd';
import { routerRedux } from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './SaleProfile.less';

import TableTop from './TableTop';
import TableLeft from './TableLeft';

import {
  querySale,
  querySaleDetail,
  queryProductids,
  queryPresaleById,
  getTrackStatusForId,
  queryactualdetails,
  querycartnodetail,
  querypaydetail,
  queryListClients,
  queryErpClient,
  querysupplydictionry,
  queryDelivery,
  addDelivery,
  queryInquireBasic,
  queryPresale,
} from '../../services/api';
import { getMyDate, trackiList, recordstatusList, ismergeList } from '../../utils/utils';
import PrintingProfile from './PrintingProfile';
import DeliveryTable from './Delivery';  
import PickUpTable from '../Pickup/PickUpTable';
import { getSupplyId, getUserCompany } from '../../utils/sessionStorage';
import PrintingView from './PrintingView';

// 
const FormItem = Form.Item;

const { Option } = Select;

const TabPanes = Tabs.TabPane;

const takewayArr = ['自提', '快递', '物流', '送货上门'];

const paymentArr = ['全款', '月结'];


const PrintTable = Form.create()(props => {
  const { modalVisible, dataList, handleModalVisible } = props;
  const okHandle = () => {};
  return (
    <Modal
      title="打印"
      visible={modalVisible}
      width={800}
      onOk={okHandle}
      maskClosable={false}
      onCancel={() => handleModalVisible()}
    >
      <PrintingView dataSource={dataList} />
    </Modal>
  );
});

const DeliveryTables = Form.create()(props => {
  const { modalVisible, dataList, handleDeliveryModalVisible,handleDelivery,form } = props;
  const {getFieldDecorator,validateFieldsAndScroll} = form;
  const okHandle = () => {
    
    validateFieldsAndScroll((error, values) => {
      handleDelivery(values.table);
    }); 
  };
  return (
    <Modal
      title="生成送货单"
      visible={modalVisible}
      width={800}
      maskClosable={false}
      onOk={okHandle}
      onCancel={() => handleDeliveryModalVisible()}
    >
      <Form>
        <div style={{ width: '100%', height: 500, overflow: 'auto' }}>
          <div style={{ width: '100%' }}>
            {/* <div style={{  width:'50%',display:"inline-block"}}>
              {getFieldDecorator('tableLeft', {
                 initialValue:leftTab,
               },)(<TableXiMa />)}  
            
            </div>
            <div style={{width:'50%',display:"inline-block"}}>
              {getFieldDecorator('tableRight', {
                 initialValue:rightTab,
              },)(<TableXiMa />)}  
            </div>  */}
            {getFieldDecorator('table', {
             
            })( <DeliveryTable dataSource={dataList} />)}
          </div>
        </div>
      </Form>
     
    </Modal>
  );
});

const areaMap  = new Map();
@connect(({ sale, loading }) => ({
  sale,
  loading: loading.models.sale,
}))
@Form.create()
export default class SaleProfile extends PureComponent {
  state = {
    panes: [{ key: '1' }],
    activeKey: '1',
    pageindex: 1,
    saleid:"",
    pagesize: 10,
    printingFlag: false,
    deliveryFlag:false,
    loading:false,
    printData: [],
  };

  componentDidMount() {

    const supplyids = [getSupplyId()];
      const param =`paging=false&terms[0].value=${supplyids}&terms[0].column=supplyid&terms[1].value=0&terms[1].column=issupply`;
      queryErpClient(param).then((response)=>{// 加载客户信息
        if(response && response.status===200){ 
          const custarr= [];
          const list = response.result.data;
           
            for(let i=0;i<list.length;i++){
              custarr.push(<Option key={i} value={list[i].id}>{`${list[i].name}`}</Option>);
            }
            const params = 'terms[0].value=3&terms[0].column=type';
            querysupplydictionry(params).then(res => {
            if (res && res.status === 200) {
             
              const datas = res.result.data;
              datas.forEach(item => {
                areaMap.set(item.value, item.key);
                
              });
              this.setState({
                custarr,
              })
              const terms = `pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
              this.query(terms); 
            }
          });
              
            
          }
        })

    
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  query = terms => {
    querySale(terms).then(response => {
      if (response && response.status === 200) {
        const arr = response.result.data;
        const trackids = [];
        const userList = [];
        const presaleids = [];
        for (let i = 0; i < arr.length; i += 1) {
          presaleids.push(arr[i].presale);
          arr[i].key = `sale${i}`;
          if (
            `${arr[i].clientid}`.indexOf(':') === -1 &&
            userList.indexOf(arr[i].clientid) === -1
          ) {
            userList.push(arr[i].clientid);
          }
          trackids.push(arr[i].trackid);
        }
        const pagination = {
          total: response.result.total,
          current: this.state.pageindex,
          pageSize: this.state.pagesize,
          showTotal: () => {
            return `共${response.result.total}条`;
          },
          showQuickJumper: true,
        };
        if (trackids.length === 0) {
          trackids.push(null);
        }
        let preTerms = "paging=false&terms[0].column=presaleid&terms[0].termType=in";
        presaleids.forEach(item=>{
          preTerms+= `&terms[0].value=${item}`;
        })
        preTerms +=`&terms[1].value=1&terms[1].column=validstatus&terms[2].value=0&terms[2].column=cancelstatus&terms[3].value=4&terms[3].column=contenttype&terms[3].termType=not`;
        querypaydetail(preTerms).then(payresp=>{
          if(payresp && payresp.status === 200){
            const payData = payresp.result.data;
         
            if (payData.length > 0) {
              arr.forEach(arritem=>{
                let paynum = 0;
                payData.forEach(item => {
                  if(arritem.presale === item.presaleid){
                    paynum += item.amount;
                  }

                });
                const tmp = {pickwaste:paynum.toFixed(2)};
                Object.assign(arritem,tmp);
              })
              
            }
            getTrackStatusForId(trackids).then(res => {
              if (res && res.status === 200) {
                let trackData = [];
                const results = res.result;
                const resultmap = new Map();
                const trackMap = new Map();
                for (const key in results) {
                  if (key in results) {
                    trackData = results[`${key}`];
    
                    trackData.reverse((a, b) => a.buildtime < b.buildtime);
                    resultmap.set(key, trackData[0].type);
                    trackMap.set(key, trackData);
                  }
                }
                for (let z = 0; z < arr.length; z += 1) {
                  arr[z].status = resultmap.get(arr[z].trackid);
                }
                if (userList.length === 0) {
                  userList.push(null);
                }
    
                queryListClients(userList).then(cres => {
                  if (cres && cres.status === 200) {
                    const userData = cres.result;
                    for (let i = 0; i < arr.length; i += 1) {
                      if (`${arr[i].clientid}`.indexOf(':') === -1) {
                        arr[i].clientids = arr[i].clientid;
                        arr[i].clientid = userData[arr[i].clientid];
                        arr[i].user = userData[arr[i].clientid];
                      
                      }
                    }
    
                    const columns = [
                      {
                        title: '销售单编号',
                        dataIndex: 'id',
                        key: 'id',
                        render: (val, record) => {
                          return (
                            <div>
                              <li>
                                <a onClick={e => this.hadl(e, val, record)}>{val}</a>
                              </li>
                              <li>{getMyDate(record.makedate)}</li>
                            </div>
                          );
                        },
                      },
                      {
                        title: '客户',
                        dataIndex: 'clientid',
                        key: 'clientid',
                      },
                      {
                        title: '销售单状态',
                        dataIndex: 'ismerge',
                        key: 'ismerge',
    
                        render(val) {
                          return <span>{recordstatusList[val]}</span>;
                        },
                      },
                      {
                        title: '预售单编号 ',
                        dataIndex: 'presale',
                        key: 'presale',
                      },
                      {
                        title: '备注',
                        dataIndex: 'comment',
                        key: 'comment',
                      },
                      {
                        title: '数量（Kg）',
                        dataIndex: 'num',
                        key: 'num',
                      },
                      {
                        title: '取货方式',
                        dataIndex: 'takeway',
                        key: 'takeway',
    
                        render(val) {
                          return <span>{takewayArr[val]}</span>;
                        },
                      },
                      {
                        title: '结款方式',
                        dataIndex: 'payment',
                        key: 'payment',
    
                        render(val) {
                          return <span>{paymentArr[val]}</span>;
                        },
                      },
                      {
                        title: '应收款',
                        dataIndex: 'needpay',
                        key: 'needpay',
                        render: val => (val === undefined ? `￥ 0` : `￥ ${val}`),
                      },
                      {
                        title: '已收款',
                        dataIndex: 'pickwaste',
                        key: 'pickwaste',
                        render: val => (val === undefined ? `￥ 0` : `￥ ${val}`),
                      },
                      
                      {
                        title: '跟踪状态',
                        dataIndex: 'status',
                        key: 'status',
    
                        render(val) {
                          return <span>{trackiList[val]}</span>;
                        },
                      },
                    ];
    
                    const panes1 = {
                      title: '销售单列表',
                      content: (
                        <div>
                          <Table
                            pagination={pagination}
                            onChange={this.handleStandardTableChange}
                            loading={this.state.loading}
                            dataSource={arr}
                            columns={columns}
                          />
                        </div>
                      ),
                      key: '1',
                      closable: false,
                    };
                    const paness1 = [];
                    if (this.state.panes.length === 1) {
                      paness1.push(panes1);
                    } else {
                      const panes2 = this.state.panes[1];
                      paness1.push(panes1);
                      paness1.push(panes2);
                    }
    
                    this.setState({
                      panes: paness1,
                      loading:false,
                      trackMap,
                    });
                  }
                });
    
                // this.setState({
                //     pagination,
    
                //   },()=>{
    
                //   })
              }
            });
          }
        })
       

        // const arr =dataTop;
      }
    });
  };
  validate = () => {
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((error, values) => {
      
      const pretarmap = values.tableLeft[values.tableLeft.length - 1];
      const pickupdata = [];
      const productidset = new Set();
      const countMap = new Map();
      let count = 0;
      if (pretarmap.size !== 0) {
        for (const item of pretarmap.keys()) {
          // 遍历map
          count = 0;
          const pickarr = pretarmap.get(item).map(items => ({ ...items }));
          // 遍历出来的map ，生成库存明细数组 ，set所有的productId
          for (let it = 0; it < pickarr.length; it++) {
            const demo = {
              picknum: pickarr[it].output,
              goodentryids: pickarr[it].id,
              batchno: pickarr[it].batchno,
              productid: pickarr[it].productid,
            };
            count += Number(pickarr[it].output);
            pickupdata.push(demo);
            productidset.add(pickarr[it].productid);
          }

          countMap.set(pickarr[0].productid, count);
          
        }
      } else {
        message.error('请选择库存');
      }
    });
  };
  handleSearch = () => {
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((error, values) => {
      const terms = this.formatTerms(values);
      this.query(terms);
    });
  
  };

  formatTerms = params => {
    const keys = [];
    const values = [];
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        keys.push(key);
        values.push(params[key]);
      }
    });
    let terms = `pageSize=10&pageIndex=0&sorts[0].name=id&sorts[0].order=desc`;
    if (keys.length > 0) {
      terms += `&`;
    }

    for (let i = 0; i < keys.length; i++) {
      if (keys.length === 1) {
        terms += `terms[1].value=${values[i]}&terms[1].column=${keys[i]}`;
      } else {
        terms += `terms[${i + 1}].value=${values[i]}&terms[${i + 1}].column=${keys[i]}`;
        if (keys.length !== i + 1) {
          terms += '&';
        }
      }
    }

    return terms;
  };
  handleStandardTableChange = pagination => {
    const { form } = this.props;
    form.validateFields((err,feildvalues) => {
      if (err) return;
      const params = feildvalues;
      this.setState({
        pageindex : pagination.current,   
        pagesize : pagination.pageSize,
      })
      const values = this.createTerms(params, pagination.current-1,pagination.pageSize);
     // const terms = `terms[0].value=0&terms[0].column=type&pageSize=${pagination.pageSize}&pageIndex=${pagination.current-1}`
      this.query(values);
      
    });
  }

  createTerms = (obj, pageIndex = 1, pageSize = 12) => {
    let i = 0;
    let params = `pageIndex=${pageIndex}&pageSize=${pageSize}&&sorts[0].name=id&sorts[0].order=desc`;
    Object.keys(obj).forEach(key => {
      if(obj[key]!==undefined){
        params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=${key}`;
      i += 1;
      }
      
    });

    return params;
  };;


  hadl = (e, val, record) => {
    message.config({
      top: 100,
    });
    const hide = message.loading('正在读取，请稍候...', 0);
    const paness = this.state.panes;
    const { getFieldDecorator } = this.props.form;

    querySaleDetail(val).then(response => {
      if (response && response.status === 200) {
        const dataTop = [];
        let dataLeft = [];
        const productids = [];
        const pickdetailids = [];
        const sysuuidArr = [];

        dataTop.push(response.result);
        const presaleid = response.result.presale;
        queryPresaleById(presaleid).then(iresq => {
          if (iresq && iresq.status === 200) {
            const presaleData = iresq.result;
            dataTop[0].takeway = presaleData.takeway;
            dataTop[0].user = record.clientid;
            dataTop[0].payway = presaleData.payway;
            dataTop[0].ismerge = presaleData.ismerge;
            dataTop[0].address = presaleData.address;
            dataTop[0].comment = presaleData.comment;

            // let pppp = [];
            // let length1 = presaleData.pickups.length;
            // for (let i = 0; i < length1; i++) {
            //   pppp = pppp.concat(presaleData.pickups[i].details);
            // }
            // const pickupDetails = pppp;

            const pickupDetail = [];
            dataTop[0].key = `saleTop${0}`;
            // const dataLefts =  response.result.details;
            // dataLefts.forEach(item=>{
            //   if(dataLeft.indexOf(item.productid) === -1){
            //     dataLeft.push(item);
            //   }
            // });
            dataLeft = response.result.details;// 销售的产品明细
          //  const pickupid = presaleData.pickups[0].id;
            dataLeft.securepay = dataTop[0].securepay;
            dataLeft.needpay = dataTop[0].needpay;
            dataLeft.shippay = dataTop[0].shippay;
            dataLeft.taxmoney = dataTop[0].taxmoney===undefined?0:dataTop[0].taxmoney;
            dataLeft.goodpay = dataTop[0].goodpay;
            dataLeft.payment = dataTop[0].payment;
            dataLeft.pickwaste = dataTop[0].pickwaste;
            
            for (let i = 0; i < dataLeft.length; i += 1) {
              dataLeft[i].key = `saleLeft${i}`;

              productids.push(dataLeft[i].productid);
            }
            const pickupData = presaleData.pickups;
            for (let j = 0; j < pickupData.length; j += 1) {
              const pickupDetails = pickupData[j].details;
              for (let i = 0; i < pickupDetails.length; i += 1) {
                if (pickupDetails[i].status ===0 && pickupData[j].saleid===record.id)  {
                  pickupDetails[i].recordstatus =pickupData[j].recordstatus;// 拣货单的状态（给修改数量的时候判断用）
                  pickupDetails[i].presaleid = pickupData[j].presaleid;
                  pickupDetails[i].piece = ""; 
                  pickupDetails[i].finishnum = pickupData[j].finishnum;
                  pickupDetails[i].location = pickupData[j].location;
                  pickupDetail.push(pickupDetails[i]);
                }
              }
            }
            

            for (let i = 0; i < pickupDetail.length; i += 1) {
              pickupDetail[i].uuid = pickupDetail[i].sysuuid;
              pickdetailids.push(pickupDetail[i].id);
              if (sysuuidArr.indexOf(pickupDetail[i].uuid) === -1) {
                sysuuidArr.push(pickupDetail[i].uuid);
              } else {
                pickupDetail[i].uuid = '';
              }
            }
            pickupDetail.tag = 2;
            queryactualdetails(pickdetailids).then(aresponse => {
              if (aresponse && aresponse.status === 200) {
                const aresult = aresponse.result;
                const cartnos = [];
                const cartnoMap = new Map();
                aresult.forEach(item => {
                  if (cartnos.indexOf(item.cartno) === -1) {
                    cartnos.push(item.cartno);
                  }
                  cartnoMap.set(item.cartno,item.pickdetailid);
                });

                querycartnodetail(cartnos).then(cresponse => {
                  if (cresponse && cresponse.status === 200) {
                    const cresult = cresponse.result;
                    let preces = 0; // 整件数
                    let nums = 0; // 零散个数
                    let glossweights = 0; // 毛重
                    let weights = 0; // 净重

                    for (let c = 0; c < cresult.length; c += 1) {
                      // 总体的净重，毛重

                      if (cresult[c].parentcartno !== undefined) {
                        nums += cresult[c].num;
                        glossweights +=
                          cresult[c].glossweight === undefined ? 0 : cresult[c].glossweight;
                        weights += cresult[c].weight;
                      } else {
                        preces += 1;
                        glossweights +=
                          cresult[c].glossweight === undefined ? 0 : cresult[c].glossweight;
                        weights += cresult[c].weight;
                      }
                      for (let a = 0; a < pickupDetail.length; a += 1) {
                        if (pickupDetail[a].id === cartnoMap.get(cresult[c].cartno)) {
                          pickupDetail[a].glossweight = Number(
                            Number(
                              pickupDetail[a].glossweight === undefined
                                ? 0
                                : pickupDetail[a].glossweight
                            ) + Number(cresult[c].glossweight)
                          ).toFixed(2);
                          pickupDetail[a].weight = Number(
                            Number(
                              pickupDetail[a].weight === undefined ? 0 : pickupDetail[a].weight
                            ) + Number(cresult[c].weight)
                          ).toFixed(2);

                          pickupDetail[a].weights = Number(
                            Number(
                              pickupDetail[a].weight === undefined ? 0 : pickupDetail[a].weight
                            ) + Number(cresult[c].weight)
                          ).toFixed(2);// 用于送货单生成计算净重
                          if (cresult[c].parentcartno === undefined) {
                            pickupDetail[a].piece =
                              (pickupDetail[a].piece === "" ? 0 : pickupDetail[a].piece) + 1;
                            pickupDetail[a].num =
                              (pickupDetail[a].num === undefined ? 0 : pickupDetail[a].num) + 0;
                          } else {
                            pickupDetail[a].piece =
                              (pickupDetail[a].piece === "" ? 0 : pickupDetail[a].piece) + 0;
                            pickupDetail[a].num =
                              (pickupDetail[a].num === undefined ? 0 : pickupDetail[a].num) +
                              Number(cresult[c].num);
                          }
                        }
                      }
                    }
                    dataLeft.prece = preces;
                    dataLeft.num = nums;
                    dataLeft.glossweight = parseFloat(glossweights).toFixed(2);
                    dataLeft.weight = parseFloat(weights).toFixed(2);

                    queryProductids(productids).then(resn => {
                      if (resn && resn.status === 200) {
                        const productData = resn.result;
                        const map = this.state.trackMap;
                        dataLeft.trackData = map.get(record.trackid);

                        for (let z = 0; z < dataLeft.length; z += 1) {
                          for (let j = 0; j < productData.length; j += 1) {
                            if (productData[j].id === dataLeft[z].productid) {
                              const product01Entity = {
                                picture: productData[j].picture,
                                seriesname: productData[j].productseries.seriesname,
                                kindname: productData[j].productkind.kindname,
                                productname: productData[j].productname,
                                colorname: productData[j].colorname,
                              };

                              dataLeft[z].product01Entity = product01Entity;
                            }
                          }
                        }

                            for (let zd = 0; zd < dataLeft.length; zd += 1) {
                              // 多个拣货明细拼接
                              let pickdetail = '';
                              let actualWeight = 0;
                              let batchno = '';
                              for (let ld = 0; ld < pickupDetail.length; ld += 1) {
                                if (dataLeft[zd].productid === pickupDetail[ld].productid) {
                                  pickupDetail[ld].colorname =
                                    dataLeft[zd].product01Entity.colorname;
                                  pickupDetail[ld].areas = areaMap.get(`${pickupDetail[ld].area}`);
                                  pickupDetail[ld].totalpiece=pickupDetail[ld].piece+(pickupDetail[ld].num>0?1:0);// 用于送货单生成计算件数（可变）
                                  pickupDetail[ld].maxPiece=pickupDetail[ld].piece+(pickupDetail[ld].num>0?1:0);// 用于送货单生成计算件数（不变）
                                  pickupDetail[ld].productname =
                                    dataLeft[zd].product01Entity.productname;
                                  pickdetail += `${pickupDetail[ld].batchno}:${[
                                    `${pickupDetail[ld].weight}`,
                                  ]}  `;
                                  actualWeight += Number(`${pickupDetail[ld].weight}`);
                                  batchno += `${pickupDetail[ld].batchno}  `;
                                  dataLeft[zd].piece =
                                    (dataLeft[zd].piece === undefined ? 0 : dataLeft[zd].piece) +
                                    pickupDetail[ld].piece;
                                  dataLeft[zd].scattered =
                                    (dataLeft[zd].scattered === undefined
                                      ? 0
                                      : dataLeft[zd].scattered) + pickupDetail[ld].num;
                                }
                              }
                              dataLeft[zd].pickdetail = pickdetail;
                              dataLeft[zd].batchno = batchno;
                              dataLeft[zd].picknum = actualWeight;
                            }

                            // dataLeft.forEach(item=>{
                            //   if(dataLefts.indexOf(item.productid)===-1){
                            //     dataLefts.push(item);
                            //   }
                            // })
                            const payParmas = `terms[0].value=${presaleid}&terms[0].column=presaleid&terms[1].value=1&terms[1].column=validstatus&terms[2].value=0&terms[2].column=cancelstatus&terms[3].value=4&terms[3].column=contenttype&terms[3].termType=not`;
                            querypaydetail(payParmas).then(payres => {
                              if (payres && payres.status === 200) {
                                const payData = payres.result.data;
                                let paynum = 0;
                                if (payData.length > 0) {
                                  payData.forEach(item => {
                                    paynum += item.amount;
                                  });
                                }
                                dataLeft.pickwaste = paynum;
                                dataLeft.sumgoodspay =(parseFloat((dataLeft.goodpay+dataLeft.shippay+dataLeft.securepay+dataLeft.taxmoney).toFixed(2))-paynum).toFixed(2);
                                
                                const params = `paging=false&terms[0].value=${record.clientids}&terms[0].column=id`;
                                queryErpClient(params).then((eres)=>{ 
                                  if(eres && eres.status===200){
                                    const dataList = eres.result.data;  
                                    dataTop[0].credit = dataList[0].credit;
                                    setTimeout(hide, 100);
                                    this.setState({
                                      dataTop,
                                    },()=>{
                                      if (paness.length === 1) {
                                        const activeKey = '2';
                                        paness.push({
                                          title: '销售单详情',
                                          content: (
                                            <Form
                                              onSubmit={this.validate}
                                              layout="vertical"
                                              hideRequiredMark
                                            >
                                              <div>
                                                <Button
                                                  type="primary"
                                                  onClick={ep =>
                                                    this.printing(ep, dataTop, dataLeft, pickupDetail)
                                                  }
                                                >
                                                  <Icon type="printer" />打印
                                                </Button>
                                                <Button
                                                  type="primary"
                                                  style={{marginLeft:10}}
                                                  onClick={ep =>
                                                    this.createDelivery(ep, dataTop, dataLeft, pickupDetail)
                                                  } 
                                                >
                                                 生成出库单
                                                </Button>
                                                {getFieldDecorator('tableTop', {
                                                  
                                                })(<TableTop dataSource={this.state.dataTop} />)}
                                                <div style={{ width: '100%', overflowX: 'auto' }}>
                                                  <div style={{ width: 1450 }}>
                                                    <div style={{ width: 800, float: 'left' }}>
                                                      {getFieldDecorator('tableLeft', {})(
                                                        <TableLeft dataSource={dataLeft} />
                                                      )}
                                                    </div>
                                                    <div style={{ width: 500, float: 'right' }}>
                                                      {getFieldDecorator('tablePick', {})(
                                                        <PickUpTable dataSource={pickupDetail} />
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </Form>
                                          ),
                                          key: activeKey,
                                        });
      
                                        this.setState({ panes: paness, activeKey });
                                      } else {
                                        this.setState({ activeKey: '2' });
                                      }
                                    })
                                    
                                  }
                                });
                                
                              }
                            });
                          
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  };
  
  handleDelivery =(values)=>{// 生成送货单
    const head = this.state.dataTop[0];
    const arealist =[];
    
    values.forEach(item=>{
      if(arealist.indexOf(item.area)===-1){
        arealist.push(item.area);
      }
    });
    if(arealist.length === 0){
      message.warn("请勾选需出货的单号");
      return;
    }else if(arealist.length > 1){
      message.warn("只能勾选同仓库的货物");
      return;
    }
    const detail =[];
    values.forEach(item=>{
      const valil ={
        productid:item.productid,
        batchno:item.batchno,
        totalpiece:item.totalpiece,
        pickid:item.sysuuid,
        area:item.area,
      }
      detail.push(valil);
    });
    const params ={
      clientsupplyid:head.supplyid,
      clientid:head.clientid,
      saleid:head.id,
      status:`${head.ismerge}`,
      sendplace:head.address,
      takeway:`${head.takeway}`,
      details:detail,
      area:detail[0].area,
    }
   
    addDelivery(params).then(res=>{
      if(res && res.status ===200){
        message.success("提交成功！");
        this.props.dispatch(routerRedux.push(`/order/deliver`));
      }
    })

  }
  handleModalVisible = flag => {
    this.setState({
      printingFlag: !!flag,
    });
  };
  handleDeliveryModalVisible= flag=>{
    this.setState({
      deliveryFlag: !!flag,
    });
  }
  printing = (ep, dataTop, dataLeft) => {
    message.config({
      top: 100,
    });
    const hide = message.loading('正在读取，请稍候...', 0);
    this.props.dispatch({
      type:'sale/getPrintSaleDetails',
      payload:dataTop[0].id,
      callback:((response)=>{
        setTimeout(hide,100);
        this.setState({
      printData: response,
      printingFlag: true,
    }); 
      }),
    })
    

    
    
    
            
           
       
       
      
    
    
  };
  createDelivery = (ep, dataTop, dataLeft, pickupDetail) =>{
    const DeliveryTerms = `terms[0].value=${dataTop[0].id}&terms[0].column=saleid`; 
    queryDelivery(DeliveryTerms).then(delires =>{
      if(delires && delires.status === 200){// 查询该销售单是否有生成过送货单
        const deliResult = delires.result.data;
        if(deliResult.length===0){
          for(let a=0;a<pickupDetail.length;a+=1){
              pickupDetail[a].key = `delivery_${a}`;
          }
          this.setState({
            deliveryData:pickupDetail,
            deliveryFlag:true,
            dataTop,
          })
        }else{
          const pickupDeatils =[];
         
          for(let p = 0;p<pickupDetail.length;p+=1){
            const detail = {// 直接复制会把地址也复制过去，修改值的时候，会把相应地址的值给修改了
              maxPiece:pickupDetail[p].maxPiece,
              totalpiece:pickupDetail[p].totalpiece,
              finishnum:pickupDetail[p].finishnum,
              location:pickupDetail[p].location,
              area:pickupDetail[p].area,
              areas:pickupDetail[p].areas,
              batchno:pickupDetail[p].batchno,
              colorname:pickupDetail[p].colorname,
              productid:pickupDetail[p].productid,
              sysuuid:pickupDetail[p].sysuuid,
              productname:pickupDetail[p].productname,
              weight:pickupDetail[p].weight,
              weights:pickupDetail[p].weights,
              num:pickupDetail[p].num,
              piece:pickupDetail[p].piece,
            }
            pickupDeatils.push(detail);
          }

          const readyDeatils = [];
          const overDetails = [];
          for(let j=0;j<deliResult.length;j+=1){
            const deliveryDetails = deliResult[j].details;
            for(let i=0;i<deliveryDetails.length;i+=1){// 组成已经生成出货的数据
              overDetails.push(deliveryDetails[i]);
            }
          }

          for(let d=0;d<pickupDeatils.length;d+=1){// 组成已经未生成出货的数据
            for(let z=0;z<overDetails.length;z+=1){
           
              if(overDetails[z].batchno === pickupDeatils[d].batchno && 
                overDetails[z].pickid === pickupDeatils[d].sysuuid &&
                overDetails[z].productid === pickupDeatils[d].productid  ){
                  pickupDeatils[d].totalpiece-=overDetails[z].totalpiece;
                  pickupDeatils[d].weight-=overDetails[z].num===undefined?0:overDetails[z].num;
                
              }
            }
            if(pickupDeatils[d].totalpiece>0){
              pickupDeatils[d].maxPiece =pickupDeatils[d].totalpiece; 
              pickupDeatils[d].key = `delivery_${d}`;
              readyDeatils.push(pickupDeatils[d]);
            }
          }
          if(readyDeatils.length === 0){
            message.warn("该销售单已经生成送货单");
          }else{
            this.setState({
              deliveryData:readyDeatils,
              deliveryFlag:true,
              dataTop,
            })
            
          }
          
        }


      }
    });
  }
  remove = targetKey => {
    let activeKeys = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKeys === targetKey) {
      activeKeys = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey: activeKeys });
  };

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="销售单单号">
              {getFieldDecorator('id')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="客户">
              {getFieldDecorator('clientid')(
                <Select placeholder="">
                  {this.state.custarr}
                </Select>
            )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label=" 状态">
              {getFieldDecorator('ismerge')(
                <Select placeholder="">

                  {ismergeList.map((item,index)=><Option key={item} value={index}>{item}</Option>)}

                   
                </Select>
               )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="取货方式">
              {getFieldDecorator('takeway')(
                <Select placeholder="">
                  <Option value={0}>自提</Option>
                  <Option value={1}>快递</Option>
                  <Option value={2}>物流</Option>
                  <Option value={3}>送货上门</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
       
       
       

        <Row gutter={{ md: 4, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="预售单单号">
              {getFieldDecorator('presale')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="结款方式">
              {getFieldDecorator('payway')(
                <Select placeholder="">
                  <Option value={0}>日结</Option>
                  <Option value={1}>月结</Option>
                  <Option value={2}>全款</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          {/* <Col md={6} sm={24}>
            <FormItem label="结款方式">
              {getFieldDecorator('payway')(
                <Select placeholder="">
                  <Option value={0}>日结</Option>
                  <Option value={1}>月结</Option>
                  <Option value={2}>全款</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="客户评级">
              {getFieldDecorator('credit')(
                <Select placeholder="">
                  <Option value={0}>A</Option>
                  <Option value={1}>B</Option>
                  <Option value={2}>C</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="备注">
              {getFieldDecorator('comment')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col> */}
          <Col md={6} sm={24}>
        
            <div style={{ overflow: 'hidden' }}>
              <span style={{ float: 'right', marginBottom: 24 }}>
                <Button type="primary" onClick={this.handleSearch} >
                    查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                    重置
                </Button>
              
              </span>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  

  render() {

    const parentMethods = {
      handleModalVisible: this.handleModalVisible,
    };
    const DeliveryParentMethods = {
      handleDeliveryModalVisible: this.handleDeliveryModalVisible,
      handleDelivery:this.handleDelivery,
    };

    const panemap = this.state.panes;

    return (
      <PageHeaderLayout title="销售单">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator} />
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
            <Tabs
              hideAdd
              onChange={this.onChange}
              activeKey={this.state.activeKey}
              type="editable-card"
              onEdit={this.onEdit}
            >
              {panemap.map(pane => (
                <TabPanes tab={pane.title} key={pane.key} closable={pane.closable}>
                  {pane.content}
                </TabPanes>
              ))}
            </Tabs>

            <PrintTable
              modalVisible={this.state.printingFlag}
              dataList={this.state.printData}
              {...parentMethods}
            />
            <DeliveryTables
              modalVisible={this.state.deliveryFlag}
              dataList={this.state.deliveryData}
              {...DeliveryParentMethods}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
