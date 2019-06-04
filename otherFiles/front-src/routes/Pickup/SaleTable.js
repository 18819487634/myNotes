import React, { PureComponent, Fragment } from 'react';
import { Table, InputNumber } from 'antd';

import styles from './PickUpProfile.less';
import { queryGoodsBasic } from '../../services/api';
import { getMyDate, trackiList } from '../../utils/utils';

let arrData = [];
const operateProducts = new Map();
const paymentArr = ['全款', '月结'];

export default class SaleTable extends PureComponent {
  constructor(props) {
    super(props);
  
    const trackDatas = props.dataSource.trackData;
    let div = ``;
    if (trackDatas !== undefined) {
      trackDatas.forEach(item => {
        div += `${getMyDate(item.buildtime)} ${trackiList[item.type]}    
`;
      });
    }
 

    const ui = div;
    this.state = {
      data: props.dataSource,

      dataRight: [],

      loading: false,

      concatSoure: [
        {
          key: 'concat1',
          id: '',
          product01Entity: '总件数',

          picknum: props.dataSource.piece,
        },
        {
          key: 'concat2',
          id: '',
          product01Entity: '总零散个数',

          picknum: props.dataSource.num,
        },
        {
          key: 'concat3',
          id: '',
          product01Entity: '实际净重',

          picknum: props.dataSource.weight,
        },
        {
          key: 'concat4',
          id: '',
          product01Entity: '实际毛重',

          picknum: props.dataSource.glossweight,
        },
        {
          key: 'concat5',
          id: '',
          product01Entity: '已支付额',

          picknum: props.dataSource.pickwaste,
        },
        {
          key: 'concat6',
          id: '',
          product01Entity: '结款方式',
          picknum: props.dataSource.payment,
          // picknum:props.value[0].payment,
        },
        {
          key: 'concat7',
          id: '',
          product01Entity: '货款',
          picknum: props.dataSource.goodpay,
          // picknum:props.value[0].goodpay,
        },
        {
          key: 'concat8',
          id: '',
          product01Entity: '运费',
          picknum: props.dataSource.shippay,
          // picknum:props.value[0].shippay,
        },
        {
          key: 'concat9',
          id: '',
          product01Entity: '保险',
          picknum: props.dataSource.securepay,
          // picknum:props.value[0].securepay,
        },
        {
          key: 'concat13',
          id: '',
          product01Entity: '发票(税收)',
          picknum: props.dataSource.taxratenum,
          // picknum:props.value[0].needpay,taxratenum
        },
        {
          key: 'concat10',
          id: '',
          product01Entity: '应付合计',
          picknum: props.dataSource.needpay,
          // picknum:props.value[0].needpay,
        },
        {
          key: 'concat11',
          id: '',
          product01Entity: '未付余额',
          picknum: props.dataSource.oweneedpay,
          // picknum:props.value[0].needpay,
        },
        {
          key: 'concat12',
          id: '',
          product01Entity: '跟踪状态',

          // takeway:props.value[0].trackstatus,
          picknum: ui,
        },
      ],
    };
  }
  componentDidMount() {
    const result = this.state.data.concat(this.state.concatSoure);

    this.props.onChange(result);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value === undefined) {
      this.setState({
        data: nextProps.dataSource,
      });
    }
  }

  // onChildChanged= (newState)=> {
  //   if(typeof(newState) !== "string"){// 传值过来的是对象，set保存，是id字符串进行删除

  //     operateProducts.set(newState[0].productid,newState);

  //   }else{
  //     operateProducts.delete(newState);
  //   }
  //   const newData = this.state.data.map(item => ({ ...item }));

  //   const goodsData = this.state.dataRight.map(item => ({ ...item }));

  //   const fieldName = "picknum";
  //   let keys="";
  //   for(let i =0;i<goodsData.length;i++){ // set后会重新给tableRight渲染，值还是读取接口的值，重新赋值完成input的onchage的效果
  //     const productDatas = operateProducts.get(goodsData[i].productid);
  //     if(productDatas!==undefined){
  //       for(let j=0;j<productDatas.length;j++){

  //         if(goodsData[i].batchno === productDatas[j].batchno){
  //           goodsData[i].output =productDatas[j].output;
  //         }

  //       }
  //     }

  //   }
  //   newData.forEach(item=>{ // 给现货累加赋值，没有为0
  //     const productData =operateProducts.get(item.productid);

  //     if(productData !== undefined){
  //       let spotnum= 0;

  //       if(item.productid === productData[0].productid){
  //         keys = item.key;
  //         productData.forEach(items=>{
  //           spotnum += Number(items.output);
  //         })
  //       }
  //       const target = this.getRowByKey(keys, newData);
  //       if (target) {
  //         target[fieldName] = spotnum;

  //       }
  //     }else{
  //       keys = item.key;

  //       const target = this.getRowByKey(keys, newData);
  //       if (target) {
  //         target[fieldName] = 0;

  //       }
  //     }
  //   })

  //   this.setState({ data: newData,dataRight:goodsData },()=>{ // setState 是异步不能及时生效，回调保证获取到this.state.data 是最新的
  //     this.generalSum();
  //   });

  // }

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }

  handleInputNumberChange(e, fieldName, namekey) {
    

    const newData = this.state.concatSoure.map(item => ({ ...item }));

    const target = this.getRowByKey(namekey, newData);
    if (target) {
      target[fieldName] = e;

      this.setState({ concatSoure: newData }, () => {
        this.generalSum();
      });
    }

    // const result = this.state.data.concat(this.state.concatSoure);

    // this.props.onChange(result);
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
  openBatch = (e, id) => {
    let arr = [];

    if (e) {
      const param = `terms[0].value=${id}&terms[0].column=productid&terms[1].value=0&terms[1].column=status&terms[1].value=-1&terms[1].termType=in`;
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
  // saveBatch=(e,a,c)=>{
  //   this.openBatch(c,e.productid);

  // }

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

    //  // 获取到数量
    //  const targetNum = this.getRowByKey("concat1", newConcat);

    //  // 获取到货款
    //  const targetGoods = this.getRowByKey("concat4", newConcat);

    // 获取到应付
    const targetPayable = this.getRowByKey('concat10', newConcat);
    // 获取到未付
    const targetUnpaid = this.getRowByKey('concat11', newConcat);
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
      Number(newConcat[7].picknum === undefined ? 0 : newConcat[7].picknum) +
      Number(newConcat[8].picknum === undefined ? 0 : newConcat[8].picknum) +
      Number(newConcat[8].picknum === undefined ? 0 : newConcat[9].picknum) +
      goodsmoney;

    // 计算未付
    unpaid = payable - Number(newConcat[4].picknum === undefined ? 0 : newConcat[4].picknum);

    // targetNum[picknum] = this.changeTwoDecimalf(num);
    // targetGoods[picknum] = this.changeTwoDecimalf(goodsmoney);
    targetPayable[picknum] = this.changeTwoDecimalf(payable);
    targetUnpaid[picknum] = this.changeTwoDecimalf(unpaid);

    this.setState({ concatSoure: newConcat });

    const result = this.state.data.concat(this.state.concatSoure);

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
  InputNumberBlur() {
    const result = this.state.data.concat(this.state.concatSoure, operateProducts);

    this.props.onChange(result);
  }

  render() {
    const dataSource = this.state.data;
    const dataConcat = this.state.concatSoure;

   
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
        index - 9 === dataSource.length ||
        index - 10 === dataSource.length ||
        index - 11 === dataSource.length ||
        index - 12 === dataSource.length
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
              if (arrData[index].id !== '') {
                return <img src={val} alt={val} width={100} height={35} />;
              } else {
                  return renderContent(val, record, index);
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
                    <li>{`${val.kindname}${val.seriesname}`}</li>
                    <li>{val.colorname}</li>
                    <li>{val.productname}</li>
                  </div>
                );
              } else if (typeof val !== 'string' && arrData[index].spotnum === 0) {
                return (
                  <div>
                    <li>{`${val.kindname}${val.seriesname}`}</li>
                    <li>{val.colorname}</li>
                    <li>{val.productname}</li>
                  </div>
                );
              } else {
                return {
                  children: <span style={{ fontWeight: 600, float: 'right' }}>{val}</span>,
                  props: {
                    colSpan: 5,
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
        title: '用途 ',
        dataIndex: 'usefor',
        key: 'usefor',
        width: '5%',
        render: renderContent,
      },

      {
        title: '货期/备注',
        dataIndex: 'comment',
        key: 'comment',
        width: '10%',
        render: (val,recode,index)=>{
          if(typeof recode.product01Entity === 'string'){
          return  renderContent(val,recode,index);
          }else{
            const deliverydate = recode.deliverydate===undefined?"":recode.deliverydate.substring(0,recode.deliverydate.indexOf(" "));
            return (
              <div>
                <li>{deliverydate}</li>
                <li>{recode.comment}</li>
              </div>
            );
          }
          
          
        },
      },
      {
        title: '出库数量',
        dataIndex: 'picknum',
        key: 'picknum',
        width: '5%',
        render: (val, recode) => {
          if (recode.product01Entity === '结款方式') {
            return <span>{paymentArr[val]}</span>;
          } else if (recode.product01Entity === '跟踪状态') {
            return {
              children: <div style={{width:'90%'}}>{val}</div>,
              props: {
                colSpan: 2,
              },
            };
          } else if (recode.product01Entity === '运费' || recode.product01Entity === '保险' ||  recode.product01Entity ==='发票(税收)' ) {
            return (
              <InputNumber
                value={recode.picknum}
                min={0.0}
                defaultValue={val}
                formatter={value => `￥${value}`}
                parser={value => value.replace('￥', '')}
                onChange={e => this.handleInputNumberChange(e, 'picknum', recode.key)}
              />
            );
          }else if (recode.product01Entity === '未付余额'){
            if(parseFloat(val)<0){
              return <div style={{color:'#E83632',fontWeight:700}}>{val}</div>;
            }else{
              return <div>{val}</div>;
            }
          }
           else {
            return <div>{val}</div>;
          }
        },
      },
      {
        title: '出库明细',
        dataIndex: 'pickdetail',
        key: 'pickdetail',
        width: '5%',
        render: (val, recode) => {
          if (recode.product01Entity === '跟踪状态') {
            const obj = {
              children: val,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0

            obj.props.colSpan = 0;
            return obj;
          } else {
            return <span>{val}</span>;
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
              rowKey={record => record.key}
              id="tableLeft"
              width="50%"
            />
          </div>
          {/* <div className={this.state.flag?styles.tableBatchShow:styles.tableBatchNone}  style={{width:360,float:"right"}}> 
            <PickUpTable
              loading={this.state.loading}
              callbackParent={this.onChildChanged}
              
              dataSource={dataBatch}
              pagination={false}
              
            
            />
          </div> */}
        </div>
      </Fragment>
    );
  }
}
