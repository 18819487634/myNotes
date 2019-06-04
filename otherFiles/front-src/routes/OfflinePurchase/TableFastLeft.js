import React, { PureComponent, Fragment } from 'react';
import { Table, InputNumber, Input, DatePicker, message, Checkbox, Select, Drawer, Button, Icon, Modal } from 'antd';
import moment from 'moment';

import styles from './OfflinePurchaseProfile.less';

import { queryGoodsBasic, queryColorProduct } from '../../services/api';
import { getSupplyId } from '../../utils/sessionStorage';

import ColorInput from '../Color/ColorInputProfile';
import CelerityAddColor from '../Color/CelerityAddColor';

let arrData = [];
let defaultProductid = '';
const own = 'ownnum';
const chase = 'transnum';
const spot = 'spotnum';

const operateProducts = new Map();

// const productData = new Map();

export default class TableFastLeft extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.dataSource,
      tag: props.dataSource.tag,
      dataRight: [],
      dataheard: props.heard,
      loading: false,
      visible: false,
      target: null,
      dataKey: '',
      visibleModal: false,
      celerityColorData: {},
      idx: 0,

      concatSoure: [
        {
          key: 'concat1',
          id: '',
          colorname: '货款',
          flag: 1,
          comment: props.dataSource.goodspay,
        },
        {
          key: 'concat2',
          id: '',
          colorname: '运费',
          flag: 1,
          comment: props.dataSource.shippay,
        },
        {
          key: 'concat3',
          id: '',
          colorname: '保险',
          flag: 1,
          comment: props.dataSource.securepay,
        },
        {
          key: 'concat4',
          id: '',
          colorname: (
            <div>
              <span>发票</span>
              <Checkbox onChange={this.checkBoxOnchage} />
              <span>税金</span>
            </div>
          ),
          flag: 1,
          comment: 0,
        },
        {
          key: 'concat5',
          id: '',
          colorname: '备注',
          flag: 1,
          comment: '',
        },
        {
          key: 'concat6',
          id: '',
          colorname: '已选产品',
          flag: 2,
          comment: '',
        },
        {
          key: 'concat7',
          id: '',
          colorname: '合计',
          flag: 2,
          comment: props.dataSource.sum,
        },
      ],
    };
  }
  componentDidMount() {
    const result = this.state.data.concat(this.state.dataheard, this.state.concatSoure);

    this.props.onChange(result);
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.value === undefined || nextProps.value.length === 7) {
      const concatSoures = this.state.concatSoure;
      concatSoures[0].comment = nextProps.dataSource.goodspay;
      concatSoures[1].comment = nextProps.dataSource.shippay;

      concatSoures[2].comment = nextProps.dataSource.securepay;
      concatSoures[6].comment = nextProps.dataSource.sum;
      concatSoures[5].comment = nextProps.dataSource.num;
      this.setState({
        data: nextProps.dataSource,
      });
    } else {
      const newData = nextProps.dataSource;
      const oldData = this.state.data;
      if (oldData.length > 0) {
        if (newData.length !== oldData.length) {
          const concatSoures = this.state.concatSoure;
          concatSoures[0].comment = nextProps.dataSource.goodspay;
          concatSoures[1].comment = nextProps.dataSource.shippay;

          concatSoures[2].comment = nextProps.dataSource.securepay;
          concatSoures[6].comment = nextProps.dataSource.sum;
          concatSoures[5].comment = nextProps.dataSource.num;
          this.setState({
            data: nextProps.dataSource,
          });
        }

      } else {
        const concatSoures = this.state.concatSoure;
        concatSoures[0].comment = nextProps.dataSource.goodspay;
        concatSoures[1].comment = nextProps.dataSource.shippay;

        concatSoures[2].comment = nextProps.dataSource.securepay;
        concatSoures[6].comment = nextProps.dataSource.sum;
        concatSoures[5].comment = nextProps.dataSource.num;
        this.setState({
          data: nextProps.dataSource,
        });
      }

    }
  }

  onChildChanged = newState => {
    if (typeof newState !== 'string') {
      operateProducts.set(newState[0].productid, newState);
    } else {
      operateProducts.delete(newState);
    }
    const newData = this.state.data.map(item => ({ ...item }));

    const goodsData = this.state.dataRight.map(item => ({ ...item }));

    const fieldName = 'spotnum';
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
      this.generalSum();
    });
  };

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }

  checkBoxOnchage = e => {
    const Data = this.state.data;
    Data.tag = e.target.checked;
    this.setState({
      data: Data,
      tag: e.target.checked,
    });
    const result = this.state.data.concat(this.state.dataheard, this.state.concatSoure);

    this.props.onChange(result);
  };
  handleKeyPress(e, key, record) {
    if (e.key === 'Enter') {
      this.searchProduct(record);
    }
  }
  searchProduct = record => {
    const params = `terms[0].value=${
      record.colorname
      }&terms[0].column=colorname&terms[1].value=${getSupplyId()}&terms[1].column=supplyid`;
    queryColorProduct(params).then(res => {
      if (res && res.status === 200) {
        const Data = res.result.data;
        const listData = this.state.data;
        const concatData = this.state.concatSoure;
        if (Data.length === 0) {

          message.error('没有找到该产品！请添加产品');
          for (let i = 0; i < listData.length; i += 1) {
            if (listData[i].colorname === record.colorname) {
              listData[i].productname = '';
              listData[i].productid = '';
              listData[i].price = '';
            }
            if (listData[i].colorname && listData[i].productname === '') {
              listData[i].firstTime = true;
            }
          }
        } else {
          let goodspay = 0;

          for (let i = 0; i < listData.length; i += 1) {
            if (listData[i].colorname === Data[0].colorname) {
              listData[i].productname = Data[0].productname;
              listData[i].productid = Data[0].id;
              listData[i].price = Data[0].price;
              listData[i].firstTime = false;
              listData[i].money = Data[0].price * listData[i].num;
            }
            goodspay += listData[i].money;
          }

          concatData[0].comment = goodspay;
          concatData[6].comment = goodspay + concatData[1].comment + concatData[2].comment;
        }
        this.setState({
          data: listData,
          concatSoure: concatData,
        });
        const result = this.state.data.concat(this.state.dataheard, this.state.concatSoure);

        this.props.onChange(result);
      }
    });
  };

  generalSum() {
    const newData1 = this.state.data.map(item => ({ ...item }));
    newData1.tag = this.state.tag;
    let huokuan = 0;
    let sumnum = 0;
    for (let i = 0; i < newData1.length; i += 1) {
      newData1[i].money = parseFloat(newData1[i].num * newData1[i].price).toFixed(2);
      huokuan += Number(newData1[i].money);
      sumnum += Number(newData1[i].num);
    }

    const concatData = this.state.concatSoure.map(item => ({ ...item }));
    const goodspay = Number(concatData[1].comment === undefined ? 0 : concatData[1].comment);
    const securepay = Number(concatData[2].comment === undefined ? 0 : concatData[2].comment);
    const taxpay = Number(concatData[3].comment === undefined ? 0 : concatData[3].comment);
    const remake = 'comment';
    const sum = huokuan + goodspay + securepay + taxpay;
    // 货款
    const targetPrcie = this.getRowByKey('concat1', concatData);

    // 已选产品
    const targetNum = this.getRowByKey('concat6', concatData);
    // 合计
    const targetSum = this.getRowByKey('concat7', concatData);
    targetPrcie[remake] = this.changeTwoDecimalf(huokuan);
    targetNum[remake] = this.changeTwoDecimalf(sumnum);

    targetSum[remake] = this.changeTwoDecimalf(sum);
    this.setState({
      concatSoure: concatData,
      data: newData1,
    });
    const result = this.state.data.concat(this.state.dataheard, this.state.concatSoure);

    this.props.onChange(result);
  }

  handleFieldChange(e, fieldName, key) {
    const newData = this.state.concatSoure.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e === "" ? 0 : e;
      this.setState({ concatSoure: newData }, () => {
        this.generalSum();
      });
    }
  }
  handleInputnumerChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      this.setState({ data: newData }, () => {
        this.generalSum();
      });
    }
  }
  handlechangeColorname(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    newData.tag = this.state.tag;
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value.toUpperCase();
      this.setState({ data: newData }, () => {
        const result = this.state.data.concat(this.state.dataheard, this.state.concatSoure);

        this.props.onChange(result);
      });


    }
  }
  handlechange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    newData.tag = this.state.tag;
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData }, () => {
        const result = this.state.data.concat(this.state.dataheard, this.state.concatSoure);

        this.props.onChange(result);
      });


    }
  }

  handleDatachange(e, b, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    newData.tag = this.state.tag;
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = b;
      this.setState({ data: newData });
      const result = this.state.data.concat(this.state.dataheard, this.state.concatSoure);

      this.props.onChange(result);
    }
  }
  handlSelectHeardChange(e, fieldName, key) {
    const newData = this.state.dataheard.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;

      this.setState({ dataheard: newData }, () => {
        const result = this.state.data.concat(this.state.dataheard, this.state.concatSoure);
        this.props.onChange(result);
      });
    }
  }

  handlInputHeardChange(e, fieldName, key) {
    const newData = this.state.dataheard.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;

      this.setState({ dataheard: newData });
    }

    const result = this.state.data.concat(this.state.dataheard, this.state.concatSoure);

    this.props.onChange(result);
  }

  handlSelectChange(e, fieldName, key) {
    const newData = this.state.concatSoure.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;

      this.setState({ concatSoure: newData });
    }

    const result = this.state.data.concat(this.state.dataheard, this.state.concatSoure);

    this.props.onChange(result);
  }

  handleInputNumberChange(e, fieldName, key) {
    const newData = this.state.concatSoure.map(item => ({ ...item }));

    // 计算定金(每个数量*单价*支付比例)

    // 计算小计(定金+货款+运费+保险)

    // 计算总计(三个小计之和)

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;

      this.setState({ concatSoure: newData });
    }

    const result = this.state.data.concat(operateProducts);

    this.props.onChange(result);
  }

  handleConcatChange(e, fieldName, key) {
    let sumown = 0;
    let sumchase = 0;
    let sumspot = 0;

    let sum = 0;
    const newData = this.state.concatSoure.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      this.setState({ concatSoure: newData });
    }
    newData.forEach(item => {
      // 计算小计

      if (item.key === 'concat5' || item.key === 'concat6' || item.key === 'concat7') {
        sumown += Number(item.ownnum === undefined ? 0 : item.ownnum);
        sumchase += Number(item.transnum === undefined ? 0 : item.transnum);
        sumspot += Number(item.spotnum === undefined ? 0 : item.spotnum);

        sum = sumown + sumchase + sumspot;
      }
    });

    // 获取到小计
    const targetNum = this.getRowByKey('concat8', newData);
    // 获取到总计
    const targetSum = this.getRowByKey('concat9', newData);
    targetNum[own] = this.changeTwoDecimalf(sumown);
    targetNum[chase] = this.changeTwoDecimalf(sumchase);
    targetNum[spot] = this.changeTwoDecimalf(sumspot);

    targetSum[own] = this.changeTwoDecimalf(sum);

    this.setState({ concatSoure: newData });
    const result = this.state.data.concat(operateProducts);

    this.props.onChange(result);
  }

  sumTotal = (num = 0) => {
    let snum = 0;
    snum += Number(num);
    return snum;
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

  openBatch = id => {
    let arr = [];

    const param = `terms[0].value=${id}&terms[0].column=productid&pageIndex=0&pageSize=10&terms[1].value=0&terms[1].column=status&terms[1].value=-1&terms[1].termType=in`;
    queryGoodsBasic(param).then(response => {
      if (response && response.status === 200) {
        arr = response.result.data;
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
        });
      }
    });
  };
  saveBatch = e => {
    if (defaultProductid === '' || defaultProductid !== e.productid) {
      defaultProductid = e.productid;
      if (e.productid !== undefined) {
        this.openBatch(e.productid);
      }
    }
  };

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
    const result = this.state.data.concat(operateProducts);

    this.props.onChange(result);
  }

  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.setState({ data: newData });
    this.clickedCancel = false;
  }

  showDrawer = (e) => {
    this.setState({
      target: e.target,
      visible: true,
    });
  };

  changeDataKey = (key) => {
    this.setState({
      dataKey: key
    })
  };

  onClose = (val) => {
    this.setState({
      visible: false,
    }, () => {

      if (typeof val === 'string') {
        this.state.target.value = val;
        const newData = this.state.data.map(item => ({ ...item }));
        newData.tag = this.state.tag;
        const target = this.getRowByKey(this.state.dataKey, newData);
        if (target) {
          target['colorname'] = this.state.target.value.toUpperCase();
          this.setState({ data: newData }, () => {
            const result = this.state.data.concat(this.state.dataheard, this.state.concatSoure);

            this.props.onChange(result);
          });
        }
      }
    });
  };

  showModal = (index) => {
    this.setState({
      idx: index,
      visibleModal: true,
    });
  }

  handleOk = () => {
    this.setState({
      visibleModal: false,
    });
  }

  handleCancel = (value) => {
    this.setState({
      visibleModal: false,
    })
    let data = this.state.data;
    const idx = this.state.idx;
    if (value !== undefined) {
      data[idx].colorname = value.colorname;
      data[idx].productname = value.productname;
      data[idx].price = value.price;
      data.sum -= data[idx].money;
      data[idx].money = data[idx].price * data[idx].num;
      data.sum += data[idx].money;
      data[idx].firstTime = false;
      const params = `terms[0].value=${value.colorname}&terms[0].column=colorname&terms[1].value=${getSupplyId()}&terms[1].column=supplyid`;
      queryColorProduct(params).then(res => {
        const dataDetail = res.result.data;
        if (dataDetail[0] !== undefined) {
          data[idx].productid = dataDetail[0].id;
        }
      })
      let sums = 0;
      for (let i = 0, len = data.length; i < len; i++) {
        sums += data[i].money;
      }
      const concatData = this.state.concatSoure;
      concatData[0].comment = sums;
      concatData[6].comment = sums + concatData[1].comment + concatData[2].comment;
      this.setState({
        data,
        celerityColorData: value,
        concatSoure: concatData
      })
    } else {
      data[idx].firstTime = true;
    }
  }

  render() {
    const dataSource = this.state.data;
    const dataConcat = this.state.concatSoure;
    const targetval = target;
    const { entryway, deliveryway, deliveryno, arrangestatus, target, dataheard } = this.state;
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
        title: '本司产品',

        dataIndex: 'colorname',
        key: 'colorname',
        width: '5%',
        colSpan: 3,
        render: (val, record) => {
          if (record.flag === 1 || record.flag === 2) {
            return {
              children: <span style={{ fontWeight: 600, float: 'right' }}>{val}</span>,
              props: {
                colSpan: 18,
              },
            };
          } else {
            return (
              <span>
                <Input
                  defaultValue={val}
                  value={record.colorname}
                  placeholder="色号"
                  onDoubleClick={e => { e.target.value ? '' : this.showDrawer(e); this.changeDataKey(record.key); }}
                  onChange={e => this.handlechangeColorname(e, 'colorname', record.key)}
                  onKeyPress={e => this.handleKeyPress(e, record.key, record)}
                  title="双击新建色卡"
                  disabled={!this.props.visibleDrawer ? false : true}
                />
              </span>
            );
          }
        },
      },
      {
        colSpan: 0,
        width: '5%',
        dataIndex: 'productname',
        key: 'productname',
        render: renderContent,
      },
      {
        colSpan: 0,
        width: '5%',
        dataIndex: 'batchno', //缸号
        key: 'batchno',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <Input
                value={val}
                placeholder="缸号"
                onChange={e => this.handlechangeColorname(e, 'batchno', record.key)}
                title='缸号'
                maxLength='12'
              />
            )
          }
        }
      },
      {
        title: '单位：KG',
        dataIndex: 'lossfactor',
        key: 'lossfactor',
        width: '5%',
        colSpan: 3,
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <Input
                value={val}
                placeholder="损耗系数"
                onChange={e => this.handlechangeColorname(e, 'lossfactor', record.key)}
                title='损耗系数'
              />
            )
          }
        }
      },
      {
        colSpan: 0,
        width: '5%',
        dataIndex: 'paperweight',
        key: 'paperweight',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <Input
                value={val}
                placeholder="纸桶"
                onChange={e => this.handlechangeColorname(e, 'paperweight', record.key)}
                title='纸桶'
              />
            )
          }
        }
      },
      {
        colSpan: 0,
        width: '5%',
        dataIndex: 'wrapperweight',
        key: 'wrapperweight',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <Input
                value={val}
                placeholder="包装袋"
                onChange={e => this.handlechangeColorname(e, 'wrapperweight', record.key)}
                title='包装袋'
              />
            )
          }
        }
      },
      {
        width: '5%',
        title: '供应商产品',

        dataIndex: 'sbrandname',
        key: 'sbrandname',
        colSpan: 5,
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <Input
                value={val}
                placeholder="货品名称"
                onChange={e => this.handlechange(e, 'sbrandname', record.key)}
                title='货品名称'
                maxLength='30'
              />
            );
          }
        },
      },
      {
        width: '5%',
        colSpan: 0,
        dataIndex: 'offlinecolorno',
        key: 'offlinecolorno',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <span style={{ overflow: 'hidden' }}>
                <Input
                  value={val}
                  placeholder="产品编号"
                  onChange={e => this.handlechange(e, 'offlinecolorno', record.key)}
                  style={{ width: record.firstTime ? '80%' : '100%' }}
                  disabled={!this.props.visibleDrawer ? false : true}
                />
                <Icon
                  type="plus-circle"
                  theme="filled"
                  style={{ marginLeft: '4px', color: '#73c0ff', display: record.firstTime ? 'inline-block' : 'none' }}
                  onMouseOver={e => { e.target.style.cursor = 'pointer'; }}
                  onClick={() => { this.showModal(index) }}
                  title='添加产品'
                />
              </span>
            );
          }
        },
      },
      {
        width: '5%',
        colSpan: 0,
        dataIndex: 'offlinecolorname',
        key: 'offlinecolorname',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <Input
                value={val}
                placeholder="色称"
                onChange={e => this.handlechange(e, 'offlinecolorname', record.key)}
                disabled={!this.props.visibleDrawer ? false : true}
              />
            );
          }
        },
      },
      {
        colSpan: 0,
        width: '5%',
        dataIndex: 'sbatchno', //缸号
        key: 'sbatchno',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <Input
                value={val}
                placeholder="缸号"
                onChange={e => this.handlechangeColorname(e, 'sbatchno', record.key)}
                title='缸号'
                maxLength='12'
              />
            )
          }
        }
      },
      {
        colSpan: 0,
        width: '5%',
        dataIndex: 'spiecenum', //包装数
        key: 'spiecenum',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <Input
                value={val}
                placeholder="包装数"
                onChange={e => this.handlechangeColorname(e, 'spiecenum', record.key)}
                title='包装数'
              />
            )
          }
        }
      },
      {
        title: '采购单价',
        dataIndex: 'price',
        key: 'price',
        width: '5%',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <InputNumber
                value={val}
                placeholder="采购单价"
                onChange={e => this.handleInputnumerChange(e, 'price', record.key)}
              />
            );
          }
        },

        // render: renderContent,
      },
      {
        title: '采购数量(KG)',
        dataIndex: 'num',
        key: 'num',
        width: '5.5%',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <InputNumber
                value={val}
                placeholder="采购数量"
                onChange={e => this.handleInputnumerChange(e, 'num', record.key)}
              />
            );
          }
        },

        //  render: renderContent,
      },
      {
        title: '金额',
        dataIndex: 'money',
        key: 'money',
        width: '4%',
        render: renderContent,
      },

      {
        title: '货期 ',
        dataIndex: 'deliverydate',
        key: 'deliverydate',
        width: '9%',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <DatePicker
                onChange={(e, b) => this.handleDatachange(e, b, 'deliverydate', record.key)}
                defaultValue={moment(new Date(), 'YYYY/MM/DD')}
              />
            );
          }
        },
      },
      {
        title: '单位：KG',
        dataIndex: 'slossfactor',
        key: 'slossfactor',
        width: '5%',
        colSpan: 3,
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <Input
                value={val}
                placeholder="损耗系数"
                onChange={e => this.handlechangeColorname(e, 'slossfactor', record.key)}
                title='损耗系数'
              />
            )
          }
        }
      },
      {
        colSpan: 0,
        width: '5%',
        dataIndex: 'spaperweight',
        key: 'spaperweight',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <Input
                value={val}
                placeholder="纸桶"
                onChange={e => this.handlechangeColorname(e, 'spaperweight', record.key)}
                title='纸桶'
              />
            )
          }
        }
      },
      {
        colSpan: 0,
        width: '5%',
        dataIndex: 'swrapperweight',
        key: 'swrapperweight',
        render: (val, record, index) => {
          if (record.flag === 1 || record.flag === 2) {
            return renderContent(val, record, index);
          } else {
            return (
              <Input
                value={val}
                placeholder="包装袋"
                onChange={e => this.handlechangeColorname(e, 'swrapperweight', record.key)}
                title='包装袋'
              />
            )
          }
        }
      },
      {
        title: '备注',
        dataIndex: 'comment',
        key: 'comment',
        width: '15%',
        render: (val, record) => {
          if (record.flag === 1 && record.colorname !== '备注') {
            return (
              <InputNumber
                value={val}
                onChange={e => this.handleFieldChange(e, 'comment', record.key)}
              />
            );
          } else if (record.flag === 1 && record.colorname === '备注') {
            return (
              <Input
                placeholder="备注"
                onChange={e => this.handlechange(e, 'comment', record.key)}
              />
            );
          } else if (record.flag === 2) {
            return <span>{val}</span>;
          } else {
            return (
              <Input
                placeholder="备注"
                onChange={e => this.handlechange(e, 'comment', record.key)}
              />
            );
          }
        },
      },
    ];

    const Option = Select.Option;

    const colCargo = [
      {
        title: '入库方式',
        align: 'center',
        dataIndex: 'entryway',
        key: 'entryway',
        render: (val, record) => {
          return (
            <Select
              value={val}
              style={{ width: 120 }}
              onChange={e => { this.handlSelectHeardChange(e, 'entryway', record.key) }}
            >
              <Option value="0">打码入库</Option>
              <Option value="2">总数入库</Option>
            </Select>
          )
        }
      },
      {
        title: '送货方式',
        align: 'center',
        dataIndex: 'deliveryway',
        key: 'deliveryway',
        render: (val, record) => {
          return (
            <Select
              value={val}
              style={{ width: 120 }}
              onChange={e => { this.handlSelectHeardChange(e, 'deliveryway', record.key) }}
            >
              <Option value="0">自提</Option>
              <Option value="1">快递</Option>
              <Option value="2">物流</Option>
              <Option value="3">送货上门</Option>
            </Select>
          )
        }
      },
      {
        title: '送货单号',
        align: 'center',
        dataIndex: 'deliveryno',
        key: 'deliveryno',
        render: (val, record) => {
          return (
            <Input
              placeholder="送货单号"
              onChange={e => { this.handlInputHeardChange(e, 'deliveryno', record.key) }}
              maxLength="30"
              value={val}
            />
          )
        }
      },
      {
        title: '调货状态',
        align: 'center',
        dataIndex: 'arrangestatus',
        key: 'arrangestatus',
        render: (val, record) => {
          return (
            <Select
              value={val}
              style={{ width: 120 }}
              onChange={e => { this.handlSelectHeardChange(e, 'arrangestatus', record.key) }}
            >
              <Option value="0">待收</Option>
              <Option value="1" style={{ display: this.props.visibleDrawer ? 'block' : 'none' }}>已收</Option>
              <Option value="2" style={{ display: this.props.visibleDrawer ? 'block' : 'none' }}>关闭</Option>
            </Select>
          )
        }
      }
    ];
    return (
      <Fragment>
        <div className={styles.tableList}>
          <div style={{ width: 2000 }}>
            <div style={{ width: 1500, float: 'left' }}>
              <Table
                columns={colCargo}
                dataSource={dataheard}
                pagination={false}
              />
              <Table
                loading={this.state.loading}
                columns={columns}
                dataSource={arrData}
                pagination={false}
                style={{ width: 2000 }}
                bordered
              />
            </div>
          </div>
          <Drawer
            title="色卡建档"
            placement="right"
            closable={false}
            onClose={this.onClose}
            visible={this.state.visible}
            width={'100%'}
            closable
          >
            <ColorInput
              visible={this.state.visible}
              onClose={this.onClose}
            />
          </Drawer>
          <Modal
            title="新增产品"
            visible={this.state.visibleModal}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={null}
            closable={false}
          >
            <CelerityAddColor
              visibleModal={this.state.visibleModal}
              onCancel={this.handleCancel}
              celerityColorData={this.state.celerityColorData}
            />
          </Modal>
          <div style={{ float: 'left', marginTop: 12, display: this.props.visibleDrawer ? 'block' : 'none' }}>
            <Button type="primary" onClick={this.props.editFinish}>完成</Button>
            <Button style={{ marginLeft: 10 }} onClick={this.props.onDrawerClose}>取消</Button>
          </div>
        </div>
      </Fragment>
    );
  }
}
