import React, { PureComponent } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import {
    Table,
    Button,
    message,
    Form,
    Row,
    Col,
    Input,
    Select,
    Tabs,
    Modal,
} from 'antd';
import styles from '../Finance/Cashier.less'
import { querypaydetail } from '../../services/api'
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {toDecimal, getMyDate} from '../../utils/utils';
import { getSupplyId, getCurrentUser } from '../../utils/sessionStorage';
import ReceiptRecord from '../Record/ReceiptRecord';
import SplitTableTop from '../Inquiry/SplitTableTop';
import SplitsPickUpTable from '../Inquiry/SplitsPickUpTable';

const takewayArr = ["自提","快递","物流","送货上门"];
const FormItem = Form.Item;
const clientNameArr = [];
let dataList = [];
// const {TabPane} = Tabs.TabPane;
const TabPanes = Tabs.TabPane;
const {username} = JSON.parse(getCurrentUser())

const PickupForm = Form.create()(props => {
  const { modalVisible,CancelPickupModalVisible,form,pickupTmp,handlonsubmit} = props;
  const {validateFieldsAndScroll,getFieldDecorator} = form;
 
  const okHandle =() =>{
    validateFieldsAndScroll((error, values) => {
      handlonsubmit(values);
    });
   }
  return (
    <Modal
      title="快速拆分拣货单"
      width='68%'
      visible={modalVisible}
      onOk={okHandle}
      maskClosable={false}
      okText="生成拣货单"
      onCancel={() => CancelPickupModalVisible()}
    >
      <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
        <div >
          {getFieldDecorator('tableTop', {
                      
                    },)(<SplitTableTop dataSource={pickupTmp.dataTop} /> )}
        </div>
        <div >
          {getFieldDecorator('splitspickuptable', {
                  
                    },)(<SplitsPickUpTable dataSource={pickupTmp.pickupData} />)}
        </div>
        
      </Form>  
      
      
    </Modal>);
}); 


function handleDs(obj, pageIndex = 0, pageSize = 10, type) {
  let i = 0;
  let params = `pageIndex=${pageIndex}&pageSize=${pageSize}&sorts[0].name=id&sorts[0].order=desc`;
  i += 1;
  params += `&terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
  i+=1;
  params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
  i+=1;
  params += `&terms[${i}].value=${username}&terms[${i}].column=usrid`
  i+=1;
  // 如果填了单号，其它条件都是可以不管的。
  Object.keys(obj).forEach(key => {
    if((key === 'id') && obj[key] !== undefined) {
      params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=id`;
      i += 1;
    }else if((key === 'shipphone') && obj[key] !== undefined) {
      params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=shipphone`;
      i += 1;
    }else if((key === 'clientname' && obj[key] !== undefined)) {
      dataList.forEach(item =>{
        if(item.clientname === obj[key]) {
          params += `&terms[${i}].value=${item.clientid}&terms[${i}].column=clientid`;
          i += 1;
        }
      })
    }
  })
  if(type === 1) {
    params += `&terms[${i}].value=0&terms[${i}].column=type`;
    i+=1;
  } else if(type === 2) {
    params += `&terms[${i}].value=1&terms[${i}].column=type`;
    i+=1;
  }
return params;
}

@connect(({ waitpaymentprofile, loading }) => ({
  waitpaymentprofile,
  loading: loading.models.paydetail,
}))
@connect(({ receiptrecord, loading }) => ({
  receiptrecord,
  loading: loading.models.paydetail,
}))
@connect(({ splitorder, loading }) => ({
  splitorder,
  loading: loading.models.paydetail,
}))
@Form.create()
export default class NewWaitPaymentProfile extends PureComponent {
   
  constructor(props){
    super(props);
    this.state = {
      pagesize: 10,
      loading: false,
      ispresale: true,
      paneskey: '1',
      isshow: false,
      poptable: true,
      pickupVisible:false,
      pickupTmp:{
        dataTop:[{"key":"d1"}],
        pickupData:[{"key":"p1"}],
      },
    }
  }

  componentDidMount() {
    let params = `pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
    let i =0 ;
    params += `&terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
    i+=1;
    params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
    i+=1;
    params += `&terms[${i}].value=0&terms[${i}].column=type`;
    i+=1;
    params += `&terms[${i}].value=${username}&terms[${i}].column=usrid`
    this.props.dispatch({
      type: 'waitpaymentprofile/submit',
      payload: params,
    })
  }

  getAmount = (rec) => {
    if(rec.amount !== undefined && rec.amount >0) {
      return Number(rec.amount).toFixed(2);
    } else {
      return 0
    }
  };
  

  handlePresaleTableChange = pagination => {
    const { form } = this.props;
    let params = `pageIndex=${pagination.current-1}&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
    let i =0 ;
    params += `&terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
    i+=1;
    params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
    i+=1;
    params += `&terms[${i}].value=0&terms[${i}].column=type`;
    i+=1;
    params += `&terms[${i}].value=${username}&terms[${i}].column=usrid`
    i+=1;
    form.validateFields((err) => {
      if (err) return;
      this.props.dispatch({
        type: 'waitpaymentprofile/submit',
        payload: params,
      });
      this.setState({
        presalepageindex: pagination.current,
        pagesize: pagination.pageSize,
      });
    });
  };

  handleOweTableChange = pagination => {
    const { form } = this.props;
    let params = `pageIndex=${pagination.current-1}&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
    let i =0 ;
    // params += `&terms[${i}].value=0&terms[${i}].column=payway`;
    params += `&terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
    i+=1;
    params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
    i+=1;
    params += `&terms[${i}].value=1&terms[${i}].column=type`;
    i+=1;
    params += `&terms[${i}].value=${username}&terms[${i}].column=usrid`
    i+=1;
    form.validateFields((err) => {
      if (err) return;
      this.props.dispatch({
        type: 'waitpaymentprofile/submit',
        payload: params,
      });
      this.setState({
        owepageindex: pagination.current,
        pagesize: pagination.pageSize,
      });
    });
  };

  clickpay =(rec)=>{
    const params = `terms[0].value=${rec.id}&terms[0].column=presaleid`;
    querypaydetail(params).then(res=>{
      if(res && res.status === 200){
        const  remainmoney = rec.needpay
        const total = rec.amount;
        const tmpmoney = remainmoney - total; 
        if(tmpmoney <= 0){
          message.error("已经付款");
          return;
        }
        this.props.dispatch(
          routerRedux.push({
            pathname: '/finance/paydetail',
            state:{
              returnurl:this.props.location.pathname,
              address:rec.address.concat(' ').concat(rec.shipreceiver).concat(' ').concat(rec.shipphone),
              presaleid:rec.id,
              clientname:rec.clientname,
              clientid:rec.clientids,
              money: toDecimal(tmpmoney),
              contenttype:3,// 尾款
              paytype:0,// 现金
            },
          }));
      }
    }).catch(e => {
        message.config({
            top: 100,
        });
      message.error(e);
    });
  };

  handleSplit = (rec) => {
    if(rec === 2) {
      this.setState({
        pickupVisible: false,
      })
      message.warning("此单已经拆单完成");
    } else {
      const hide = message.loading(`正在读取...`, 0);
      sessionStorage.setItem('presaleid', rec.id);
      const params = `terms[0].value=${rec.id}&terms[0].column=presaleid`;
      this.props.dispatch({
        type: 'splitorder/splitorder',
        payload: params,
        callback: resp => {
          resp.unshift(hide)
          this.goToSplit(resp)
        },
      })
    }
    
  };

  goToSplit = (resp) => {
    const splitstatus = resp[1];
    if(splitstatus === 0) {
      setTimeout(resp[0],100);
      const pickupdata = JSON.parse(resp[2])
      this.setState({
        pickupTmp: pickupdata,
        pickupVisible:true,
      })
    } else if(splitstatus === 1) {
      setTimeout(resp[0],100);
      message.warning("此单不需要拆单");
    } else if(splitstatus === 2) {
      setTimeout(resp[0],100);
      message.warning("此单已经拆单完成");
    }
  };

  handleSearch = (e) => {
    if(e) {e.preventDefault();}
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      if(this.state.paneskey === '1') {
        const ds = handleDs(values, 0, 10, 1)
        this.props.dispatch({
          type: 'waitpaymentprofile/submit',
          payload: ds,
        })
      } else if(this.state.paneskey === '2') {
        const ds = handleDs(values, 0, 10, 2)
        this.props.dispatch({
          type: 'waitpaymentprofile/submit',
          payload: ds,
        })
      }
    });
  };

  handleFormReset = () => {
    this.props.form.resetFields();
    if(this.state.paneskey === '1') {
      let params = `pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
      let i =0 ;
      params += `&terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
      i+=1;
      params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
      i+=1;
      params += `&terms[${i}].value=0&terms[${i}].column=type`;
      i+=1;
      params += `&terms[${i}].value=${username}&terms[${i}].column=usrid`
      i+=1;
      this.props.dispatch({
        type: 'waitpaymentprofile/submit',
        payload: params,
      })
    } else if(this.state.paneskey === '2') {
      let params = `pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
      let i =0 ;
      params += `&terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
      i+=1;
      params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
      i+=1;
      params += `&terms[${i}].value=1&terms[${i}].column=type`;
      i+=1;
      params += `&terms[${i}].value=${username}&terms[${i}].column=usrid`
      i+=1;
      this.props.dispatch({
        type: 'waitpaymentprofile/submit',
        payload: params,
      })
    }
  };

  loadData = (key) => {
    let params = `sorts[0].name=id&sorts[0].order=desc`;
    let i =0 ;
    // params += `&terms[${i}].value=0&terms[${i}].column=payway`;
    params += `&terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
    i+=1;
    params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
    i+=1;
    params += `&terms[${i}].value=${username}&terms[${i}].column=usrid`
    i+=1;
    if (key === '1') {
      if (this.state.presalepageindex) {
        params += `&pageIndex=${this.state.presalepageindex}&pageSize=10`
      } else {
        params += `&pageIndex=0&pageSize=10`
      }
      params += `&terms[${i}].value=0&terms[${i}].column=type`;
      i+=1;
      this.props.dispatch({
        type: 'waitpaymentprofile/submit',
        payload: params,
      })
    } else if(key === '2'){
      if (this.state.owepageindex) {
        params += `&pageIndex=${this.state.owepageindex}&pageSize=10`
      } else {
        params += `&pageIndex=0&pageSize=10`
      }
      params += `&terms[${i}].value=1&terms[${i}].column=type`;
      i+=1;
      this.props.dispatch({
        type: 'waitpaymentprofile/submit',
        payload: params,
      })
    }
  }

  changeDataList = (key) => {
    this.setState({
      paneskey: key,
    })
    if (key === '1') {
      this.loadData(key)
    } else if (key === '2') {
      this.loadData(key)
    }
  }

  showPayDetail = (id) => {
    const params = `sorts[0].name=id&sorts[0].order=desc&terms[1].value=${id}&terms[1].column=presaleid`;
    this.setState({
      isshow: true,
    })
    this.props.dispatch({
      type: 'receiptrecord/submit',
      payload: params,
    })
  };

  CancelPickupModalVisible=()=>{
    this.setState({
      pickupVisible:false,
    })
  };

  handlonsubmit=(values)=>{
    const params = values;
    message.config({
      top: 100,
    });
    const hide = message.loading(`正在提交...`, 0);
    if(params.splitspickuptable === undefined){
      message.error("请选择需要拆单的缸号");
      setTimeout(hide,100);
      return;
    }
    const splitData = params.splitspickuptable;
    const topData = params.tableTop;
    const splictParmas ={
      status:topData[0].ismerge,
      clientid:topData[0].clientid,
      comment:topData[0].comment,
      presaleid:topData[0].id,
      supplyid:getSupplyId(),
    }
    const areas =[];
   
    const details =[];
    for(let i =0;i<splitData.length;i+=1){
      if(splitData[i].status===1){
        const vail = {
          productid:splitData[i].productid,
          area:splitData[i].area,
          picknum:splitData[i].output,
          originalpicknum:splitData[i].picknum,
          piece:splitData[i].outpiece,
          originalpiece:splitData[i].piece,
          batchno:splitData[i].batchno,
          ids:splitData[i].id,
          completestatus:splitData[i].completestatus,
          locations:splitData[i].locations,
          goodentryids:splitData[i].goodentryid,
          supplyid:getSupplyId(),
        }
        if(areas.indexOf(splitData[i].area) ===-1 ){
          areas.push(splitData[i].area);
        }
        details.push(vail);
      }
    }
    if(areas.length === 0 || areas.length >1){
      message.warning("勾选的缸号必须得同区域");
      setTimeout(hide,100);
      return;
    }else{
      const areaVail = areas[0];
      splictParmas.area = areaVail;
    }
    if(details.length ===0){
      message.error("请选择需要拆单的缸号");
      setTimeout(hide,100);
      return;
    }
    splictParmas.details = details;

    const paramsdata = [];
    paramsdata.push(splictParmas);
    paramsdata.push(details);
    setTimeout(hide,100);
    this.props.dispatch({
      type: 'splitorder/splitsuccess',
      payload: paramsdata,
      callback: (resp) => {
        if(resp === 'ok') {
          message.success('提交成功');
          this.handleSplit(2);
        }
      },
    })
  };

  renderQueryForm() {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{md: 8, lg: 24, xl: 48}}>
          <Col md={6} sm={24}>
            <FormItem label="订单号">
              {getFieldDecorator('id')(<Input placeholder="请输入订单号" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="收件电话">
              {getFieldDecorator('shipphone')(<Input placeholder="请输入电话号" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="客户">
              {getFieldDecorator('clientname')(
                <Select
                  showSearch
                  allowClear
                  placeholder="请选择客户"
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {clientNameArr && clientNameArr.map((item, index) => <Select.Option key={index} value={item}>{item}</Select.Option>)}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{md: 4, lg: 24, xl: 48}}>
          <Col md={6} sm={24}>
            <div style={{overflow: 'hidden'}}>
              <span style={{float: 'left', marginBottom: 24}}>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset} type="ghost" htmlType="submit">
                  重置
                </Button>
              </span>
            </div>
          </Col>
        </Row>
      </Form>
    )
  };

  

  render() {
    const { waitpaymentprofile } = this.props;
    const { data } = waitpaymentprofile;
    const pickupParentMethods = {
      CancelPickupModalVisible: this.CancelPickupModalVisible,
      handlonsubmit:this.handlonsubmit,
    };

    const {pickupVisible,pickupTmp} =this.state
    let pagination = {};

    if(this.state.isshow) {
      // if(receiptrecord && receiptrecord.data.status === 200) {
      //   showDataList = receiptrecord.data.result.data;
      // }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (data && data.result.data && data.status === 200  ) {
        pagination = {
          total: data.result.total,
          current: this.state.ispresale ? this.state.presalepageindex : this.state.owepageindex,
          pageSize: this.state.pagesize,
          showTotal: () => {
            return `共${data.result.total}条`;
          },
          showQuickJumper: false,
        };
        dataList = data.result.data
      }
    }
    
    clientNameArr.length = 0
    for(let i = 0; i <= dataList.length ; i += 1) {
      for (const key in dataList[i]) {
        if (key === 'clientname') {
          if (clientNameArr.indexOf(dataList[i].clientname) < 0) {
            clientNameArr.push(dataList[i].clientname)
          }
        }
      }
    }

    const columns=[{
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      render: (val, record) => {
        return (
          <div>
            <li>
              {val}
            </li>
            <li>{getMyDate(record.makedate)}</li>
          </div>
        );
      },
    }, {
      title: '客户',
      dataIndex: 'clientname',
      key: 'clientname',
    },
    // {
    //   title: '支付方式',
    //   dataIndex: 'payway',
    //   key: 'payway',
    // },
    {
      title: '备注',
      dataIndex: 'comment',
      key: 'comment',
    },{
      title: '应收款',
      dataIndex: 'needpay',
      key: 'needpay',
      align: 'right',
      render: (text, record) => {
        return Number(record.needpay).toFixed(2);
      },
    }, {
      title: '已收款',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render:(val, rec)=>{
        return(
          <a onClick={() => this.showPayDetail(rec.id)}>{this.getAmount(rec)}</a>
        )
      },
    },{
      title: '业务员',
      dataIndex: 'usrid',
      key: 'usrid',
      align: 'center',
      render(val) {
        let u = '';
        if(val && val !== '') {
          u = (
            <span >{val.split(':')[1]}</span>
          )
        }
        return u;
      },
    },{
      title: '取货方式',
      dataIndex: 'takewayname',
      key: 'takewayname',
      align: 'center',
      
    },{
      title: '拆单',
      align: 'center',
      dataIndex: 'splitor',
      key: 'splitor',
      render:(val,record)=>{
        return(
          <Button onClick={() =>{this.handleSplit(record)}}>拆单</Button>
        )   
      },
    },{
      title: '收款',
      dataIndex: 'payment',
      key: 'payment',
      align: 'center',
      render:(val, rec)=>{
        return(
          <Button onClick={() =>{this.clickpay(rec)}}>收款</Button>
        )
      },
    }];
    return(
      <PageHeaderLayout title="待收款">
        <div className={this.popWindow}>
          {this.state.isshow && <div className={styles.mask} onClick={() => this.setState({isshow: false})} />}
          <div className={styles.flexTable}>
            {this.state.isshow && <ReceiptRecord poptable={this.state.poptable} />}
          </div>
        </div>
        <Tabs type="card" onChange={this.changeDataList}>
          <TabPanes tab="预售单" key="1">
            <div className={styles.tableListForm}>
              {this.renderQueryForm()}
            </div>
            <Table
              rowKey="id"
              loading={this.state.loading}
              dataSource={dataList}
              columns={columns}
              pagination={pagination}
              bordered
              onChange={this.handlePresaleTableChange}
            />
          </TabPanes>
          <TabPanes tab="欠货单" key="2">
            <div className={styles.tableListForm}>
              {this.renderQueryForm()}
            </div>
            <Table
              rowKey="id"
              loading={this.state.loading}
              dataSource={dataList}
              columns={columns}
              pagination={pagination}
              bordered
              onChange={this.handleOweTableChange}
            />
          </TabPanes>
        </Tabs>
        <PickupForm {...pickupParentMethods} modalVisible={pickupVisible} pickupTmp={pickupTmp} />
      </PageHeaderLayout>
    )
  }
}
