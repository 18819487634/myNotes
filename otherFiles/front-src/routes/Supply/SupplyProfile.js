import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  Modal,
  message,
  Badge,
  Divider,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getSupplyId } from '../../utils/sessionStorage';
import styles from './SupplyProfile.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['default', 'processing', 'success', 'error'];
const status = ['建立联系中', '验证通过', '验证不通过', '取消申请'];

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      title="录入供应商（越详细审批越能成功）"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="供应商名称">
        {form.getFieldDecorator('supplyname', {
          rules: [{ required: true, message: '请输入供应商名称' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="负责人电话">
        {form.getFieldDecorator('phone', {
          rules: [{ required: true, message: '请输入供应商联系电话' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="负责人">
        {form.getFieldDecorator('charge', {
          rules: [{ required: true, message: '请输入供应商负责人' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
});

@connect(({ supply, loading }) => ({
  supply,
  loading: loading.models.supply,
}))
@Form.create()
export default class SupplyList extends PureComponent {
  state = {
    modalVisible: false,

    selectedRows: [],
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const supplyids = getSupplyId();
    const param = `terms[0].value=${supplyids}&terms[0].column=applyid&pageIndex=0&pageSize=10`;
    dispatch({
      type: 'supply/fetch',
      payload: param,
    });
  }

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
      type: 'supply/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'supply/fetch',
      payload: {},
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'supply/remove',
          payload: {
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'supply/fetch',
        payload: values,
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleAdd = fields => {
    this.props.dispatch({
      type: 'supply/add',
      payload: {
        supplyname: fields.supplyname,
        phone: fields.phone,
        charge: fields.charge,
      },
    });
    const supplyids = getSupplyId();
    const param = `terms[0].value=${supplyids}&terms[0].column=applyid&pageIndex=0&pageSize=10`;
    this.props.dispatch({
      type: 'supply/fetch',
      payload: param,
    });
    message.success('申请已提交');
    this.setState({
      modalVisible: false,
    });
  };

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="供应商名称">
              {getFieldDecorator('no')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="供应商状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">建立联系中</Option>
                  <Option value="1">验证通过</Option>
                  <Option value="2">验证不通过</Option>
                  <Option value="3">取消申请</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderForm() {
    return this.renderSimpleForm();
  }

  render() {
    const { supply: { data }, loading } = this.props;

    if (data && data.status) {
      if (data.status === 200 && data.result.data) {
        // 数据结构和后台不一样，是不是不应该放在这里做呢？

        data.list = data.result.data;
        data.pagination = {
          total: data.result.total,
          current: data.result.current + 1,
          pageSize: data.result.pageSize,
          showTotal: () => {
            return `共${data.result.total}条`;
          },
          showQuickJumper: true,
        };
      } else {
        data.list = [];
        data.pagination = {};
      }
    }

    const { selectedRows, modalVisible } = this.state;

    const columns = [
      {
        title: '供应商名称',
        dataIndex: 'supplyname',
      },
      {
        title: '负责人',
        dataIndex: 'charge',
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
      },

      {
        title: '状态',
        dataIndex: 'status',
        filters: [
          {
            text: status[0],
            value: 0,
          },
          {
            text: status[1],
            value: 1,
          },
          {
            text: status[2],
            value: 2,
          },
          {
            text: status[3],
            value: 3,
          },
        ],
        onFilter: (value, record) => record.status.toString() === value,
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]} />;
        },
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        render: () => (
          <Fragment>
            <a href="">详情</a>
            <Divider type="vertical" />
            <a href="">发信息</a>
          </Fragment>
        ),
      },
    ];

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">取消申请</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout title="我的供应商">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button>批量操作</Button>
                  <Dropdown overlay={menu}>
                    <Button>
                      更多操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>
            <StandardTable
              rowKey="id"
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
      </PageHeaderLayout>
    );
  }
}
