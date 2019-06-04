import { all } from 'redux-saga/effects'
import {queryAllPresale, queryListClients, queryallpaydetail} from '../services/api'

export default {
    namespace: 'cashier',

    state: {
        state: {
            data: {
              list: [],
            },
            loading:false,
            test: '',
        },
    },

    effects: {
        *getcashierlist({payload}, {call, put}) {

            const { status, result } = payload;
            const { data } = result;
            const datapresalce = [];
            const datachase = [];
            if (status === 200) {

                let payparams = `terms[0].termType=in&terms[0].column=presaleid&terms[1].termType=in&terms[1].value=0&terms[1].value=1&terms[1].value=2&terms[1].value=3&terms[1].column=paytype`

                data.forEach(element => {
                    if(element.id && element.id !== '') {
                        payparams += `&terms[0].value=${element.id}`;
                    }
                });
                const paydetailresp = yield call(queryallpaydetail, payparams);

                payload.result.data.forEach(item => {
                    let totalamount = 0;
                    paydetailresp.result.data.forEach(paydetailitem => {
                        if(paydetailitem.presaleid === item.id) {
                            if(paydetailitem.paytype !== 0) {
                                if(paydetailitem.validstatus === 1) {
                                    totalamount += paydetailitem.amount;
                                }
                            } else if(paydetailitem.paytype === 0) {

                                if(paydetailitem.cancelstatus !== 1) {
                                    totalamount += paydetailitem.amount;
                                }
                            }
                        }
                    })
                    const val = totalamount;
                    const tmp = {amount: val};
                    Object.assign(item, tmp)
                })

                const erpparams = [];

                data.forEach(element => {
                    erpparams.push(element.clientid);
                })

                const { erpclientresp } = yield all({
                    erpclientresp: call(queryListClients, erpparams),
                })

                payload.result.data.forEach((paydetailitem) => {
                    if(paydetailitem.type === 0) {
                        datapresalce.push(paydetailitem)
                    } else if(paydetailitem.type === 1) {
                        datachase.push(paydetailitem)
                    }
                })
 
                //  获取用户名
                if(erpclientresp && erpclientresp.status === 200) {
                    const clientData = erpclientresp.result
                    payload.result.data.forEach(paydetailitem => {
                        if(clientData[paydetailitem.clientid]) {
                            const val = clientData[paydetailitem.clientid];
                            const tmp = {clientname: val};
                            Object.assign(paydetailitem, tmp);
                        }
                    })
                };
                yield put({
                    type: 'saveList',
                    payload,
                });
            }
        },

        *submit({ payload }, { call,put}) {
            const response = yield call(queryAllPresale, payload);// 原始数据入口
            if (response && response.status === 200) {
                yield put({
                    type: 'getcashierlist',
                    payload: response,
                });
            }
        },
    },
    reducers: {
        saveList(state, action) {
            return {
                ...state,
                data: action.payload,
            };
        },
    },
      

}
