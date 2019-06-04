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
  Input,
} from 'antd';

import styles from './SaleProfile.less';

import { getMyDate, recordstatusList, ismergeList } from '../../utils/utils';

// 
const FormItem = Form.Item;

const { Option } = Select;

const takewayArr = ['自提', '快递', '物流', '送货上门'];

const paymentArr = ['全款', '月结'];

const clientNameArr= [];
@connect(({ sale, loading }) => ({
  sale,
  loading: loading.models.sale,
}))
@connect(({ erpclient, loading }) => ({
  erpclient,
  loading: loading.models.erpclient,
}))
@Form.create()
export default class SaleProfileList extends PureComponent {
    constructor(props){
        super(props);
        this.state = {
            panes: [{ key: '1' }],
            activeKey: '1',
            pageindex: 1,
            pagesize: 10,
          };
    }
    

  componentDidMount() {
     
      const params = `pagin=false&terms[0].value=0&terms[0].column=issupply`;
      this.props.dispatch({
          type:'erpclient/fetcherp',
          payload:params,
          callback:((res)=>{
            clientNameArr.length = 0;
            res.forEach(item=>{
              const client = {
                name:item.name,
                id: item.id,
              }
              clientNameArr.push(client);
            });
            const values = `pageSize=10&pageIndex=0`;
            this.props.dispatch({
                type:'sale/fetch',
                payload:values,
            })
          }),
      })

    
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  
  handleSearch = () => {
    const {form,dispatch} = this.props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((error, values) => {
      const terms = this.formatTerms(values);
      this.setState({
        pageindex:1,
        pagesize:10,
      })
      dispatch({
        type:'sale/fetch',
        payload:terms,
      })
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
    const { form,dispatch } = this.props;
    form.validateFields((err,feildvalues) => {
      if (err) return;
      const params = feildvalues;
      this.setState({
        pageindex : pagination.current,   
        pagesize : pagination.pageSize,
      })
      const values = this.createTerms(params, pagination.current-1,pagination.pageSize);
     // const terms = `terms[0].value=0&terms[0].column=type&pageSize=${pagination.pageSize}&pageIndex=${pagination.current-1}`
     dispatch({
       type:'sale/fetch',
       payload:values,
     })
      
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
                <Select placeholder=""  showSearch filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                  {clientNameArr && clientNameArr.map((item) => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)}
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
    const { sale: { data } } = this.props;
    let dataList = [];
    if (data && data.status === 200 && data.result.data) {
      data.list = data.result.data;
      data.pagination = {
        total: data.result.total,
        pageIndex:this.state.pageindex,
        pageSize:this.state.pagesize,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: true,
      };
      dataList = data.list;
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
          dataIndex: 'clientname',
          key: 'clientname',
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
          dataIndex: 'takewayname',
          key: 'takewayname',
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
          dataIndex: 'trackstatus',
          key: 'trackstatus',

          render(val) {
            return <span>{val}</span>;
          },
        },
      ];

    return (
      <Fragment>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator} />
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
            <Table
              dataSource={dataList}
              columns={columns}
              pagination={data.pagination}
              onChange={this.handleStandardTableChange}
              rowKey="id"
            />
          </div>
        </Card>
      </Fragment>
    );
  }
}
