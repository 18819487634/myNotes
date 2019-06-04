import { message } from 'antd';
import { queryErpClient, addErpClient, deleteContact } from '../services/api';

export default {
  namespace: 'erpclient',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryErpClient, payload);

      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetcherp({payload,callback},{call}){
      const response = yield call(queryErpClient, payload);
      if(response && response.status === 200){
        callback(response.result.data);
      }
    },

    *add({ payload, callback }, { call }) {
      const response = yield call(addErpClient, payload);
      if (response.status === 200) {
        // 返回成功
        message.success('提交成功！');
        callback(response);
      }
    },
    // *remove({ payload, callback }, { call, put }) {
    //   const response = yield call(removeSupply, payload);
    //   yield put({
    //     type: 'save',
    //     payload: response,
    //   });
    //   if (callback) callback();
    // },
    // *update({ payload, callback }, { call, put }) {
    //   const response = yield call(updateSupply, payload);
    //   yield put({
    //     type: 'save',
    //     payload: response,
    //   });
    //   if (callback) callback();
    // },
    *deleteContacts({payload,callback},{call}){
      const response = yield call(deleteContact,payload);
      if (response.status === 200) {
        // 返回成功
        message.success('删除成功!');
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
  },
};
