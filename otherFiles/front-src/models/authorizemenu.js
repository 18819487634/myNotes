import { registByAdmin, queryCompanyUser, queryAuthSetting } from '../services/api';

export default {
  namespace: 'authorizemenu',

  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *submitUserForm({ payload, callback }, { call, put }) {
      const response = yield call(registByAdmin, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *companyuser({ payload }, { call, put }) {
      const response = yield call(queryCompanyUser, payload);
      if (response && response.status === 200) {
        yield put({
          type: 'save',
          payload: response,
        });
      }
    },
    *findAuthsetting({ payload }, { call, put }) {
      const response = yield call(queryAuthSetting, payload);
      if (response && response.status === 200 && response.result) {
        const { result: { menus } } = response;
        const mids = [];
        if (menus) {
          const t = Array.from(menus);
          t.forEach(m => {
            mids.push(m.menuId);
          });
        }
        yield put({
          type: 'save',
          payload: { selectMenus: mids },
        });
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
