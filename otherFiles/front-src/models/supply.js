import { querySupply, removeSupply, addSupply, updateSupply } from '../services/api';

export default {
  namespace: 'supply',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(querySupply, payload);

      yield put({
        type: 'save',
        payload: response,
      });
    },

    *add({ payload }, { call, put }) {
      const response = yield call(addSupply, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeSupply, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *update({ payload, callback }, { call }) {
      const response = yield call(updateSupply, payload);
      if (response.status === 200) {
        // 返回成功
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
