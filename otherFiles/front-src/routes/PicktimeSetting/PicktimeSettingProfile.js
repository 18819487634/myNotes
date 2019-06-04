import React, { PureComponent } from 'react';
import { connect } from 'dva';

import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Button,
  Modal,
  message,
  Table,
  InputNumber,
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getSupplyId } from '../../utils/sessionStorage';

import styles from './PicktimeSettingProfile.less';

import { querysupplydictionry, updateuserlocation, savepicktimesetting } from '../../services/api';

const FormItem = Form.Item;
const { Option } = Select;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const status = ['无效', '有效'];

const DictionryForm = Form.create()(props => {
  const { modalVisible, CancelModalVisible, form, updateRows, handleKindAdd, childrens } = props;
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
  let supernum2 = '';
  let productnum2 = 0;
  let isact2 = '';
  let weightlimit2 = '';
  let wastetime2 = '';
  let desc2 = '';
  if (Object.keys(datasouce).length !== 0) {
    id2 = datasouce.id;
    isact2 = datasouce.isact;
    supernum2 = datasouce.supernum;
    weightlimit2 = datasouce.weightlimit;
    productnum2 = datasouce.productnum;
    wastetime2 = datasouce.wastetime;
    desc2 = datasouce.desc;
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
              <FormItem {...formItemLayout} label="核对仓管员(人)">
                {getFieldDecorator('supernum', { initialValue: supernum2 })(
                  <InputNumber min={0.0} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="产品个数">
                {getFieldDecorator('productnum', { initialValue: productnum2 })(
                  <InputNumber min={0.0} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="拣货重量(KG)">
                {getFieldDecorator('weightlimit', { initialValue: weightlimit2 })(
                  <InputNumber min={0.0} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="拣货时间(分钟)">
                {getFieldDecorator('wastetime', { initialValue: wastetime2 })(
                  <InputNumber min={0.0} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="描述">
                {getFieldDecorator('desc', { initialValue: desc2 })(<Input maxLength="200" placeholder="描述" />)}
              </FormItem>
            </Col>
          </Row>

          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="有效性">
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

@connect(({ pickupsetting, loading }) => ({
  pickupsetting,
  loading: loading.models.pickupsetting,
}))
@Form.create()
export default class PicktimeSettingProfile extends PureComponent {
  state = {
    KindeModalVisible: false,

    selectedRows: [],
    formValues: {},
    updateRows: {},
    titlename: '拣货时间管理',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const supplyids = getSupplyId();
    const params = `terms[0].value=${supplyids}&terms[0].column=supplyid&pageIndex=${0}&pageSize=${10}&sorts[0].name=supernum&sorts[0].order=asc&sorts[1].name=productnum&sorts[1].order=asc`;

    dispatch({
      type: 'pickupsetting/fetch',
      payload: params,
    });
  }

  handleKindAdd = params => {
    const ds = `terms[0].value=${getSupplyId()}&terms[0].column&pageIndex=${0}&pageSize=${10}`;
    savepicktimesetting(params).then(response => {
      if (response && response.status === 200) {
        message.success('提交成功！');
        this.props.dispatch({
          type: 'pickupsetting/fetch',
          payload: ds,
        });

        this.setState({
          KindeModalVisible: false,
        });
      }
    });
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
      type: 'pickupsetting/fetch',
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

      const values = this.createTerms(fieldsValue);

      dispatch({
        type: 'pickupsetting/fetch',
        payload: values,
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


  render() {
    const { pickupsetting: { data } } = this.props;
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
  
    const { selectedRows, KindeModalVisible, updateRows, titlename, children } = this.state;

    const columns = [
      {
        title: '核对仓管人员(人)',
        width: '10%',
        dataIndex: 'supernum',
        key: 'supernum',
      },
      {
        title: '产品个数',
        width: '10%',
        dataIndex: 'productnum',
        key: 'productnum',
      },
      {
        title: '拣货重量(KG)',
        width: '10%',
        dataIndex: 'weightlimit',
        key: 'weightlimit',
      },
      {
        title: '拣货时间(分钟)',
        dataIndex: 'wastetime',
        key: 'wastetime',
        width: '10%',
      },
      {
        title: '描述',
        dataIndex: 'desc',
        key: 'desc',
      },
      {
        title: '有效性',
        dataIndex: 'isact',
        width: '5%',
        render: val => status[val],
      },
      {
        title: '操作',
        width: '10%',
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
      <PageHeaderLayout title="拣货时间管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div>
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
          childrens={children}
        />
      </PageHeaderLayout>
    );
  }
}
