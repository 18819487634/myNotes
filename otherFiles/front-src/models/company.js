import { routerRedux } from 'dva/router';
import { message } from 'antd';
import {
  registCompany,
  companyDetail,
  addCompanyAddress,
  removeCompanyAddress,
  updateCompanyAddress,
} from '../services/api';
import { setUserToken, setSupplyId, setCurrentUser } from '../utils/sessionStorage';

export default {
  namespace: 'company',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *submitCompanyForm({ payload }, { call, put }) {
      const response = yield call(registCompany, payload);

      if (response.status === 200 && response.result.regist === '00') {
        // 更新成功
        message.success('提交成功,请重新登录');
        // 返回成功
        setUserToken(null);
        setSupplyId(null);
        setCurrentUser(null);
        yield put(routerRedux.push('/user/login'));
      }
    },
    *fetchBasic({ payload }, { call, put }) {
      const response = yield call(companyDetail, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchAddress({ payload }, { call, put }) {
      const response = yield call(companyDetail, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *removeAddress({ payload }, { call, put }) {
      const response = yield call(removeCompanyAddress, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *updateAddress({ payload }, { call, put }) {
      const response = yield call(updateCompanyAddress, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *addAddress({ payload }, { call, put }) {
      const response = yield call(addCompanyAddress, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
