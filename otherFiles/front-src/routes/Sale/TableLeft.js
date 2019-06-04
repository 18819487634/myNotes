import React, { PureComponent, Fragment } from 'react';
import { Table } from 'antd';
import moment from 'moment';
import styles from './SaleProfile.less';
import { queryGoodsBasic } from '../../services/api';

import { getMyDate, trackiList } from '../../utils/utils';

let arrData = [];

const operateProducts = new Map();
const paymentArr = ['全款', '月结'];
const butes = ['', '色纱', '胚纱', '代销色纱', '代销胚纱'];

// const productData = new Map();

export default class TableLeft extends PureComponent {
  constructor(props) {
    super(props);
    console.log("oriosss11",props);
    const trackDatas = props.dataSource.trackData;

    let div = ``;
    if (trackDatas !== undefined) {
      trackDatas.forEach(item => {
        div += `${getMyDate(item.buildtime)} ${trackiList[item.type]}  `;
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

          picknum: props.dataSource.prece,
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
          picknum: props.dataSource.taxmoney,
          // picknum:props.value[0].securepay,
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
          product01Entity: '欠余付款',
          picknum: props.dataSource.sumgoodspay,
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
    this.props.onChange({ data: arrData });
  }

  componentWillReceiveProps(nextProps) {
    const trackDatas = nextProps.dataSource.trackData;

    let div = ``;
    if (trackDatas !== undefined) {
      trackDatas.forEach(item => {
        div += `${getMyDate(item.buildtime)} ${trackiList[item.type]}  `;
      });
    }
      this.setState({
        data: nextProps.dataSource,
        concatSoure: [
          {
            key: 'concat1',
            id: '',
            product01Entity: '总件数',
  
            picknum: nextProps.dataSource.prece,
          },
          {
            key: 'concat2',
            id: '',
            product01Entity: '总零散个数',
  
            picknum: nextProps.dataSource.num,
          },
          {
            key: 'concat3',
            id: '',
            product01Entity: '实际净重',
  
            picknum: nextProps.dataSource.weight,
          },
          {
            key: 'concat4',
            id: '',
            product01Entity: '实际毛重',
  
            picknum: nextProps.dataSource.glossweight,
          },
          {
            key: 'concat5',
            id: '',
            product01Entity: '已支付额',
  
            picknum: nextProps.dataSource.pickwaste,
          },
          {
            key: 'concat6',
            id: '',
            product01Entity: '结款方式',
            picknum: nextProps.dataSource.payment,
            // picknum:props.value[0].payment,
          },
          {
            key: 'concat7',
            id: '',
            product01Entity: '货款',
            picknum: nextProps.dataSource.goodpay,
            // picknum:props.value[0].goodpay,
          },
          {
            key: 'concat8',
            id: '',
            product01Entity: '运费',
            picknum: nextProps.dataSource.shippay,
            // picknum:props.value[0].shippay,
          },
          {
            key: 'concat9',
            id: '',
            product01Entity: '保险',
            picknum: nextProps.dataSource.securepay,
            // picknum:props.value[0].securepay,
          },
          {
            key: 'concat13',
            id: '',
            product01Entity: '发票(税收)',
            picknum: nextProps.dataSource.taxmoney,
            // picknum:props.value[0].securepay,
          },
          {
            key: 'concat10',
            id: '',
            product01Entity: '应付合计',
            picknum: nextProps.dataSource.needpay,
            // picknum:props.value[0].needpay,
          },
          {
            key: 'concat11',
            id: '',
            product01Entity: '欠余付款',
            picknum: nextProps.dataSource.sumgoodspay,
            // picknum:props.value[0].needpay,
          },
          {
            key: 'concat12',
            id: '',
            product01Entity: '跟踪状态',
  
            // takeway:props.value[0].trackstatus,
            picknum: div,
          },
        ],
      });
    
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

  handleInputNumberChange(e, fieldName, namekey) {
    const key = namekey === '运费' ? 'concat5' : 'concat6';

    const newData = this.state.concatSoure.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;

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
        index - 11 === dataSource.length||
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
            width: '10%',
            render: (val, record, index) => {
              if (arrData[index].id !== '') {
                return <img src={val} alt={val} width={100} height={35} />;
              } else {
                return renderContent(val,record,index);
              }
            },
          },
          {
            dataIndex: 'product01Entity',
            key: 'product01Entity',
            width: '10%',
            render: val => {
              if (typeof val !== 'string') {
                return (
                  <div>
                    <li>{`${val.kindname}${val.seriesname}`}</li>
                    <li>
                      {val.colorname}
                    </li>
                    <li>{val.productname}</li>
                    <li>{butes[val.productattribute]}</li>
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
      // {
      //   title: '用途 ',
      //   dataIndex: 'usefor',
      //   key: 'usefor',
      //   width: '5%',
      //   render: renderContent,
      // },

      {
        title: '货期/用途(备注)',
        dataIndex: 'comment',
        key: 'comment',
        width: '10%',
        render: (val, record, index) => {
          if (typeof record.product01Entity !== 'string') {
            return (
              <div>
                <li>{moment(record.deliverydate).format('YYYY-MM-DD')}</li>
                <li>{record.comment}</li>
              </div>
            );
          } else {
            return renderContent(val,record,index);
          }
        },
      },
      {
        title: '拣货数量',
        dataIndex: 'picknum',
        key: 'picknum',
        width: '5%',
        render: (val, recode) => {
          if (recode.product01Entity === '结款方式') {
            return <span>{paymentArr[val]}</span>;
          } else if (recode.product01Entity === '欠余付款') {
            if(parseFloat(val)>0){
              return <span>{val}</span>;
            }else{
              return <span style={{color:'red'}}>{val}</span>;
            }
           
          } 
          
          if (recode.product01Entity === '跟踪状态') {
            return {
              children: <div>{val}</div>,
              props: {
                colSpan: 2,
              },
            };
          } else {
            // }else if(recode.product01Entity==="运费" || recode.product01Entity==="保险"){

            //   return (
            //     <InputNumber

            //       value={recode.picknum}
            //       min={0.0}
            //       formatter={value => `￥${value}`}
            //       parser={value => value.replace('￥', '')}
            //       onChange={e => this.handleInputNumberChange(e, 'picknum', recode.product01Entity)}

            //     />
            //     )
            // }

            return <div>{val}</div>;
          }
        },
      },
      {
        title: '拣货明细',
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
            return <div>{val}</div>;
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
