import React, { PureComponent, Fragment } from 'react';
import { Table, InputNumber,message } from 'antd';

import styles from './ChaseProfile.less';
import { queryGoodsBasic, queryDescBatchno, queryGoods, queryGoodslocation } from '../../services/api';
import TableRight from '../Inquiry/TableRight';
import { getMyDate, trackiList, everlastpaywayList } from '../../utils/utils';


let arrData = [];
let defaultProductid = '';

const butes = ['色纱', '代销色纱', '胚纱', '代销胚纱'];
const operateProducts = new Map();
const paymentArr = ['全年', '月结', '日结'];

// const productData = new Map();

export default class TableLeft extends PureComponent {
  constructor(props) {
    super(props);
    const trackDatas = props.value.trackData;
    let div = ``;
    trackDatas.forEach(item => {
      div += `${getMyDate(item.buildtime)} ${trackiList[item.type]}`;
    });

    const ui = div;
    this.state = {
      data: props.value,
      dataRight: [],

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

          picknum: props.value.pickwaste,
        },
        {
          key: 'concat3',
          id: '',
          product01Entity: '结款方式',

          picknum: props.value.payment,
        },
        {
          key: 'concat4',
          id: '',
          product01Entity: '货款',

          picknum: props.value.goodpay,
        },
        {
          key: 'concat5',
          id: '',
          product01Entity: '运费',

          picknum: props.value.shippay,
        },
        {
          key: 'concat6',
          id: '',
          product01Entity: '保险',

          picknum: props.value.securepay,
        },
        {
          key: 'concat10',
          id: '',
          product01Entity: '发票',

          picknum: props.value.taxratenum,
        },
        {
          key: 'concat7',
          id: '',
          product01Entity: '应付合计',

          picknum: props.value.sumneedpay,
        },
        {
          key: 'concat8',
          id: '',
          product01Entity: '欠余付款',

          picknum: props.value.needpay,
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
    goodsData.colorname = newState.colorname;
    goodsData.productname = newState.productname;
    const fieldName = 'picknum';
    let keys = '';
    for (let i = 0; i < goodsData.length; i++) {
      // set后会重新给tableRight渲染，值还是读取接口的值，重新赋值完成input的onchage的效果
      const productDatas = operateProducts.get(goodsData[i].productid);
      if (productDatas !== undefined) {
        for (let j = 0; j < productDatas.length; j++) {
          
          if(goodsData[i].id === productDatas[j].id){
            goodsData[i].output =productDatas[j].output;
            goodsData[i].piece =productDatas[j].piece;
            goodsData[i].completestatus = productDatas[j].completestatus;
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

  openBatch=(id,colorname,productname,num,usrids)=>{
    message.config({
      top: 100,
    });
    const hide = message.loading(`正在查询...`, 0);
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
                  const locationTerms = `terms[0].value=${id}&terms[0].column=productid&paging=false&terms[1].column=recordstatus&terms[1].value=0`;
                  queryGoodslocation(locationTerms).then(lores=>{
                    if(lores && lores.status===200){
                     
                      const piecemap = new Map();// 计算整件数
                      const scatpiecemap = new Map();// 计算包数
                      const cartnoData = lores.result.data;
                     
                      if(operateProducts.get(id)){
                        const data = arr;
                  
                        const selectdata = operateProducts.get(id);
                        for(let z=0;z<data.length;z+=1){
                          const cartnoChildren =[];// 子包
                          const cartnoList = [];// 父包
                          for(let s=0;s<cartnoData.length;s+=1){
                            if(data[z].id === cartnoData[s].detailid){
                              if(cartnoData[s].newnw === cartnoData[s].weight){
                                cartnoList.push(cartnoData[s].id);
                              }else{
                                cartnoChildren.push(cartnoData[s].id);
                              }
                              
                             }
                          }
                          piecemap.set(data[z].id,cartnoList.length);
                          scatpiecemap.set(data[z].id,cartnoChildren.length);
                          
                          
                        }
                        for(let i = 0;i<data.length;i+=1){
        
                          for(let j=0;j<selectdata.length;j+=1){
                              if(data[i].batchno === selectdata[j].batchno && data[i].id === selectdata[j].id){
                                data[i].output = selectdata[j].output;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
                                data[i].piece = selectdata[j].piece;
                                data[i].completestatus = selectdata[j].completestatus;
                                data[i].piecenums =piecemap.get(data[i].id);
                                data[i].splitnums = scatpiecemap.get(data[i].id);
                                data[i].maxpiece = Math.ceil(selectdata[j].remainnum/(selectdata[j].totalnw /selectdata[j].allpiecenum));
                              }
                          }
                          data[i].area = goodArea.get (data[i].goodid);
                          data[i].deliverydate =goodDate.get(data[i].goodid);
                        }
                        
                        
                        
                        this.setState({
                          dataRight:data,
                          flag:true,
                          total:response.result.total,
                          productid:id,
                          defaultProductids:id,
                        })
                      }else{
                        for(let z=0;z<arr.length;z+=1){
                          const cartnoChildren =[];// 子包
                          const cartnoList = [];// 父包
                          for(let s=0;s<cartnoData.length;s+=1){
                            if(arr[z].id === cartnoData[s].detailid){
                              if(cartnoData[s].parentcartno ===undefined && cartnoData[s].newnw === cartnoData[s].weight){// 没有拆过算整件
                                cartnoList.push(cartnoData[s].id);
                              }else{
                                cartnoChildren.push(cartnoData[s].id);
                              }
                              
                             }
                          }
                          piecemap.set(arr[z].id,cartnoList.length);
                          scatpiecemap.set(arr[z].id,cartnoChildren.length);
                          
                          
                        }
                     
                        for(let i = 0;i<arr.length;i+=1){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                            arr[i].area = goodArea.get (arr[i].goodid);
                            arr[i].piecenums =piecemap.get(arr[i].id);
                            arr[i].splitnums = scatpiecemap.get(arr[i].id);
                            arr[i].deliverydate =goodDate.get(arr[i].goodid);
                            arr[i].maxpiece = Math.ceil(arr[i].remainnum/( arr[i].totalnw / arr[i].allpiecenum));
                         }
                          
                        
                      }
                      setTimeout(hide,100);
                      this.setState({
                        dataRight:arr,
                        flag:true,
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
          });
          
               
        }
      }
    )

  }
  saveBatch = e => {
    if (defaultProductid === '' || defaultProductid !== e.productid) {
      defaultProductid = e.productid;
      if (e.productid !== undefined) {
        console.log("e",e);
        this.openBatch(e.productid,e.product01Entity.colorname,e.product01Entity.productname,e.num,e.usrid);
      }
    } else {
      defaultProductid = '';
    }
  };

  generalSum() {
    const newConcat = this.state.concatSoure.map(item => ({ ...item }));

    let num = 0;
    let goodsmoney = 0;

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
      Number(newConcat[6].picknum === undefined ? 0 : newConcat[6].picknum) +
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
  handleFieldChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      this.setState({ data: newData }, () => {
        this.generalSum();
      });
    }
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
  InputNumberBlur() {
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
        index - 8 === dataSource.length ||
        index - 9=== dataSource.length
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
            width:'20%',
            render: (val, record, index) => {
              if (arrData[index].id !== '') {
                return (
                  <div>
                    <li>{`${record.product01Entity.kindname}${record.product01Entity.seriesname}`}</li>
                    <li>
                      <img src={val} alt={val} width={100} height={35} />
                      {/* <a onClick={e=>this.openBatch(e,`${val.productid}`)}>{val.colorname}</a> */}
                    </li>
                  </div>
                );
              } else {
                return renderContent(val, record, index) ;
              }
            },
          },
          {
            dataIndex: 'product01Entity',
            key: 'product01Entity',
            width:'10%',
            render: val => {
              if (typeof val !== 'string') {
                return (
                  <div>
                    <li>
                      {val.colorname}
                      {/* <a onClick={e=>this.openBatch(e,`${val.productid}`)}>{val.colorname}</a> */}
                    </li>
                    <li>{val.productname}</li>
                    <li>{butes[val.productattribute]}</li>
                  </div>
                );
              } else {
                return {
                  children: <span style={{ fontWeight: 600, float: 'right' }}>{val}</span>,
                  props: {
                    colSpan: 6,
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
        render: (text, record, index) => {
          if (record.changeTag === true) {
            return (
              <InputNumber
                defaultValue={text}
                onChange={e => this.handleFieldChange(e, 'price', record.key)}
                styel={{ width: 100 }}
              />
            );
          } else if (text !== '' && record.changeTag === false) {
            return <span>{text}</span>;
          } else {
            return renderContent(text, record, index) ;
          }
        },
      },
      {
        title: '数量(KG)',
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
        title: '追染缸号 ',
        dataIndex: 'batchno',
        key: 'batchno',
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
            return <span>{everlastpaywayList[val]}</span>;
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
          const deliverydate = `${recode.deliverydate}`.substring(0,10);
          if (typeof recode.product01Entity !== 'string') {
            return (
              <div>
                <li>{deliverydate}</li>
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
        <div style={{ width: 1600 }}>
          <div style={{ width: 875, float: 'left' }}>
            <Table
              loading={this.state.loading}
              columns={columns}
              dataSource={arrData}
              pagination={false}
              onRow={e => ({
                onClick: () => {
                  this.saveBatch(e);
                },
              })}
              id="rowkey"
              rowKey={record => record.key}
            />
          </div>
          <div
            className={this.state.flag ? styles.tableBatchShow : styles.tableBatchNone}
            style={{overflowY: "auto",width:480,height:500}}
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
