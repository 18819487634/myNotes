import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Form, Input, Button, Select, Row, Col, Popover, Progress, Card, message } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Company.less';

import {
  setUserToken,
  setSupplyId,
  setCurrentUser,
  getCurrentUser,
} from '../../utils/sessionStorage';
import { updateLoginUserPassword } from '../../services/api';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

const passwordStatusMap = {
  ok: <div className={styles.success}>强度：强</div>,
  pass: <div className={styles.warning}>强度：中</div>,
  poor: <div className={styles.error}>强度：太短</div>,
};

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

@connect(({ register, loading }) => ({
  register,
  submitting: loading.effects['register/update'],
}))
@Form.create()
export default class UpdatePwd extends Component {
  state = {
    count: 0,
    confirmDirty: false,
    visible: false,
    help: '',
    prefix: '86',
  };

  //   componentWillReceiveProps(nextProps) {
  //     const mobile = this.props.form.getFieldValue('mobile');
  //     if (nextProps.register.status === 'ok') {
  //       this.props.dispatch(
  //         routerRedux.push({
  //           pathname: '/user/register-result',
  //           state: {
  //             mobile,
  //           },
  //         })
  //       );
  //     }
  //   }

  //   componentWillUnmount() {
  //     clearInterval(this.interval);
  //   }

  onGetCaptcha = () => {
    let count = 59;
    this.setState({ count });
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({ count });
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  };

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch } = this.props;
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        updateLoginUserPassword(values).then(res => {
          if (res && res.status === 200) {
            message.success('修改成功！请重新登录');

            setUserToken(null);
            setSupplyId(null);
            setCurrentUser(null);
            dispatch(routerRedux.push('/user/login'));
          }
        });
      }
    });
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
  };

  checkPassword = (rule, value, callback) => {
    if (!value) {
      this.setState({
        help: '请输入密码！',
        visible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      if (!this.state.visible) {
        this.setState({
          visible: !!value,
        });
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  changePrefix = value => {
    this.setState({
      prefix: value,
    });
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const currentUser = JSON.parse(getCurrentUser());

    const { count, prefix } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };
    return (
      <PageHeaderLayout title="修改密码">
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="用户名称">
              <Row gutter={8}>
                <Col span={16}>
                  {getFieldDecorator('username', {
                    initialValue: currentUser.username,
                  })(<Input size="large" disabled />)}
                </Col>
              </Row>
            </FormItem>

            <FormItem {...formItemLayout} label="原来的密码">
              <Row gutter={8}>
                <Col span={25}>
                  {getFieldDecorator('oldPassword', {
                    rules: [
                      {
                        required: true,
                        message: '请输入之前的密码！',
                      },
                    ],
                  })(<Input size="large" type="password" placeholder="请输入之前的密码" />)}
                </Col>
              </Row>
            </FormItem>
            <FormItem help={this.state.help} {...formItemLayout} label="新密码">
              <Popover
                content={
                  <div style={{ padding: '4px 0' }}>
                    {passwordStatusMap[this.getPasswordStatus()]}
                    {this.renderPasswordProgress()}
                    <div style={{ marginTop: 10 }}>
                      请至少输入 6 个字符。请不要使用容易被猜到的密码。
                    </div>
                  </div>
                }
                overlayStyle={{ width: 240 }}
                placement="right"
                visible={this.state.visible}
              >
                {getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message: '请输入新的密码！',
                      validator: this.checkPassword,
                    },
                  ],
                })(<Input size="large" type="password" placeholder="至少6位密码，区分大小写" />)}
              </Popover>
            </FormItem>
            <FormItem {...formItemLayout} label="确认密码">
              {getFieldDecorator('confirm', {
                rules: [
                  {
                    required: true,
                    message: '请确认密码！',
                  },
                  {
                    validator: this.checkConfirm,
                  },
                ],
              })(<Input size="large" type="password" placeholder="确认密码" />)}
            </FormItem>

            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button
                size="large"
                loading={submitting}
                className={styles.submit}
                type="primary"
                htmlType="submit"
              >
                确定修改
              </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderLayout>
    );
  }
}
