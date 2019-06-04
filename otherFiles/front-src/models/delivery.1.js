import { queryDelivery, queryDeliveryForId } from '../services/api';

export default {
  namespace: 'delivery',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryDelivery, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *fetchDetail({ payload }, { call, put }) {
      const response = yield call(queryDeliveryForId, payload);
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
