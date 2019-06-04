import { queryInquire, inquery2presale, queryGoodsBasic, quickInquery } from '../services/api';

export default {
  namespace: 'inquiry',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchBasic({ payload }, { call, put }) {
      const response = yield call(queryInquire, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchGoodsDetail({ payload, callback }, { call, put }) {
      const response = yield call(queryGoodsBasic, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback(response);
    },

    *submitInuqiry({ payload, callback }, { call }) {
      const response = yield call(inquery2presale, payload);

      if (response.status === 200) {
        callback(response);
        // 返回成功
        //   if(response.result){
        //    const inquirys =response.result.inquiry;
        //    const pickups =response.result.pickup;
        //    const users =response.result.user;
        //    console.log(`${inquirys},${pickups},${users}`);
        //     message.success(`提交成功`);
        //     yield put(routerRedux.push('/order/inquirybatchno'));
        //      window.location.reload();
      }

      // }else if(response.status === 404){
      //   message.error(`提交失败,${response.message}`)
      // }else{
      //   message.error(`提交失败,${response.message},请重新刷新页面`)
      // }
    },
    *submitQuickInuqiry({ payload, callback }, { call }) {
      const response = yield call(quickInquery, payload);

      if (response) {
        // 返回成功
        callback(response);
        // if(response.result){
        //  const inquirys =response.result.inquiry;
        //  const pickups =response.result.pickup;
        //  const users =response.result.user;
        //  console.log(`${inquirys},${pickups},${users}`);
        //   message.success(`提交成功`);
        //   yield put(routerRedux.push('/order/inquirybatchno'));
        //    window.location.reload();
        // }

        // }else if(response.status === 404){
        //   message.error(`提交失败,${response.message}`)
        // }else{
        //   message.error(`提交失败,${response.message},请重新刷新页面`)
        // }
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
