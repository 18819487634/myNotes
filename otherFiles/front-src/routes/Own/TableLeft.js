import React, { PureComponent, Fragment } from 'react';
import { Table, InputNumber, Select, Input } from 'antd';

import styles from './OwnProfile.less';
import { queryGoodsBasic, queryGoods, queryDescBatchno } from '../../services/api';
import TableRight from '../Inquiry/TableRight';

const { Option } = Select;
let arrData = [];
const own = 'ownnum';
const chase = 'chasenum';
const spot = 'spotnum';
const operateProducts = new Map();
const paymentArr = ['全年', '月结', '日结'];
const Demodata = [
  {
    productid: '1533697589676000005',
    batchno: 'K12134',
    incommedate: '2018-06-04',
    total: 132,
  },
  {
    productid: '1533697589676000005',
    batchno: 'K2223',
    incommedate: '2018-06-04',
    total: 67,
  },
  {
    productid: '1533697589676000005',
    batchno: 'K1144',
    incommedate: '2018-06-04',
    total: 1345,
  },
  {
    productid: '1533697589676000005',
    batchno: 'K88999',
    incommedate: '2018-06-04',
    total: 98,
  },
];

const Demodata1 = [
  {
    productid: '1533697729089000000',
    batchno: 'D313',
    incommedate: '2018-05-13',
    total: 693,
  },
  {
    productid: '1533697729089000000',
    batchno: 'D3414',
    incommedate: '2018-11-04',
    total: 32,
  },
  {
    productid: '1533697729089000000',
    batchno: 'D367',
    incommedate: '2018-12-04',
    total: 1345,
  },
  {
    productid: '1533697729089000000',
    batchno: 'D879',
    incommedate: '2018-06-04',
    total: 20147,
  },
];

// const productData = new Map();

export default class TableLeft extends PureComponent {
  constructor(props) {
    super(props);

    const ui = (
      <div>
        <li>2018/07/26 09:32:08 提交询购单</li>
        <li>2018/07/26 10:35:20 生成欠货单</li>
        <li>2018/07/26 10:52:10 客户支付定金</li>
      </div>
    );
    this.state = {
      data: props.value,
      dataRight: [],
      selectedRows: [],
      loading: false,
      flag: false,
      concatSoure: [
        {
          key: 'concat1',
          id: '',
          product01Entity: '数量',

          picknum: props.value[0].num,
        },
        {
          key: 'concat2',
          id: '',
          product01Entity: '定金/拣货费',

          picknum: props.value[0].pickwaste,
        },
        {
          key: 'concat3',
          id: '',
          product01Entity: '结款方式',

          picknum: props.value[0].payment,
        },
        {
          key: 'concat4',
          id: '',
          product01Entity: '货款',

          picknum: props.value[0].goodpay,
        },
        {
          key: 'concat5',
          id: '',
          product01Entity: '运费',

          picknum: props.value[0].shippay,
        },
        {
          key: 'concat6',
          id: '',
          product01Entity: '保险',

          picknum: props.value[0].securepay,
        },
        {
          key: 'concat7',
          id: '',
          product01Entity: '应付合计',

          picknum: props.value[0].needpay,
        },
        {
          key: 'concat8',
          id: '',
          product01Entity: '欠余付款',

          picknum: props.value[0].needpay,
        },
        {
          key: 'concat9',
          id: '',
          product01Entity: '跟踪状态',

          // takeway:props.value[0].trackstatus,
          picknum: ui,
        },
      ],
    };
  }
  componentDidMount() {
    this.props.onChange({ data: arrData });
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        data: nextProps.value,
      });
    }
  }

  onChildChanged = newState => {
    if (typeof newState !== 'string') {
      // 传值过来的是对象，set保存，是id字符串进行删除

      operateProducts.set(newState[0].productid, newState);
    } else {
      operateProducts.delete(newState);
    }
    const newData = this.state.data.map(item => ({ ...item }));

    const goodsData = this.state.dataRight.map(item => ({ ...item }));

    const fieldName = 'picknum';
    let keys = '';
    for (let i = 0; i < goodsData.length; i++) {
      // set后会重新给tableRight渲染，值还是读取接口的值，重新赋值完成input的onchage的效果
      const productDatas = operateProducts.get(goodsData[i].productid);
      if (productDatas !== undefined) {
        for (let j = 0; j < productDatas.length; j++) {
          if (goodsData[i].batchno === productDatas[j].batchno) {
            goodsData[i].output = productDatas[j].output;
          }
        }
      }
    }
    newData.forEach(item => {
      // 给现货累加赋值，没有为0
      const productData = operateProducts.get(item.productid);

      if (productData !== undefined) {
        let spotnum = 0;

        if (item.productid === productData[0].productid) {
          keys = item.key;
          productData.forEach(items => {
            spotnum += Number(items.output);
          });
        }
        const target = this.getRowByKey(keys, newData);
        if (target) {
          target[fieldName] = spotnum;
        }
      } else {
        keys = item.key;

        const target = this.getRowByKey(keys, newData);
        if (target) {
          target[fieldName] = 0;
        }
      }
    });

    this.setState({ data: newData, dataRight: goodsData }, () => {
      // setState 是异步不能及时生效，回调保证获取到this.state.data 是最新的
      this.generalSum();
    });
  };

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }

  handlechange(e, fieldName, key) {
    const newData = this.state.concatSoure.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;

      this.setState({ concatSoure: newData });
    }

    const result = this.state.data.concat(this.state.concatSoure, operateProducts);

    this.props.onChange(result);
  }

  changeTwoDecimalf = x => {
    try {
      const fx1 = parseFloat(x);
      if (isNaN(fx1)) {
        return x;
      }
      const fx = Math.round(x * 100) / 100;
      let sx = fx.toString();
      let posdecimal = sx.indexOf('.');
      if (posdecimal < 0) {
        posdecimal = sx.length;
        sx += '.';
      }
      while (sx.length <= posdecimal + 2) {
        sx += '0';
      }
      return sx;
    } catch (e) {
      return '0.00';
    }
  };
  handleSelectRows = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
    });
  };
  openBatch=(id,colorname,productname,num,usrids)=>{
    let arr =[];
    
      const inuqiry ={
        usrid:usrids,
        inquiryDetail01Entities:{
          "productid":id,
        },
      }
      const param =`terms[0].value=${id}&terms[0].column=productid&terms[1].value=${0}&terms[1].value=${-1}&terms[1].column=status&terms[1].termType=in`;
      queryGoodsBasic(param).then((response)=>{
        if(response && response.status===200){
         arr =response.result.data
          // if(id==='1533697589676000005'){
            
          //   arr =Demodata;
          // }else{
          //   arr =Demodata1;
          // }
          const goodids = [];
          let goodterms = "terms[0].column=id&";
        
          for(let i =0;i< arr.length;i+=1){
            arr[i].key= `Goodsdetail${arr[i].id}${i}`;
            arr[i].output=0;
            arr[i].piece=0;
            arr[i].completestatus=0;
            if(goodids.indexOf(arr[i].goodid)===-1){
              goodids.push(arr[i].goodid);
              goodterms += `terms[0].value=${arr[i].goodid}&`;
              
              
            }
           
          }
          
        
          //  arr = arr.sort((a,b)=>{
          //   return a.localeCompare(b,'zh-CN');
          //   });
          goodterms += "terms[0].termType=in";
          queryDescBatchno(inuqiry).then(inres=>{
            if(inres && inres.status === 200){
              let batchno = "";
              if(inres.result !== undefined){
                batchno = inres.result;
              }
              queryGoods(goodterms).then(goodsres=>{
                if(goodsres && goodsres.status === 200){
                  const goodsData = goodsres.result.data;
                  const goodArea  = new Map();
                  const goodDate = new Map();
                  goodsData.forEach(item=>{
                    goodArea.set(item.id,item.area);
                    goodDate.set(item.id,item.deliverydate);
                  });
                  arr.colorname =colorname;
                  arr.productname =productname;
                  arr.inquirynum = num;
                  arr.recentBatchno = batchno;
                  if(operateProducts.get(id)){
                    const data = arr;
              
                    const selectdata = operateProducts.get(id);
                    
                    for(let i = 0;i<data.length;i++){
    
                      for(let j=0;j<selectdata.length;j++){
                          if(data[i].batchno === selectdata[j].batchno && data[i].id === selectdata[j].id){
                            data[i].output = selectdata[j].output;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
                            data[i].piece = selectdata[j].piece;
                            data[i].completestatus = selectdata[j].completestatus;
                            data[i].maxpiece = Math.ceil(selectdata[j].remainnum/(selectdata[j].totalnw /selectdata[j].allpiecenum));
                          }
                      }
                      data[i].area = goodArea.get (data[i].goodid);
                      data[i].deliverydate =goodDate.get(data[i].goodid);
                    }
                    
                    this.setState({
                      dataRight:data,
                      total:response.result.total,
                      productid:id,
                      defaultProductids:id,
                    })
                  }else{
                    for(let i = 0;i<arr.length;i++){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                        arr[i].area = goodArea.get (arr[i].goodid);
                        arr[i].deliverydate =goodDate.get(arr[i].goodid);
                        arr[i].maxpiece = Math.ceil(arr[i].remainnum/( arr[i].totalnw / arr[i].allpiecenum));
                     }
                     console.log("arr",arr);
                      
                    
                  }
                  
                  
                  this.setState({
                    dataRight:arr,
                    total:response.result.total,
                    productid:id,
                    defaultProductids:id,
                  }
                  ); 
                }
              });
            }
          });
          
               
        }
      }
    )

     
    
    

    
  }
  openBatch = (e, id) => {
    let arr = [];

    if (e) {
      const param = `terms[0].value=${id}&terms[0].column=productid&pageIndex=0&pageSize=3`;
      queryGoodsBasic(param).then(response => {
        if (response && response.status === 200) {
          arr = response.result.data;
          // if(id==='1533697589676000005'){

          //   arr =Demodata;
          // }else{
          //   arr =Demodata1;
          // }
          for (let i = 0; i < arr.length; i += 1) {
            arr[i].key = `Goodsdetail${i}`;
            arr[i].output = 0;
          }
          if (operateProducts.get(id)) {
            const data = arr;

            const selectdata = operateProducts.get(id);

            for (let i = 0; i < data.length; i++) {
              for (let j = 0; j < selectdata.length; j++) {
                if (data[i].batchno === selectdata[j].batchno) {
                  data[i].output = selectdata[j].output;
                }
              }
            }
            this.setState({
              dataRight: data,
            });
          }

          this.setState({
            dataRight: arr,

            flag: true,
          });
        }
      });
    }
  };
  saveBatch = (e, a, c) => {
    this.openBatch(e.productid,e.product01Entity.colorname,e.product01Entity.productname,e.num,e.usrid);
  };

  generalSum() {
    const newConcat = this.state.concatSoure.map(item => ({ ...item }));

    let num = 0;
    let goodsmoney = 0;
    let freight = 0;

    let deposit = 0;
    let insurance = 0;
    let payable = 0;

    let unpaid = 0;
    const picknum = 'picknum';

    // 获取到数量
    const targetNum = this.getRowByKey('concat1', newConcat);

    // 获取到货款
    const targetGoods = this.getRowByKey('concat4', newConcat);

    // 获取到应付
    const targetPayable = this.getRowByKey('concat7', newConcat);
    // 获取到未付
    const targetUnpaid = this.getRowByKey('concat8', newConcat);
    const newdata = this.state.data.map(item => ({ ...item }));
    newdata.forEach(item => {
      const pnum = item.picknum === undefined ? 0 : item.picknum;
      // 计算总数量
      num += Number(pnum);

      // 计算货款
      goodsmoney += Number(item.price * pnum);
    });
    // 计算应付
    payable =
      Number(newConcat[4].picknum === undefined ? 0 : newConcat[4].picknum) +
      Number(newConcat[5].picknum === undefined ? 0 : newConcat[5].picknum) +
      goodsmoney;

    // 计算未付
    unpaid = payable - Number(newConcat[1].picknum === undefined ? 0 : newConcat[1].picknum);

    targetNum[picknum] = this.changeTwoDecimalf(num);
    targetGoods[picknum] = this.changeTwoDecimalf(goodsmoney);
    targetPayable[picknum] = this.changeTwoDecimalf(payable);
    targetUnpaid[picknum] = this.changeTwoDecimalf(unpaid);

    this.setState({ concatSoure: newConcat });

    const result = this.state.data.concat(this.state.concatSoure, operateProducts);

    this.props.onChange(result);
  }
  handleRightChange(e, fieldName, key) {
    const newData = this.state.dataRight.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
    }
    this.setState({
      dataRight: newData,
    });
  }
  InputNumberBlur(e) {
    const result = this.state.data.concat(this.state.concatSoure, operateProducts);

    this.props.onChange(result);
  }

  render() {
    const dataSource = this.state.data;
    const dataConcat = this.state.concatSoure;
    const dataBatch = this.state.dataRight;

    const renderContent = (value, row, index) => {
      const obj = {
        children: value,
        props: {},
      };
      // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
      if (
        index === dataSource.length ||
        index - 1 === dataSource.length ||
        index - 2 === dataSource.length ||
        index - 3 === dataSource.length ||
        index - 4 === dataSource.length ||
        index - 5 === dataSource.length ||
        index - 6 === dataSource.length ||
        index - 7 === dataSource.length ||
        index - 8 === dataSource.length
      ) {
        obj.props.colSpan = 0;
      }
      return obj;
    };

    if (dataSource.length) {
      arrData = dataSource.concat(dataConcat);
    } else {
      arrData = dataSource;
    }

    const columns = [
      {
        title: '产品信息',
        children: [
          {
            dataIndex: 'product01Entity.picture',
            key: 'picture',
            render: (val, record, index) => {
              if (arrData[index].takeway !== '') {
                return <img src={val} alt={val} width={100} height={35} />;
              } else {
                const obj = {
                  children: val,
                  props: {},
                };
                // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
                if (
                  index === dataSource.length ||
                  index - 1 === dataSource.length ||
                  index - 2 === dataSource.length ||
                  index - 3 === dataSource.length ||
                  index - 4 === dataSource.length ||
                  index - 5 === dataSource.length ||
                  index - 6 === dataSource.length ||
                  index - 7 === dataSource.length ||
                  index - 8 === dataSource.length
                ) {
                  obj.props.colSpan = 0;
                }
                return obj;
              }
            },
          },
          {
            dataIndex: 'product01Entity',
            key: 'product01Entity',
            render: (val, record, index) => {
              if (typeof val !== 'string') {
                return (
                  <div>
                    <li>{val.kind}</li>
                    <li>
                      <a onClick={e => this.openBatch(e, `${val.productid}`)}>{val.colorname}</a>
                    </li>
                    <li>{val.productname}</li>
                  </div>
                );
              } else if (typeof val !== 'string' && arrData[index].spotnum === 0) {
                return (
                  <div>
                    <li>{val.kind}</li>
                    <li>{val.colorname}</li>
                    <li>{val.productname}</li>
                  </div>
                );
              } else {
                return {
                  children: <span style={{ fontWeight: 600, float: 'right' }}>{val}</span>,
                  props: {
                    colSpan: 4,
                  },
                };
              }
            },
          },
        ],
        key: 'product',
      },
      {
        title: '单价',
        dataIndex: 'price',
        key: 'price',
        width: '5%',
        render: renderContent,
      },
      {
        title: '欠货量(KG)',
        dataIndex: 'num',
        key: 'num',
        width: '5%',
        render: renderContent,
      },
      {
        title: '用途 ',
        dataIndex: 'usefor',
        key: 'usefor',
        width: '5%',
        render: renderContent,
      },

      {
        title: '拣货数量',
        dataIndex: 'picknum',
        key: 'picknum',
        width: '5%',
        render: (val, recode) => {
          if (recode.product01Entity === '结款方式') {
            return <span>{paymentArr[val]}</span>;
          } else if (recode.product01Entity === '跟踪状态') {
            return {
              children: <div>{val}</div>,
              props: {
                colSpan: 2,
              },
            };
          } else {
            return <div>{val}</div>;
          }
        },
      },
      {
        title: '货期/备注',
        dataIndex: 'comment',
        key: 'comment',
        width: '10%',
        render: (val, recode) => {
          if (typeof recode.product01Entity !== 'string') {
            return (
              <div>
                <li>{recode.deliverydate}</li>
                <li>{recode.comment}</li>
              </div>
            );
          } else if (recode.product01Entity === '跟踪状态') {
            const obj = {
              children: val,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0

            obj.props.colSpan = 0;
            return obj;
          }
        },
      },
    ];

    return (
      <Fragment>
        <div style={{ width: 1300 }}>
          <div style={{ width: 875, float: 'left' }}>
            <Table
              loading={this.state.loading}
              columns={columns}
              dataSource={arrData}
              pagination={false}
              onRowClick={this.saveBatch}
              id="tableLeft"
              width="50%"
            />
          </div>
          <div
            className={this.state.flag ? styles.tableBatchShow : styles.tableBatchNone}
            style={{ width: 360, float: 'right' }}
          >
            <TableRight
              loading={this.state.loading}
              callbackParent={this.onChildChanged}
              dataSource={dataBatch}
              pagination={false}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}
