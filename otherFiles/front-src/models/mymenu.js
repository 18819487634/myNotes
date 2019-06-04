import { queryAllmenu } from '../services/api';
import { setAllTreeData } from '../utils/sessionStorage';

export default {
  namespace: 'mymenu',

  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *fetchAuthorizeMenu({ payload }, { call, put }) {
      const response = yield call(queryAllmenu, payload);

      if (response && response.status === 200) {
        setAllTreeData(JSON.stringify(response.result.data));
        yield put({
          type: 'saveMenu',
          payload: response.result.data,
        });
      }
    },
  },

  reducers: {
    saveMenu(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
