import { queryAccountnumber,addAccountnumber  } from '../services/api';

export default {
  namespace: 'accountnumber',
  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *submit({ payload }, { call,put}) {
      const response = yield call(queryAccountnumber, payload);
      if (response && response.status === 200) {
        yield put({ 
          type: 'save',
          payload: response,
        });
      }
      
    },
    *add({payload,callback},{call}){
      
      const response = yield call(addAccountnumber, payload);
      // console.log("response:"+response+";payload:"+payload);
      if (response.status === 200) {
        // 返回成功
        callback(response);
      }

    },
  },
  reducers: { // 管理state 的 
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
