import {
  querysupplydictionry,
  queryclientDispatchDetail,
  queryproductSalesList,
  queryallsaleids,
  querybusinessList,
} from '../services/api';

export default {
  namespace: 'statements',

  state: {
    cangkus: [],
    clientList: [],
    saleids: [],
    businessList: [],
    productList: {
      saleidslist: [],
      arealist: [],
      classify: [],
    },
  },

  effects: {
    // 获取搜索部分的仓库数据
    *querywarehouse({ payload }, { call, put }) {
      const params = `terms[0].value=3&terms[0].column=type`;
      const response = yield call(querysupplydictionry, params);
      if (response && response.status === 200) {
        const dataList = [payload, ...response.result.data]
        yield put({
          type: 'warehouselist',
          payload: dataList,
        });
      }
    },
    // 获取业务员 
    *querysaleidslist(_, { call, put }) {
      const response = yield call(queryallsaleids);
      if (response && response.status === 200) {
        const data = response.result;
        const saleidslist = ['全部', ...data.split(',')];
        yield put({
          type: 'saleids',
          payload: saleidslist,
        });
      }
    },
    // 产品销售搜索
    *queryproductSales({ payload }, { call, put }) {
      const response = yield call(queryproductSalesList, payload);
      if (response && response.status === 200) {
        const data = response.result;
        const saleidslist = ['全部'];
        const brandnamelist = [];
        const arealist = [];
        const classify = [];
        for (let i = 0, len = data.length; i < len; i++) {
          // 业务员
          if (saleidslist.indexOf(data[i].saleids) < 0) {
            saleidslist.push(data[i].saleids);
          }

          if (brandnamelist.indexOf(data[i].brandname) < 0) {
            brandnamelist.push(data[i].brandname);
            classify.push({
              title: `${data[i].brandname}`,
              children: [data[i]]
            })
          } else {
            let idx = brandnamelist.indexOf(data[i].brandname);
            classify[idx].children.push(data[i]);
          }
          // 表格显示的仓库
          if (arealist.indexOf(data[i].area) < 0) {
            arealist.push(data[i].area);
          }
        }
        const obj = {
          saleidslist,
          arealist,
          classify,
        }
        yield put({
          type: 'product',
          payload: obj,
        });
      }
    },
    // 客户出货销售明细搜索
    *queryclientDispatch({ payload }, { call, put }) {
      const response = yield call(queryclientDispatchDetail, payload);
      if (response && response.status === 200) {
        const data = response.result;
        const dataSource = [];
        for (let i = 0, len = data.length; i < len; i++) {
          let status = '';
          if (data[i].outnum >= data[i].totalweight) {
            status = '0';
          } else if (data[i].outnum < data[i].totalweight && data[i].outnum > 0) {
            status = '1';
          } else if (data[i].outnum === 0) {
            status = '2';
          } else {
            status = '2';
          }
          dataSource.push({
            key: `${i}`,
            makedate: new Date(data[i].makedate).toLocaleString().split(' ')[0],
            saleid: data[i].saleid,
            clientname: data[i].clientname,
            brandname: data[i].brandname,
            color: `${data[i].colorname}#${data[i].productname}`,
            location: data[i].location,
            batchno: data[i].batchno,
            unit: 'Kg',
            outnum: data[i].outnum,
            price: data[i].price,
            money: `￥${Math.round((data[i].outnum ? data[i].outnum : 0) * data[i].price)}`,
            totalpiecenum: data[i].totalpiecenum,
            totalnum: data[i].totalnum,
            area: data[i].area,
            usrid: (data[i].usrid).split(':')[1],
            pickuser: (data[i].pickuser).split(':')[1],
            comment: data[i].comment,
            departStatus: status,
          })
        }
        yield put({
          type: 'client',
          payload: dataSource,
        })
      }
    },
    // 业务统计
    *querybusinessList({payload}, {call, put}) {
      const response = yield call(querybusinessList, payload);
      if (response.status === 200 && response) {
        const data = response.result;
        const dataSource = [];
        for (let i=0, len=data.length; i<len; i++) {
          dataSource.push({
            key: `${i}`,
            makedate: new Date(data[i].makedate).toLocaleString().split(' ')[0], //销售日期
            saleid: data[i].saleid, //销售单号
            clearingForm: data[i].payment, //结算方式
            clientname: data[i].clientname, //客户名称、
            payway: data[i].payway, //收款方式
            receivable: `￥${Math.round((data[i].goodpay + data[i].shippay + data[i].securepay) + (data[i].taxmoney ? data[i].taxmoney : 0))}`, //应收金额
            received: `￥${Math.round(data[i].haspay ? data[i].haspay : 0)}`, //已收金额 
            area: data[i].area, //仓库
            remark: data[i].comment, //备注
            cargoStatus: data[i].outstatus,  //出库状态
            usrid: (data[i].usrid).split(':')[1], //业务员
            pickuser: (data[i].pickuser).split(':')[1], //拣货员
            claimGoods: data[i].takeway,  //取货方式
            invoice: data[i].taxmoney ? '1' : '0',  //开票
          });
        }

        yield put({
          type: 'business',
          payload: dataSource,
        })
      }
    }
  },

  reducers: {
    warehouselist(state, action) {
      return {
        ...state,
        cangkus: action.payload
      }
    },
    client(state, action) {
      return {
        ...state,
        clientList: action.payload
      }
    },
    product(state, action) {
      return {
        ...state,
        productList: action.payload
      }
    },
    saleids(state, action) {
      return {
        ...state,
        saleids: action.payload
      }
    },
    business(state, action) {
      return {
        ...state,
        businessList: action.payload
      }
    }
  }
}
