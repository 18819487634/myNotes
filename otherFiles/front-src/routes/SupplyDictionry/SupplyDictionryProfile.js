import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Button, Badge, Modal, Table,message } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getSupplyId } from '../../utils/sessionStorage';

import styles from './SupplyDictionryProfile.less';

import { addsupplydictionry, updatesupplydictionry, querysupplydictionry } from '../../services/api';
import { DictionaryType, DictionaryTypeEnum } from '../../utils/utils';

const FormItem = Form.Item;
const { Option } = Select;

let overKind = '';

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['error', 'success'];
const status = ['无效', '有效'];

const DictionryForm = Form.create()(props => {
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
  if (Object.keys(datasouce).length !== 0) {
    id2 = datasouce.id;
    isact2 = datasouce.isact;
    value2 = datasouce.value;
    key2 = datasouce.key;
    type2 = datasouce.type;
  
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
      params.type = options;
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
              <FormItem {...formItemLayout} label="值">
                {getFieldDecorator('value', { initialValue: value2 })(<Input placeholder="值" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="名称">
                {getFieldDecorator('key', { initialValue: key2 })(<Input placeholder="名称" />)}
              </FormItem>
            </Col>
          </Row>

          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="有效">
                {getFieldDecorator('isact', { initialValue: isact2 })(
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
const DictionaryTypeMap = new Map();
@connect(({ supplydictionry, loading }) => ({
  supplydictionry,
  loading: loading.models.supplydictionry,
}))
@Form.create()
export default class SupplyDictionryProfile extends PureComponent {
  state = {
    KindeModalVisible: false,
    selectedRows: [],
    formValues: {},
    updateRows: {},
    titlename: '',
    flag: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const supplyids = getSupplyId();
    this.query();
    // const children = [];

    // for (let i = 0; i < DictionaryTypeEnum.length; i += 1) {
    //   children.push(
    //     <Option key={DictionaryTypeEnum[i].value}>
    //       {DictionaryTypeEnum[i].key}
    //     </Option>
    //   );
    // }
    // DictionaryTypeEnum.forEach(item=>{
    //     children.push(<Option key={item.value} value={item.value}>{item.key}</Option>);
    // })
  }

  query = () => {
    const children = [];
    for (let i = 0; i < DictionaryTypeEnum.length; i += 1) {
      children.push(
        <Option key={DictionaryTypeEnum[i].value}>
          {DictionaryTypeEnum[i].key}
        </Option>
      );
      DictionaryTypeMap.set(DictionaryTypeEnum[i].value,DictionaryTypeEnum[i].key);
    }
    this.setState({ children });
  };
  handleKindAdd = params => {
    const ds = `terms[0].value=${params.type}&terms[0].column=type&pageIndex=${0}&pageSize=${10}&terms[1].value=${getSupplyId()}&terms[1].column=supplyid`;
    if (params.id === undefined) {
      const ls = `terms[0].value=${params.type}&terms[0].column=type&terms[1].value=${getSupplyId()}&terms[1].column=supplyid`;
      querysupplydictionry(ls).then(sdres=>{
        if(sdres && sdres.status === 200){
          const resultdata = sdres.result.data;
          const typeList = ["4","5","6"];
          if(typeList.indexOf(params.type)>-1 && resultdata.length>0){
            message.warn("该字典已经有数据，只能做修改");
            return;
          }
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
        }
      })
      
    } else {
      updatesupplydictionry(params).then(response => {
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
    });
  };

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
        titlename: DictionaryTypeMap.get(params.type),
        options: fieldsValue.type,
      });
    });
  };
  createTerms = (obj, pageIndex = 1, pageSize = 12) => {
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
    const divstyle = {
      backgroundColor: this.state.bgcolor,
    };
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="类别">
              {getFieldDecorator('type')(
                <Select style={{width: 180 }}>{this.state.children}</Select>
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

  render() {
    const { supplydictionry: { data } } = this.props;
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
      titlename,
      flag,
      children,
    } = this.state;

    const columns = [
      {
        title: '值',
        width: '5%',
        dataIndex: 'value',
        key: 'value',
      },
      {
        title: '名称',
        dataIndex: 'key',
        key: 'key',
      },
      {
        title: '有效',
        dataIndex: 'isact',
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
          return <a onClick={() => this.handleModalVisible(true, 'update', record)}>修改</a>;
        },
      },
    ];

    const parentMethods = {
      handleKindAdd: this.handleKindAdd,

      CancelModalVisible: this.CancelModalVisible,

      onSelect: this.onSelect,
    };

    return (
      <PageHeaderLayout title="数据字典">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>

            <div className={flag ? styles.block : styles.none}>
              <Button type="primary" onClick={() => this.handleModalVisible(true, 'new')}>
                新建
              </Button>
              <Table
                title={() => titlename}
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
        />
      </PageHeaderLayout>
    );
  }
}
