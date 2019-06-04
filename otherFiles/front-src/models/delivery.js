import { all } from 'redux-saga/effects';
import { routerRedux } from 'dva/router';
import {message} from 'antd';
import { queryDelivery, queryDeliveryForId, queryListClients, queryProductids, queryDeliveryCartno, querycartnodetail, querySaleDetail, queryPresaleById, addDelivery, queryDeliveryWay } from '../services/api';

export default {
  namespace: 'delivery',

  state: {
    data: {
        list: [],
      },
      loading:false,
  },

  effects: {
    *getDeliveryList({payload}, {call, put}) {
        const { status, result } = payload;
        const { data } = result;
        if (status === 200) {
            const erpparams = [];

            data.forEach(element => {
                erpparams.push(element.clientid)
            })
            const wayTerm = `sorts[0].value=no&sors[0].order=asc`;

            const {erpclientresp,takewayresp} = yield all({
                erpclientresp: call(queryListClients, erpparams),
                takewayresp:call(queryDeliveryWay,wayTerm),
            });

            if(takewayresp && takewayresp.status ===200){
                payload.result.data.forEach(pyItem=>{
                    takewayresp.result.data.forEach(wayitem=>{
                        if(`${pyItem.takekway}`=== wayitem.value){
                            let takwaystatus =0;// 自提
                            if(wayitem.logisstatus===1 && wayitem.distristatus===0){
                                // 物流/快递方式
                                takwaystatus =1;

                            }else if(wayitem.logisstatus===0 && wayitem.distristatus===1){
                                // 配送员方式
                                takwaystatus =2;
                            }
                        
                            const tmp ={ takekwayname:wayitem.name,takekstatus:takwaystatus};
                            Object.assign(pyItem,tmp);
                        }
                    })
                })
                
            }


            //  获取用户名
            if(erpclientresp && erpclientresp.status === 200) {
                const  clientData = erpclientresp.result
                payload.result.data.forEach(deliveryitem => {
                    if(clientData[deliveryitem.clientid]) {
                        const val = clientData[deliveryitem.clientid];
                        const tmp = {clientname: val};
                        Object.assign(deliveryitem, tmp);
                    }
                })
            };
          
            yield put({
                type: 'save',
                payload,
            });
        }
    },

    *fetch({ payload }, { call, put }) {
      const response = yield call(queryDelivery, payload);
      yield put({
        type: 'getDeliveryList',
        payload: response,
      });
    },
    *add({payload},{call,put}){
        const response = yield call(addDelivery,payload);
        if(response && response.status === 200){
            message.success("提交成功!");
            yield put(routerRedux.push(`/order/deliver`));
        }
    },

    *fetchDetail({ payload }, { call, put }) {
      const response = yield call(queryDeliveryForId, payload);
      yield put({
        type: 'getDetialList',
        payload: response,
      });
    },
    *getDetialList({payload},{call, put}){
        message.config({
            top: 100,
          });
          const hide = message.loading('正在读取，请稍候...', 0);
        const { status, result } = payload;
        if(status === 200){
            const detailsList = result.details;
            const saleids = result.saleid;// 销售单id
            const productids = [];
            const detailids = [];
            detailsList.forEach(item=>{
                productids.push(item.productid);
            });
            const wayTerm = `sorts[0].value=no&sors[0].order=asc`;
            const {productresp,saleresp,takewayresp} = yield all({
                productresp: call(queryProductids, productids),
                saleresp:  call(querySaleDetail,saleids),
                takewayresp:call(queryDeliveryWay,wayTerm),
            });

            if(saleresp && saleresp.status === 200){
                const saleData = saleresp.result;
                payload.result.shipphone = saleData.shipphone;
                payload.result.shipreceiver = saleData.shipreceiver;
                payload.result.makedate = saleData.makedate;
                const presaleid = saleData.presale;
                const preres = yield call(queryPresaleById,presaleid);
                if(preres && preres.status === 200){
                    payload.result.usrid = preres.result.usrid;
                }
            }

            if(takewayresp && takewayresp.status ===200){
                    takewayresp.result.data.forEach(wayitem=>{
                        if(`${payload.result.takeway}`=== wayitem.value){
                            let takwaystatus =0;// 自提
                            if(wayitem.logisstatus===1 && wayitem.distristatus===0){
                                // 物流/快递方式
                                takwaystatus =1;

                            }else if(wayitem.logisstatus===0 && wayitem.distristatus===1){
                                // 配送员方式
                                takwaystatus =2;
                            }
                        
                         
                            payload.result.takewayname=wayitem.name;
                            payload.result.takestatus=takwaystatus;
                        }
                    })
                
                
            }
            if(productresp && productresp.status === 200){
                const productData = productresp.result;
                const productMap = new Map();
                productData.forEach(productItem=>{// 产品信息
                    productMap.set(productItem.id,productItem);
                })
                payload.result.details.forEach(item=>{
                    if(productMap.get(item.productid)){// 赋值产品信息
                        detailids.push(item.id);
                        const val = productMap.get(item.productid);
                        const tmp = {
                            colorname: val.colorname,
                            productname: val.productname,
                            brandname : val.brandname};
                        Object.assign(item, tmp);
                    }
                   
                });
                let cartnoParams = `paging=false&terms[0].column=detailid&terms[0].termType=in`;
                detailids.forEach(iditem=>{
                    cartnoParams += `&terms[0].value=${iditem}`;

                })
                const deliveryCartnoresp = yield call(queryDeliveryCartno,cartnoParams);
                
                if(deliveryCartnoresp && deliveryCartnoresp.status === 200){
                    const  cartnos = [];
                    const deliveryCartnoData = deliveryCartnoresp.result.data;
                    deliveryCartnoData.forEach(deliveryitem=>{// 出库明细箱号
                        cartnos.push(deliveryitem.cartno);
                    });
                    if(cartnos.length ===0){
                        cartnos.push(null);
                    }
                    const cartnoresp = yield call(querycartnodetail,cartnos);
                    if(cartnoresp && cartnoresp.status === 200){
                        const cartnoData = cartnoresp.result;
                        deliveryCartnoData.forEach(deliveryitem=>{
                            
                            cartnoData.forEach(cartnoItem=>{// 箱号明细,parentcartno为undefined则为整件
                                if(deliveryitem.cartno === cartnoItem.cartno){
                                    const tmp = {piece:0,scattered:0};
                                    if(cartnoItem.parentcartno === undefined){
                                        tmp.piece +=1;
                                    }else{
                                        tmp.scattered += cartnoItem.num;
                                    }
                                  
                                    Object.assign(deliveryitem,tmp);
                                }
                            });
                            
                        });
                        
                        let nums = 0;
                        let pieces = 0;
                        let scattereds = 0;
                        payload.result.details.forEach(detailsitem=>{

                            let detailpieces = 0;
                            let detailscattereds = 0;
                            deliveryCartnoData.forEach(deliveryitem=>{// 整理出散只，整件数
                                if(detailsitem.id === deliveryitem.detailid){
                                   
                                    pieces += deliveryitem.piece;
                                    scattereds += deliveryitem.scattered;
                                    detailpieces += deliveryitem.piece;
                                    detailscattereds += deliveryitem.scattered;
                                    
                                }
                              
                            });
                            nums += detailsitem.num===undefined?0:detailsitem.num;
                            const tmp = {piece:detailpieces,scattered:detailscattereds,key:detailsitem.id};
                            Object.assign(detailsitem,tmp);
                            
                        });
                        payload.result.details.push({brandname:'合计',num:nums.toFixed(1),piece:pieces,scattered:scattereds,key:"heji"});
                        
                    }
                }

            }
            setTimeout(hide, 100);
            yield put({
                type: 'save',
                payload,
            });
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
