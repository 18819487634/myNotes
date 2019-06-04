import {  queryPickup } from '../services/api';

export default {
  namespace: 'pickup',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryPickup, payload);
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
