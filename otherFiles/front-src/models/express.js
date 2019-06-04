import { queryExpress, queryExpressCost, queryProvince, saveOrupdateExpressCost } from '../services/api';

export default {
  namespace: 'express',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },
  stp:{
    exdata:{},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryExpress, payload);

      yield put({
        type: 'save',
        payload: response,
      });
    },

    *fetchDetail({payload},{call,put}){
      const response = yield call(queryExpressCost,payload);
      yield put({
        type:'save',
        payload:response,
      })
    },

   *getProviceList({payload, callback},{call}){
    const time = new Date().getTime()
    //  每隔一天重新拉取一次数据
    if(localStorage.getItem('expireTime') === undefined || (time - Number(localStorage.getItem('expireTime')) > 86400000)) {
      window.localStorage.removeItem('proviceData')
      if((localStorage.getItem('proviceData') === null || localStorage.getItem('proviceData') === undefined)) {
        let i = 35;
        const proviceresp = yield call(queryProvince, payload);
        if(proviceresp && proviceresp.status === 200) {
            const proviceDatas = proviceresp.result.data;
            const newprovicedata =[]
            for(let q = 0; q < proviceDatas.length; q++) {
              const val = {}
              for(const keys in proviceDatas[q]) {
                if(keys !== 'children') {
                  val[keys] = proviceDatas[q][keys]
                }
              }
              const tmp = [];
              for(let w = 0; w < proviceDatas[q].children.length; w++) {
                const obj = {}
                for(const item in proviceDatas[q].children[w]) {
                  if(item === 'id') {
                    obj.cid = i;
                    i += 1;
                  } else {
                    obj[item] = proviceDatas[q].children[w][item];
                  }
                }
                tmp.push(obj)
              }
              val.children = tmp
              newprovicedata.push(val)
            }
            callback(newprovicedata)
            const expireTime = new Date().getTime()
            const str = JSON.stringify(newprovicedata)
            window.localStorage.setItem('proviceData', str)
            window.localStorage.setItem('expireTime', expireTime)
        }
      } else {
        callback('local')
      }
    } else {
      callback('local')
    }
    },

    //  把对应物流公司的数据塞进provinceData中并返回用于展示
    *getLogisticsData({payload, callback}, {call}) {
      if(payload.indexOf('paging') > 0) {
        const expresscostresp = yield call(queryExpressCost, payload);
        if(expresscostresp && expresscostresp.status === 200) {
          const resp = expresscostresp.result.data;
          const provincedata = JSON.parse(localStorage.getItem('proviceData'));   //  数组
          for(let i = 0; i < provincedata.length; i++) {
            for(let p = 0; p < resp.length; p++) {
              if(!resp[p].codec) {
                if(resp[p].provincec === provincedata[i].codeP) {
                  provincedata[i].basepay = resp[p].basepay
                  provincedata[i].baseweight = resp[p].baseweight
                  provincedata[i].expressid = resp[p].expressid
                  provincedata[i].updateid = resp[p].id
                  // provincedata[i].overload = resp[p].overload
                  provincedata[i].overweight = resp[p].overweight
                  provincedata[i].supplyid = resp[p].supplyid
                }
              } else if(resp[p].codec) {
                for(let s = 0; s < provincedata[i].children.length; s++) {
                  if(resp[p].codec === provincedata[i].children[s].codeC) {
                    provincedata[i].children[s].basepay = resp[p].basepay
                    provincedata[i].children[s].baseweight = resp[p].baseweight
                    provincedata[i].children[s].expressid = resp[p].expressid
                    provincedata[i].children[s].updateid = resp[p].id
                    // provincedata[i].children[s].overload = resp[p].overload
                    provincedata[i].children[s].overweight = resp[p].overweight
                    provincedata[i].children[s].supplyid = resp[p].supplyid
                  }
                }
              }
            }
          }
          callback(provincedata)
        } else {
          callback(payload)
        }
      }
    },

    *savePrice({payload, callback}, {call, put}) {
      const saveorupdate = yield call(saveOrupdateExpressCost, payload)
      if(saveorupdate && saveorupdate.status === 200) {
        callback('ok')
        // const id = window.sessionStorage.getItem('expressid')
        // const params = `terms[0].value=${id}&terms[0].column=expressid&paging=false`;
        // yield put({ 
        //   type: 'getLogisticsData',
        //   payload: params,
        // });
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
    saveList(stp, action) {
      return {
        ...stp,
        exdata: action.payload,
      };
    },
  },
};
