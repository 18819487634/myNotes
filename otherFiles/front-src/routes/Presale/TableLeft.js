import React, { PureComponent, Fragment } from 'react';
import { Table, InputNumber, Modal, Form } from 'antd';
import moment from 'moment';
import styles from './PresaleProfile.less';
import { queryGoodsBasic, queryPresaleById, queryGoods, queryGoodslocation } from '../../services/api';
import TableRight from './TableRight';
import { getMyDate, trackiList } from '../../utils/utils';
import UpdatePickup from './UpdatePickup';
import UpdatePickups from './UpdatePickups';

let arrData = [];
// const own = "ownnum";
// const chase = "chasenum";
// const spot = "spotnum";
const operateProducts = new Map();
const paymentArr = ['全款', '月结'];
const butes = ['', '色纱', '胚纱', '代销色纱', '代销胚纱'];

const GoodFrom = Form.create()(props => {
  const {
    modalVisible,
    form,
    handleModalVisible,
    dataBatch,
    handlclick,
    updateFlag,
    abnormaFlag,
  } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      if (updateFlag) {
        handlclick(fieldsValue.tableTop, false);
      } else if (abnormaFlag) {
        handlclick(fieldsValue.tableTop, true);
      }
    });
  };
  const { getFieldDecorator } = form;
  
  let titlename = '货物列表';
  if (updateFlag === true) {
    titlename += '·修改';
    return (
      <Modal
        title={titlename}
        visible={modalVisible}
        onOk={okHandle}
        maskClosable={false}
        onCancel={() => handleModalVisible()}
      >
        <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
          <div>{getFieldDecorator('tableTop', {})(<UpdatePickup dataSource={dataBatch} />)}</div>
        </Form>
      </Modal>
    );
  } else if (abnormaFlag === true) {
    titlename += '·再分配';
    return (
      <Modal
        title={titlename}
        visible={modalVisible}
        onOk={okHandle}
        maskClosable={false}
        onCancel={() => handleModalVisible()}
      >
        <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
          <div>{getFieldDecorator('tableTop', {})(<TableRight dataSource={dataBatch} />)}</div>
        </Form>
      </Modal>
    );
  } else {
    return (
      <Modal
        title={titlename}
        visible={modalVisible}
        onOk={okHandle}
        maskClosable={false}
        onCancel={() => handleModalVisible()}
      >
        <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
          <div>{getFieldDecorator('tableTop', {})(<UpdatePickups dataSource={dataBatch} />)}</div>
        </Form>
      </Modal>
    );
  }
});

export default class TableLeft extends PureComponent {
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
      modalVisible: false,
      loading: false,
      abnormaFlag: false,
      updateFlag: false,
      concatSoure: [
        {
          key: 'concat1',
          id: '',
          product01Entity: '数量',

          picknum: props.dataSource.num,
        },
        {
          key: 'concat2',
          id: '',
          product01Entity: '定金/拣货费',

          picknum: props.dataSource.pickwaste,
        },
        {
          key: 'concat3',
          id: '',
          product01Entity: '结款方式',

          picknum: props.dataSource.payment,
        },
        {
          key: 'concat4',
          id: '',
          product01Entity: '货款',

          picknum: props.dataSource.goodpay,
        },
        {
          key: 'concat5',
          id: '',
          product01Entity: '运费',

          picknum: props.dataSource.shippay,
        },
        {
          key: 'concat6',
          id: '',
          product01Entity: '保险',

          picknum: props.dataSource.securepay,
        },
        {
          key: 'concat10',
          id: '',
          product01Entity: '发票(税收)',

          picknum: props.dataSource.taxratenum,
        },
        {
          key: 'concat7',
          id: '',
          product01Entity: '应付合计',

          picknum: props.dataSource.needpay,
        },
        {
          key: 'concat8',
          id: '',
          product01Entity: '欠余付款',

          picknum: props.dataSource.needpays,
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
    const result = this.state.data.concat(this.state.concatSoure);
    this.props.onChange(result);                        






  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        data: nextProps.value,
      });
    }
  }

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
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
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
      updateFlag: false,
      abnormaFlag: false,
    });
  };

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
  // handleSelectRows = (selectedRowKeys,selectedRows) => {

  //   this.setState({
  //     selectedRows,

  //   });

  // };
  openBatch = (e, id, colorname, productname) => {
    let arr = [];

    const param = `terms[0].value=${id}&terms[0].column=productid&terms[1].value=${0}&terms[1].value=${-1}&terms[1].column=status&terms[1].termType=in`;
    queryGoodsBasic(param).then(response => {
      if (response && response.status === 200) {
        arr = response.result.data;
        // if(id==='1533697589676000005'){

        //   arr =Demodata;
        // }else{
        //   arr =Demodata1;
        // }
        const goodids = [];
        let goodterms = 'terms[0].column=id&';

        for (let i = 0; i < arr.length; i += 1) {
          arr[i].key = `Goodsdetail${i}`;
          arr[i].output=0;
          arr[i].piece=0;
          arr[i].completestatus=0;
          if (goodids.indexOf(arr[i].goodid) === -1) {
            goodids.push(arr[i].goodid);
            goodterms += `terms[0].value=${arr[i].goodid}&`;
          }
        }
        goodterms += 'terms[0].termType=in';
        queryGoods(goodterms).then(goodsres => {
          if (goodsres && goodsres.status === 200) {
            const goodsData = goodsres.result.data;
            const goodArea = new Map();
            const goodDate = new Map();
            goodsData.forEach(item => {
              goodArea.set(item.id, item.area);
              goodDate.set(item.id, item.deliverydate);
            });
            arr.colorname = colorname;
            arr.productname = productname;
            const locationTerms = `terms[0].value=${id}&terms[0].column=productid&paging=false&terms[1].column=recordstatus&terms[1].value=0`;
            queryGoodslocation(locationTerms).then(lores=>{
              if(lores && lores.status===200){
               
                const piecemap = new Map();// 计算整件数
                const scatpiecemap = new Map();// 计算包数
                const cartnoData = lores.result.data;
                if (operateProducts.get(id)) {
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
                  for (let i = 0; i < data.length; i+=1) {
                    for (let j = 0; j < selectdata.length; j+=1) {
                      if (data[i].batchno === selectdata[j].batchno) {
                        data[i].output = selectdata[j].output;
                        data[i].piece = selectdata[j].piece;
                        data[i].completestatus = selectdata[j].completestatus;
                        data[i].piecenums =piecemap.get(data[i].id);
                        data[i].splitnums = scatpiecemap.get(data[i].id);
                        data[i].maxpiece = Math.ceil(selectdata[j].remainnum/(selectdata[j].totalnw /selectdata[j].allpiecenum));
                      }
                    }
                    data[i].area = goodArea.get(data[i].goodid);
                    data[i].deliverydate = goodDate.get(data[i].goodid);
                  }
    
                  this.setState({
                    dataRight: data,
                    total: response.result.total,
                    modalVisible: true,
                    abnormaFlag: true,
                    productid: id,
                  });
                } else {
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
                  this.setState({
                    dataRight: arr,
                    total: response.result.total,
                    modalVisible: true,
                    abnormaFlag: true,
                    productid: id,
                    flag: true,
                  });
                }
              }
            });
            
          }
        });
      }
    });
  };
  saveBatch = (e, c, b) => {
    if (e.productid !== undefined) {
      this.openBatch(c, e.productid, e.product01Entity.colorname, e.product01Entity.productname);
    }
  };
  handlclick = (fieldsValue, flag) => {
    let num = 0;
    if (fieldsValue) {
      for (let z = 0; z < fieldsValue.length; z += 1) {
        num += fieldsValue[z].output;
        operateProducts.set(fieldsValue[z].productid, fieldsValue);
      }
      const newdata = this.state.data;
      for (let i = 0; i < newdata.length; i += 1) {
        if (newdata[i].productid === fieldsValue[0].productid) {
          if (flag) {
            newdata[i].againnum = num;
          } else {
            newdata[i].updatenum = num;
          }
        }
      }

      this.setState(
        {
          data: newdata,
          modalVisible: false,
        },
        () => {
          this.generalSum();
          const data = this.state.data.concat(operateProducts);
          this.props.onChange(data);
        }
      );
    }
  };

  generalSum() {
    const newConcat = this.state.concatSoure.map(item => ({ ...item }));

    let num = 0;
    let goodsmoney = 0;
    // let freight =0;

    // let deposit =0;
    // let insurance=0;
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
      let pnum = 0;
      if (item.updatenum === 0) {
        pnum = parseFloat(item.picknum === undefined ? 0 : item.picknum) + parseFloat(item.againnum);
      } else {
        pnum =  parseFloat(item.updatenum === undefined ? 0 : item.updatenum) + parseFloat(item.againnum);
      }
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

  updateCilck = (e, record) => {
    let arr = [];

    queryPresaleById(record.presaleid).then(response => {
      if (response && response.status === 200) {
        const pickupList = response.result.pickups;
        const detailsPickup = [];
        for (let i = 0; i < pickupList.length; i += 1) {
          const detailss = pickupList[i].details;
          for (let d = 0; d < detailss.length; d += 1) {
            if (
              detailss[d].productid === record.productid &&
              detailss[d].status === 0 &&
              detailss[d].ok !== -1
            ) {
              detailss[d].key = `pickDetails${d}`;
              detailss[d].output = detailss[d].picknum;
              
              detailsPickup.push(detailss[d]);
            }
          }
        }
        detailsPickup.colorname = record.product01Entity.colorname;
        this.setState({
          dataRight: detailsPickup,
          modalVisible: true,
          updateFlag: true,
        });
      }
    });
  };

  render() {
    const dataSource = this.state.data;

    const dataConcat = this.state.concatSoure;
    const dataBatch = this.state.dataRight;
    const { modalVisible, total, updateFlag, abnormaFlag } = this.state;
    const parentMethods = {
      handleSelectRows: this.handleSelectRows,
      handleModalVisible: this.handleModalVisible,
      handlclick: this.handlclick,
    };
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
        index - 9 === dataSource.length
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
    // arrData =dataSource;
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
                return renderContent(val, record, index);
              }
            },
          },
          {
            dataIndex: 'product01Entity',
            key: 'product01Entity',
            width: '10%',
            render: (val, record, index) => {
              if (typeof val !== 'string') {
                if (record.status === 1) {
                  return (
                    <div
                      style={{ backgroundColor: '#E83632' ,cursor:"pointer" }}
                      onClick={e => this.openBatch(e, `${val.productid}`, `${val.colorname}`, `${val.productname}`)}
                    >
                      <li>{`${val.kindname}${val.seriesname}`}</li>
                      <li>
                        <a onClick={e => this.openBatch(e, `${val.productid}`, `${val.colorname}`, `${val.productname}`)}>
                          {val.colorname}
                        </a>
                      </li>
                      <li>{val.productname}</li>
                      <li>{butes[val.productattribute]}</li>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <li>{`${val.kindname}${val.seriesname}`}</li>
                      <li>
                        {val.colorname}
                        {/* <a onClick={e=>this.openBatch(e,`${val.productid}`)}>{val.colorname}</a> */}
                      </li>
                      <li>{val.productname}</li>
                      <li>{butes[val.productattribute]}</li>
                    </div>
                  );
                }
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
            return (
              <div  >
                <span>{text}</span>
              </div>
            );
          } else {
            return renderContent(text, record, index);
          }
        },
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
        render: (val, recode, index) => {
          if (typeof recode.product01Entity !== 'string') {
            return (
              <div >
                <li>{moment(recode.deliverydate).format('YYYY-MM-DD')}</li>
                <li>{recode.comment}</li>
              </div>
            );
          } else {
            const obj = {
              children: (
                <div>
                  {val}
                </div>
              ),
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
              index - 9 === dataSource.length
            ) {
              obj.props.colSpan = 0;
            }
            return obj;
          }
        },
      },
      {
        title: '预售数量(KG)',
        dataIndex: 'num',
        key: 'num',
        width: '5%',
        render: (val, recode, index) => {
          const obj = {
            children: (
              <div>
                {val}
              </div>
            ),
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
            index - 9 === dataSource.length
          ) {
            obj.props.colSpan = 0;
          }
          return obj;
        },
      },


      {
        title: '已分配拣货(KG)',
        dataIndex: 'picknum',
        key: 'picknum',
        width: '5%',
        render: (val, recode) => {
          if (recode.product01Entity === '结款方式') {
            return <span>{paymentArr[val]}</span>;
          } else if (recode.product01Entity === '跟踪状态') {
            return {
              children: (
                <div style={{width:'90%'}}>
                  {val}
                </div>
              ),
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
        title: '重新分配(KG)',
        dataIndex: 'againnum',
        key: 'againnum',
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
            return (
              <div>
                {val}
              </div>
            );
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
              rowKey={record => record.key}
              dataSource={arrData}
              pagination={false}
              // onRow={(e,b,c) => ({
              //   onClick: () => {

              //     this.saveBatch(e,b,c);

              //   },
              // })}
              id="tableLeft"
              width="50%"
            />
          </div>
          <GoodFrom
            {...parentMethods}
            modalVisible={modalVisible}
            dataBatch={dataBatch}
            total={total}
            updateFlag={updateFlag}
            abnormaFlag={abnormaFlag}
          />
          {/* <div className={this.state.flag?styles.tableBatchShow:styles.tableBatchNone}  style={{width:360,float:"right"}}> 
            <TableRight
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
