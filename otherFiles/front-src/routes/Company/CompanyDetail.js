import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Modal, Table, Divider, Form, Input, Button, message } from 'antd';

import DescriptionList from 'components/DescriptionList';
import { companyDetail, queryCompanyAddress } from '../../services/api';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './CompanyDetail.less';
import { getSupplyId } from '../../utils/sessionStorage';

const { Description } = DescriptionList;
const FormItem = Form.Item;
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
      title="新增通讯地址"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="收货地址">
        {form.getFieldDecorator('address', {
          rules: [{ required: true, message: '请输入收货地址' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="收货人">
        {form.getFieldDecorator('charge', {
          rules: [{ required: true, message: '请输入收货人' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="收货手机">
        {form.getFieldDecorator('phone', {
          rules: [{ required: true, message: '请输入收货手机' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
});

@connect(({ company, loading }) => ({
  company,
  loading: loading.models.company,
}))
export default class CompanyDetail extends Component {
  state = {
    detail: {},

    selectedRows: [],
    modalVisible: false,
  };

  componentDidMount() {
    this.fetch();
  }
  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };
  handleSelectRows = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
    });
  };

  handleAdd = fields => {
    const supplyid = getSupplyId();
    this.props.dispatch({
      type: 'company/addAddress',
      payload: {
        companyid: supplyid,
        address: fields.address,
        phone: fields.phone,
        charge: fields.charge,
      },
    });
    message.success('新增成功!');
    this.fetch();

    this.setState({
      modalVisible: false,
    });
  };
  handleDelete = () => {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;

    if (!selectedRows) return;
    const idArr = [];
    selectedRows.forEach(data => {
      idArr.push(data.id);
    });
    dispatch({
      type: 'company/deleteAddress',
      payload: {
        ids: idArr,
      }.then(response => {
        if (response.status === 200) {
          this.fetch();
        }
      }),
    });
  };
  fetch = () => {
    const supplyid = getSupplyId();

    companyDetail({ id: supplyid }).then(response => {
      this.setState({
        detail: response.result,
      });
      const param = `terms[0].value=${supplyid}&terms[0].column=companyid&pageIndex=0&pageSize=10`;
      queryCompanyAddress(param).then(responses => {
        this.setState({
          tableData: responses.result.data,
        });
      });
    });
  };

  render() {
    const { loading } = this.props;

    const { modalVisible, selectedRows } = this.state;
    const rowSelection = {
      selectedRows,

      onChange: this.handleSelectRows,
    };
    // if(data&&data.status){
    //     if (data.status === 200 && data.result) {// 数据结构和后台不一样，是不是不应该放在这里做呢？

    //       this.state.detail = data.result;
    //     }

    //   }
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    const goodsColumns = [
      {
        title: '收货地址',
        dataIndex: 'address',
      },
      {
        title: '收货人',
        dataIndex: 'charge',
      },
      {
        title: '收货手机',
        dataIndex: 'phone',
      },
    ];
    return (
      <PageHeaderLayout title="个人中心">
        <Card bordered={false}>
          <Divider style={{ marginBottom: 32 }} />
          <DescriptionList size="large" title="用户信息" style={{ marginBottom: 32 }}>
            <Description term="公司名">{this.state.detail.company}</Description>
            <Description term="注册人">{this.state.detail.loginuser}</Description>
            <Description term="税号">{this.state.detail.taxnumber}</Description>
            <Description term="营业执照">
              <img alt="" src={this.state.detail.photo} />
            </Description>
            <Description term="注册时间">{this.state.detail.createtime}</Description>
          </DescriptionList>
          <Divider style={{ marginBottom: 32 }} />
          <div className={styles.title}>通讯地址</div>
          <div style={{ display: 'inline-block', marginLeft: 10 }}>
            <Button
              icon="plus"
              className={styles.switchBtn}
              type="primary"
              onClick={() => this.handleModalVisible(true)}
            >
              新建
            </Button>
            <Button
              icon="delete"
              className={styles.switchBtn}
              style={{ marginLeft: 10 }}
              type="primary"
              onClick={() => this.handleDelete()}
            >
              删除
            </Button>
          </div>
          <Table
            style={{ marginBottom: 24 }}
            pagination={false}
            selectedRows={selectedRows}
            rowSelection={rowSelection}
            onChange={this.handleStandardTableChange}
            bordered
            loading={loading}
            dataSource={this.state.tableData}
            columns={goodsColumns}
            rowKey="id"
          />
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
      </PageHeaderLayout>
    );
  }
}
