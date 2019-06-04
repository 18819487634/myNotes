import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Button, Badge, Modal, Table,Radio,message } from 'antd';
import RadioGroup from 'antd/lib/radio/group';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getSupplyId } from '../../utils/sessionStorage';

import styles from './TakeWayProfile.less';

import { addsupplydictionry, updatesupplydictionry, querysupplydictionry, queryDeliveryWay } from '../../services/api';
import { DictionaryType } from '../../utils/utils';


const FormItem = Form.Item;
const { Option } = Select;
const fixedList = ["0","1","2","3"];
let overKind = '';

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['error', 'success'];
const status = ['无效', '有效'];

const DictionryForm = Form.create()(props => {
  const { modalVisible, CancelModalVisible, form, updateRows, options, handleKindAdd,areaOption } = props;
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
  let no2 = '';
  let isvalid2 = 1;
  let key2 = '';
  let logisstatus2 = 0;
  let distristatus2 = 0;
  let desc2 = "";

  if (datasouce.id !==undefined) {
    id2 = datasouce.id;
    isvalid2 = datasouce.isvalid;
    value2 = datasouce.value;
    no2 = datasouce.no;
    key2 = datasouce.key;
    logisstatus2 = datasouce.logisstatus;
    distristatus2 = datasouce.distristatus;
    desc2 = datasouce.desc;
  }

  let titlename = '';
  if (datasouce.id ===undefined) {
    titlename = '新增';
    value2 = datasouce.value;
    no2 = datasouce.no;
  } else {
    titlename = '修改';
  }

  const okHandle = () => {
    validateFieldsAndScroll((error, values) => {
      if (values.id === '') {
        delete values.id;
      }
      const params = values;
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
      destroyOnClose
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
              <FormItem  {...formItemLayout} label="序号" >
                {getFieldDecorator('no', { initialValue: no2} )(
                  <Input disabled />
                )}
              </FormItem>
            </Col>
            <Col md={24} sm={24}>
              <FormItem  {...formItemLayout} label="value" style={{ display: 'none' }}>
                {getFieldDecorator('value', { initialValue: value2 })(
                  <Input disabled />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="名称">
                {getFieldDecorator('name', { initialValue: key2 })(<Input placeholder="名称" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem  {...formItemLayout} label="配送员方式">
                {getFieldDecorator('distristatus', { initialValue: distristatus2 })(
                  <RadioGroup>
                    <Radio  value={1}>是</Radio>
                    <Radio  value={0}>否</Radio>

                  </RadioGroup>
                )}
                
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem  {...formItemLayout} label="物流/快递方式">
                {getFieldDecorator('logisstatus', { initialValue: logisstatus2 })(
                  <RadioGroup >
                    <Radio  value={1}>是</Radio>
                    <Radio  value={0}>否</Radio>

                  </RadioGroup>
                )}
                
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="描述">
                {getFieldDecorator('desc', { initialValue: desc2 })(<Input placeholder="描述" />)}
              </FormItem>
            </Col>
          </Row>

          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="有效">
                {getFieldDecorator('isvalid', { initialValue: isvalid2 })(
                  <Select>
                    <Option value={1}>有效</Option>
                    <Option value={0}>无效</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
        </Row>
      </Form>
    </Modal>
  );
});
const areaMap = new Map();
@connect(({ deliveryway, loading }) => ({
  deliveryway,
  loading: loading.models.deliveryway,
}))
@Form.create()
export default class TakeWayProfile extends PureComponent {
  state = {
    KindeModalVisible: false,
    selectedRows: [],
    pageIndex:1,
    pageSize:10,
    formValues: {},
    updateRows: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const supplyids = getSupplyId();
    const params = "terms[0].value=3&terms[0].column=type&terms[0].termType=in";


    const ds = `pageIndex=${0}&pageSize=${10}`;
        this.props.dispatch({
          type: 'deliveryway/fetch',
          payload: ds,
   });
   
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
  handleKindAdd = params => {
    const {dispatch,form}=this.props;
    console.log("params",params);
    if(params.logisstatus ===1 && params.distristatus ===1){
      message.warn("配送员方式跟物流/快递方式只能选择一个");
      return;
    }
    form.validateFields((err, fieldsValue) => {
      const paramss = fieldsValue;
      if(paramss.isvalid === undefined){
        delete paramss.isvalid
      }
      if(paramss.name === undefined){
        delete paramss.name
      }
      const values = this.createTerms(paramss, this.state.pageIndex-1,this.state.pageSize);
      dispatch({
        type:'deliveryway/addorupdate',
        payload:params,
        callback:(response)=>{
          if(response && response.status===200){
            message.success("提交成功");
            dispatch({
              type:'deliveryway/fetch',
              payload:values,
            });
            this.setState({
              KindeModalVisible: false,
            });
          }
        },
      })
  
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch,form } = this.props;
    const { formValues } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = fieldsValue;
      if(params.isvalid === undefined){
        delete params.isvalid
      }
      if(params.name === undefined){
        delete params.name
      }
      params.type=2;
      const values = this.createTerms(params, pagination.current-1,pagination.pageSize);
    dispatch({
      type: 'supplydictionry/fetch',
      payload: values,
    });
    this.setState({
      pageIndex:pagination.current,
      pageSize:pagination.pageSize,
     })
    })
    // const filters = Object.keys(filtersArg).reduce((obj, key) => {
    //   const newObj = { ...obj };
    //   newObj[key] = getValue(filtersArg[key]);
    //   return newObj;
    // }, {});
    // formValues.type = 2;
    // const params = {
    //   currentPage: pagination.current,
    //   pageSize: pagination.pageSize,
    //   ...formValues,
    //   ...filters,
    // };
    // if (sorter.field) {
    //   params.sorter = `${sorter.field}_${sorter.order}`;
    // }
    // const values = this.createTerms(params, pagination.current-1,pagination.pageSize);
    // dispatch({
    //   type: 'supplydictionry/fetch',
    //   payload: values,
    // });
    // this.setState({
    //  pageIndex:pagination.current,
    //  pageSize:pagination.pageSize,
    // })
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  CancelModalVisible = flag => {
    this.setState({
      KindeModalVisible: !!flag,
    });
  };

  handleModalVisible = (flag, dataStatus, row) => {
    if (dataStatus === 'new') {
      const term = `paging=false&sorts[0].name=value&sorts[0].order=desc`;
      queryDeliveryWay(term).then(res=>{
        if(res && res.status ===200){
          const valueResult = res.result.data;
          const vali = {
            value : 0,
            no:1,
          }
          if(valueResult.length >0){
            vali.value =parseInt(valueResult[0].value,10)+1;
            vali.no = parseInt(valueResult[0].no,10)+1;
          }
          this.setState({
            KindeModalVisible: flag,
    
            updateRows: vali,
          });
        }
      })
      
    } else {
      this.setState({
        KindeModalVisible: flag,

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
      params.tyep = 2;
      const values = this.createTerms(params,this.state.pageIndex-1,this.state.pageSize);

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
    let params = `sorts[0].value=no&sorts[0].order=asc&pageIndex=${pageIndex}&pageSize=${pageSize}`;
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
            <FormItem label="名称">
              {getFieldDecorator('key')(
                <Input />
              )}
            </FormItem>
          </Col>
          
          <Col md={8} sm={24}>
            <FormItem label="有效性">
              {getFieldDecorator('isvalid')(
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

  render() {
    const { deliveryway: { data } } = this.props;
    let dataList = [];
    if (data && data.status === 200 && data.result.data) {
      data.list = data.result.data;
      data.pagination = {
        total: data.result.total,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: true,
      };
      dataList = data.list;
    }
    const {
      selectedRows,
      KindeModalVisible,
      updateRows,
      options,
      children,
    } = this.state;

    const columns = [
      {
        title: '序号',
        width: '5%',
        dataIndex: 'no',
        key: 'no',
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: '25%',
      },
      {
        title: '配送员方式',
        dataIndex: 'distristatus',
        key: 'distristatus',
        width: '10%',
        render:val=>{
          if(val===1){
            return <span>√</span>
          }
        },
      },
      {
        title: '物流/快递方式',
        dataIndex: 'logisstatus',
        key: 'logisstatus',
        width: '10%',
        render:val=>{
          if(val===1){
            return <span>√</span>
          }
        },
      },
      {
        title: '描述',
        dataIndex: 'desc',
        key: 'desc',
        width: '25%',
      },
      
      {
        title: '有效',
        dataIndex: 'isvalid',
        width: '10%',
        filters: [
          {
            text: status[0],
            value: 0,
          },
          {
            text: status[1],
            value: 1,
          },
        ],
        onFilter: (value, record) => record.status.toString() === value,
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]} />;
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => {
          if(fixedList.indexOf(record.value)===-1){
            return <a onClick={() => this.handleModalVisible(true, 'update', record)}>修改</a>;
          }
         
        },
      },
    ];

    const parentMethods = {
      handleKindAdd: this.handleKindAdd,

      CancelModalVisible: this.CancelModalVisible,

      onSelect: this.onSelect,
    };

    return (
      <PageHeaderLayout title="送货方式设置">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>

            <div >
              <Button type="primary" onClick={() => this.handleModalVisible(true, 'new')}>
                新建
              </Button>
              <Table
                title={() => '送货方式设置'}
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
          options={options}
          areaOption={children}
        />
      </PageHeaderLayout>
    );
  }
}
