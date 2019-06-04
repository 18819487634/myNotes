import { all, select } from 'redux-saga/effects'
import {queryAllPresale, queryListClients, querypaydetail, querySale, queryPickuptmpdetail, queryGoods, queryGoodsBasic, queryProductids, querysupplydictionry, queryPresaleById, queryErpClient, queryPresale, getTrackStatusForId, queryDeliveryWay} from '../services/api'

export default {
    namespace: 'waitpaymentprofile',

    state: {
        state: {
            data: {
              list: [],
            },
            loading:false,
            splitstatus: 0,
            presaleid: '',
            pickupTmp: {},
        },
    },

    effects: {
        *getwaitpaylist({payload}, {call, put}) {
            const { status, result } = payload;
            const { data } = result;
            const datapresalce = [];
            const datachase = [];

            if (status === 200) {
                const erpparams = [];
                let payparams = `terms[0].termType=in&terms[0].column=presaleid&terms[1].termType=in&terms[1].value=0&terms[1].value=1&terms[1].value=2&terms[1].value=3&terms[1].column=paytype`
                let saleparams = `paging=false&terms[0].termType=in&terms[0].column=presale`

                data.forEach(element => {
                    payparams += `&terms[0].value=${element.id}`;
                    saleparams += `&terms[0].value=${element.id}`;
                    erpparams.push(element.clientid);
                });

                const { erpclientresp, paydetailresp, saledetailresp } = yield all({
                    erpclientresp: call(queryListClients, erpparams),
                    paydetailresp: call(querypaydetail, payparams),
                    saledetailresp: call(querySale, saleparams),
                })

                if(saledetailresp && saledetailresp.status === 200) {
                    const saledetail = saledetailresp.result.data;
                    const payloaddetail = payload.result.data

                    for(let i = 0; i < payload.result.data.length; i++) {
                        let needmoney = 0;
                        for (let u = 0; u < saledetail.length; u++) {
                            if (payload.result.data[i].id === saledetail[u].presale) {
                                needmoney = saledetail[u].needpay
                                const val = needmoney;
                                const tmp = {needpay: val}
                                Object.assign(payload.result.data[i], tmp);
                            }
                        }
                        if(needmoney === 0) {
                            needmoney = payloaddetail[i].goodpay + payloaddetail[i].securepay + payloaddetail[i].shippay + (payloaddetail[i].goodpay*payloaddetail[i].taxrate);
                            const val = needmoney;
                            const tmp = {needpay: val}
                            Object.assign(payload.result.data[i], tmp);
                        }
                    }

                }

                payload.result.data.forEach(item => {
                    let totalamount = 0;
                    paydetailresp.result.data.forEach(paydetailitem => {
                        if(paydetailitem.presaleid === item.id) {
                            if(item.paytype !== 0) {
                                if(paydetailitem.validstatus === 1 || paydetailitem.paytype === 0) {
                                    totalamount += paydetailitem.amount;
                                }
                            } else if(item.paytype === 0) {
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

                payload.result.data.forEach((paydetailitem) => {
                    if(paydetailitem.type === 0) {
                        datapresalce.push(paydetailitem)
                    } else if(paydetailitem.type === 1) {
                        datachase.push(paydetailitem)
                    }
                })
                const deliverywayterms = `sorts[0].value=no&sorts[0].order=asc`;
                const deliveryresp = yield call(queryDeliveryWay,deliverywayterms);
                if(deliveryresp &&deliveryresp.status ===200){
                    const delivery = deliveryresp.result.data;
                    payload.result.data.forEach((paydetailitem) => {
                        delivery.forEach(delivItem=>{
                            if(`${paydetailitem.takeway}` === delivItem.value){
                                const tmp = {takewayname : delivItem.name};
                                Object.assign(paydetailitem,tmp);
                            }
                        })
                    })
                   
                    
                }
 
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

        *splitorder({payload}, {call, put}) {
            const areaMap = new Map();
            const params = "terms[0].value=3&terms[0].column=type";
            // const terms =`terms[0].termType=lt&terms[0].value=5&terms[0].column=paytype&pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
            // const presaleresp = yield call(queryPresale, terms);
            const supplyresp = yield call(querysupplydictionry, params);
            if(supplyresp && supplyresp.result.status === 200) {
                supplyresp.result.data.forEach(item => {
                    areaMap.set(item.value,item.key);
                })
            }

            // if(presaleresp && presaleresp.result.status === 200) {
            //     const arr = presaleresp.result.data;
            //     const trackids = [];
            //     const userList =[];

            //     for(let i =0;i< arr.length;i+=1){
            //         trackids.push(arr[i].trackid);
            //         if(`${arr[i].clientid}`.indexOf(":")===-1 &&userList.indexOf(arr[i].clientid)===-1){
            //             userList.push(arr[i].clientid);
            //         }
            //     }
            //     if(trackids.length===0){
            //         trackids.push(null);
            //     }

            //     const trackstatusresp = yield call(getTrackStatusForId, trackids);
            //     if(trackstatusresp && trackstatusresp.result.status === 200) {
            //         let trackData  =[];
            //         const results = trackstatusresp.result;
            //         const resultmap = new Map();
            //         const trackmap = new Map();
            //         for(const key in results){
            //             if(key in results){
            //               trackData = results[`${key}`];
            //               trackData.reverse((a,b)=>a.buildtime < b.buildtime);
            //               resultmap.set(key,trackData[0].type);
            //               trackmap.set(key,trackData);
            //             }
            //         }

            //         for(let z =0;z< arr.length;z+=1){
            //             arr[z].key= `presaleAll${z}`;
            //             arr[z].status = resultmap.get(arr[z].trackid);
            //         }

            //         if(userList.length===0){
            //             userList.push(null);
            //         }
            //     }
            // }

            //  0 需要拆单，1 不需要拆单，2 此单已完成拆单
            let splitstatus = 0;
            const tmpDatas = payload.result.data;

            const productidList =[];
            const batchnoNo = [];
            const tmpData =[];

            if(tmpDatas.length === 0) {
                splitstatus = 1;
                sessionStorage.setItem('splitstatus', 1);
                yield put({
                    type: 'saveList',
                    payload,
                });
            } else {
                tmpDatas.forEach(item => {
                    if(item.completestatus ===1 && item.piece !==0) {
                        // 有整件数的
                        productidList.push(item.productid);
                        batchnoNo.push(item.batchno);
                        tmpData.push(item);
                    }
                    if( item.completestatus ===0 &&item.picknum !==0){
                        // 没有整件数的
                        productidList.push(item.productid);
                        batchnoNo.push(item.batchno);
                        tmpData.push(item);
                    }
                })
                if(tmpData.length===0){
                    //  已经拆好了
                    splitstatus = 2;
                    sessionStorage.setItem('splitstatus', 2);
                    yield put({
                        type: 'saveList',
                        payload,
                    });
                }
                let terms = "";
                batchnoNo.forEach(item=>{
                    terms += `terms[0].value=${item}&`;
                })
                terms += `terms[0].termType=in&terms[0].column=batchno&paging=false`;

                const goodsbasicresp = yield call(queryGoodsBasic, terms);
                if(goodsbasicresp && goodsbasicresp.status === 200) {
                    const goodsData = goodsbasicresp.result.data;
                    const goodsMap = new Map();
                    let goodterms = "terms[0].column=id&";
                    for(let g = 0; g < goodsData.length; g += 1){
                        if(productidList.indexOf(goodsData[g].productid) > -1){
                            goodsMap.set(goodsData[g].id, goodsData[g]); 
                            goodterms += `terms[0].value=${goodsData[g].goodid}&`;  
                        }
                    }

                    goodterms += "terms[0].termType=in";
                    const goodsresp = yield call(queryGoods, goodterms)
                    if(goodsresp && goodsresp.result.status === 200) {
                        const gData = goodsresp.result.data;
                        const goodArea  = new Map()

                        gData.forEach(item=>{
                            goodArea.set(item.id,item.area);
                        });
                        if(productidList.length === 0){
                            productidList.push(null);
                        }

                        const productidresp = yield call(queryProductids, productidList);
                        if(productidresp && productidresp.result.status === 200) {
                            const productData = productidresp.result;
                            for(let i=0; i < tmpData.length; i+=1){
                                for(let z=0; z < productData.length; z+=1){
                                  if(tmpData[i].productid === productData[z].id){
                                    const product01Entity ={
                                        picture :productData[z].picture,
                                        seriesname :productData[z].productseries.seriesname,
                                        kindname :productData[z].productkind.kindname,
                                        productname:productData[z].productname,
                                        colorname : productData[z].colorname,
                                    
                                    }
                                    tmpData[i].key=`tmp${i}`;
                                    tmpData[i].status=0;
                                    tmpData[i].output=tmpData[i].picknum;
                                    
                                    tmpData[i].outpiece = tmpData[i].piece;
                                    tmpData[i].product01Entity =product01Entity;
                                    tmpData[i].remainnum=tmpData[i].picknum;
                                    // tmpData[i].goodentryids = goodsMap.get(tmpData[i].batchno).id;// 批次id
                                    tmpData[i].pieceweight = goodsMap.get(tmpData[i].goodentryid).pieceweight;// 每包净重
                                    tmpData[i].locations = goodsMap.get(tmpData[i].goodentryid).locations;// 位置信息
                                    tmpData[i].area = goodArea.get(goodsMap.get(tmpData[i].goodentryid).goodid);// 区域位置
                                    tmpData[i].areas = areaMap.get(`${tmpData[i].area}`);
                                  }
                                }
                            }

                            const presaleid = yield select(state => state.waitpaymentprofile.presaleid);
                            const querypresaleidresp = yield call(queryPresaleById, presaleid);
                            if(querypresaleidresp && querypresaleidresp.result.status === 200) {
                                const presaleData = querypresaleidresp.result;
                                const paramss = `terms[0].value=${presaleData.clientid}&terms[0].column=id&pageIndex=0&pageSize=10`;
                            
                                const userlist = yield call(queryErpClient, paramss);
                                if(userlist && userlist.result.status === 200) {
                                    const userList = userlist.result.data;
                                    presaleData.clientids = userList[0].name;
                                    presaleData.credit = userList[0].credit;
                                    const deliverywayterms = `sorts[0].value=no&sorts[0].order=asc`;
                                    const deliveryresp = yield call(queryDeliveryWay,deliverywayterms);
                                    if(deliveryresp &&deliveryresp.status ===200){
                                        const delivery = deliveryresp.result.data;
                                        delivery.forEach(delivItem=>{
                                            if(`${presaleData.takeway}` === delivItem.value){
                                              presaleData.takewayname=delivItem.name
                                            }
                                        })
                                        
                                    }
                                    const pickupTmp = {
                                        pickupData:tmpData,
                                        dataTop:[presaleData],
                                    }
                                    sessionStorage.setItem('pickupTmp', pickupTmp)

                                    yield put({
                                        type: 'savePickUpTmp',
                                        pickupTmp,
                                    })
                                    yield put({
                                        type: 'saveSplit',
                                        splitstatus,
                                    })
                                }
                            }
                        }

                    }
                }
            }
        },


        *submit({ payload }, { call,put}) {
            const response = yield call(queryAllPresale, payload);// 原始数据入口
            if (response && response.status === 200) {
                yield put({
                    type: 'getwaitpaylist',
                    payload: response,
                });
            }
        },
        
        //  查询是否需要拆单
        *suimitsplitor({payload}, {call, put}) {
            const params = payload[0]
            const id = payload[1]
            yield put({
                type: 'savepresaleid',
                id,
            })
            const response = yield call(queryPickuptmpdetail, params);
            if(response && response.status === 200) {
                yield put({
                    type: 'splitorder',
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
        saveSplit(state, action) {
            return {
                ...state,
                splitstatus: action.payload,
            }
        },
        savepresaleid(state, action) {
            return {
                ...state,
                presaleid: action.payload,
            }
        },
        savePickUpTmp(state, action) {
            return {
                ...state,
                pickupTmp: action.payload,
            }
        },
    },
}
