import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { fakeRegister, updateLoginUserPassword } from '../services/api';
import { setAuthority } from '../utils/authority';

import { setUserToken, setSupplyId, setCurrentUser } from '../utils/sessionStorage';
import { reloadAuthorized } from '../utils/Authorized';

export default {
  namespace: 'register',

  state: {
    status: undefined,
  },

  effects: {
    // *submit(_, { call, put }) {
    *submit(_, { call, put }) {
      const response = yield call(fakeRegister, _.payload);
      if (response.status === 200) {
        if (response.message && response.message === '{username_exists}') {
          message.error('注册失败，用户已存在');
        } else {
          message.success('注册成功');
          yield put(routerRedux.push('/user/login'));
        }
      }
    },
    *update(_, { call, put }) {
      const response = yield call(updateLoginUserPassword, _.payload);
      if (response.status === 200) {
        message.success('修改成功！请重新登录');

        setUserToken(null);
        setSupplyId(null);
        setCurrentUser(null);
        reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
      }
    },
  },

  reducers: {
    registerHandle(state, { payload }) {
      // 注册成功之后，可以进入完善公司企业信息的界面，我们前端给common 账户
      setAuthority('common');
      reloadAuthorized();
      return {
        ...state,
        status: payload.status,
      };
    },
  },
};
