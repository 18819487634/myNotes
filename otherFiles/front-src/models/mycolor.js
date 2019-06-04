import { queryColor } from '../services/api';

export default {
  namespace: 'mycolor',

  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *fetchMyColor({ payload }, { call, put }) {
      const response = yield call(queryColor, payload);
      yield put({
        // 把返回结果放到reducers
        type: 'saveMy',
        payload: response,
      });
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
