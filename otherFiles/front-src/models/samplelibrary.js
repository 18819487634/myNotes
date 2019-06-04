import { querygetbanmao } from '../services/api';

export default {
  namespace: 'samplelibrary',

  
  state: {
    data: {
      firstlist: [],
    },
  },
// 获取建立api的连接
  effects:{
    *fetch({ payload },{call, put}){
      const response = yield call(querygetbanmao, payload);
        yield put({
          type:'getbanmao',
          payload:response
        });
    },
  },
// 触发方法
  reducers:{
    // 触发，接收一个action更新props
    getbanmao(state,action){
      return {
        ...state,//保留之前的state不变
        firstlist:action.payload,
      };
    }
  }


};
