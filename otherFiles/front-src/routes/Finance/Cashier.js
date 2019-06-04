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
} from 'antd';
import styles from './Cashier.less'
import { queryallpaydetail } from '../../services/api'
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {toDecimal, getMyDate} from '../../utils/utils';

const takewayArr = ["自提","快递","物流","送货上门"];
const FormItem = Form.Item;
const clientNameArr = [];
let dataList = [];
// const {TabPane} = Tabs.TabPane;
const TabPanes = Tabs.TabPane;

function handleDs(obj, pageIndex = 0, pageSize = 10, type) {
  let i = 0;
  let params = `pageIndex=${pageIndex}&pageSize=${pageSize}&sorts[0].name=id&sorts[0].order=desc&terms[0].value=3&terms[0].column=payway`;
  // params += `&terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
  i+=1;
  params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
  i+=1;
  // 如果填了单号，其它条件都是可以不管的。
  Object.keys(obj).forEach(key => {
    if((key === 'id') && obj[key] !== undefined) {
      params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=id&terms[0].value=3&terms[0].column=payway`;
      i += 1;
    }else if((key === 'shipphone') && obj[key] !== undefined) {
      params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=shipphone&terms[0].value=3&terms[0].column=payway`;
      i += 1;
    }else if((key === 'clientname' && obj[key] !== undefined)) {
      dataList.forEach(item =>{
        if(item.clientname === obj[key]) {
          params += `&terms[${i}].value=${item.clientid}&terms[${i}].column=clientid&terms[0].value=3&terms[0].column=payway`;
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

@connect(({ cashier, loading }) => ({
  cashier,
  loading: loading.models.paydetail,
}))
@Form.create()
export default class Cashier extends PureComponent {
   
  constructor(props){
    super(props);
    this.state = {
      pagesize: 10,
      loading: false,
      ispresale: true,
      paneskey: '1',
    }
  }

  componentDidMount() {
    let i = 0;
    let params = `pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc&terms[0].value=3&terms[0].column=payway`;
    // i += 1 ;
    // params += `&terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
    i+=1;
    params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
    i+=1;
    params += `&terms[${i}].value=0&terms[${i}].column=type`;
    i+=1;
    this.props.dispatch({
      type: 'cashier/submit',
      payload: params,
    })
  }

  getAmount = (rec) => {
    if(rec.amount !== undefined && rec.amount >0) {
      return Number(rec.amount).toFixed(2);
    } else {
      return 0
    }
    //  传参如下！！
/* 
    pageIndex=0&pageSize=10&terms[0].type=or&terms[0].value=1106072476239077376&terms[0].column=presaleid&
    terms[1].type=or&terms[1].value=1106072476239077376&terms[1].column=preceiveid&
    terms[2].termType=in&terms[2].value=1&terms[2].value=2&terms[2].value=3&terms[2].column=paytype */
  };

  handlePresaleTableChange = pagination => {
    const { form } = this.props;
    let i =0 ;
    let params = `pageIndex=${pagination.current-1}&pageSize=10&sorts[0].name=id&sorts[0].order=desc&terms[0].value=3&terms[0].column=payway`;
    i+=1;
    params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
    i+=1;
    params += `&terms[${i}].value=0&terms[${i}].column=type`;
    i+=1;
    form.validateFields((err) => {
      if (err) return;
      this.props.dispatch({
        type: 'cashier/submit',
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
    let i =0 ;
    let params = `pageIndex=${pagination.current-1}&pageSize=10&sorts[0].name=id&sorts[0].order=desc&terms[0].value=3&terms[0].column=payway`;
    // params += `&terms[${i}].value=0&terms[${i}].column=payway`;
    i+=1;
    params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
    i+=1;
    params += `&terms[${i}].value=1&terms[${i}].column=type`;
    i+=1;
    form.validateFields((err) => {
      if (err) return;
      this.props.dispatch({
        type: 'cashier/submit',
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
    queryallpaydetail(params).then(res=>{
      if(res && res.status === 200){
        const datas = res.result.data;
        const  remainmoney = toDecimal(rec.goodpay)+toDecimal(rec.shippay)+toDecimal(rec.securepay);
        let total = 0;
        datas.forEach(item => {
            total += toDecimal(item.amount);
        });
        const tmpmoney = remainmoney - total; 
        if(tmpmoney<=0){
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
              clientname:rec.clientid,
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

  handleSearch = (e) => {
    if(e) {e.preventDefault();}
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      if(this.state.paneskey === '1') {
        const ds = handleDs(values, 0, 10, 1)
        this.props.dispatch({
          type: 'cashier/submit',
          payload: ds,
        })
      } else if(this.state.paneskey === '2') {
        const ds = handleDs(values, 0, 10, 2)
        this.props.dispatch({
          type: 'cashier/submit',
          payload: ds,
        })
      }
    });
  };

  handleFormReset = () => {
    this.props.form.resetFields();
    if(this.state.paneskey === '1') {
      let params = `pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc&terms[0].value=3&terms[0].column=payway`;
      let i =0 ;
      // params += `&terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
      i+=1;
      params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
      i+=1;
      params += `&terms[${i}].value=0&terms[${i}].column=type`;
      i+=1;
      this.props.dispatch({
        type: 'cashier/submit',
        payload: params,
      })
    } else if(this.state.paneskey === '2') {
      let params = `pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc&terms[0].value=3&terms[0].column=paywa`;
      let i =0 ;
      i+=1;
      params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
      i+=1;
      params += `&terms[${i}].value=1&terms[${i}].column=type`;
      i+=1;
      this.props.dispatch({
        type: 'cashier/submit',
        payload: params,
      })
    }
  };

  loadData = (key) => {
    let params = ``;
    let i =0 ;
    // params += `&terms[${i}].value=0&terms[${i}].column=payway`;
    params += `sorts[0].order=desc&terms[0].value=3&terms[0].column=payway`;
    i+=1;
    params += `&terms[${i}].termType=not&terms[${i}].value=5&terms[${i}].column=paytype`;
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
        type: 'cashier/submit',
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
        type: 'cashier/submit',
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
    const { cashier } = this.props;
    const { data } = cashier;

    let pagination = {};

    if (data && data.status === 200 && data.result.data) {
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
    }, {
      title: '已收款',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      render:(val, rec)=>{
        return(
          <span>{this.getAmount(rec)}</span>
        )
      },
    },{
      title: '业务员',
      dataIndex: 'usrid',
      key: 'usrid',
      align: 'center',
      render(val) {
        return <span >{val.split(':')[1]}</span>;
      },
    },{
      title: '取货方式',
      dataIndex: 'takeway',
      key: 'takeway',
      align: 'center',
      render(val) {
        return <span >{takewayArr[val]}</span>;
      },
    },{
      title: '收款',
      dataIndex: 'payment',
      align: 'center',
      render:(val, rec)=>{
        return(
          <Button onClick={() =>{this.clickpay(rec)}}>收款</Button>
        )
      },
    }];
    return(
      <PageHeaderLayout title="收银列表">
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
        
      </PageHeaderLayout>
    )
  }
}
