import { queryuserlocation, updateuserlocation, deleteuserlocation } from '../services/api';

export default {
  namespace: 'userlocation',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryuserlocation, payload);

      yield put({
        type: 'save',
        payload: response,
      });
    },

    *add({ payload, callback }, { call }) {
      const response = yield call(updateuserlocation, payload);

      callback(response);
    },
    *remove({ payload, callback }, { call }) {
      const response = yield call(deleteuserlocation, payload);
      callback(response);
    },
    // *update({ payload, callback }, { call }) {
    //   const response = yield call(updateSupply, payload);
    //   if (response.status === 200) {
    //     // 返回成功
    //     callback(response);

    //   }

    // },
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
