import { queryDictionary, removeDictionary, addDictionary } from '../services/api';

export default {
  namespace: 'dictionary',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchBasic({ payload }, { call, put }) {
      const response = yield call(queryDictionary, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *remove({ payload }, { call, put }) {
      const response = yield call(removeDictionary, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *add({ payload }, { call, put }) {
      const response = yield call(addDictionary, payload);
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
