import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Button, Badge, Modal, Table, Tabs, InputNumber, Checkbox, Radio  } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getSupplyId } from '../../utils/sessionStorage';

import styles from './PicktimeSettingProfile.less';

import { addsupplydictionry, updatesupplydictionry } from '../../services/api';
import { DictionaryType } from '../../utils/utils';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

let overKind = '';

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['error', 'success'];
const status = ['无效', '有效'];
// ===========第一个弹窗===================
const DictionryForm = Form.create()(props => {
  const { modalVisible, CancelModalVisible, form, updateRows, options, handleKindAdd, cangkudata } = props;
  const { getFieldDecorator, validateFieldsAndScroll } = form;

  const formItemLayout = {
    labelCol: {
      xs: { span: 2 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
      md: { span: 12 },
    },
  };
  const datasouce = updateRows;

  let id2 = '';
  let value2 = '';
  let isact2 = 1;
  let key2 = '';
  let type2 = '6';
  if (Object.keys(datasouce).length !== 0) {
    id2 = datasouce.id;
    isact2 = datasouce.isact;
    value2 = datasouce.value;
    key2 = datasouce.key;
    type2 = datasouce.type;
   
    cangkudata.map((item,index)=>{
      if(item.value == key2){
        key2 = item.key;
      }
    })
  }

  let titlename = '';
  if (JSON.stringify(updateRows) === '{}') {
    titlename = '新增';
  } else {
    titlename = '修改';
  }

  const okHandle = () => {
    validateFieldsAndScroll((error, values) => {
      if (values.id === '') {
        delete values.id;
      }
      let params = values;
      params.type = 6;
      params.supplyid = getSupplyId();
    
      handleKindAdd(params);
    });
  };

  return (
    <Modal
      title={titlename}
      width="68%"
      visible={modalVisible}
      onOk={okHandle}
      maskClosable={false}
      onCancel={() => CancelModalVisible()}
    >
      <Form>
        <Row gutter={{ md: 12, lg: 24, xl: 24 }}>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="id">
                {getFieldDecorator('id', { initialValue: id2 })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>

          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="拣货重量偏差(KG)">
                {getFieldDecorator('value', { initialValue: value2 })(
                  <InputNumber min={0.0} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="适用的仓库">
                {getFieldDecorator('key', { initialValue: key2 })(
                  <Select>
                    <Option value={0}>仓库1</Option>
                    <Option value={1}>仓库2</Option>
                    <Option value={2}>仓库3</Option>
                    <Option value={3}>湖北仓库</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="描述">
                {getFieldDecorator('isact', { initialValue: isact2 })(<Input placeholder="描述" />)}
              </FormItem>
            </Col>
          </Row>
        </Row>
      </Form>
    </Modal>
  );
});
// ===============第三个弹窗===============
const DictionryFormthree = Form.create()(props => {
  const { modalVisible, CancelModalVisible, form, updateRows, options, handleKindAdd } = props;
  const { getFieldDecorator, validateFieldsAndScroll } = form;

  const formItemLayout = {
    labelCol: {
      xs: { span: 2 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
      md: { span: 12 },
    },
  };
  const datasouce = updateRows;

  let id2 = '';
  let value2 = '';
  let isact2 = 1;
  let key2 = '';
  let type2 = '';
  let value4 = '';
  if (Object.keys(datasouce).length !== 0) {
    id2 = datasouce.id;
    isact2 = datasouce.isact;
    value2 = datasouce.value;
    key2 = datasouce.key;
    type2 = datasouce.type;
    value4 = datasouce.value4;
  }

  let titlename = '';
  if (JSON.stringify(updateRows) === '{}') {
    titlename = '新增';
  } else {
    titlename = '修改';
  }

  const okHandle = () => {
    validateFieldsAndScroll((error, values) => {
      // delete values.id;
      if (values.id === '') {
        delete values.id;
      }
      let params = values;
      params.type = 4;
      params.supplyid = getSupplyId();
      value4 = params.value4;
      let value5 = params.value;
      let params4 = params;


      params4.value = value4;
    
       handleKindAdd(params4);//这是产品总数量的传值

      let params5 = params;
      params5.value = value5;
      params5.type = 5;
      
      setTimeout(() => {
       
          handleKindAdd(params5);//这是拣货总重量的传值
      }, 10);
    });
  };

  return (
    <Modal
      title={titlename}
      width="68%"
      visible={modalVisible}
      onOk={okHandle}
      maskClosable={false}
      onCancel={() => CancelModalVisible()}
    >
      <Form>
        <Row gutter={{ md: 12, lg: 24, xl: 24 }}>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="id">
                {getFieldDecorator('id', { initialValue: id2 })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>

          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="拣货总重量(KG)">
                {getFieldDecorator('value', { initialValue: value2 })(
                  <InputNumber min={0.0} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="产品总数量">
                {getFieldDecorator('value4', { initialValue: value4 })(
                  <InputNumber min={0.0} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="描述">
                {getFieldDecorator('productnum', { initialValue: isact2 })(<Input placeholder="描述" />)}
              </FormItem>
            </Col>
          </Row>
        </Row>
      </Form>
    </Modal>
  );
});

@connect(({ supplydictionry, loading }) => ({
  supplydictionry,
  loading: loading.models.supplydictionry,
}))
@Form.create()
export default class PicktimeSettingProfile extends PureComponent {
  state = {
    KindeModalVisible: false,
    KindeModalVisiblethree: false,
    selectedRows: [],
    formValues: {},
    updateRows: {},
    titlename: '',
    flag: false,
    panes:[
      {title:"拣货偏差设置",key:"1"},
      {title:"拣货结束设置",key:"2"},
      {title:"拣货拆单设置",key:"3"},
      {title:"拣货加时设置",key:"4"}
    ],
    activeKey:"1",
    cangkudata:[],
    value77:'1',
  };

  // ===============================
  componentWillMount(){
    const { dispatch } = this.props;
    // const supplyids = getSupplyId();
    const params6 = `terms[0].value=6&terms[0].column=type&pageIndex=0&pageSize=21`;
    dispatch({
      type: 'supplydictionry/fetch',
      payload: params6,
    });
    
    //请求对应仓库的数据 
    const paramscangku = `terms[0].value=3&terms[0].column=type`;
    dispatch({
      type: 'supplydictionry/fetchcangku',
      payload: paramscangku,
    });
    
    
  }
  onTabsChange = (activeKey) => {
   
    this.setState({ activeKey:activeKey });
    const { dispatch } = this.props;
    if(activeKey == 1){
      const params = `terms[0].value=6&terms[0].column=type&pageIndex=0&pageSize=1`;
  
      dispatch({
        type: 'supplydictionry/fetch',
        payload: params,
      });
      }
    if(activeKey == 2){
    const params = `terms[0].value=7&terms[0].value=8&terms[0].termType=in&terms[0].column=type`;

    dispatch({
      type: 'supplydictionry/fetch',
      payload: params,
    });
    }else if(activeKey == 3){
      // 同时请求两个数据接口
      const params = `terms[0].value=4&terms[0].value=5&terms[0].termType=in&terms[0].column=type&pageIndex=0&pageSize=2`;
      dispatch({
        type: 'supplydictionry/fetch',
        payload: params,
      });
    }else if(activeKey == 4){
      
    }
  }


  // ===============================
  componentDidMount() {
    const { dispatch } = this.props;
    // ===================2019.01.09修改的代码===========================
    const { supplydictionry: { cangku} } = this.props;
    // 处理仓库数据
    if (cangku && cangku.status === 200 && cangku.result.data) {
      this.setState({
        cangkudata:cangku.result.data
      })
      
    }


    //================================================
    const supplyids = getSupplyId();
    this.query();
    const children = [];
    for (let i = 0; i < DictionaryType.length; i += 1) {
      children.push(
        <Option key={i + 1} value={i + 1}>
          {DictionaryType[i]}
        </Option>
      );
    }
    // DictionaryTypeEnum.forEach(item=>{
    //     children.push(<Option key={item.value} value={item.value}>{item.key}</Option>);
    // })
    
  }

  query = () => {
    const children = [];
    for (let i = 0; i < DictionaryType.length; i += 1) {
      children.push(
        <Option key={i + 1} value={i + 1}>
          {DictionaryType[i]}
        </Option>
      );
    }
    this.setState({ children });
  };
  // 路由方法
  handleKindAdd = params => {
    const ds = `terms[0].value=6&terms[0].column=type&pageIndex=${0}&pageSize=${10}`;
    if (params.id === undefined) {
      addsupplydictionry(params).then(response => {
        if (response && response.status === 200) {
          this.props.dispatch({
            type: 'supplydictionry/fetch',
            payload: ds,
          });
          this.setState({
            KindeModalVisible: false,
          });
        }
      });
    } else {
      updatesupplydictionry(params).then(response => {
        if (response && response.status === 200) {
          this.props.dispatch({
            type: 'supplydictionry/fetch',
            payload: params,
          });

          this.setState({
            KindeModalVisible: false,
          });
        }
      });
    };
    if(params.type == 6){
      const type6 = `terms[0].value=6&terms[0].column=type&pageIndex=0&pageSize=1`;
      
      setTimeout(()=>{
        this.props.dispatch({
          type: 'supplydictionry/fetch',
          payload: type6,
        });
      },500)
    }
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'supplydictionry/fetch',
      payload: params,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  CancelModalVisible = flag => {
    this.setState({
      KindeModalVisible: !!flag,
      KindeModalVisiblethree: !!flag,
    });
  };
// ============打开第一个弹窗==============
  handleModalVisible = (flag, dataStatus, row) => {
    if (dataStatus === 'new') {
      this.setState({
        KindeModalVisible: flag,
        updateRows: {},
      });
    } else {
      this.setState({
        KindeModalVisible: flag,
        updateRows: row,
      });
    }
  };
  // =-=======打开第三个弹窗==============
  handleModalVisiblethree = (flag, dataStatus, row) => {
    if (dataStatus === 'new') {
      this.setState({
        KindeModalVisiblethree: flag,
        updateRows: {},
      });
    } else {
      this.setState({
        KindeModalVisiblethree: flag,
        updateRows: row,
      });
    }
  };
  handleSearch = e => {
    //  const params =`terms[0].value=${value}&terms[0].column=type&pageIndex=${0}&pageSize=${10}`;

    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = fieldsValue;
      if (params.isact === undefined) {
        delete params.isact;
      }
      const values = this.createTerms(params);

      dispatch({
        type: 'supplydictionry/fetch',
        payload: values,
      });
      this.setState({
        flag: true,
        titlename: DictionaryType[fieldsValue.type - 1],
        options: fieldsValue.type,
      });
    });
  };
  createTerms = (obj, pageIndex = 1, pageSize = 12) => {
    let i = 0;
    let params = `pageIndex=${pageIndex}&pageSize=${pageSize}`;
    Object.keys(obj).forEach(key => {
      params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=${key}`;
      i += 1;
    });

    return params;
  };

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    const divstyle = {
      backgroundColor: this.state.bgcolor,
    };
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="类别">
              {getFieldDecorator('type')(
                <Select style={{ width: 100 }}>{this.state.children}</Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="有效性">
              {getFieldDecorator('isact')(
                <Select placeholder="请选择" style={{ width: 100 }}>
                  <Option value={1}>有效</Option>
                  <Option value={0}>无效</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
  endClick(record){
   

  }
  render() {
    const { supplydictionry: { data} } = this.props;
    let dataList = [];
    let dataArr = [];//新建表格数组  
    let monidata = [];//表单2的数据表格
    let value77;
    let value88;
    if (data && data.status === 200 && data.result.data) {
      data.list = data.result.data;
      data.pagination = {
        total: data.result.total,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: true,
      };
      dataList = data.list;  // 假设我的数据始终只有一条显示,返回的两条数据。我要拿来进行数据渲染，拆分改变键值对
      if(dataList.type == 4){
        let value4 ;
        dataList.map((item,index)=>{
          if(item.type == 4){
            value4 = item.value;
          }
          else if(item.type == 5){
            item.value4 = value4;
            dataArr.push(item);
          }
        });
       
      }
      if(dataList.type == 7){
        monidata =data.result.data;
       
      };
    };
    
    // 0110数据处理
    monidata.map((item)=>{
      if(item.type == 7){
        value77 = item.value;
        this.setState({
          value77:Number(value77)-1
        })
      }
    })
    
    // 表单2的渲染数据
    let hgyarr = [
      {
        value:'拣货员',
        key:'1',
        isact:'1',
        ms:'只有一人完成，没有核对员',
        value7:false,
        value8:'1'
      },
      {
        value:'拣货员 ---> 核对员',
        key:'2',
        isact:'1',
        ms:'两个人完成',
        value7:false,
        value8:'2'
      },
      {
        value:'拣货员 ---> 仓管员 ---> 核对员',
        key:'3',
        isact:'1',
        ms:'三个人完成，扫码核对打勾：表示扫码后才可提交',
        value7:false,
        value8:'3'
      }
    ];

    hgyarr.map((item,index)=>{
      if(item.key == this.state.value77){
        item.value8 = 1;
      }
    })

    
    const {
      selectedRows,
      KindeModalVisible,
      updateRows,
      options,
      titlename,
      flag,
      children,
      cangkudata
    } = this.state;

    const columns1=[
      {
        title: '拣货偏差重量(Kg)',
        width:"10%",
        dataIndex: 'value',
        key: 'value',
      },
      {
        title: '适用于(仓库)',
        width:"10%",
        dataIndex: 'key',
        key: 'key',
        render:(text) =>{
          if(text == 0){
            return '仓库1'
          }else if(text == 1){
            return '仓库2'
          }else if(text == 2){
            return '仓库3'
          }else if(text == 3){
            return '湖北仓库'
          }
        }
      },
      {
        title: '描述',
        dataIndex: 'isact',
        key: 'isact',
      },
      {
        title: '操作',
        width:"10%",
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record) => {
          return <a onClick={() => this.handleModalVisible(true, 'update', record)}>修改</a>;
        },
      }
    ];
    const columns2=[
      {
        title:'仓库出库流程设置',
        dataIndex: 'value',
        width:'20%'
      },
      {
        title: '扫码核对',
        dataIndex: 'valu8',
        width:"10%",
        render:(text)=>{
          return <Radio value={text} className="value8"></Radio>
          
        }
      },
      {
        title: '描述',
        dataIndex: 'ms',
        key: 'ms',
        
      },
      {
        title: '按钮',
        dataIndex: 'anniu',
        width:'10%',
        render:(text,record)=>{
          return <a onClick={this.endClick.bind(this,record)}>更改</a>
        }
      }
    ];
    const columns3=[
      {
        title: '拣货总重量(Kg)',
        width:"10%",
        dataIndex: 'value',
        key: 'value',
      },
      {
        title: '产品总数量',
        width:"10%",
        dataIndex: 'value4',
        key: 'value4',
      },
      {
        title: '描述',
        dataIndex: 'isact',
        key: 'isact',
      },
      {
        title: '操作',
        width:"10%",
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record) => {
          return <a onClick={() => this.handleModalVisible(true, 'update', record)}>修改</a>;
        },
      }
    ];
    const columns4=[
      {
        title: '仓库',
        width:"10%",
        dataIndex: 'key',
        key: 'key',
      },
      {
        title: '开始时间',
        width:"10%",
        dataIndex: 'supernum',
        key: 'supernum',
      },
      {
        title: '结束时间',
        width:"10%",
        dataIndex: 'productnum',
        key: 'productnum',
      },
      {
        title: '加时分钟',
        width:"10%",
        dataIndex: 'isact',
        key: 'isact',
      },
      {
        title: '暂停',
        width:"10%",
        dataIndex: 'suspend',
        key: 'suspend',
      },
      {
        title: '描述',
        dataIndex: 'describe',
        key: 'describe',
      },
      {
        title: '操作',
        width:'10%',
        dataIndex: 'describ',
        key: 'describ',
        render: (text, record) => {
          return <a onClick={() => this.handleModalVisiblefour(true, 'update', record)}>修改</a>;
        },
      },
    ];


    const parentMethods = {
      handleKindAdd: this.handleKindAdd,

      CancelModalVisible: this.CancelModalVisible,

      onSelect: this.onSelect,
    };

    return (
      <PageHeaderLayout title="拣货设置">
        <Card bordered={false}>
          <div className={styles.tableList}>
            {/* <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div> */}
              <Tabs
                type="card"
                onChange={this.onTabsChange}
              >
                {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>
                { 
                  (()=>{
                    if(pane.key == 1){
                    return (
                  <Button type="primary" onClick={() => this.handleModalVisible(true, 'new')}>
                    新建
                  </Button>
                    )
                  }
                  if(pane.key == 2){
                    return (
                  <Button type="primary" onClick={() => this.handleModalVisibletwo(true, 'new')}>
                    新建
                  </Button>
                    )
                  }
                  if(pane.key == 3){
                    return (
                  <Button type="primary" onClick={() => this.handleModalVisible(true, 'new')}>
                    新建
                  </Button>
                    )
                  }
                  if(pane.key == 4){
                    return (
                  <Button type="primary" onClick={() => this.handleModalVisiblefour(true, 'new')}>
                    新建
                  </Button>
                    )
                  }
                  })()
                  
                }
                {
                  (()=>{
                    if(this.state.activeKey == 1){
                      return <Table
                      rowKey="id"
                      selectedRows={selectedRows}
                      dataSource={dataList}
                      columns={columns1}
                      onSelectRow={this.handleSelectRows}
                      onChange={this.handleStandardTableChange}
                      // loading={true}
                    />
                    }
                    else if(this.state.activeKey == 2){
                      return <Table
                      rowKey="id"
                      selectedRows={selectedRows}
                      dataSource={hgyarr}
                      columns={columns2}
                      onSelectRow={this.handleSelectRows}
                      onChange={this.handleStandardTableChange}
                      rowSelection={{type:'radio',title:'选择'}}
                    />
                    }
                    else if(this.state.activeKey == 3){
                      return <Table
                      rowKey="id"
                      selectedRows={selectedRows}
                      dataSource={dataArr}
                      columns={columns3}
                      onSelectRow={this.handleSelectRows}
                      onChange={this.handleStandardTableChange}
                    />
                    }
                    else if(this.state.activeKey == 4){
                      return <Table
                      rowKey="id"
                      selectedRows={selectedRows}
                      dataSource={dataList}
                      columns={columns4}
                      onSelectRow={this.handleSelectRows}
                      onChange={this.handleStandardTableChange}
                    />
                    }

                  })()
                }
                </TabPane>)}
              </Tabs>
            </div>
          
        </Card>
        {
          (()=>{
            if(this.state.activeKey == 1){
              return <DictionryForm
              {...parentMethods}
              modalVisible={KindeModalVisible}
              updateRows={updateRows}
              options={options}
              cangkudata={this.state.cangkudata}
            />
            }
            else if(this.state.activeKey == 3){
              return <DictionryFormthree
              {...parentMethods}
              modalVisible={KindeModalVisible}
              updateRows={updateRows}
              options={options}
            />
            }
          })()
        }
        
       
      </PageHeaderLayout>
    );
  }
}
