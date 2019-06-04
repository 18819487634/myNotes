import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { Form, Modal, Row, Col, Card, Popconfirm, message, Input, Button, Table } from 'antd';

import {
  getSupplyId,
  getCurrentUser,
  getTempPermisson,
  getTempMenu,
} from '../../utils/sessionStorage';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Authoritymenu.less';
import MenuTree from './menu';
import { queryAuthSetting, makeAuthSetting, enableUser, disableUser, updateUserPassword } from '../../services/api';

const FormItem = Form.Item;

function handleDs(fieldsValue, pageIndex = 0, pageSize = 10) {
  const currentUser = JSON.parse(getCurrentUser());

  const companyname = encodeURI(`%${currentUser.username.split(':')[0]}:%`);

  let ds = `terms[0].value=${companyname}&terms[0].column=username&terms[0].termType=like&pageIndex=${pageIndex}&pageSize=${pageSize}`;
  if (fieldsValue.username && fieldsValue.username.length > 0) {
    const companyname1 = encodeURI(
      `${currentUser.username.split(':')[0]}:%${fieldsValue.username}%`
    );
    ds = `terms[0].value=${companyname1}&terms[0].termType=like&terms[0].column=username&pageIndex=${pageIndex}&pageSize=${pageSize}`;
  }
  if (fieldsValue.name && fieldsValue.name.length > 0) {
    const tmp = encodeURI(`%${fieldsValue.name}%`);
    ds = `${ds}&terms[1].value=${tmp}&terms[1].column=name&terms[1].termType=like`;
  }
  return ds;
}

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
      title="添加员工"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="员工名称">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入员工名称' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="登录用户名">
        {form.getFieldDecorator('loginname', {
          rules: [{ required: true, message: '请输入登录名' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="登录密码">
        {form.getFieldDecorator('password', {
          rules: [{ required: true, message: '请输入登录密码' }],
        })(<Input type="password" placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
});
const UpdateForm = Form.create()(props => {
  const { modalVisible, form, handleUpdate, handleUpdateModalVisible, params } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleUpdate(fieldsValue);
    });
  };
  
  const username = params===undefined?"":params.username;
  return (
    <Modal
      title="修改密码"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleUpdateModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="员工名称">
        {form.getFieldDecorator('username',{initialValue:username})(<Input disabled />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="登录密码">
        {form.getFieldDecorator('password', {
          rules: [{ required: true, message: '请输入登录密码' }],
        })(<Input type="password" placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
});
@connect(({ authorizemenu, loading }) => ({
  authorizemenu,
  loading: loading.models.authorizemenu,
}))
@Form.create()
export default class CompanyUserList extends PureComponent {
  state = {
    modalVisible: false,
    selectedRowKeys: [],
    selectMenus: [], //
    pageindex: 1,
    pagesize: 10,
  };

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const currentUser = JSON.parse(getCurrentUser());
    const companyname = encodeURI(`%${currentUser.username.split(':')[0]}%`);
    const ds = `terms[0].value=${companyname}&terms[0].column=username&terms[0].termType=like&pageIndex=0&pageSize=10`;
    this.props.dispatch({
      type: 'authorizemenu/companyuser',
      payload: ds,
    });
  };

  handleAdd = fields => {
    this.props
      .dispatch({
        type: 'authorizemenu/submitUserForm',
        payload: {
          supplyid: getSupplyId(),
          name: fields.name,
          loginname: fields.loginname,
          password: fields.password,
        },
      })
      .then(() => {
        message.success('提交成功');

        this.setState({
          modalVisible: false,
        });
        this.loadData();
      });
  };
  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };
  handleUpdateModalVisible = flag => {
    this.setState({
      updateModalVisisble:  !!flag,
    });
  };
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const ds = handleDs(fieldsValue, 0, 10);
      this.props.dispatch({
        type: 'authorizemenu/companyuser',
        payload: ds,
      });
    });
  };

  loadTreeData = (r, inst) => {
    message.config({
      top: 100,
    });
    const hide = message.loading(`正在加载权限...`, 0);

    queryAuthSetting(r.id).then(response => {
      setTimeout(hide, 100);
      if (response && response.status === 200 && response.result) {
        const { result: { details } } = response;
        const mids = [];
        if (details) {
          details.forEach(m => {
            if (m.actions && m.actions.length > 0) {
              const ac = Array.from(m.actions);
              ac.forEach(x => {
                mids.push(`${m.permissionId}~${x}`);
              });
            } else {
              mids.push(m.permissionId);
            }
          });

          inst.setState({
            selectedRowKeys: [r.id],
            selectMenus: mids,
          });
        }
      } else {
        inst.setState({
          selectedRowKeys: [r.id],
          selectMenus: [],
        });
      }
    });
  };

  handleSelectRows = r => {
    this.loadTreeData(r, this);
  };
  handleChangeRow = r => {
    this.loadTreeData({ id: r }, this);
  };
  disableSelectUser = val => {
    if (this.state.selectedRowKeys.length === 0) {
      message.warn(`请选择需要${val === 1 ? '启用' : '停用'}的用户`, 10);
      return false;
    }
    if (val === 1) {
      enableUser(this.state.selectedRowKeys[0]).then(response => {
        message.success(`已启用`, 10);
        this.loadData();
      });
    } else {
      disableUser(this.state.selectedRowKeys[0]).then(response => {
        message.success(`已停用`, 10);
        this.loadData();
      });
    }
  };

  handleStandardTableChange = pagination => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const ds = handleDs(fieldsValue, pagination.current - 1, pagination.pageSize);
      this.props.dispatch({
        type: 'authorizemenu/companyuser',
        payload: ds,
      });
      this.setState({
        pageindex: pagination.current,
        pagesize: pagination.pageSize,
      });
    });
  };
  handleUpdate=(fieldsValue)=>{
    updateUserPassword(fieldsValue).then(res=>{
      if(res && res.status === 200){  
        message.success("修改成功！");
        this.setState({
          updateModalVisisble:false,
        })
      }else if(res && res.status === 400){
        message.warning(res.message);
      }
    })
  }
  updatePW=(e,record)=>{
    this.setState({
      updateModalVisisble:true,
      params:record,
    })
  }
  handleSelectMenus = () => {
    if (this.childCp.state.checkedKeys.length === 1 && this.childCp.state.checkedKeys[0] === '-1') {
      return false;
    } else {
      const mypermisson = Array.from(this.childCp.state.checkedKeys);

      const selectUserId = this.state.selectedRowKeys[0];

      const putdata = {
        type: 'user',
        merge: 'true',
        settingFor: selectUserId, // 当前选中人
        details: [],
        menus: [],
      };
      const pmap = new Map();
      mypermisson.forEach(p => {
        if (p && p.length > 0 && p.indexOf('~') === -1) {
          if (!pmap.has(p)) {
            const sp = new Set();
            pmap.set(p, sp);
          }
        } else if (p && p.length > 0 && p.indexOf('~') > -1) {
          const my = p.split('~');
          if (!pmap.has(my[0])) {
            const sp = new Set();
            sp.add(my[1]);
            pmap.set(my[0], sp);
          } else {
            pmap.get(my[0]).add(my[1]);
          }
        }
      });

      for (const k1 of pmap.keys()) {
        const pobj = {
          actions: pmap.get(k1),
          dataAccesses: [],
          merge: true,
          permissionId: k1,
          priority: '10',
        };
        putdata.details.push(pobj);
      }

      makeAuthSetting(putdata).then(response => {
        if (response && response.status === 200) {
          message.success('权限保存成功！');
        } else if(response && response.status === 400){
           message.error(response.message);
        }else{
          message.error('服务端异常');
        }
      });
    }
  };

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="员工名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="登录用户名">
              {getFieldDecorator('username')(<Input placeholder="请输入" />)}
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
  renderStatus = val => {
    if (val === 1) {
      return '使用中';
    } else {
      return '已停用';
    }
  };
  render() {
    const { authorizemenu, loading } = this.props;

    const { data } = authorizemenu;

    let dataList = [];

    if (data.status === 200 && data.result.data) {
      data.list = data.result.data;

      data.pagination = {
        total: data.result.total,
        current: this.state.pageindex,
        pageSize: this.state.pagesize,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: false,
      };
      dataList = data.list;
    }
    const { selectedRowKeys, modalVisible, updateModalVisisble, params} = this.state;
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateParentMethods = {
      handleUpdate: this.handleUpdate,
      handleUpdateModalVisible: this.handleUpdateModalVisible,
    };
    const columns = [
      {
        title: '用户名',
        dataIndex: 'name',
        key:'name',
      },
      {
        title: '登录名',
        dataIndex: 'username',
        key:'username',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key:'status',
        render: val => this.renderStatus(val),
      },
      {
        title: '修改密码',
        dataIndex: 'update',
        key:'update',
        render: (val,record )=> <Button onClick={e=>{this.updatePW(e,record)}}>修改</Button>,
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      type: 'radio',
      onChange: this.handleChangeRow,
    };
    const { selectMenus } = this.state; // 登录用户的授权的菜单

    return (
      <PageHeaderLayout title="编辑权限">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新增员工
              </Button>
              <Button icon="add" type="primary" onClick={() => this.handleSelectMenus()}>
                保存权限
              </Button>
              <Popconfirm
                placement="top"
                title="确定停用？"
                onConfirm={() => this.disableSelectUser(0)}
              >
                <Button>停用</Button>
              </Popconfirm>
              <Popconfirm
                placement="top"
                title="确定启？"
                onConfirm={() => this.disableSelectUser(1)}
              >
                <Button>启用</Button>
              </Popconfirm>
            </div>
            <div style={{ margin: '5px' }}>
              <div style={{ width: '40%', float: 'left' }}>
                <Table
                  rowKey="id"
                  rowSelection={rowSelection}
                  loading={loading}
                  dataSource={dataList}
                  columns={columns}
                  onRowClick={this.handleSelectRows}
                  bordered
                  pagination={data.pagination}
                  onChange={this.handleStandardTableChange}
                />
              </div>
              <div style={{ width: '40%', float: 'left' }}>
                <MenuTree
                  // ref="" 使用connet 过的组件包裹过的是无法获取的。
                  getInstance={childCp => {
                    this.childCp = childCp;
                  }}
                  mySelectedKeys={selectMenus}
                />
              </div>
            </div>
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
        <UpdateForm {...updateParentMethods} modalVisible={updateModalVisisble} params={params} />
      </PageHeaderLayout>
    );
  }
}
