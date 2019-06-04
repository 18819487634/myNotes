import { routerRedux } from 'dva/router';
import { message } from 'antd';
import {
  fakeColorInputForm,
  queryColor,
  removeColor,
  getuuid,
  longforsearch,
  queryColorProduct,
  saveColorProduct,
  saveOrupdatekind,
  queryColorKind,
  saveOrupdateseries,
  saveOrupdateColorProduct,
  queryColorseries,
} from '../services/api';

export default {
  namespace: 'color',

  state: {
    data: [],
    seriesData:[],
  },

  effects: {
    *submitColorForm({ payload }, { call, put }) {
      const response = yield call(saveColorProduct, payload);

      if (response.status === 200) {
        // 返回成功
        message.success('提交成功');
        yield put(routerRedux.push('/color/show/search'));
      } else if (response.status === 403) {
        message.error(`提交失败,${response.message}`);
      } else {
        message.error(`提交失败,${response.message},请重新刷新页面`);
      }
    },

    *saverOrUpdateColorForm({ payload }, { call, put }) {
      const response = yield call(saveOrupdateColorProduct, payload);

      if (response.status === 200) {
        // 返回成功
        message.success('提交成功');
        if(payload.id === undefined){// 新建
          yield put(routerRedux.push('/color/show/search'));
        }
        else{// 修改,查询条件一起带过来?
          const values = `pageSize=${payload.pagesize}&pageIndex=${payload.pageindex}`;
          yield put({
            type:'fetchColor',
            payload:values,
          })
        }
       
      } else if (response.status === 403) {
        message.error(`提交失败,${response.message}`);
      } else {
        message.error(`提交失败,${response.message},请重新刷新页面`);
      }
    },
    *offlineColorFrom({ payload }, { call }) {
      const response = yield call(saveColorProduct, payload);
      if (response.status === 200) {
        message.success('提交成功');
      } else if (response.status === 403) {
        message.error(`提交失败,${response.message}`);
      } else {
        message.error(`提交失败,${response.message},请重新刷新页面`);
      }
    },
    *fetchColor({ payload }, { call, put }) {
      const response = yield call(queryColorProduct, payload);
      yield put({
        // 把返回结果放到reducers
        type: 'save',
        payload: response,
      });
    },
    *getUuid({ payload, callback }, { call }) {
      const response = yield call(getuuid, payload);
      if (response.status === 200) {
        // 返回成功
        callback(response);
      }
    },

    *deleteColor({ payload, callback }, { call }) {
      const response = yield call(removeColor, payload);
      message.success('删除成功');
      if (response.status === 200) {
        // 返回成功
        callback(response);
      }
    },
    *addOrUpdateKind({ payload, callback }, { call }) {
      const response = yield call(saveOrupdatekind, payload);

      if (response.status === 200) {
        // 返回成功
        callback(response);
      }
    },
    *fetchKind({ payload }, { call, put }) {
      const response = yield call(queryColorKind, payload);

      yield put({
        // 把返回结果放到reducers
        type: 'save',
        payload: response,
      });
    },
    *fetchSeries({ payload }, { call, put }) {
      const response = yield call(queryColorseries, payload);

      yield put({
        // 把返回结果放到reducers
        type: 'saveSeries',
        payload: response,
      });
    },
    *addOrUpdateSeries({ payload, callback }, { call }) {
      const response = yield call(saveOrupdateseries, payload);

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
    saveSeries(state, action) {
      return {
        ...state,
        seriesData: action.payload,
      };
    },
  },
};
