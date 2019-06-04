import { querypicktimesetting, savepicktimesetting } from '../services/api';

export default {
  namespace: 'pickupsetting',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(querypicktimesetting, payload);

      yield put({
        type: 'save',
        payload: response,
      });
    },

    *add({ payload, callback }, { call }) {
      const response = yield call(savepicktimesetting, payload);

      callback(response);
    },
    // *remove({ payload, callback }, { call, put }) {
    //   const response = yield call(removeSupply, payload);
    //   yield put({
    //     type: 'save',
    //     payload: response,
    //   });
    //   if (callback) callback();
    // },
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
