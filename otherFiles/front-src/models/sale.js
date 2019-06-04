import { all } from 'redux-saga/effects'
import {
  message,
} from 'antd';
import { querySale, querySaleDetail,querypaydetail, queryPresaleById,queryErpClient, queryactualdetails, queryProductids, getTrackStatusForId, queryListClients, querycartnodetail, querysupplydictionry, queryDelivery, queryDeliveryWay } from '../services/api';
import { getUserCompany, getSupplyId } from '../utils/sessionStorage';
import { getMyDateNoHMS, trackEnum } from '../utils/utils';

export default {
  namespace: 'sale',

  state: {
    data: {
      list: [],
    },
    printSale:{},
    saledata:{
      dataTop:[],
      dataLeft:[],
      dataRight:[],
    },
    loading:false,
  },

  effects: {
    *fetchSaleBaisc({payload}, {call, put}){
      
      const response = yield call(querySaleDetail, payload);
      yield put({
        type: 'getSaleDetails',
        payload: response,
      });
    },
    *getSaleDetails({payload}, {call, put}){
      message.config({
        top: 100,
      });
      const hide = message.loading('正在读取，请稍候...', 0);
      const { status, result } = payload;
      const pickupDetail = [];// 拣货明细
      const productDetail = [];// 销售产品明细
      const saleHead = [];// 销售单表头
      let trackData = [];
      if(status === 200){
        const presaleid = result.presale;
        const saleId = result.id;
        const detailMap = new Map();
        const areaMap = new Map();
        saleHead.push(result);
        result.details.forEach(item=>{
          const key = {key:item.id};
          Object.assign(item,key)
          productDetail.push(item);
          detailMap.set(item.productid,item);
        })
        productDetail.securepay = result.securepay;
        productDetail.needpay = result.needpay;
        productDetail.shippay = result.shippay;
        productDetail.taxmoney = result.taxmoney===undefined?0:result.taxmoney;
        productDetail.goodpay = result.goodpay;
        productDetail.payment = result.payment;
        productDetail.pickwaste = result.pickwaste;
        const presaleResp = yield call(queryPresaleById,presaleid);
        if(presaleResp && presaleResp.status === 200){
          const presaleData = presaleResp.result;
          const detailsids = [];// 实际拣货detailid
          const productids = [];// 产品id
         
          const pickupList = presaleData.pickups;
          const pickdetailids = [];
          const sysuuidArr = [];
          const tracks =[result.trackid];
          pickupList.forEach(pickupitems=>{
              const pickupDetails = pickupitems.details;
              pickupDetails.forEach(detailitem=>{
                detailsids.push(detailitem.id);
                if(productids.indexOf(detailitem.productid)===-1){// 可能存在相同的产品id
                  productids.push(detailitem.productid);
                };
                const details = detailitem;
                details.recordstatus = pickupitems.recordstatus;
                details.presaleid = pickupitems.presaleid;
                details.finishnum = pickupitems.finishnum;
                details.location = pickupitems.location;
                details.piece = "";
                pickupDetail.push(details);
              });
          });
          for (let i = 0; i < pickupDetail.length; i += 1) {
            pickupDetail[i].uuid = pickupDetail[i].sysuuid;
            pickdetailids.push(pickupDetail[i].id);
            if (sysuuidArr.indexOf(pickupDetail[i].uuid) === -1) {
              sysuuidArr.push(pickupDetail[i].uuid);
            } else {
              pickupDetail[i].uuid = '';
            }
          }
          pickupDetail.tag = 2;
          const payParmas = `terms[0].value=${presaleid}&terms[0].column=presaleid&terms[1].value=1&
          terms[1].column=validstatus&terms[2].value=0&terms[2].column=cancelstatus&terms[3].value=4&terms[3].column=contenttype&terms[3].termType=not`; 
          const clientParams = `terms[0].value=${result.clientid}&terms[0].column=id`; 
          const areaParams = `paging=false&terms[0].value=3&terms[0].column=type&terms[1].value=${getSupplyId()}&terms[1].column=supplyid`;     
          const takewayParams = `paging=false&sorts[0].value=no&sorts[0].order=asc`;
          const {actualdetailsresp,productresp,paydetailresp,erpclientresp,arearesp,trackreap,takewayresp} = yield all({
            actualdetailsresp: call(queryactualdetails,detailsids),
            productresp: call(queryProductids,productids),
            paydetailresp:call(querypaydetail,payParmas),
            erpclientresp:call(queryErpClient,clientParams),
            arearesp:call(querysupplydictionry,areaParams),
            trackreap:call(getTrackStatusForId,tracks),
            takewayresp:call(queryDeliveryWay,takewayParams),
          });
          const cartnoMap = new Map();
          let clientname ="";
          let paynum = 0;// 付款金额
          if (paydetailresp && paydetailresp.status === 200) {
            const payData = paydetailresp.result.data;
            
            if (payData.length > 0) {
              payData.forEach(item => {
                paynum += item.amount;
              });
            }

          }
          if(trackreap && trackreap.status === 200){
            const results = trackreap.result;
            for (const key in results) {
              if (key in results) {
                trackData = results[`${key}`];

                trackData.reverse((a, b) => a.buildtime < b.buildtime);
                
              }
            }
          }
          if(arearesp && arearesp.status === 200){
            const areaResult = arearesp.result.data;
            areaResult.forEach(areaItem=>{
              areaMap.set(areaItem.value,areaItem.key);
            });
          }
          let credits ="";
          if(erpclientresp && erpclientresp.status ===200){
            const erpclient = erpclientresp.result.data[0];
            clientname = erpclient.name;
            credits = erpclient.credit;
            saleHead[0].clientname = clientname;
            saleHead[0].credit = credits;
          }
          if(takewayresp && takewayresp.status ===200){
            takewayresp.result.data.forEach(item=>{
              if(item.value === `${result.takeway}`){
                saleHead[0].takewayname = item.name;
              }
            })
          }
          if(productresp && productresp.status===200){
            const productList = productresp.result;
            productList.forEach(productItem=>{
              pickupDetail.forEach(pItem=>{
                if(productItem.id === pItem.productid){
                  const productprice = detailMap.get(productItem.id).price;
                  const tmp = {
                    colorname: productItem.colorname,
                    productname: productItem.productname,
                    brandname : productItem.brandname,
                    unit:'KG',
                    saleid : saleId,
                    price:productprice,
                    sum:parseFloat((productprice*pItem.picknum).toFixed(2)),
                    };
                    Object.assign(pItem, tmp);
                }
                
              })
             
            })
            productDetail.forEach(detailItem=>{
              productList.forEach(pItem=>{
                if(pItem.id === detailItem.productid){
                  const product01Entity = {
                    picture: pItem.picture,
                    seriesname: pItem.productseries.seriesname,
                    kindname: pItem.productkind.kindname,
                    productname: pItem.productname,
                    colorname:pItem.colorname,
                  };

                  const tmp = {
                    product01Entity,
                    };
                    Object.assign(detailItem, tmp);
                }
                
              })
            })
           
             
          }
          if(actualdetailsresp && actualdetailsresp.status === 200){
            const cartnos = [];// 箱号
            const actualdetails = actualdetailsresp.result;
            actualdetails.forEach(actualdetailsItem=>{
              cartnos.push(actualdetailsItem.cartno);
              cartnoMap.set(actualdetailsItem.cartno,actualdetailsItem.pickdetailid);
            });
            const cartnoresp = yield call(querycartnodetail,cartnos);
            if(cartnoresp && cartnoresp.status === 200){
              const cartnoList = cartnoresp.result;
              
                let glossweights = 0;// 总毛重
                let weights = 0;// 总净重
                let pieces = 0;// 总件数
                let nums =0;// 总散只
              
                pickupDetail.forEach(detailItem=>{
                  const pickupVail = detailItem;
                  pickupVail.areas = areaMap.get(`${detailItem.area}`);
                  pickupVail.glossweight =0;
                  pickupVail.weight =0;
                  pickupVail.key = detailItem.id;
                  pickupVail.piece = 0;
                  pickupVail.num = 0; 
                  cartnoList.forEach(cartnoItem=>{
                  if(detailItem.id === cartnoMap.get(cartnoItem.cartno)){
                    pickupVail.glossweight += cartnoItem.glossweight;
                    pickupVail.glossweight =parseFloat(pickupVail.glossweight.toFixed(2));
                    pickupVail.weight += cartnoItem.weight;
                    pickupVail.weight =parseFloat(pickupVail.weight.toFixed(2));
                    if(cartnoItem.parentcartno === undefined){
                      pickupVail.piece += 1;
                    }else{
                      pickupVail.num += cartnoItem.num;
                    }
                  }
                })
               
                glossweights += pickupVail.glossweight;
                weights += pickupVail.weight;
                
                pieces += pickupVail.piece;
                nums += pickupVail.num;
              });
              productDetail.glossweight = parseFloat(glossweights).toFixed(2);;
              productDetail.weight = parseFloat(weights).toFixed(2);;
              productDetail.num = nums;
              productDetail.prece =pieces;

              const goodpays = parseFloat(result.goodpay.toFixed(0));
              productDetail.pickwaste = parseFloat(paynum.toFixed(2));
              productDetail.needpay = parseFloat((goodpays+ result.shippay+ result.securepay+result.taxmoney).toFixed(2));
              productDetail.sumgoodspay = parseFloat((productDetail.needpay-paynum).toFixed(2));
              productDetail.trackData =trackData;

              productDetail.forEach(pdItem=>{
                let pickdetail = '';
                let actualWeight = 0;
                let batchno = '';
                pickupDetail.forEach(ppItem=>{
                  if (pdItem.productid ===ppItem.productid) {
                    const tmp={
                      colorname:pdItem.product01Entity.colorname,
                      productname:pdItem.product01Entity.productname,
                      totalpiece:ppItem.piece+ppItem.num>0?1:0,
                      maxPiece:ppItem.piece + ppItem.num>0?1:0,
                      

                    }
                    Object.assign(ppItem,tmp);
                    pickdetail += `${ppItem.batchno}:${ppItem.weight.toFixed(2)}`;
                    actualWeight += parseFloat(ppItem.weight);
                    batchno += `${ppItem.batchno} `;
                    const tmp1 = {
                      piece:(pdItem.piece === undefined? 0: pdItem.piece)+ppItem.piece,
                      scattered:(pdItem.scattered === undefined? 0: pdItem.scattered) +ppItem.scattered,
                    }
                    Object.assign(pdItem,tmp1);

                  }
                });
                const tmp2 = {
                  pickdetail,
                  batchno,
                  picknum:parseFloat(actualWeight.toFixed(2)),
                }
                Object.assign(pdItem,tmp2);
              })
              
            }
          }
          
         
        }
      }
      setTimeout(hide,100);
      const saledata = {dataTop:saleHead,dataLeft:productDetail,dataRight:pickupDetail};// 销售单的明细
      yield put({
        type: 'saveDetail',
        payload:saledata,
    });
    },
    *printingSale({payload}, {call, put}){// 打印销售单
      
      const response = yield call(querySaleDetail, payload);
      yield put({
        type: 'getPrintSaleDetails',
        payload: response,
      });
    },
    *getPrintSaleDetails({ payload ,callback}, {call}){// 打印销售单明细
      
      const response = yield call(querySaleDetail, payload);
     
      const pickupDetail = [];// 拣货明细
      if(response && response.status === 200){
        const  {result } = response;
        const presaleid = result.presale;
        const saleId = result.id;
        const detailMap = new Map();
        
        result.details.forEach(item=>{
          detailMap.set(item.productid,item);
        })
        const presaleResp = yield call(queryPresaleById,presaleid);
        if(presaleResp && presaleResp.status === 200){
          const presaleData = presaleResp.result;
          const detailsids = [];// 实际拣货detailid
          const productids = [];// 产品id
         
          const pickupList = presaleData.pickups;

          pickupList.forEach(pickupitems=>{
              if(pickupitems.saleid === saleId){
                const pickupDetails = pickupitems.details;
              pickupDetails.forEach(detailitem=>{
                if(detailitem.status === 0){
                  detailsids.push(detailitem.id);
                if(productids.indexOf(detailitem.productid)===-1){// 可能存在相同的产品id
                  productids.push(detailitem.productid);
                };
                const details = detailitem;
                details.recordstatus = pickupitems.recordstatus;
                details.presaleid = pickupitems.presaleid;
                details.finishnum = pickupitems.finishnum;
                details.location = pickupitems.location;
                details.piece = "";
                pickupDetail.push(details);
                }
                
              }); 
              }
              
          });
          const {actualdetailsresp,productresp,clientresp} = yield all({
            actualdetailsresp: call(queryactualdetails,detailsids),
            productresp: call(queryProductids,productids),
            clientresp: call(queryListClients,[result.clientid]),
          });
          const cartnoMap = new Map();
          let clientname ="";
          if(clientresp && clientresp.status ===200){
            clientname = clientresp.result[result.clientid];
          }
          if(productresp && productresp.status===200){
            const productList = productresp.result;
            productList.forEach(productItem=>{
              pickupDetail.forEach(pItem=>{
                if(productItem.id === pItem.productid){
                  const productprice = detailMap.get(productItem.id).price;
                  const tmp = {
                    colorname: productItem.colorname,
                    productname: productItem.productname,
                    brandname : productItem.brandname,
                    unit:'KG',
                    saleid : saleId,
                    price:productprice,
                    sum:parseFloat((productprice*detailMap.get(productItem.id).num).toFixed(0)),
                    };
                    Object.assign(pItem, tmp);
                }
                
              })
             
            })
           
             
          }
          if(actualdetailsresp && actualdetailsresp.status === 200){
            const cartnos = [];// 箱号
            const actualdetails = actualdetailsresp.result;
            actualdetails.forEach(actualdetailsItem=>{
              cartnos.push(actualdetailsItem.cartno);
              cartnoMap.set(actualdetailsItem.cartno,actualdetailsItem.pickdetailid);
            });
            const cartnoresp = yield call(querycartnodetail,cartnos);
            if(cartnoresp && cartnoresp.status === 200){
              const cartnoList = cartnoresp.result;
              
                let glossweights = 0;// 总毛重
                let weights = 0;// 总净重
                let pieces = 0;// 总件数
                let nums =0;// 总散只
              
                pickupDetail.forEach(detailItem=>{
                  const pickupVail = detailItem;
                  pickupVail.glossweight =0;
                  pickupVail.weight =0;
                  pickupVail.key = detailItem.id;
                  pickupVail.piece = 0;
                  pickupVail.scattered = 0; 
                  cartnoList.forEach(cartnoItem=>{
                  if(detailItem.id === cartnoMap.get(cartnoItem.cartno)){
                    pickupVail.glossweight += cartnoItem.glossweight;
                    pickupVail.weight += cartnoItem.weight;
                    if(cartnoItem.parentcartno === undefined){
                      pickupVail.piece += 1;
                    }else{
                      pickupVail.scattered += cartnoItem.num;
                    }
                    pickupVail.weight = parseFloat(pickupVail.weight.toFixed(2));
                  }
                })
               
                glossweights += pickupVail.glossweight;
                weights += parseFloat( pickupVail.weight.toFixed(2));
                
                pieces += pickupVail.piece;
                nums += pickupVail.scattered;
              });
              const goodpays = parseFloat(result.goodpay.toFixed(0));
              const dataSum= {
                key:'xiaoji1',
                brandname:'小计',
                weight: parseFloat( weights.toFixed(2)),
                sum:goodpays,
                piece:pieces,
                scattered:nums,
              };
              pickupDetail.push(dataSum);
              pickupDetail.taxmoney = result.taxmoney===undefined?0:result.taxmoney;
              pickupDetail.needpay = parseFloat((goodpays+ result.shippay+ result.securepay+pickupDetail.taxmoney).toFixed(2));
              pickupDetail.shippay = (result.shippay +result.securepay).toFixed(2);
              const company = JSON.parse(getUserCompany());
              pickupDetail.company = {
                fullname : company.fullname,
                address : company.address,
                telphone : company.telphone,
                logo : company.logo,
                fax : company.fax,
              };
              pickupDetail.address = result.address;
              pickupDetail.shipreceiver = result.shipreceiver;
              pickupDetail.shipphone = result.shipphone;
              pickupDetail.makedate = getMyDateNoHMS(result.makedate);
              pickupDetail.clientname = clientname;
              pickupDetail.saleid = saleId;
            }
          }
         
          


        }
        callback(pickupDetail);
        // yield put({
        //   type:'saveprint',
        //   payload:pickupDetail,
        // })
      }
      
      
    },
    *fetch({payload},{call,put}){
      const response = yield call(querySale,payload);
      yield put({
        type:'getClient',
        payload:response,
      })
    },
    *getClient({payload},{call,put}){
      const { status, result } = payload;
      const { data } = result;

      if(status===200){
        const clientnList =[];
        const trackList =[];
        const presaleids = [];
        data.forEach(dataItem=>{
          if(clientnList.indexOf(dataItem.clientid)===-1){
            clientnList.push(dataItem.clientid);
          }
          if(trackList.indexOf(dataItem.trackid)===-1){
            trackList.push(dataItem.trackid);
          }
          if(presaleids.indexOf(dataItem.presale)===-1){
            presaleids.push(dataItem.presale);
          }
        })
        let preTerms = "paging=false&terms[0].column=presaleid&terms[0].termType=in";
        presaleids.forEach(item=>{
          preTerms+= `&terms[0].value=${item}`;
        })
        preTerms +=`&terms[1].value=1&terms[1].column=validstatus&terms[2].value=0&terms[2].column=cancelstatus&terms[3].value=4&terms[3].column=contenttype&terms[3].termType=not`;
        
        if(trackList.length === 0){
          trackList.push(null);
        }
        if(clientnList.length === 0){
          clientnList.push(null);
        }
        const takewayTerm = `paging=false&sorts[0].value=no&sorts[0].order=asc`;
        const {clientresp,trackresp,paydetailresp,takewayresp} = yield all({
          clientresp:call(queryListClients,clientnList),
          trackresp:call(getTrackStatusForId,trackList),
          paydetailresp:call(querypaydetail,preTerms),
          takewayresp:call(queryDeliveryWay,takewayTerm), 
        });
          if(takewayresp && takewayresp.status ===200){
             const takewayResult = takewayresp.result.data;
             payload.result.data.forEach(dataItem=>{
             takewayResult.forEach(wayitem=>{
              if(`${dataItem.takeway}` === wayitem.value){
                const tmp = {takewayname:wayitem.name};
                Object.assign(dataItem,tmp);
              }
             })
            });
          }
          if(paydetailresp && paydetailresp.status === 200){
            const payData = paydetailresp.result.data;
         
            if (payData.length > 0) {
              data.forEach(arritem=>{
                let paynum = 0;
                payData.forEach(item => {
                  if(arritem.presale === item.presaleid){
                    paynum += item.amount;
                  }

                });
                const tmp = {pickwaste:paynum.toFixed(2)};
                Object.assign(arritem,tmp);
              })
              
            }
          }

        if(clientresp && clientresp.status === 200){
          const clientData = clientresp.result;
          payload.result.data.forEach(dataItem=>{  
              if(clientData[dataItem.clientid]){
                const tmp = {clientname:clientData[dataItem.clientid]};
                Object.assign(dataItem,tmp);
              }
                
          })
        }
        if(trackresp && trackresp.status === 200){
          const trackDatas = trackresp.result;
          payload.result.data.forEach(dataItem=>{  
              if(trackDatas[dataItem.trackid]){
                const trackData = trackDatas[dataItem.trackid];
                trackData.reverse((a, b) => a.buildtime < b.buildtime);
                
                const val = trackEnum.find(it=>{
                  return it.value === trackData[0].type;
                }).key;
                const tmp = {trackstatus:val,trackData};
                Object.assign(dataItem,tmp);
              }
                
          })
        }
       
      }
      yield put({
        type:'save',
        payload,
      })
    },
    *createDelivery({payload,callback},{call}){
      const params =  `terms[0].value=${payload.id}&terms[0].column=saleid`; 
      const pickupDetail = payload.pickups;
      const delires = yield call(queryDelivery,params);
      if(delires && delires.status ===200){
        const deliResult = delires.result.data;
        if(deliResult.length===0){
          for(let a=0;a<pickupDetail.length;a+=1){
              pickupDetail[a].key = `delivery_${a}`;
          }
          callback(pickupDetail);
        }else{
          const pickupDeatils =[];
         
          for(let p = 0;p<pickupDetail.length;p+=1){
            const detail = {// 直接复制会把地址也复制过去，修改值的时候，会把相应地址的值给修改了
              maxPiece:pickupDetail[p].maxPiece,
              totalpiece:pickupDetail[p].totalpiece,
              finishnum:pickupDetail[p].finishnum,
              location:pickupDetail[p].location,
              area:pickupDetail[p].area,
              areas:pickupDetail[p].areas,
              batchno:pickupDetail[p].batchno,
              colorname:pickupDetail[p].colorname,
              productid:pickupDetail[p].productid,
              sysuuid:pickupDetail[p].sysuuid,
              productname:pickupDetail[p].productname,
              weight:pickupDetail[p].weight,
              weights:pickupDetail[p].weights,
              num:pickupDetail[p].num,
              piece:pickupDetail[p].piece,
            }
            pickupDeatils.push(detail);
          }

          const readyDeatils = [];
          const overDetails = [];
          for(let j=0;j<deliResult.length;j+=1){
            const deliveryDetails = deliResult[j].details;
            for(let i=0;i<deliveryDetails.length;i+=1){// 组成已经生成出货的数据
              overDetails.push(deliveryDetails[i]);
            }
          }

          for(let d=0;d<pickupDeatils.length;d+=1){// 组成已经未生成出货的数据
            for(let z=0;z<overDetails.length;z+=1){
           
              if(overDetails[z].batchno === pickupDeatils[d].batchno && 
                overDetails[z].pickid === pickupDeatils[d].sysuuid &&
                overDetails[z].productid === pickupDeatils[d].productid  ){
                  pickupDeatils[d].totalpiece-=overDetails[z].totalpiece;
                  pickupDeatils[d].weight-=overDetails[z].num===undefined?0:overDetails[z].num;
                
              }
            }
            if(pickupDeatils[d].totalpiece>0){
              pickupDeatils[d].maxPiece =pickupDeatils[d].totalpiece; 
              pickupDeatils[d].key = `delivery_${d}`;
              readyDeatils.push(pickupDeatils[d]);
            }
          }
          if(readyDeatils.length === 0){
            message.warn("该销售单已经生成送货单");
          }else{
            callback(readyDeatils);
            
          }
          
        }
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
    saveprint(state, action) {
      return {
        ...state,
        printSale: action.payload,
      };
    },
    saveDetail(state, action) {
      return {
        ...state,
        saledata: action.payload,
      };
    },
  },
};
