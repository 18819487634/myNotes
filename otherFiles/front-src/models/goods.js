import { all } from 'redux-saga/effects';
import { queryGoodsStock, queryErpClient, queryColorProduct, queryGoodslocation, querysupplydictionry, queryGoodsBasic, addGoods, addGoodsDetails, addGoodsLocations, querynocodeGoodslocation } from '../services/api';

export default {
  namespace: 'goods',

  state: {
    data: [],
    SupplierArea: {
      supplierList: [],
      areaList: [],
    },
    goods: {
      goodsList: 0,
      id: '',
      batchno: 0,
    },
    goodsNum: [],
    locationList: [],

  },

  effects: {

    *addnocode({ payload,callback }, { call, put }){
        const goodsres = yield call(addGoods,payload.goodsParams);
        if(goodsres && goodsres.status === 200 ){
          const detailparams = payload.details;
          detailparams.goodid = goodsres.result;
          const goodsdetailres = yield call(addGoodsDetails,detailparams);
          if(goodsdetailres && goodsdetailres.status === 200){
            const goodslocation = payload.item;
            goodslocation.detailid =  goodsdetailres.result;
            goodslocation.goodid =  goodsres.result;
            const goodslocationres = yield call(addGoodsLocations,goodslocation);
            if(goodslocationres && goodslocationres.status ===200){
              callback(goodslocationres);
            }
          }

        }
    },
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryGoodsStock, payload);

      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchSupplierArea({ payload }, { call, put }) {
      const params = `terms[0].value=3&terms[0].column=type`;
      const res = yield call(queryErpClient, payload);
      const response = yield call(querysupplydictionry, params);
      const obj = {
        supplierList: res.result.data,
        areaList: response.result.data
      }
      yield put({
        type: 'supplierArea',
        payload: obj
      })
    },
    *uploadFile({ payload, callback }, { call, put }){
      const  response = yield call(querynocodeGoodslocation,payload);
      callback(response);
    },
    *nocodequeryGoods({ payload, callback }, { call }) {
      const { colorTerms,data } = payload;
      const response = yield call(queryColorProduct,colorTerms);
      if(response && response.status=== 200){
        const responseData = response.result.data;
        let batchnoTems = `terms[0].column=batchno&terms[0].termType=in&terms[1].column=productid&terms[1].termType=in`;
        let batchnoTagno = `terms[0].column=batchno&terms[1].column=productid&terms[2].column=tagno&terms[0].termType=in&terms[1].termType=in&terms[2].termType=in`;
        let locationTerms = `terms[0].column=value&terms[1].column=type&terms[1].value=2&terms[0].termType=in`;
          data.forEach(dataitem=>{
            responseData.forEach(item=>{
              if(dataitem.colorname === item.colorname && dataitem.productname === item.productname){
               
                batchnoTems+=`&terms[0].value=${dataitem.batchno}&terms[1].value=${item.id}`;
                const tagno = `${dataitem.tagno}`.length ===1?`00${dataitem.tagno}`:(`${dataitem.tagno}`.length ===2?`00${dataitem.tagno}`:`${dataitem.tagno}`);
                batchnoTagno+=`&terms[0].value=${dataitem.batchno}&terms[1].value=${item.id}&terms[2].value=${tagno}`;
                const tmp = {productid : item.id,tagno};
                Object.assign(dataitem,tmp);
              }
            })
            locationTerms += `&terms[0].value=${dataitem.area}`; 
          })
          const {goodDetailresp,locationtagnoresp,locationreap}  = yield all({
            goodDetailresp : call(queryGoodsBasic,batchnoTems),
            locationtagnoresp : call(queryGoodslocation,batchnoTagno),
            locationreap :call(querysupplydictionry,locationTerms),
          });
          if(goodDetailresp && goodDetailresp.status ===200){
            data.forEach(dataitem=>{
              goodDetailresp.result.data.forEach(goodetailitem=>{
                if( dataitem.productid ===goodetailitem.productid && dataitem.batchno === goodetailitem.batchno){
                  const tmp= {nobatchnostatus:false};
                  Object.assign(dataitem,tmp);
                }
              })
          })

          
          }
          if(locationtagnoresp && locationtagnoresp.status ===200){
            data.forEach(dataitem=>{
              locationtagnoresp.result.data.forEach(goodetailitem=>{
                if( dataitem.productid ===goodetailitem.productid && dataitem.batchno === goodetailitem.batchno && dataitem.tagno === goodetailitem.tagno){
                  const tmp= {notagnostatus:false};
                  Object.assign(dataitem,tmp);
                }
              })
          })
          }
          if(locationreap && locationreap.status ===200){
            data.forEach(dataitem=>{
              locationreap.result.data.forEach(locationitem=>{
                if( `${dataitem.area}` ===locationitem.value && dataitem.location === locationitem.key ){
                  const tmp= {locationstatus:true};
                  Object.assign(dataitem,tmp);
                }
              })
          })
          }


        
          callback(data);
      }
    },
    *queryGoods({ payload, callback }, { call, put }) {
      const { colorname, productname, batchno } = payload;
      const response = yield call(queryColorProduct, `terms[0].column=colorname&terms[0].value=${colorname}&terms[1].column=productname&terms[1].value=${productname}`);
      let obj = {};
      let batchos = 0;
      let ressList = [];
      obj.goodsList = response.result.total;
      if (obj.goodsList > 0) {
        obj.id = response.result.data[0].id;
        const res = yield call(queryGoodsBasic, `terms[0].value=${obj.id}&terms[0].column=productid`);
        res.result.data.map(item => {
          if (item.batchno === batchno + '') {
            batchos = 1;
          }
        });
        obj.batchno = batchos;
        const ress = yield call(queryGoodslocation, `terms[0].value=${obj.id}&terms[0].column=productid&terms[1].column=batchno&terms[1].value=${batchno + ''}`)
        ressList = ress.result.data.map(item => item.tagno);
      } else {
        obj.id = '';
        obj.batchno = 0;
      }
      yield put({
        type: 'goods',
        payload: obj,
      });
      yield put({
        type: 'goodsNum',
        payload: ressList
      })
      const res = (typeof response.result.data[0] === 'undefined') ? {} : typeof response.result.data[0]
      if (callback && typeof callback === 'function') {
        callback(obj, ressList, res); // 返回结果
      }
    },
    *queryAreaLocation({ payload, callback }, { call, put }) {
      const { locationList, area } = payload;
      let params = `terms[1].column=isact&terms[1].value=1&terms[2].column=type&terms[2].value=2&terms[3].column=value&terms[3].value=${area}&terms[0].column=key&terms[0].termType=in`;
      const data = [];
      locationList.map(item => {
        params += `&terms[0].value=${item}`;
      })
      const res = yield call(querysupplydictionry, params);
      res.result.data.map(item => {
        data.push(item.key)
      });
      if (callback && typeof callback === 'function') {
        callback(data)
      }
      yield put({
        type: 'location',
        payload: data,
      })
    },
  },

  reducers: {
    save(state, action) {

      return {
        state,
        data: action.payload,
      };
    },
    supplierArea(state, action) {
      return {
        ...state,
        SupplierArea: action.payload,
      };
    },
    goods(state, action) {
      return {
        ...state,
        goods: action.payload,
      }
    },
    goodsNum(state, action) {
      return {
        ...state,
        goodsNum: action.payload,
      }
    },
    location(state, action) {
      return {
        ...state,
        locationList: action.payload,
      }
    },
  },
};
