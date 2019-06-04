import React, { Component } from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import { Checkbox, Alert, Icon, Modal } from 'antd';

import Login from 'components/Login';
import { longforsearch } from '../../services/api';
import { setUserToken, setSupplyId, setCurrentUser } from '../../utils/sessionStorage';
import styles from './Login.less';
import store from '../../index';
import { setAuthority } from '../../utils/authority';
import { getUserPwd } from '../../utils/localStorage';

const { Tab, UserName, Password, Submit } = Login;
const confirms = Modal.confirm;
const QRCode = require('qrcode.react');

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  componentWillMount() {
    const userpwd = JSON.parse(getUserPwd());
    if(userpwd!==null && userpwd.autoflag === true){
      this.setState({
        type: 'account',
        autoflag:true,
        username:userpwd.username,
        password:userpwd.password,
        uuid: '',
        qrcodeVal: '',
        count: 0,
        loginStatus: false,
        flag: true,
        autoLogin:true,
      },()=>{
        this.autoLogin(userpwd);
      })
    }else if(userpwd !== null){
      this.setState({
        type: 'account',
        username:userpwd.username,
        password:userpwd.password,
        autoflag:false,
        uuid: '',
        qrcodeVal: '',
        count: 0,
        loginStatus: false,
        flag: true,
      });
    }else{
      this.setState({
        type: 'account',
        autoflag:false,
        uuid: '',
        qrcodeVal: '',
        count: 0,
        loginStatus: false,
        flag: true,
      });
    }
    
  }
  componentDidMount() {
  }
  
  componentWillUnmount() {

    clearTimeout(this.timer);
  }
   
  onTabChange = type => {
    if (type === 'qrcode') {
      this.createQrcode();
      if (this.state.count >= 3) {
        this.state.count = 0;
      }
    }
    this.setState({ type });
  };
  timeout = () => {
    const a = this.state.count;

    if (a >= 4) {
      clearTimeout(this.timer);
      if (this.state.loginStatus === false) {
        this.setState({
          flag: false,
        });
      }
    } else {
      this.longsearch();

      setTimeout(() => {
        this.timeout();
      }, 10000);
      this.state.count = a + 1;
    }
  };
  createQrcode = () => {
    this.props.dispatch({
      type: 'color/getUuid',
      payload: {},
      callback: response => {
        const uuidVal = response.result;
        const uuids = uuidVal.split('=');

        this.setState({
          qrcodeVal: `${uuidVal}`,
          uuid: uuids[1],
        });
        this.timer = this.timeout();
      },
    });
  };
  autoLogin= (userpwd) => {
    const values ={
      username:userpwd.username,
      password:userpwd.password,
      token_type:'jwt',
    };
    const { type } = this.state;
      this.props.dispatch({
        type: 'login/login',
        payload: {
          ...values,
          type,
        },
      });
    
  };

  handleSubmit = (err, values) => {
    values.token_type = 'jwt'; // 使用token 。linjiefeng
    values.autoflag = this.state.autoflag;// 是否自动登录
    
    const { type } = this.state;
    if (!err) {
      this.props.dispatch({
        type: 'login/login',
        payload: {
          ...values,
          type,
        },
      });
    }
  };

  changeAutoLogin = e => {
    const loginPro = this;
    if(e.target.checked===true){
      confirms({
        title: `是否保留用户密码到本地?`,
        content: ``,
        onOk() {
          loginPro.setState({
            autoLogin:true,
            autoflag:true,
          });
        },
        onCancel() {
          loginPro.setState({
            autoLogin: false,
            autoflag:false,
          });
        },
      });
    }else{
      this.setState({
        autoLogin:e.target.checked,
      })
    }
    
  
  };
  longsearch = () => {
    const uuidval = this.state.uuid;
    if (uuidval !== '') {
      longforsearch({ uuid: uuidval }).then(response => {
        const { dispatch } = store;
        if (response !== undefined && response.status === 200) {
          if (response.result.code === '201') {
            const tokens = response.result.token;

            setUserToken(tokens);
            const { supplyid, currentUser, currentAuthority } = response.result;
            if (supplyid) {
              setSupplyId(supplyid);
            }

            setCurrentUser(JSON.stringify(currentUser));

            setAuthority(currentAuthority);
            this.setState.loginStatus = true;
            dispatch(routerRedux.push('/goods/goodsstock'));

            clearTimeout(this.timer);
          }
        }
      });
    }
  };
  refresh = () => {
    clearTimeout(this.timer);
    this.setState({
      flag: true,
    });
    this.createQrcode();
    this.state.count = 0;
    this.timer = this.timeout();
  };

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };

  render() {
    const { login, submitting } = this.props;
    const { type,password,username } = this.state;
    return (
      <div className={styles.main}>
        <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
          <Tab key="account" tab="账户密码登录">
            {login.status === 'error' &&
              login.type === 'account' &&
              !login.submitting &&
              this.renderMessage('账户或密码错误')}
            <UserName name="username" placeholder="" defaultValue={username} />
            <Password name="password" placeholder="" defaultValue={password} />
            <div>
              <Checkbox checked={this.state.autoLogin} onChange={this.changeAutoLogin}>
                自动登录
              </Checkbox>
              <a style={{ float: 'right' }} href="">
                忘记密码
              </a>
            </div>
            <Submit loading={submitting}>登录</Submit>
          </Tab>
          <Tab key="qrcode" tab="二维码登录">
            <div>
              <div id="fail" className={this.state.flag ? styles.failnone : styles.failshow}>
                <span>失效</span>
              </div>
              <QRCode
                style={{ margin: 'auto' }}
                size={150}
                value={this.state.qrcodeVal}
                onClick={this.refresh}
              />
            </div>
          </Tab>

          <div className={styles.other}>
            其他登录方式
            <Icon className={styles.icon} type="alipay-circle" />
            <Icon className={styles.icon} type="taobao-circle" />
            <Icon className={styles.icon} type="weibo-circle" />
            <Link className={styles.register} to="/user/register">
              注册账户
            </Link>
          </div>
        </Login>
      </div>
    );
  }
}
