import { queryDyedyarnForm } from '../services/api';

export default {
  namespace: 'bigcarglibrary',

  state: {
    data: {
      firstlist: [],
    },
  },
// 获取建立api的连接
  effects:{
    *fetch({ payload },{call, put}){
      const response = yield call(queryDyedyarnForm, payload);
        yield put({
          type:'getbigcarg',//对应触发action的方法
          payload:response
        });
    },
  },
// 触发方法
  reducers:{
    // 触发，接收一个action更新props
    getbigcarg(state,action){
      return {
        ...state,//保留之前的state不变
        firstlist:action.payload,
      };
    }
  }


};
