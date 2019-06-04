import { queryInquire, inquery2presale, querypresalespecialdetail } from '../services/api';

export default {
  namespace: 'presalespecial',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchBasic({ payload }, { call, put }) {
      const response = yield call(queryInquire, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *fetchDetail({ payload, callback }, { call, put }) {
      const response = yield call(querypresalespecialdetail, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback(response);
    },

    *submitInuqiry({ payload }, { call, put }) {
      const response = yield call(inquery2presale, payload);
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
