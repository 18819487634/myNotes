import { querypaydetail, addpaydetail } from '../services/api';

export default {
  namespace: 'paydetail',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(querypaydetail, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addpaydetail, payload);
      yield put({
        type: 'saveMy',
        payload: response,
      });
      if (response) {
        callback(response);
      }
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
