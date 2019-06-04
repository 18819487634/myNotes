import React, {PureComponent, Fragment} from 'react';
import {
  Table,
  Modal,
  Button,
  Tabs,
  Card,
  Form,
  Row,
  Col,
  Input,
  message,
  Tooltip,
} from 'antd';
import { connect } from 'dva';
import styles from '../Finance/Cashier.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getMyDate } from '../../utils/utils';
import SearchTable from './SearchTable';
import { getCurrentUser } from '../../utils/sessionStorage';

const paywayArr = ["现金", "支付宝", "微信", "银行"];
// const reviewStatusArr = ["未审核", "通过", "交结", "失败", "作废"];
const TabPanes = Tabs.TabPane;
let dataList = [];
const FormItem = Form.Item;
const {username} = JSON.parse(getCurrentUser());

function handleDs(obj, pageIndex = 0, pageSize = 10, type) {
  let i = 0;
  let index = pageIndex;
  if (index >= 1) {
    index -= 1;
  }
  let params = `pageIndex=${index}&pageSize=${pageSize}&sorts[0].name=id&sorts[0].order=desc`;
  i+=1;
  // params += `&terms[${i}].value=${username}&terms[${i}].column=usrid`;
  // i+=1;
  if (type === 'search') {
    Object.keys(obj).forEach(key => {
      if((key==='presaleid') && obj[key] !== undefined){
        /* 
          单号查找 
        */
        params += `&terms[${i}].type=or&terms[${i}].value=${obj[key]}&terms[${i}].column=presaleid`;
        i+=1;
        params += `&terms[${i}].type=or&terms[${i}].value=${obj[key]}&terms[${i}].column=preceiveid`;
        i+=1;
      }else if(key==='validstatus' && obj[key] !== -1){
        /* 
          审核状态查找 
          目前只有三种状态：0 未审核，1 通过，2失败
          数据库中：0 未审核，1 通过， -1 失败 
        */
        if(obj[key] === 2) {
          params += `&terms[${i}].value=-1&terms[${i}].column=validstatus`;
          i+=1;
        } else {
          params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=validstatus`;
          i+=1;
        }
      } else if(key==='paytype' && obj[key] !== -1 ) {
      /* 
        收款方式查找
        收款方式：0 现金，1 支付宝，2 微信，3 银行
      */
        params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=paytype`
      } else if(key==='clientname' && obj[key] !== undefined) {
        /* 
          客户名查找
        */
        let clientid = '';
        dataList.forEach((item) => {
          if(item.clientname === obj[key]) {
            // eslint-disable-next-line prefer-destructuring
            clientid = item.clientid;
          }
        })
        params += `&terms[${i}].value=${clientid}&terms[${i}].column=clientid`
      }
    });
  } else if(type === 'get') {
    params += `&terms[${i}].termType=in&terms[${i}].value=0&terms[${i}].value=1&terms[${i}].value=2&terms[${i}].value=3&terms[${i}].column=paytype`;
  }
  return params;
}

const CreateForm = Form.create()(props => {
  const {data, modalVisible, form, handleAuditing, handleModalVisible} = props;

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      const payload = {
        ...fieldsValue,
        id: data.id,
        cancelstatus: 1,
      }
      handleAuditing(payload);
    })
  };

  return(
    <Modal
      title="作废"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <Row gutter={{md: 8, lg: 24, xl: 48}}>
        <Col md={8} sm={24} style={{width: '70%'}}>
          <FormItem labelCol={{span: 5}} wrapperCol={{span: 15}} label="流水单号">
            {data.id ? data.id : null}
          </FormItem>
          <FormItem labelCol={{span: 5}} wrapperCol={{span: 15}} label="订单编号">
            {data.presaleid === '' ? data.preceiveid : data.presaleid}
          </FormItem>
          <FormItem labelCol={{span: 5}} wrapperCol={{span: 15}} label="收款金额">
            {data.amount}
          </FormItem>
          <FormItem labelCol={{span: 5}} wrapperCol={{span: 15}} label="摘要">
            {data.comment && data.comment !== '' ? data.commnet : null}
          </FormItem>
          <FormItem labelCol={{span: 5}} wrapperCol={{span: 15}} label="收款账号">
            {data.accountidShow ? data.accountidShow : null}
          </FormItem>
          <FormItem labelCol={{span: 5}} wrapperCol={{span: 15}} label="付款人">
            {data.clientid}
          </FormItem>
          <FormItem labelCol={{span: 5}} wrapperCol={{span: 15}} label="付款账号">
            {data.payaccountid ? data.payaccountid : null}
          </FormItem>
          <FormItem labelCol={{span: 5}} wrapperCol={{span: 15}} label="流水号">
            {data.receiptno ? data.receiptno : null}
          </FormItem>
          <FormItem labelCol={{span: 5}} wrapperCol={{span: 15}} label="作废原因">
            {form.getFieldDecorator('invalidreason', {
              rules: [{required: true, message: '请输入作废原因'}],
              initialValue: data.invalidreason ? data.invalidreason : null,
            })(<Input style={{marginLeft: 10}} placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col md={8} sm={24} style={{width:'20%',height:'100%'}}>
          <div style={{width:'100%',height:'100%'}} > <img alt="" style={{width:'100%',height:'100%'}} src={data.picurl} /></div>
        </Col>
      </Row>
    </Modal>
  )
});

@connect(({ receiptrecord, loading }) => ({
  receiptrecord,
  loading: loading.models.paydetail,
}))
@Form.create()
export default class ReceiptRecord extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pageindex: 1,
      pagesize: 10,
      modalVisible:false,
      shenpirecord:{},
    }
  };

  componentDidMount() {
    if(!this.props.poptable) {
      const { form } = this.props;
      form.validateFields((err, fieldsValue) => {
        const ds = handleDs(fieldsValue, 0, 10, 'get');
        this.props.dispatch({
          type: 'receiptrecord/submit',
          payload: ds,
        })
      })
    }
    
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  showpicurl = (picurl) => {
    Modal.success({
      title: `单据详情`,
      content: <img alt="加载失败" src={picurl} style={{width: '100%'}} />,
      maskClosable: true,
      onOk() {
      },
    });
  };



  handleInvalid = (record) => {
    this.setState({
      modalVisible: true,
      shenpirecord: record,
    })
  };


  handleAuditing = fields => {
    this.props.dispatch({
      type: 'receiptrecord/changestatus',
      payload: fields,
      callback: () => {
        message.success('作废成功！');
        this.setState({
          modalVisible: false,
        });
        const ds = handleDs(fields, this.state.pageindex, 10, 'get');
        this.props.dispatch({
          type: 'receiptrecord/submit',
          payload: ds,
        })
      },
    })
  };

  handleStandardTableChange = pagination => {
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const ds = handleDs(fieldsValue, pagination.current,pagination.pageSize, 'get');
      this.props.dispatch({
        type: 'receiptrecord/submit',
        payload: ds,
      });
      this.setState({
        pageindex: pagination.current,
        pagesize: pagination.pageSize,
      });
    });
  };

  saveDate = (data, dataString) => {
    const dateArr = [];
    const start = new Date(dataString[0].replace(/-/g, '/'));
    const end = new Date(dataString[1].replace(/-/g, '/'));

    const startTime = start.getTime();
    const endTime = end.getTime();
    dateArr.push(startTime);
    dateArr.push(endTime)
    this.setState({
      time: dateArr,
    })
    this.props.dispatch({
      type: 'receiptrecord/submitDate',
      payload: dateArr,
    })
  }

  handleSearch = (data) => {
    // eslint-disable-next-line no-param-reassign
    data.time = this.state.time
    // data.push({time: this.state.time})
    const keys = Object.keys(data)
    let status = 0
    for(let i = 0; i < keys.length; i += 1) {
      if(data[keys[i]] === undefined) {
        status += 1;
      } else if(data[keys[i]] === -1 || data[keys[i]] === 2) {
        status += 1;
      }
    }
    if(status !== 4) {
      const ds = handleDs(data, 0, 10, 'search');
      this.props.dispatch({
        type: 'receiptrecord/submit',
        payload: ds,
      })
    }

    const ds = handleDs(data, 0, 10, 'search');
      this.props.dispatch({
        type: 'receiptrecord/submit',
        payload: ds,
      })
    
  };

  handleFormReset = () => {
    this.props.form.resetFields();
  };

  // eslint-disable-next-line react/sort-comp
  renderReview = (text, record) => {
    let t = "";
    const status = record.validstatus;
    // 非现金
    if(record.paytype !== 0) {
      if((status === 0 && !record.cancelstatus) || (status === 0 && record.cancelstatus && record.cancelstatus === 0)) {
        t = ( <span>未审核</span> )
      } else if(record.cancelstatus && record.cancelstatus === 1) {
        t = ( <span style={{color: '#FF0000'}}>作废</span> )
      } else if(status === -1) {
        t = ( <span style={{color: '#FF0000'}}>失败</span> )
      } else if(status === 1) {
        t = ( <span style={{color: '#00FF00'}}>通过</span> )
      }
    } else if(record.paytype === 0) {   //  现金
      if(((!record.transfer || (record.transfer && record.transfer === 0)) && ((record.cancelstatus && record.cancelstatus === 0) || !(record.cancelstatus)))) {
        t = ( <span>未交结</span> )
      } else if(record.cancelstatus === 1) {
        t = ( <span style={{color: '#FF0000'}}>作废</span> )
      } else if(record.transfer === 1) {
        t = ( <span style={{color: '#00FF00'}}>交结</span> )
      }
    }
    return t;
  };

  render() {
    const { receiptrecord, loading } = this.props;
    const { data } = receiptrecord;
    const {modalVisible,shenpirecord } = this.state;

    if(data && data.status === 200 && data.result.data) {
      data.list = data.result.data;
      data.pagination = {
        total: data.result.total,
        current: this.state.pageindex,
        pageSize: this.state.pagesize,
        showTotal:() => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: false,
      };
      dataList = data.list;
    };

    const columns=[{
      title: '收款交易流水号',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (val, record) => {
        return (
          <Tooltip placement="top" title={record.comment}>
            <li>{record.id}</li>
            <li>{getMyDate(record.createdate)}</li>
          </Tooltip>
        );
      },
    }, {
      title: '收款方式',
      dataIndex: 'paytype',
      key: 'paytype',
      align: 'center',
      render(val) {
        return <span>{paywayArr[val]}</span>
      },
    }, {
      title: '收款账户',
      dataIndex: 'accountid',
      key: 'accountid',
      render: (text,record) => {
        return record.accountidShow  ;
      },
    }, {
      title: '付款账户',
      dataIndex: 'payaccountid',
      key: 'payaccountid',
    },{
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      render: (val, record) => {
        let t = 0;
        if (Number(val) > 0) {
          t = (
            <span style={record.validstatus === -1 ? {textDecoration: 'line-through'} : {}}>￥{Number(val).toFixed(2)}</span>
          )
        }
        return t;
      },
    },{
      title: '单据',
      dataIndex: 'receiptimg',
      key: 'receiptimg',
      align: 'center',
      render: (text, record) => {
        let url = ''
        if(record.picurl !== '') {
          url = (
            <a onClick={() =>this.showpicurl(record.picurl)}>图</a>
          )
        }
        return url;
      },
    },{
      title: '审核',
      dataIndex: 'validstatus',
      key: 'validstatus', 
      align: 'center',
      render: (text, record) => this.renderReview(text, record),
    },{
      title: '单号/客户',
      dataIndex: 'preceiveid',
      key: 'preceiveid',
      align: 'center',
      render: (text,record) => {
        let d = record.presaleid;
        if(record.preceiveid !== undefined && record.preceiveid !== ''){
          d=record.preceiveid;
        }
        return (
          <div>
            <li>{d}</li>
            <li>{record.clientname}</li>
          </div>
        );
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
      title: '收款人',
      dataIndex: 'createid',
      key: 'createid',
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
      title: '作废',
      dataIndex: '',
      align: 'center',
      render:(text, record)=>{
        let t = '';
        const status = record.validstatus;

        if((record.createid === username)) {
          //  非现金
          if(record.paytype !== 0) {
            if(status === 0 && (!record.cancelstatus || (record.cancelstatus && record.cancelstatus === 0))) {
              t = ( <Button type="danger" onClick={() => this.handleInvalid(record)}>作废</Button> )
            }
          } else if(record.paytype === 0) {   //  现金
            if(status === 1 && ((!record.transfer || (record.transfer && record.transfer === 0)) && ((record.cancelstatus && record.cancelstatus === 0) || !record.cancelstatus))) {
              t = ( <Button type="danger" onClick={() => this.handleInvalid(record)}>作废</Button> )
            }
          }
        }
        return t;
      },
    }];

    const parentMethods = {
      handleAuditing: this.handleAuditing,
      handleModalVisible: this.handleModalVisible,
    };


    let view = '';
    if(!this.props.poptable) {
      view = (
        <PageHeaderLayout title="收款记录">
          <Card>
            <div className={styles.tableList}>
              <SearchTable handleSearch={this.handleSearch} saveDate={this.saveDate} />
              <Tabs hideAdd type="editable-card">
                <TabPanes closable={false} tab="业务员">
                  <CreateForm {...parentMethods} modalVisible={modalVisible} data={shenpirecord} />
                  <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={dataList}
                    bordered
                    pagination={data.pagination}
                    onChange={this.handleStandardTableChange}
                  />
                </TabPanes>
              </Tabs>
            </div>
          </Card>
        </PageHeaderLayout>
      )
    } else if(this.props.poptable === true) {
      view = (
        <Fragment>
          <Card>
            <Table
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={dataList}
              bordered
              pagination={data.pagination}
              onChange={this.handleStandardTableChange}
            />
          </Card>
        </Fragment>
      )
    }

    return view;
  }
}
