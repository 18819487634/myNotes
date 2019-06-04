import React, { PureComponent, Fragment } from 'react';
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
  queryDelivery,
  addDelivery,
  queryInquireBasic,
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
@connect(({ delivery, loading }) => ({
  delivery,
  loading: loading.models.delivery,
}))
@Form.create()
export default class SaleDetailProfile extends PureComponent {
    constructor(props){
        super(props);
        this.state = {
            panes: [{ key: '1' }],
            activeKey: '1',
            pageindex: 1,
            pagesize: 10,
            id:props.detailid,
            printingFlag: false,
            deliveryFlag:false,
            loading:false,
            printData: [],
          };
    }
    

  componentDidMount() {
      this.props.dispatch({
          type:'sale/fetchSaleBaisc',
          payload:this.state.id,
      })


    
  }
  componentWillReceiveProps(nextProps){
    if(this.state.id !== nextProps.detailid){// 如果新的id跟原有的id一样，不刷新
      this.props.dispatch({
        type:'sale/fetchSaleBaisc',
        payload:nextProps.detailid,
      })
      this.setState({
        id : nextProps.detailid,
      });
    }
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
        for (let i = 0; i < arr.length; i += 1) {
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

  hadl = (e,val,record) =>{
    this.props.callbackParent(val);
  }
 
  
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
      status:head.ismerge,
      sendplace:head.address,
      takeway:head.takeway,
      details:detail,
      area:detail[0].area,
    }
    this.props.dispatch({
      type:'delivery/add',
      payload:params,
    });
    // addDelivery(params).then(res=>{
    //   if(res && res.status ===200){
    //     message.success("提交成功！");
    //     this.props.dispatch(routerRedux.push(`/order/deliver`));
    //   } 
    // })

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
  printing = (ep, dataTop) => {
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
    const params = {
      id: dataTop[0].id,
      pickups:pickupDetail,
    }
    this.props.dispatch({
      type:'sale/createDelivery',
      payload:params,
      callback:((readyDeatils)=>{
        this.setState({
          deliveryData:readyDeatils,
          deliveryFlag:true,
          dataTop,
        })
      }),
    })
    
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


  

  render() {
    const { sale: { saledata },form } = this.props;
    const {getFieldDecorator} = form;
    // let dataList = [];
    let saleDetail = [];
    let pickupDeatil = [];
    let salehead = [];
    if (saledata.dataLeft.length >0) {
    //   data.list = data.result.data;
    //   data.pagination = {
    //     total: data.result.total,
    //     showTotal: () => {
    //       return `共${data.result.total}条`;
    //     },
    //     showQuickJumper: true,
    //   };
    //   dataList = data.list;
      console.log("saledata.dataLeft",saledata.dataLeft);
      saleDetail = saledata.dataLeft;
      pickupDeatil = saledata.dataRight;
      salehead = saledata.dataTop;
    }
    const parentMethods = {
      handleModalVisible: this.handleModalVisible,
    };
    const DeliveryParentMethods = {
      handleDeliveryModalVisible: this.handleDeliveryModalVisible,
      handleDelivery:this.handleDelivery,
    };
    return (
      <Fragment>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <Form
              onSubmit={this.validate}
              layout="vertical"
              hideRequiredMark
            >
              <div>
                <Button 
                  type="primary"
                  onClick={ep =>
                  this.printing(ep, salehead, saleDetail, pickupDeatil)
                }
                >
                  <Icon type="printer" />打印
                </Button>
                <Button
                  type="primary"
                  style={{marginLeft:10}}
                  onClick={ep =>
                  this.createDelivery(ep, salehead, saleDetail, pickupDeatil)
                } 
                >
                生成出库单
                </Button>
                {getFieldDecorator('tableTop', {
                    
                })(<TableTop dataSource={salehead} />)}
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <div style={{ width: 1450,float: 'left' }}>
                    {getFieldDecorator('tableLeft', {})(
                      <TableLeft dataSource={saleDetail} />
                      )}
                    
                    <div style={{ width: 500, display:'inline-block' }}>
                      {getFieldDecorator('tablePick', {})(
                        <PickUpTable dataSource={pickupDeatil} />
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </Form>

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
      </Fragment>
    );
  }
}
