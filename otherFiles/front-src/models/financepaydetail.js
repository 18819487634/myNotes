
import { all } from 'redux-saga/effects';
import { addpaydetail,querypaydetail,queryAccountnumber,queryPresale,
  queryPrereceive,queryErpClient,updatePaydetail, queryPresaleById, querysupplydictionry, canChangePrice, queryProductids, queryactualdetails, querycartnodetail, queryGoodsBasicNoPaging, getTrackStatusForId } from '../services/api';
import {banks,recordstatus} from '../utils/constants'



export default {
  namespace: 'financepaydetail',

  // subscriptions:{// 监听地址
  //   setup ({ dispatch, history }) {
  //     history.listen((location) => {
  //       console.log('location is: %o', location);
  //       console.log('重定向接收参数：%o', location.state)
  //       // 调用 effects 属性中的 query 方法，并将 location.state 作为参数传递 
  //       dispatch({
  //         type: 'saveStepFormData',
  //         payload: location.state,
  //       })
  //     });
  //   },

  // },
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
  },

  effects: {

    *changestatus({payload,callback},{call}){
      const response = yield call(updatePaydetail, payload);// 原始数据入口
      callback(response);

    },

    // 添加账户
    *changepaydetailList({ payload }, { call,put}){


         const {status ,result } = payload ;
         const { data } = result ;
         if(status===200){
            let params = `terms[0].termType=in&terms[0].column=id&` ;
            let  presaleparams = `terms[0].termType=in&terms[0].column=id&` ;
            let preceiveparams = `terms[0].termType=in&terms[0].column=id&` ;
            let clientparams = `terms[0].termType=in&terms[0].column=id&`; // 离线的
            data.forEach(element => {
              params += `terms[0].value=${element.accountid}&`;
              presaleparams += `terms[0].value=${element.presaleid}&`;
              if(element.preceiveid) {
                preceiveparams += `terms[0].value=${element.preceiveid}&`;
              } else {
                preceiveparams += `terms[0].value=${element.presaleid}&`;
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
                clientparams +=  `terms[0].value=${item.clientid}&` ; 
                payload.result.data.forEach(paydetailitem => {
                  if(paydetailitem.presaleid===item.id){
                    const val =recordstatus.find(it => {
                      return it.value === item.ismerge;
                    }).key; // 字段
                    const tmp = {idstatus:val}; // 覆盖字段 
                    Object.assign(paydetailitem, tmp);

                    const track = {trackid: item.trackid};
                    Object.assign(paydetailitem, track)


                    if(clientmap.get(item.clientid)===undefined){
                      clientmap.set(item.clientid,new Set());

                    }
                    clientmap.get(item.clientid).add(paydetailitem.id);
                    // clientmap.set(item.clientid,);// 每个item 都会
                  }
                }) 
              });
              
            }
            if ( preceiveresp &&  preceiveresp.status === 200) {
              preceiveresp.result.data.forEach(item => {
                clientparams +=  `terms[0].value=${item.clientid}&` ; 
                payload.result.data.forEach(paydetailitem => {
                  if(paydetailitem.preceiveid===item.id){
                    const val =recordstatus.find(it => {
                      return it.value === 0;
                    }).key; // 字段
                    const tmp = {idstatus:val}; // 覆盖字段 
                    Object.assign(paydetailitem, tmp);
                    if(clientmap.get(item.clientid)===undefined){
                      clientmap.set(item.clientid,new Set());

                    }
                    clientmap.get(item.clientid).add(paydetailitem.id);
                    // clientmap.set(item.clientid,paydetailitem.id);
                  }
                }) 
              });
              
            }
            const clientresponse =  yield call(queryErpClient, clientparams);
            if ( clientresponse &&  clientresponse.status === 200) {
              clientresponse.result.data.forEach(item => {
                payload.result.data.forEach(paydetailitem => {
                  if(clientmap.get(item.id).has(paydetailitem.id)){
                    const val = item.name; // 字段
                    const tmp = {clientname:val}; // 覆盖字段 
                    Object.assign(paydetailitem, tmp);
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
    *submitStepForm({ payload ,callback}, { call, put }) {
      const response =  yield call(addpaydetail, payload);
      yield put({
        type: 'saveStepFormData',
        payload,
      });
      
      if(response.status===200){
        callback(response);
      }
    },

    *getPresaleDetail({payload, callback}, {call}) {
      const productids = [];
      const params = payload.presaleid;
      let changeTag = false;
      const rightData =[];// 拣货明细
      let saleTag = false;// 已有拣货单生成销售单的标记
      const pickupDetailId = [];

      const callbackdata = {};  //  返回的数据

      const supplyparam = `terms[0].value=3&terms[0].column=type`;
      const suppliresp = yield call(querysupplydictionry, supplyparam);
      const areaMap = new Map();
      if(suppliresp && suppliresp.status === 200) {
        const datas = suppliresp.result.data;
        datas.forEach(item => {
          areaMap.set(item.value, item.key);
        });
      }
      const presaleparam = `terms[0].value=0&terms[0].column=type&pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
      const presaleres = yield call(queryPresale, presaleparam);
      if(presaleres && presaleres.status === 200) {
        const arr = presaleres.result.data;
        const trackids = [];
        for(let i =0;i< arr.length;i+=1){
          trackids.push(arr[i].trackid);
        }
        if(trackids.length===0){
          trackids.push(null);
        }
        const listclietnsresp = yield call(getTrackStatusForId, trackids);
        if(listclietnsresp && listclietnsresp.status === 200) {
          let trackData  =[];
          const results = listclietnsresp.result;
          const trackmap = new Map();
          for(const key in results){
            if(key in results){
              trackData = results[`${key}`];
              trackData.reverse((a,b)=>a.buildtime < b.buildtime);
              trackmap.set(key,trackData);
            }
          }
        
          const presalebyidres = yield call(queryPresaleById, params)
          if(presalebyidres && presalebyidres.status === 200) {
            const presalebyid = presalebyidres.result;
            const dataTop=[];
            dataTop.push(presalebyid);
            for(let i =0;i< dataTop.length;i+=1){
              dataTop[i].key= `presaleTop${i}`;
              dataTop[i].clientids = payload.clientid;
              dataTop[i].clientid = payload.clientname;
            }
            const dataLeft = presalebyid.details;
            const pickupList = presalebyid.pickups;// 下发的拣货单(可能存在多个)
            dataLeft.payment = presalebyid.payment;
            dataLeft.goodpay = presalebyid.goodpay;
            dataLeft.pickwaste = presalebyid.pickwaste;
            dataLeft.shippay = presalebyid.shippay;
            dataLeft.taxrate = presalebyid.taxrate;
            dataLeft.taxratenum = parseFloat((dataLeft.goodpay*dataLeft.taxrate).toFixed(2));
            dataLeft.securepay = presalebyid.securepay;
            dataLeft.needpay = (dataLeft.shippay+dataLeft.goodpay+ dataLeft.securepay+dataLeft.taxratenum).toFixed(2);
            dataLeft.needpays = dataLeft.needpay - dataLeft.pickwaste;
            const sysuuidArr=[];
            // if(dataLeft===undefined){
            //   message.error("没有数据");
            //   return;
            // }

            for(let p = 0; p < pickupList.length; p += 1){
              const detail = pickupList[p].details;
              for(let i =0;i< detail.length;i+=1){
                detail[i].uuid = detail[i].sysuuid;
                detail[i].recordstatus =pickupList[p].recordstatus;// 拣货单的状态（给修改数量的时候判断用）
                detail[i].presaleid = pickupList[p].presaleid;
                if(pickupList[p].saleid !== undefined){// 表示已经有拣货单生成销售单了
                  saleTag = true;
                }
                detail[i].saleid = pickupList[p].saleid;
                detail[i].areas = areaMap.get(`${detail[i].area}`);
                detail[i].piece = "";// 把整件数为空，这里的整件数是业务填写的整件数，rightData的piece是实际整件数
                rightData.push(detail[i]);
                pickupDetailId.push(detail[i].id);
                
              }
              dataTop[0].makeid = pickupList[p].makeid;
            }


            const canchangeparam = `clientid=${payload.clientid}`;
            const canchangeresp = yield call(canChangePrice, canchangeparam);
            if(canchangeresp && canchangeresp.status === 200) {
              if(canchangeresp.result === true && saleTag === false){
                changeTag = true;
              }
            }else if(canchangeresp && canchangeresp.status === 403){
              // const val = {message: canchangeresp.message}
              callbackdata.message = canchangeresp.message
            }
            for(let i = 0; i < dataLeft.length; i += 1){
              dataLeft[i].key= `presaleLeft${i}`;
              dataLeft[i].changeTag = changeTag;
              productids.push(dataLeft[i].productid);
            }
            for(let i = 0; i < rightData.length; i += 1){
              if(sysuuidArr.indexOf(rightData[i].uuid)===-1){
                sysuuidArr.push(rightData[i].uuid);
              }else{
                rightData[i].uuid = "";
              }
            }
            const projectidsresp = yield call(queryProductids, productids);
            if(projectidsresp && projectidsresp.status === 200) {
              const productData = projectidsresp.result;
              const map = trackmap;;
              const productmap = new Map();
              dataLeft.trackData =map.get(payload.trackid);
              for(let z = 0; z < dataLeft.length; z += 1){
                for(let j = 0; j<productData.length; j += 1){
                  if(productData[j].id === dataLeft[z].productid){
                    const product01Entity ={
                      picture :productData[j].picture,
                      seriesname :productData[j].productseries.seriesname,
                      kindname :productData[j].productkind.kindname,
                      productname:productData[j].productname,
                      colorname : productData[j].colorname,
                      productid:productData[j].id, 
                    }
                    productmap.set(productData[j].id,productData[j]);
                    dataLeft[z].product01Entity = product01Entity;
                  }
                }
              }

              const actualresp = yield call(queryactualdetails, pickupDetailId)
              if(actualresp && actualresp.status === 200) {
                const aresult = actualresp.result;
                const cartnos= [];
                const cartnoMap = new Map();
                if(aresult !== undefined){
                  aresult.forEach(item=>{
                    if(cartnos.indexOf(item.cartno)===-1){
                      cartnos.push(item.cartno);
                    }
                    cartnoMap.set(item.cartno,item.pickdetailid);
                  });
                }
                if(cartnos.length === 0){
                  cartnos.push(null);
                }
                const cartnoresp = yield call(querycartnodetail, cartnos)
                if(cartnoresp && cartnoresp.status === 200) {
                  const cresult = cartnoresp.result;
                  let preces =0;// 整件数
                  // let nums = 0;// 零散个数
                  let glossweights = 0;// 毛重
                  let weights =0;// 净重
                  const pickNumMap = new Map();
                  if(cresult.length === 0){
                    for(let a =0;a<rightData.length;a+=1){
                      rightData[a].key = `rightData_${a}`;
                      rightData[a].colorname = productmap.get(rightData[a].productid).colorname;
                      rightData[a].productname = productmap.get(rightData[a].productid).productname;
                      rightData[a].flag= false;
                    }
                  }
                  for(let c =0;c <cresult.length;c+=1){// 总体的净重，毛重
                    if(cresult[c].parentcartno !== undefined){
                      glossweights  += cresult[c].glossweight===undefined?0:cresult[c].glossweight;
                      weights  += cresult[c].weight;
                    }else{
                      preces += 1;
                      glossweights  += cresult[c].glossweight===undefined?0:cresult[c].glossweight;
                      weights  += cresult[c].weight;
                    }
                    for(let a =0;a<rightData.length;a+=1){
                      rightData[a].key = `rightData_${a}`;
                      rightData[a].colorname = productmap.get(rightData[a].productid).colorname;
                        rightData[a].productname = productmap.get(rightData[a].productid).productname;
                        
                      if(rightData[a].id === cartnoMap.get(cresult[c].cartno)){ 
                        rightData[a].flag= true;
                        
                        rightData[a].glossweight =Number(Number(rightData[a].glossweight===undefined?0:rightData[a].glossweight) + Number(cresult[c].glossweight)).toFixed(2);
                        rightData[a].weight =Number(Number(rightData[a].weight===undefined?0:rightData[a].weight) + Number(cresult[c].weight)).toFixed(2);
                        if(cresult[c].parentcartno === undefined){
                          rightData[a].piece =(rightData[a].piece===""?0:rightData[a].piece) + 1;
                          rightData[a].num = (rightData[a].num===undefined?0:rightData[a].num)+0;
                        }else{
                          rightData[a].piece = (rightData[a].piece===""?0:rightData[a].piece)+0;
                          rightData[a].num = (rightData[a].num===undefined?0:rightData[a].num) + Number(cresult[c].num);;
                        }
                          pickNumMap.set(rightData[a].productid,rightData[a].weight);
                      }else if(rightData[a].flag === undefined){
                        rightData[a].flag= false;
                      }
                    }
                  }
                  let sum =0;
                  const detailList = [];
                  for(let z = 0; z < dataLeft.length; z += 1){
                    // 多个拣货明细拼接
                    let pickdetail = '';
                    let actualWeight = 0;
                    for (let ld = 0; ld < rightData.length; ld += 1) {
                      if (dataLeft[z].productid === rightData[ld].productid ) {
                        rightData[ld].changetype = 0;
                        detailList.push(rightData[ld].goodentryids);
                        if(rightData[ld].status !== 3 &&rightData[ld].status !== 1){
                          pickdetail += `${rightData[ld].batchno}:${rightData[ld].weight===undefined?0:rightData[ld].weight}  `;
                          actualWeight += Number(
                            rightData[ld].weight 
                          );
                        }
                      }
                    }
                    dataLeft[z].pickdetail = pickdetail;
                    dataLeft[z].picknum = pickNumMap.get(dataLeft[z].productid);
                    sum += parseFloat(dataLeft[z].num);
                    dataLeft[z].againnum =0;
                    dataLeft[z].updatenum =0;
                  }
                  let goodentryidsTerms = `terms[0].value=-1&terms[0].column=status&terms[1].column=id&terms[1].termType=in`;
                  detailList.forEach(item=>{
                    goodentryidsTerms += `&terms[1].value=${item}`;
                  });
                  const goodsnopagingres = yield call(queryGoodsBasicNoPaging, goodentryidsTerms);
                  if(goodsnopagingres && goodsnopagingres.status === 200) {
                    const errList = goodsnopagingres.result
                    if(errList && errList.length >0){
                      errList.forEach(item=>{
                        rightData.forEach(dataitem=>{
                          if(item.id === dataitem.goodentryids){
                            const tmp ={status:2};
                            Object.assign(dataitem,tmp);
                          }
                        })
                      });
                    }
                    dataLeft.piece =preces;
                    dataLeft.num =Number(sum).toFixed(2);
                    dataLeft.glossweight =Number(glossweights).toFixed(2);
                    dataLeft.weight =Number(weights).toFixed(2);
                    //  赋值
                    callbackdata.dataTop = dataTop;
                    callbackdata.dataLeft = dataLeft;
                    callbackdata.dataRight = rightData;
                    callbackdata.changeTag = changeTag
                    callback(callbackdata)
                  } //  queryGoodsBasicNoPaging
                } //  querycartnodetail
              }  //  queryactualdetails
            }   //  queryProductids
          }    //  queryPresaleById
        }   //  getTrackStatusForId
      } //  queryPresale
    },
  },

  reducers: {
    saveStepFormData(state, { payload }) {
      return {
        ...state,
        step: {
          ...state.step,
          ...payload,
        },
      };
    },
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
  
};
