export default {
  namespace: 'MenuAndTabs',
  state: {
    MenuTabsArr: [
      { title: '点我一下', content: 'Content of Tab Pane 1', key: '1' },
      { title: '不点咋地', content: 'Content of Tab Pane 2', key: '2' },
    ],
    count: 0,
  },
  reducers: {
    request(state, payload) {
      return { ...state, ...payload };
    },
    response(state, payload) {
      return { ...state, ...payload };
    },
  },
  effects: {
    *fetch(action, { put, call }) {
      yield put({ type: 'request', loading: true });

      let count = yield call(count => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(count + 1);
          }, 1000);
        });
      }, action.count);

      yield put({
        type: 'response',
        count,
        MenuTabsArr,
      });
    },
  },
};
