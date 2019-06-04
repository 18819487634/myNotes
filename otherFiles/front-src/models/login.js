import { routerRedux } from 'dva/router';
import { fakeAccountLogin, longforsearch } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';

import { setUserToken, setSupplyId, setCurrentUser, setUserCompany } from '../utils/sessionStorage';
import { setUserPwd, getUserPwd } from '../utils/localStorage';

export default {
  namespace: 'login',
  state: {
    status: undefined,
    result: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      // 保存结果。这里如果后端返回的是个数组，表示登录用户含有多个角色怎么处理呢？
      if (response) {
        if (response.status === 200 || response.status === 'ok') {
          // 密码错误
          // const currentUsers = response.result.currentAuthority===undefined?"common":response.result.currentAuthority;
          yield put({
            type: 'changeLoginStatus',
            payload: {
              currentAuthority: response.result.currentAuthority,
            },
          });
          if(payload.autoflag===true){

            const userpwd = {
              username:payload.username,
              password:payload.password,
              autoflag:payload.autoflag,
            };
            setUserPwd(JSON.stringify(userpwd));
          }
          setUserToken(response.result.token);
          const { supplyid, currentUser,company } = response.result;
          if (supplyid) {
            setSupplyId(supplyid);
          }
          if (currentUser) {
            setCurrentUser(JSON.stringify(currentUser));
          }
          if(company){
            setUserCompany(JSON.stringify(company));
          }
          reloadAuthorized();
          if (supplyid) {
            yield put(routerRedux.push('/goods/goodsstock'));
          } else {
            yield put(routerRedux.push('/#/'));
          }
        } else {
          yield put({
            type: 'changeLoginStatus',
            payload: {
              status: 'error',
              type: 'account',
            },
          });
        }
      } else {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: 'error',
            type: 'account',
          },
        });
      }
    },
    *searchToken({ payload }, { call, put }) {
      const response = yield call(longforsearch, payload);
      yield put({
        // 把返回结果放到reducers
        type: 'saveToken',
        payload: response,
      });
    },
    *logout(_, { put, select }) {
      try {
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        setUserToken(null);
        setSupplyId(null);
        setCurrentUser(null);
        setUserCompany(null);
        const userpwd = JSON.parse(getUserPwd());
        if(userpwd){
          userpwd.autoflag = false;
          setUserPwd(JSON.stringify(userpwd));
        }
        reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      // setAuthority("admin");
      if (payload.status && payload.status === 'error') {
        return {
          ...state,
          status: payload.status,
          type: payload.type,
        };
      }
      if (payload.currentAuthority === undefined) {
        setAuthority('common');
      } else if (payload.currentAuthority.length === 0) {
        setAuthority('common');
      } else {
        setAuthority(payload.currentAuthority); // Linjiefeng 这个后端hsweb登录时候直接带过来
      }

      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
    saveToken(state, { payload }) {
      return {
        ...state,
        status: payload.status,
        result: {
          code: payload.result.code,
          token: payload.result.token,
        },
      };
    },
  },
};
