import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { Row, Col, Card, Form, Input, Select, Divider, Button, Modal, message, Table, TreeSelect } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getSupplyId } from '../../utils/sessionStorage';

import styles from './UserLocationProfile.less';
// import treedata from './treemune.js'

import { querysupplydictionry, updateuserlocation } from '../../services/api';

const FormItem = Form.Item;
const { Option } = Select;

const status = ['否', '是'];

const DictionryForm = Form.create()(props => {
  const { modalVisible, CancelModalVisible, form, updateRows, handleKindAdd, childrens,selectChage,treedata,destroy } = props;
  const { getFieldDecorator, validateFieldsAndScroll } = form;
let treedatas = treedata;
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
  // const treeData = treedata.treedata;
  let id2 = '';
  let usrname2 = '';
  let issupper2 = 1;
  let location2 = '';
  let area2 = '';
  let Choice = '';
  if (Object.keys(datasouce).length !== 0) {
    id2 = datasouce.id;
    issupper2 = datasouce.issupper;
    usrname2 = datasouce.username;
    location2 = datasouce.locations.split(',');
    area2 = `${datasouce.area}`;
    // 判断仓库对应赋值
    
    // areaData.map((item,index)=>{
    //   if(item.value === area2){
    //     area2 = item.key
    //   }
    // })

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
      
      const params = values;
      form.resetFields();
      params.supplyid = getSupplyId();
      let lo = params.locations.join(',');
      params.locations = lo;
      
      handleKindAdd(params);
    });
  };

  // 选中的回调
  const onChange = (value, label, extra)=>{
      
      location2 = label;
  
    }
  return (
    
    destroy
    ?''
    :
    <Modal
      title={titlename}
      width="68%"
      visible={modalVisible}
      onOk={okHandle}
      maskClosable={false}
      onCancel={() => CancelModalVisible()}
      centered={true}
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
              <FormItem {...formItemLayout} label="仓库信息">
                { 
                  getFieldDecorator('area', { initialValue: area2 })(
                    <Select style={{ width: 200 }} onChange={e=>selectChage(e)}>{childrens}</Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="用户名">
                {getFieldDecorator('username', { initialValue: usrname2 })(
                  <Input placeholder="用户名" />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="是否为仓管员">
                {getFieldDecorator('issupper', { initialValue: issupper2 })(
                  <Select>
                    <Option value={0}>否</Option>
                    <Option value={1}>是</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          {/* 位置 */}
          {/* <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="位置信息">
                {getFieldDecorator('locations', { initialValue: location2 })(
                  <Input placeholder="中间以,隔开，例如A01,A02" disabled="true" />
                )}
              </FormItem>
            </Col>
          </Row> */}
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="仓库区域">
                {
                  getFieldDecorator('locations', { initialValue: location2})(
                    treedatas.length===0?
                    <TreeSelect 
                      searchPlaceholder='请先选择仓库'
                      treeData={treedatas}
                      treeCheckable={true}
                      onChange={onChange}
                      disabled
                      dropdownStyle={{height:200}}
                      treeDefaultExpandAll={false}
                      size="small"
                      // dropdownMatchSelectWidth={false }
                    />:
                    <TreeSelect 
                      searchPlaceholder='请选择'
                      treeData={treedatas}
                      treeCheckable={true}
                      onChange={onChange}
                      
                      dropdownStyle={{height:200}}
                      treeDefaultExpandAll={false}
                      size="small"
                      // dropdownMatchSelectWidth={false }
                    />
                    )
                  }
              </FormItem>
            </Col>
          </Row> 
        </Row>
      </Form>
    </Modal>
  );
});

const areaMap = new Map();

@connect(({ userlocation, loading }) => ({
  userlocation,
  loading: loading.models.userlocation,
}))
@Form.create()
export default class UserLocationProfile extends PureComponent {
  state = {
    KindeModalVisible: false,
    selectedRows: [],
    treedata:[],
    updateRows: {},
    titlename: '',
    areaData:[],
  };

  // 数据处理代码
  componentWillMount() {
    
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const supplyids = getSupplyId();
    const params = `terms[0].value=${supplyids}&terms[0].column=supplyid&pageIndex=${0}&pageSize=${10}`;
    const params1 = `paging=false&terms[0].value=${supplyids}&terms[0].column=supplyid&terms[1].value=3&terms[1].column=type`;
    querysupplydictionry(params1).then(res => {
      if (res && res.status === 200) {
        const areaData = res.result.data;
        
        
        const children = [];
        areaData.forEach(item => {
          areaMap.set(item.value, item.key);
          children.push(
            <Option key={item.value} value={item.value}>
              {item.key}
            </Option>
          );
        });
        
        this.setState({
          children,
        });
        dispatch({
          type: 'userlocation/fetch',
          payload: params,
        });
      }
    });
  }
  selectChage =(e)=>{
    const params  = `paging=false&terms[0].value=${e}&terms[0].column=value&terms[1].value=${getSupplyId()}&terms[1].column=supplyid&terms[2].value=2&terms[2].column=type&terms[3].value=1&terms[3].column=isact`;
    querysupplydictionry(params).then(res=>{
      if(res && res.status){
        const dataResult = res.result.data;
        const treemuneData = [];
        const parentData = [];
        for(let i=0;i<dataResult.length;i+=1){
          if(parentData.indexOf(dataResult[i].remark)===-1 &&(dataResult[i].remark!==""&&dataResult[i].remark!==undefined)){
            parentData.push(dataResult[i].remark);
            treemuneData.push({
              title:dataResult[i].remark,
              value:dataResult[i].remark,
              children:[],
          });
          }
        }

        for(let z=0;z<dataResult.length;z+=1){
          for(let j=0;j<treemuneData.length;j+=1){
            if(treemuneData[j].title===dataResult[z].remark){
              const vallist ={
                title:dataResult[z].key,
                value:dataResult[z].key,
              }
              treemuneData[j].children.push(vallist);
            }
          
          }
        
        }
        
        this.setState({
          treedata:treemuneData,
        })
        
      }
    })
  }

  handleKindAdd = params => {
    this.props.form.resetFields();
    const ds = `terms[0].value=${getSupplyId()}&terms[0].column=supplyid&terms[1].value=${
      params.type
    }&terms[1].column=type&pageIndex=${0}&pageSize=${10}`;
    const locationList = `${params.locations}`.split(',');
    const dataParams = params;
    const locationSet = new Set();
    locationList.forEach(item => {
      locationSet.add(item);
    });
    let locations = '';
    locationSet.forEach(si => {
      locations += si;
      if (locationSet.size > 1) {
        locations += ',';
      }
    });
    if (locationSet.size > 1) {
      locations = locations.substring(0, locations.lastIndexOf(','));
    }

    dataParams.locations = locations;
    dataParams.area = parseInt(dataParams.area,10);
    updateuserlocation(dataParams).then(response => {
      if (response && response.status === 200) {
        message.success('提交成功！');
        this.props.dispatch({
          type: 'userlocation/fetch',
          payload: ds,
        });

        this.setState({
          KindeModalVisible: false,
          pageIndex:1,
          pageSize:10,
        });
      }
    });
  };

  handleStandardTableChange = pagination => {
    const { dispatch } = this.props;
    let ds = `terms[0].value=${getSupplyId()}&terms[0].column=supplyid&pageIndex=${pagination.current -
      1}&pageSize=${pagination.pageSize}`;
    if (this.state.issupper !== undefined) {
      ds += `&terms[1].value=${this.state.issupper}&terms[1].column=issupper`;
    }
    if (this.state.area !== undefined && this.state.issupper === undefined) {
      ds += `&terms[1].value=${this.state.area}&terms[1].column=area`;
    } else if(this.state.area !== undefined ){
      ds += `&terms[2].value=${this.state.area}&terms[2].column=area`;
    }

    dispatch({
      type: 'userlocation/fetch',
      payload: ds,
    });
    this.setState({
      pageIndex:pagination.current,
      pageSize:pagination.pageSize,
    })
    // const params = {
    //   currentPage: pagination.current-1,
    //   pageSize: pagination.pageSize,

    //   ...formValues,
    //   ...filters,
    // };
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  CancelModalVisible = flag => {
    this.setState({
      treedata:[],
      destroy:true, 
      KindeModalVisible: !!flag,
    });
  };

  handleModalVisible = (flag, dataStatus, row) => {
    
    if (dataStatus === 'new') {
      this.setState({
        treedata:[],
        KindeModalVisible: flag,
        destroy:false,
        updateRows: {},
      });
    } else {
      const params  = `paging=false&terms[0].value=${row.area}&terms[0].column=value&terms[1].value=${getSupplyId()}&terms[1].column=supplyid&terms[2].value=2&terms[2].column=type&terms[3].value=1&terms[3].column=isact`;
    querysupplydictionry(params).then(res=>{
      if(res && res.status){
        const dataResult = res.result.data;
        const treemuneData = [];
        const parentData = [];
        for(let i=0;i<dataResult.length;i+=1){
          if(parentData.indexOf(dataResult[i].remark)===-1 &&(dataResult[i].remark!=="" &&dataResult[i].remark!==undefined)){
            parentData.push(dataResult[i].remark);
            treemuneData.push({
              title:dataResult[i].remark,
              value:dataResult[i].remark,
              children:[],
          });
          }
        }

        for(let z=0;z<dataResult.length;z+=1){
          for(let j=0;j<treemuneData.length;j+=1){
            if(treemuneData[j].title===dataResult[z].remark){
              const vallist ={
                title:dataResult[z].key,
                value:dataResult[z].key,
              }
              treemuneData[j].children.push(vallist);
            }
          
          }
        
        }
        
        
        this.setState({
          destroy:false,
          KindeModalVisible: flag,
          treedata:treemuneData,
          updateRows: row,
        });
      }
    });
      
    }
  };
  handleSelectRows = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
    });
  };
  handleDel = (e, ids) => {
    const { dispatch, form } = this.props;

    const params = {
      id: ids,
    };

    dispatch({
      type: 'userlocation/remove',
      payload: params,
      callback: () => {
        this.setState({
          selectedRows: [],
        });

        const values = {
          ...form.fieldsValue,
        };
        const fectchParams = `pageSize=12&pageIndex=0`;

        dispatch({
          type: 'userlocation/fetch',
          payload: fectchParams,
        });
      },
    });
  };
  handleSearch = e => {
    //  const params =`terms[0].value=${value}&terms[0].column=type&pageIndex=${0}&pageSize=${10}`;

    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = fieldsValue;
      if (params.issupper === undefined) {
        delete params.issupper;
      }
      const values = this.createTerms(params,1,this.state.pageSize);

      
      this.setState({
        area: params.area,
        issupper: params.issupper,
        pageIndex:1,
        pageSize:10,
      },()=>{
        dispatch({
          type: 'userlocation/fetch',
          payload: values,
        });
      });
    });
  };
  createTerms = (obj, pageIndex = 1, pageSize = 10) => {
    let i = 1;
    let params = `pageIndex=${pageIndex}&pageSize=${pageSize}&terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
    Object.keys(obj).forEach(key => {
      params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=${key}`;
      i += 1;
    });

    return params;
  };

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="仓库信息">
              {getFieldDecorator('area')(
                <Select style={{ width: 200 }}>{this.state.children}</Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="是否为仓管员">
              {getFieldDecorator('issupper')(
                <Select placeholder="请选择" style={{ width: 100 }}>
                  <Option value={0}>否</Option>
                  <Option value={1}>是</Option>
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

  render() {
    const { userlocation: { data } } = this.props;
    let dataList = [];
    if (data && data.status === 200 && data.result.data) {
      data.list = data.result.data;
      data.pagination = {
        total: data.result.total,
        pageIndex:this.state.pageIndex,
        pageSize:this.state.pageSize,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: true,
      };
      dataList = data.list;
    }

    const { selectedRows, KindeModalVisible, updateRows, titlename, children } = this.state;

    const columns = [
      {
        title: '用户名',
        width: '10%',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: '仓库信息',
        width: '10%',
        dataIndex: 'area',
        key: 'area',
        render: val => areaMap.get(`${val}`),
      },
      {
        title: '位置信息',
        dataIndex: 'locations',
        key: 'locations',
        width: '45%',
      },
      {
        title: '是否为仓管员',
        dataIndex: 'issupper',
        key: 'issupper',
        width: '5%',
        render: val => status[val],
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '15%',
        render: (text, record) => {
          return (
            <span>
              <a onClick={() => this.handleModalVisible(true, 'update', record)}>修改</a>
              <Divider type="vertical" />
              <a onClick={e => this.handleDel(e, record.id)}>删除</a>
            </span>
          );
        },
      },
    ];

    const parentMethods = {
      handleKindAdd: this.handleKindAdd,
      selectChage:this.selectChage,
      CancelModalVisible: this.CancelModalVisible,

      onSelect: this.onSelect,
    };

    return (
      <PageHeaderLayout title="仓库管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>

            <div>
              <Button type="primary" onClick={() => this.handleModalVisible(true, 'new')}>
                新建
              </Button>

              <Table
                rowKey="id"
                selectedRows={selectedRows}
                pagination={data.pagination}
                dataSource={dataList}
                columns={columns}
                onSelectRow={this.handleSelectRows}
                onChange={this.handleStandardTableChange}
                bordered
              />
            </div>
          </div>
        </Card>
        <DictionryForm
          {...parentMethods}
          modalVisible={KindeModalVisible}
          updateRows={updateRows}
          childrens={children}
          treedata={this.state.treedata}
          destroy={this.state.destroy}
        />
      </PageHeaderLayout>
    );
  }
}
