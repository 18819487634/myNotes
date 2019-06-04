import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Row, Col, Select, Button, Table, Input, Modal, Icon, Drawer, message } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import TableFastLeft from './TableFastLeft';
import styles from './OfflinePurchaseProfile.less';

import { queryPickup, queryofflinepurchasen, queryListClients, queryofflinepurchasenBasic, queryProductreLation, addofflinepurchase, updateofflinepurchase, updateofflinedetails, queryProductids } from '../../services/api';
import { getMyDate } from '../../utils/utils';
import { routerRedux } from 'dva/router';
import { getSupplyId } from '../../utils/sessionStorage';

import * as QrCode from 'qrcode.react';

const FormItem = Form.Item;
const { Option } = Select;
// let dataTop = [
//     {
//         id:'208007200143425',
//         makedate:'2017-07-06',
//         usrid:'人生无限有限公司',
//         deliverydate:'2018-04-02',
//         takeway:0,
//         payway:0,
//         credit:'优质客户',
//         status:0,

//     },

// ];
// let dataLeft = [

//     {comment:"紧急",
//     id:"2fd574271c852553acbaaf37ad6ce43f",
//     inquiryid:"cb9f8a44e38db5ca208eac28759dfa3",
//     num:15.62,
//     price:141.123,
//     key:'13123321',
//     product01Entity:
//     {colorname:"CA001",
//     colorproduct:{a:60.14,b:57.19,begindate:"2018-01-01 10:45:19",enddate:"2019-01-01 10:45:19",hex:"#e84c22",id:802,l:55.35,lrv:"23",
//     productid:"1533697589676000005",rgb:"232,76,34",status:1,supplyid:"cb564b09127e4e1d8cd1fcd7a35b03a9"},
//     id:782,kind:"膨体棉晴·2/16支·60%棉·40%晴",largetype:"膨体棉晴",location:"1-01-01",picture:"http://47.95.202.38/upload/20180808/6743237244707997.png",
//     price:36.0,productid:"1533697589676000005",productname:"火龙桔",recommande:10.0,series:"膨体棉晴",supplyid:"cb564b09127e4e1d8cd1fcd7a35b03a9"},
//     productid:"1533697589676000005",usefor:"自用"},
//     {comment:"紧急",
//     key:'121211sss',
//     id:"50b365fdbc612e3909afccb3a18bdf28",inquiryid:"cb9f8a44e38db5ca208eac28759dfa3",num:20.62,price:141.123,
//     product01Entity:{colorname:"CA002",
//     colorproduct:{a:55.46,b:58.9,begindate:"2018-01-01 11:06:50",enddate:"2019-01-01 11:06:50",hex:"#f6632b",id:803,l:61.27,lrv:"30",productid:"1533697729089000000",rgb:"246,99,43",status:1,supplyid:"cb564b09127e4e1d8cd1fcd7a35b03a9"},
//     id:783,kind:"膨体棉晴·2/16支·60%棉·40%晴",largetype:"膨体棉晴",location:"1-01-02",picture:"http://47.95.202.38/upload/20180808/6743368622129332.png",
//     price:36.0,productid:"1533697729089000000",productname:"桔红",recommande:10.0,series:"膨体棉晴",supplyid:"cb564b09127e4e1d8cd1fcd7a35b03a9"},
//     productid:"1533697729089000000",usefor:"自用"},
// ];

// const TabPanes = Tabs.TabPane;

// const takewayArr = ["自提","快递","物流","送货上门"];

const recordstatusArr = ['正常', '加急'];

const userMap = new Map();
@connect(({ offlinepurchase, loading }) => ({
  offlinepurchase,
  loading: loading.models.offlinepurchase,
}))
@Form.create()
export default class OfflinePurchaseList extends PureComponent {
  state = {
    panes: [{ key: '1' }],
    activeKey: '1',
    pagesize: 12,
    pageindex: 1,
    userLists: [],
    visible: false,
    QrData: '',
    visibleDrawer: false,
    tableData: [],
    listId: '',
    dataheard: [],
    dataLists: [],
    idx: []
  };

  componentDidMount() {
    const terms = `pageIndex=0&pageSize=12&sorts[0].name=id&sorts[0].order=desc&terms[1].value=${getSupplyId()}&terms[1].column=supplyid`;
    const { dispatch } = this.props;
    queryofflinepurchasen(terms).then(response => {
      if (response && response.status === 200) {
        const offData = response.result.data;
        const userList = [];
        offData.forEach(item => {
          if (userList.indexOf(item.clientsupplyid) === -1) {
            userList.push(item.clientsupplyid);
          }
        });
        if (userList.length > 0) {
          queryListClients(userList).then(res => {
            if (res && res.status === 200) {
              const userLists = res.result;
              // for(const key in userLists){
              //   if(key in userLists){

              //     userMap.set(key,userLists[key]);

              //   }

              // }
              this.setState({
                userLists,
              });
            }
          });
        }
      }
    });

    dispatch({
      type: 'offlinepurchase/fetch',
      payload: terms,
    });
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  query = terms => {
    queryofflinepurchasen(terms).then(response => {
      if (response && response.status === 200) {
        const arr = response.result.data;
        for (let i = 0; i < arr.length; i += 1) {
          arr[i].key = `offline${i}`;
        }
        this.setState({
          loadData: arr,
        });
      }
    });
  };

  handleSearch = () => {
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((error, values) => {
      const terms = this.formatTerms(values);
      this.query(terms);
    });
  };
  // hadl=(e,val,record)=>{
  //   queryofflinepurchasenBasic(record);
  // }

  formatTerms = params => {
    const keys = [];
    const values = [];
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        keys.push(key);
        values.push(params[key]);
      }
    });
    let terms = `terms[0].value=0&terms[0].column=type`;
    if (keys.length > 0) {
      terms += `&`;
    }

    for (let i = 0; i < keys.length; i++) {
      if (keys.length === 1) {
        terms += `terms[1].value=${values[i]}&terms[1].column=${keys[i]}`;
      } else {
        terms += `terms[${i + 1}].value=${values[i]}&terms[${i + 1}].column=${keys[i]}`;
        if (keys.length !== i + 1) {
          terms += '&';
        }
      }
    }

    return terms;
  };
  clickAdd = () => {
    this.props.dispatch(routerRedux.push(`/order/offlinepurchase`));
  };

  handleStandardTableChange = pagination => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.setState({
        pageindex: pagination.current,
        pagesize: pagination.pageSize,
      });
      const terms = `terms[0].value=0&terms[0].column=type&pageSize=${
        pagination.pageSize
        }&pageIndex=${pagination.current - 1}&sorts[0].name=id&sorts[0].order=desc&terms[1].value=${getSupplyId}&terms[1].column=supplyid`;
      dispatch({
        type: 'offlinepurchase/fetch',
        payload: terms,
      });
    });
  };

  remove = targetKey => {
    let activeKeys = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKeys === targetKey) {
      activeKeys = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey: activeKeys });
  };

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="编号">
              {getFieldDecorator('id')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="客户">
              {getFieldDecorator('userid')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>

          <Col md={6} sm={24}>
            <FormItem label=" 状态">
              {getFieldDecorator('ismerge')(
                <Select placeholder="">
                  <Option value={0}>正常</Option>
                  <Option value={1}>加急</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="取货方式">
              {getFieldDecorator('takeway')(
                <Select placeholder="">
                  <Option value={0}>自提</Option>
                  <Option value={1}>快递</Option>
                  <Option value={2}>物流</Option>
                  <Option value={3}>送货上门</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>

        <Row gutter={{ md: 4, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="结款方式">
              {getFieldDecorator('payway')(
                <Select placeholder="">
                  <Option value={0}>日结</Option>
                  <Option value={1}>月结</Option>
                  <Option value={2}>全款</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="客户评级">
              {getFieldDecorator('credit')(
                <Select placeholder="">
                  <Option value={0}>A</Option>
                  <Option value={1}>B</Option>
                  <Option value={2}>C</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="备注">
              {getFieldDecorator('comment')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ float: 'right', marginBottom: 24 }}>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  重置
                </Button>
              </span>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  tableClick(val) {
    this.setState(() => {
      return {
        QrData: val,
        visible: true
      }
    })
  }

  handleOk = () => {
    this.setState({
      visible: false,
    });
  }

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }

  editData(val, idx) {
    this.setState({ idx });
    queryofflinepurchasenBasic(val).then(response => {
      if (response && response.status === 200) {
        const data = response.result;
        let arr = [];
        arr.goodspay = data.goodspay;
        arr.shippay = data.shippay;
        arr.securepay = data.securepay;
        arr.isbill = data.isbill;
        arr.taxpay = data.taxpay;
        arr.remark = data.remark;
        arr.entryway = data.entryway;
        arr.deliveryway = data.deliveryway;
        arr.deliveryno = data.deliveryno;
        arr.arrangestatus = data.arrangestatus;
        arr.clientsupplyid = data.clientsupplyid;
        const heard = [{
          key: 'concatheard',
          entryway: data.entryway + '',
          deliveryway: data.deliveryway + '',
          deliveryno: data.deliveryno + '',
          arrangestatus: data.arrangestatus + ''
        }];
        const productID = [];
        for (let i = 0, len = data.details.length; i < len; i++) {
          productID.push(data.details[i].productid);
        }
        queryProductids(productID).then(re => {
          if (re.result.length > 0 && re.status === 200) {
            let nums = 0;
            let sum = 0;
            for (let i = 0, len = data.details.length; i < len; i++) {
              const list = data.details[i];
              list.key = `offine-${i}`,
                list.productname = re.result[i].productname;
              list.colorname = re.result[i].colorname;
              list.offlinecolorno = re.result[i].colorname;
              list.offlinecolorname = re.result[i].productname;
              list.money = (list.num * list.price).toFixed(2);
              nums += list.num;
              sum += list.money * 1;
              arr.push(list);
            }
            arr.num = nums.toFixed(2);
            arr.sum = (sum + arr.securepay * 1 + arr.shippay * 1).toFixed(2);
            this.setState({
              tableData: arr,
              listId: val,
              visibleDrawer: true,
              dataheard: heard
            })
          }
        })
      }
    });
  }

  editFinish = (e) => {
    if (e.target.id === 'colorForm') {
      return;
    }
    const { validateFieldsAndScroll } = this.props.form;
    message.config({
      top: 100,
    });
    const hide = message.loading(`正在修改...`, 0);
    validateFieldsAndScroll((error, values) => {
      const paramsData = {};
      if (values === undefined) {
        return;
      }
      const detailData = [];
      const summaryData = [];
      const valuesData = values.tableLeft;
      let dataList = this.state.dataLists;
      dataList[this.state.idx].arrangestatus = values.tableLeft[2].arrangestatus * 1;
      this.setState({ dataLists: dataList })

      for (let i = 0; i < valuesData.length; i += 1) {
        if (`${valuesData[i].key}`.indexOf('concat') === -1) {
          detailData.push(valuesData[i]);
        } else {
          summaryData.push(valuesData[i]);
        }
      }
      if (valuesData.tag === false) {
        paramsData.isbill = 1;
      } else {
        paramsData.isbill = 0;
      }
      for (let d = 0; d < detailData.length; d += 1) {
        if (detailData[d].productid === '') {
          message.error(`${detailData[d].colorname}没有这个产品!`);
          setTimeout(hide, 100);
          return;
        } else {
          paramsData.details = detailData;
        }
      }
      summaryData.forEach(item => {
        if (item.key === 'concatheard') {
          // 入库，送货，单号，状态
          paramsData.entryway = item.entryway;
          paramsData.deliveryway = item.deliveryway;
          paramsData.deliveryno = item.deliveryno;
          paramsData.arrangestatus = item.arrangestatus;
        } else
          if (item.key === 'concat1') {
            // 货款
            paramsData.goodspay = item.comment;
          } else if (item.key === 'concat2') {
            // 运费
            paramsData.shippay = item.comment;
          } else if (item.key === 'concat3') {
            // 保险
            paramsData.securepay = item.comment;
          } else if (item.key === 'concat4') {
            // 税金
            paramsData.taxpay = item.comment;
          } else if (item.key === 'concat5') {
            // 备注
            paramsData.remark = item.comment;
          }
      });
      paramsData.payway = 1;
      paramsData.takeway = 1;
      paramsData.clientsupplyid = this.state.userid;
      paramsData.id = this.state.listId;
      if (paramsData.details !== undefined) {
        for (let i = 0, len = paramsData.details.length; i < len; i++) {
          delete paramsData.details[i].firstTime
        }
      }
      updateofflinepurchase(paramsData).then(res => {
        if (res && res.status === 200) {
          if (paramsData.details !== undefined) {
            for (let i = 0, len = paramsData.details.length; i < len; i++) {
              updateofflinedetails(paramsData.details[i]).then(response => {
                if (response && response.status === 200) {
                  this.onClose();
                  setTimeout(hide, 100);
                } else {
                  message.error('修改失败！');
                }
              })
            }
            message.success('修改成功！');
          }
        } else {
          message.error('修改失败！');
          setTimeout(hide, 100);
        }
      });
    });
  }

  onClose = () => {
    this.setState({
      visibleDrawer: false,
    });
    this.props.form.resetFields();
  };

  render() {
    const { offlinepurchase: { data }, loading } = this.props;
    const { form } = this.props;
    const { getFieldDecorator } = form;

    let dataList = this.state.dataLists;

    if (data && data.status === 200 && data.result.data) {
      data.list = data.result.data;

      data.pagination = {
        total: data.result.total,
        current: this.state.pageindex,
        pageSize: this.state.pagesize,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: true,
      };
      dataList = data.list;
    }
    for (let i = 0; i < dataList.length; i++) {
      const detail = dataList[i].details;
      dataList[i].key = `offline_${i}`;
      let num = 0;
      for (let z = 0; z < detail.length; z += 1) {
        num += detail[z].num;
      }
      dataList[i].num = num;
    }
    this.setState({ dataLists: dataList })

    const columns = [
      {
        title: '线下调货单编号',
        dataIndex: 'id',
        key: 'id',
        // render: (val, record) => {
        //   return <a onClick={e => this.hadl(e, val, record)}>{val}</a>;
        // },
        render: (val, record, idx) => {
          return (
            <span>
              <Icon
                title='二维码'
                type="qrcode"
                style={{ marginRight: 5 }}
                onMouseOver={(e) => { e.target.style.cursor = 'pointer' }}
                onClick={e => { this.tableClick(val) }}
              />
              {val}
              <Icon
                title='修改'
                type="edit"
                style={{ marginLeft: 5 }}
                onMouseOver={(e) => { e.target.style.cursor = 'pointer' }}
                onClick={e => { this.editData(val, idx) }}
              />
            </span>
          )
        }
      },
      {
        title: '供应商',
        dataIndex: 'clientsupplyid',
        key: 'clientsupplyid',
        render: val => this.state.userLists[val],
      },
      {
        title: '送货方式',
        dataIndex: 'deliveryway',
        key: 'deliveryway',
        render: val => {
          if (val === 0) {
            return '自提';
          } else if (val === 1) {
            return '快递';
          } else if (val === 2) {
            return '物流';
          } else if (val === 3) {
            return '送货上门';
          } else {
            return '无';
          }
        }
      },
      {
        title: '入库方式',
        dataIndex: 'entryway',
        key: 'entryway',
        render: val => {
          if (val === 0) {
            return '打码入库';
          } else if (val === 2) {
            return '总数入库';
          } else {
            return '无';
          }
        }
      },
      // {
      //   title: '最早货期',
      //   dataIndex: 'deliverydate',
      //   key: 'deliverydate',
      // },
      {
        title: '创建时间',
        dataIndex: 'createdate',
        key: 'createdate',

        render: val => getMyDate(val),
      },
      {
        title: '采购数量（Kg）',
        dataIndex: 'num',
        key: 'num',
      },
      {
        title: '货款',
        dataIndex: 'goodspay',
        key: 'goodspay',
        render: val => `￥ ${val}`,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
      },
      {
        title: '状态',
        dataIndex: 'arrangestatus',
        key: 'arrangestatus',
        render: val => {
          if (val === 0) {
            return <span style={{ color: '#f00' }}>待收</span>;
          } else if (val === 1) {
            return '已收';
          } else if (val === 2) {
            return '关闭';
          } else {
            return '无状态';
          }
        }
      }
    ];
    return (
      <PageHeaderLayout title="线下调货单">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div>
              <Button type="primary" onClick={this.clickAdd}>
                添加
              </Button>
            </div>
            <div className={styles.tableListOperator} />
            <Table
              rowKey={record => record.key}
              pagination={data.pagination}
              onChange={this.handleStandardTableChange}
              dataSource={dataList}
              columns={columns}
            />
            <Modal
              visible={this.state.visible}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              width={248}
              closable={false}
              footer={null}
            >
              <QrCode value={this.state.QrData} size={200} />
            </Modal>
            <Drawer
              title=" 线下调货明细"
              placement="right"
              closable={false}
              onClose={this.onClose}
              visible={this.state.visibleDrawer}
              width={1650}
              closable
            >
              <p>线下调货单号：{this.state.listId}</p>
              <p>供应商：{this.state.userLists[this.state.tableData.clientsupplyid]}</p>
              {getFieldDecorator('tableLeft', {})(
                <TableFastLeft dataSource={this.state.tableData} onDrawerClose={this.onClose} visibleDrawer={this.state.visibleDrawer} editFinish={this.editFinish} heard={this.state.dataheard} />
              )}
            </Drawer>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
