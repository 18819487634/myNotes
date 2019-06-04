import { queryColorBook, addColorBook } from '../services/api';

export default {
  namespace: 'colorbook',

  state: {
    data: {
      list: [],
    },
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryColorBook, payload);
      yield put({
        type: 'saveMy',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addColorBook, payload);
      yield put({
        type: 'saveMy',
        payload: response,
      });
      if (callback) callback();
    },
  },
  reducers: {
    saveMy(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
