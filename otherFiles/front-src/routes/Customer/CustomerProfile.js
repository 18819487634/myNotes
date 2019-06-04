import React, { PureComponent } from 'react';
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
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getSupplyId } from '../../utils/sessionStorage';
import { companyDetail, queryCompanyUser } from '../../services/api';
import styles from './CustomerProfile.less';

const FormItem = Form.Item;
const { Option } = Select;
const children = [];

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['default', 'processing', 'success', 'error'];
const status = ['审批中', '验证通过', '验证不通过', '取消申请'];

function handleDs(fieldsValue, pageIndex = 0, pageSize = 10) {
  const supplyids = getSupplyId();

  let ds = `terms[0].value=${supplyids}&terms[0].column=supplyid&pageIndex=${pageIndex}&pageSize=${pageSize}`;
  if (fieldsValue.company && fieldsValue.company.length > 0) {
    ds += `&terms[1].value=%25${
      fieldsValue.company
    }%25&terms[1].termType=like&terms[1].column=companyinfo.company`;
  }
  if (fieldsValue.status && fieldsValue.status.length > 0) {
    if (fieldsValue.company.length > 0) {
      ds += `&terms[2].value=${fieldsValue.status}&terms[2].column=status`;
    } else {
      ds += `&terms[1].value=${fieldsValue.status}&terms[1].column=status`;
    }
  }
  return ds;
}
const UpdateForm = Form.create()(props => {
  const { modalVisible, form, handleUpdate, CancelModalVisible, updateRows, onSelect } = props;
  const datasouce = updateRows;

  let loginusers = '';
  let salesidss = [];
  let credit = '';
  if (Object.keys(datasouce).length !== 0) {
    loginusers = datasouce.usrid;
    if ('salesids' in datasouce) {
      salesidss = datasouce.salesids.split(',');
    }

    credit = `${datasouce.credit}`;
  }
  const statusv = `${datasouce.status}`;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      handleUpdate(fieldsValue);
    });
  };
  return (
    <Modal
      title="客户审批"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => CancelModalVisible()}
    >
      <FormItem
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label="id"
        style={{ display: 'none' }}
      >
        {form.getFieldDecorator('id', { initialValue: datasouce.id })(
          <Input placeholder="" readOnly="true" />
        )}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="申请人名称">
        {form.getFieldDecorator('companyinfo.loginuser', { initialValue: loginusers })(
          <Input placeholder="" readOnly="true" />
        )}
      </FormItem>
      <Row>
        <Col md={12}>
          <FormItem label="客户状态">
            {form.getFieldDecorator('status', { initialValue: statusv })(
              <Select placeholder="请选择" style={{ width: '70%' }} onChange={onSelect}>
                <Option value="0">审批中</Option>
                <Option value="1">验证通过</Option>
                <Option value="2">验证不通过</Option>
                <Option value="3">取消申请</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col md={12}>
          <div id="creditid">
            <FormItem label="信用评级">
              {form.getFieldDecorator('credit', { initialValue: credit })(
                <Select placeholder="请选择" style={{ width: '70%' }}>
                  <Option value="0">A</Option>
                  <Option value="1">B</Option>
                  <Option value="2">C</Option>
                  <Option value="3">D</Option>
                </Select>
              )}
            </FormItem>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <div id="salesids">
            <FormItem label="业务员">
              {form.getFieldDecorator('salesids', { initialValue: salesidss })(
                <Select mode="multiple" placeholder="请选择" style={{ width: '70%' }}>
                  {children}
                </Select>
              )}
            </FormItem>
          </div>
        </Col>
        <Col md={12}>
          <div id="directorid">
            <FormItem label="业务主管">
              {form.getFieldDecorator('directorid', { initialValue: datasouce.directorid })(
                <Select placeholder="请选择" style={{ width: '70%' }}>
                  {children}
                </Select>
              )}
            </FormItem>
          </div>
        </Col>
      </Row>
    </Modal>
  );
});

@connect(({ supply, loading }) => ({
  supply,
  loading: loading.models.supply,
}))
@Form.create()
export default class CustomerProfile extends PureComponent {
  state = {
    modalVisible: false,
    pageIndex:1,
    pageSize:10,
    selectedRows: [],
    formValues: {},
    updateRows: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const supplyids = getSupplyId();
    let companys = '';
    const param = `terms[0].value=${supplyids}&terms[0].column=supplyid&pageIndex=0&pageSize=10`;
    dispatch({
      type: 'supply/fetch',
      payload: param,
    });

    companyDetail({ id: supplyids }).then(response => {
      if (response && response.status === 200) {
        companys = response.result.company;
        const params = `terms[0].column=username&pageIndex=0&pageSize=10&terms[0].termType=like&terms[0].value=${companys}%25`;

        queryCompanyUser(params).then(res => {
          if (res.status === 200) {
            const list = res.result.data;
            for (let i = 0; i < list.length; i++) {
              children.push(
                <Option key={i} value={list[i].username}>
                  {list[i].username}
                </Option>
              );
            }
          }
        });
      }
    });
  }
  onSelect = value => {
    if (value === '1') {
      document.getElementById('creditid').style.display = 'block';
    } else {
      document.getElementById('creditid').style.display = 'none';
    }
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
 
    // const { formValues } = this.state;

    // const filters = Object.keys(filtersArg).reduce((obj, key) => {
    //   const newObj = { ...obj };
    //   newObj[key] = getValue(filtersArg[key]);
    //   return newObj;
    // }, {});

    // const params = {
    //   currentPage: pagination.current,
    //   pageSize: pagination.pageSize,

    //   ...formValues,
    //   ...filters,
    // };
    // if (sorter.field) {
    //   params.sorter = `${sorter.field}_${sorter.order}`;
    // }

    // dispatch({
    //   type: 'supply/fetch',
    //   payload: params,
    // });
    const { dispatch,form } = this.props;
    const { formValues } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = fieldsValue;
      if(params.isact === undefined){
        delete params.isact
      }
      if(params.value === undefined){
        delete params.value
      }
      params.type=2;
      const values = this.createTerms(params, pagination.current-1,pagination.pageSize);
    dispatch({
      type: 'supply/fetch',
      payload: values,
    });
    this.setState({
      pageIndex:pagination.current,
      pageSize:pagination.pageSize,
     })
    })
   
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
      this.setState({
        formValues: fieldsValue,
      });

      const values = handleDs(fieldsValue, 0, 10);

      dispatch({
        type: 'supply/fetch',
        payload: values,
      });
    });
  };
  CancelModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };
  handleModalVisible = (flag, row) => {
    this.setState({
      modalVisible: !!flag,
      updateRows: row,
    });
  };

  handleUpdate = fields => {
    const salesid = fields.salesids;
    const supplyids = getSupplyId();
    let val = '';
    if (salesid.length > 0) {
      for (let j = 0; j < salesid.length; j++) {
        if (j === 0) {
          val = salesid[j];
        } else {
          val += `,${salesid[j]}`;
        }
      }
    }

    this.props.dispatch({
      type: 'supply/update',
      payload: {
        id: fields.id,
        credit: fields.credit,
        status: fields.status,
        charge: fields.charge,
        salesids: val,
        directorid: fields.directorid,
      },
      callback: response => {
        if (response.status === 200) {
          const param = `terms[0].value=${supplyids}&terms[0].column=supplyid&pageIndex=0&pageSize=10`;
          this.props.dispatch({
            type: 'supply/fetch',
            payload: param,
          });
          message.success('评级成功');

          this.setState({
            modalVisible: false,
          });
        }
      },
    });
  };

  isEditing = record => {
    return record.key === this.state.editingKey;
  };
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="客户名称">
              {getFieldDecorator('company')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="客户状态">
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

    const { selectedRows, modalVisible, updateRows } = this.state;

    const columns = [
      {
        title: '客户公司',
        dataIndex: 'supplyname',
      },
      {
        title: '客户联系人',
        dataIndex: 'usrid',
      },

      {
        title: '状态',
        dataIndex: 'status',
        editable: true,
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
        title: '等级',
        dataIndex: 'credit',
        render: val => {
          if (val === 0) {
            return 'A';
          } else if (val === 1) {
            return 'B';
          } else if (val === 2) {
            return 'C';
          } else if (val === 3) {
            return 'D';
          }
        },
      },
      {
        title: '业务员',
        dataIndex: 'salesids',
      },
      {
        title: '业务主管',
        dataIndex: 'directorid',
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => {
          return <a onClick={() => this.handleModalVisible(true, record)}>审批</a>;
        },
      },
    ];

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">取消申请</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleUpdate: this.handleUpdate,
      CancelModalVisible: this.CancelModalVisible,
      onSelect: this.onSelect,
    };

    return (
      <PageHeaderLayout title="我的客户">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              {/* <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button> */}
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
        {/* <CreateForm {...parentMethods} modalVisible={modalVisible} /> */}
        <UpdateForm {...parentMethods} modalVisible={modalVisible} updateRows={updateRows} />
      </PageHeaderLayout>
    );
  }
}
