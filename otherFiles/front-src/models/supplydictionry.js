import { querysupplydictionry, addsupplydictionry, querysupplydictionrycangku } from '../services/api';

export default {
  namespace: 'supplydictionry',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    cangku:{},
  },

  
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(querysupplydictionry, payload);

      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchcangku({ payload }, { call, put }) {
      const response = yield call(querysupplydictionry, payload);

      yield put({
        type: 'cangkus',
        payload: response,
      });
    },

    *add({ payload, callback }, { call }) {
      const response = yield call(addsupplydictionry, payload);
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
    cangkus(state, action) {
      return {
        ...state,
        cangku: action.payload,
      };
    },
  },
};
