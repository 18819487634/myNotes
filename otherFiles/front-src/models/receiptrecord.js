
import { all, select } from 'redux-saga/effects';
import { querypaydetail, queryAccountnumber, queryPresale,
  queryPrereceive, queryErpClient, updatePaydetail} from '../services/api';
import {banks,recordstatus} from '../utils/constants'
import { getCurrentUser } from '../utils/sessionStorage';



export default {
  namespace: 'receiptrecord',

  state: {
    step: {
      preceiveid: '',
      presaleid: '',
    
      address: '',
      money:'',
      amount: 0,
      accountid:'',
      remark:'',
      picurl:'',
      
      
    } ,
    data: {
      list: [],
    },
    loading:false,
    datetime: [],
  },

  effects: {

    *changestatus({payload,callback},{call}){
      const response = yield call(updatePaydetail, payload);// 原始数据入口
      callback(response);

    },

    // 添加账户
    *changepaydetailList({ payload }, { call,put}){
      const {username} = JSON.parse(getCurrentUser());
      const searchdate = yield select(state => state.receiptrecord.datetime);

      if(searchdate.length > 0 && !isNaN(searchdate[0])) {

        const len = payload.result.data.length - 1;
        for(let y = len; y >= 0; y--) {
          if (!(payload.result.data[y].createdate > searchdate[0] && payload.result.data[y].createdate < searchdate[1])) {
            payload.result.data.splice(y, 1)
          }
        }

      }

      const {status ,result } = payload ;
      const { data } = result ;
      if(status===200){
        let params = `terms[0].termType=in&terms[0].column=id` ;
        let  presaleparams = `terms[0].termType=in&terms[0].column=id` ;
        let preceiveparams = `terms[0].termType=in&terms[0].column=id` ;
        let clientparams = `terms[0].termType=in&terms[0].column=id`; // 离线的
        data.forEach(element => {
          params += `&terms[0].value=${element.accountid}`;
          if(element.presaleid && element.presaleid !== undefined && presaleparams.indexOf(element.presaleid) < 0) {
            presaleparams += `&terms[0].value=${element.presaleid}`;
          }
          if(element.preceiveid && element.preceiveid !== undefined) {
            preceiveparams += `&terms[0].value=${element.preceiveid}`;
          }
        });
        // 三个同时请求
        const { accountresp, presaleresp,preceiveresp } = yield all({
          accountresp: call(queryAccountnumber, params),
          presaleresp: call(queryPresale, presaleparams),
          preceiveresp: call(queryPrereceive,preceiveparams),
        })

        if (accountresp && accountresp.status === 200) {
          accountresp.result.data.forEach(accountnumberitem => {
            payload.result.data.forEach(paydetailitem => {
              if(paydetailitem.accountid===accountnumberitem.id){
                
                const val = accountnumberitem.type===3?`${banks.find(item => {
                  return item.value === accountnumberitem.banktype;
                }).key}(${accountnumberitem.charge})${accountnumberitem.accountno}`:(accountnumberitem.type===2?`微信${accountnumberitem.accountno}`:`支付宝${accountnumberitem.accountno}`);
                const tmp = {accountidShow:val};
                Object.assign(paydetailitem, tmp);
              }
            }) 
          });
        }

        const clientmap = new Map(); // 预收款客户ID和结果主键
        if ( presaleresp &&  presaleresp.status === 200) {
          presaleresp.result.data.forEach(item => {
            clientparams +=  `&terms[0].value=${item.clientid}` ; 
            payload.result.data.forEach(paydetailitem => {
              if(paydetailitem.presaleid !== undefined) {
                if(paydetailitem.presaleid===item.id){
                  const val =recordstatus.find(it => {
                    return it.value === item.ismerge;
                  }).key; // 字段
                  const tmp = {idstatus:val}; // 覆盖字段 
                  Object.assign(paydetailitem, tmp);
                  const str = item.usrid;
                  const obj = {usrid: str};
                  Object.assign(paydetailitem, obj);
                  if(clientmap.get(item.clientid)===undefined){
                    clientmap.set(item.clientid,new Set());
                  }
                  clientmap.get(item.clientid).add(paydetailitem.id);
                  // clientmap.set(item.clientid,);// 每个item 都会
                }
              }
            }) 
          });
        }
        if ( preceiveresp &&  preceiveresp.status === 200) {
          preceiveresp.result.data.forEach(item => {
            clientparams +=  `&terms[0].value=${item.clientid}` ; 
            payload.result.data.forEach(paydetailitem => {
              if(paydetailitem.preceiveid && paydetailitem.preceiveid !== undefined) {
                if(paydetailitem.preceiveid===item.id){
                  const val =recordstatus.find(it => {
                    return it.value === 0;
                  }).key; // 字段
                  //  状态字段
                  const tmp = {idstatus:val}; // 覆盖字段 
                  Object.assign(paydetailitem, tmp);
                  const str = item.usrid;
                  const obj = {usrid: str};
                  Object.assign(paydetailitem, obj);
  
                  if(clientmap.get(item.clientid)===undefined){
                    clientmap.set(item.clientid,new Set());
                  }
                  clientmap.get(item.clientid).add(paydetailitem.id);
                  // clientmap.set(item.clientid,paydetailitem.id);
                }
              }
            }) 
          });
        }

        payload.result.data.forEach(item => {
          if(item.usrid && item.usrid !== item.createid) {
            const val = false
            const tmp = {canInvalid: val};
            Object.assign(item, tmp);
          }
        })

        const notme = [];
        payload.result.data.forEach((item, index) => {
          if(item.usrid !== username){
            notme.push(index)
          }
        })
        
        const len = payload.result.data.length - 1;
        for(let r = len; r >= 0; r--) {
          if (payload.result.data[r].usrid && payload.result.data[r].usrid !== username && payload.result.data[r].createid !== username) {
            payload.result.data.splice(r, 1)
          }
        }

        const clientresponse =  yield call(queryErpClient, clientparams);
        if ( clientresponse &&  clientresponse.status === 200) {
          clientresponse.result.data.forEach(item => {
            payload.result.data.forEach(paydetailitem => {
              if(clientmap.get(item.id) !== undefined) {
                if(clientmap.get(item.id).has(paydetailitem.id)){
                  const val = item.name; // 字段
                  const tmp = {clientname:val}; // 覆盖字段 
                  Object.assign(paydetailitem, tmp);
                }
              }
            })
          });
        }
        yield put({ 
          type: 'save',
          payload,
        });
      }

    },

    *submit({ payload }, { call,put}) {
      const response = yield call(querypaydetail, payload);// 原始数据入口
      if (response && response.status === 200) {
         yield put({ 
          type: 'changepaydetailList',
          payload: response,
        });
      }
    },
    *submitDate({payload}, {put}) {
      yield put({
        type: 'saveDate',
        payload,
      })
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveDate(state, action) {
      return {
        ...state,
        datetime: action.payload,
      }
    },
  },
  
};
