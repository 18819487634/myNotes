import React, { PureComponent } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Card, Form, Row, Col, Select, Button, Table, Tabs, Input, message } from 'antd';
import FooterToolbar from 'components/FooterToolbar';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './AccountProfile.less';


import {
  queryPresaleById,
  queryProductids,
  addSale,
  queryPickup,
  queryPickupForid,
  queryactualdetails,
  querycartnodetail,
  getTrackStatusForId,
  querypaydetail,
  queryListClients,
  updatePresaledetail,
  pickupAgain,
  updatePickDetailIds,
  querysupplydictionry,
} from '../../services/api';
import { getMyDate, trackiList, recordstatusList } from '../../utils/utils';

import { getSupplyId } from '../../utils/sessionStorage';

const FormItem = Form.Item;
const { Option } = Select;

const TabPanes = Tabs.TabPane;

// const takewayArr = ["自提","快递","物流","送货上门"];

const areaMap = new Map();;

@connect(({ inquiry, loading }) => ({
  inquiry,
  loading: loading.models.inquiry,
}))
@Form.create()
export default class AccountProfile extends PureComponent {
  state = {
    panes1: [],
    panes: [],
    activeKey: '1',
    pageindex: 1,
    pagesize: 10,

    anroindex: 1,
    anrosize: 10,
    endindex: 1,
    endsize: 10,
    waitindex: 1,
    waitsize: 10,
  };

  componentDidMount() {
    const params = 'terms[0].value=3&terms[0].column=type';
    querysupplydictionry(params).then(res => {
      if (res && res.status === 200) {
       
        const datas = res.result.data;
        datas.forEach(item => {
          areaMap.set(item.value, item.key);
          
        });
        const endTerms = `terms[0].value=3&terms[0].column=recordstatus&pageSize=10&pageIndex=0&sorts[0].name=id&sorts[0].order=desc`;

    this.query(endTerms, '1');
      }
    });
    
    // this.queryAear();
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };


  query = (terms, restatus) => {
    const trackids = [];
    const userList = [];
    queryPickup(terms).then(response => {
      if (response && response.status === 200) {
        const arr = response.result.data;

        for (let i = 0; i < arr.length; i += 1) {
          arr[i].key = `pickup${arr[i].recordstatus}${i}`;
          trackids.push(arr[i].trackid);
          if (
            `${arr[i].clientid}`.indexOf(':') === -1 &&
            userList.indexOf(arr[i].clientid) === -1
          ) {
            userList.push(arr[i].clientid);
          }
        }
        if (userList.length === 0) {
          userList.push(null);
        }
        if (trackids.length === 0) {
          trackids.push(null);
        }
        getTrackStatusForId(trackids).then(res => {
          if (res && res.status === 200) {
            let trackData = [];
            const results = res.result;
            const resultmap = new Map();
            const trackmap = new Map();
            for (const key in results) {
              if (key in results) {
                trackData = results[`${key}`];

                trackData.reverse((a, b) => a.buildtime < b.buildtime);
                resultmap.set(key, trackData[0].type);
                trackmap.set(key, trackData);
              }
            }
            for (let z = 0; z < arr.length; z += 1) {
              arr[z].trackStatus = resultmap.get(arr[z].trackid);
            }
            

            queryListClients(userList).then(lres => {
              if (lres && lres.status === 200) {
                const userData = lres.result;
                if (userData !== undefined) {
                  for (let i = 0; i < arr.length; i += 1) {
                    if (`${arr[i].clientid}`.indexOf(':') === -1) {
                      arr[i].userid = arr[i].clientid;
                      arr[i].clientid = userData[arr[i].clientid];
                    }
                  }
                }

                const columns = [
                  {
                    title: '银行',
                    dataIndex: 'id',
                    key: 'id',
                    
                  },
                  {
                    title: '银行收款账号',
                    dataIndex: 'clientid',
                    key: 'clientid',
                  },

                  {
                    title: '收款人',
                    dataIndex: 'presaleid',
                    key: 'presaleid',
                  },
                  {
                    title: '开户行',
                    dataIndex: 'presaleid',
                    key: 'presaleid',
                  },
                  {
                    title: '行号',
                    dataIndex: 'presaleid',
                    key: 'presaleid',
                  },
                  {
                    title: '账户类型',
                    dataIndex: 'presaleid',
                    key: 'presaleid',
                  },
                 
                  {
                    title: '备注',
                    dataIndex: 'comment',
                    key: 'comment',
                  },
                 
                ];

                const pagination = {
                  total: response.result.total,
                  current: this.state.pageindex,
                  pageSize: this.state.pagesize,
                  showTotal: () => {
                    return `共${response.result.total}条`;
                  },
                  showQuickJumper: true,
                };

                let titile = '';
                if (restatus === '1') {
                  titile = '银行卡';
                } else if (restatus === '2') {
                  titile = '支付宝';
                } else if (restatus === '3') {
                  titile = '微信';
                }
                const panes2 = this.state.panes1;
                const panes = {
                  title: titile,
                  content: (
                    <div>
                      <Table
                        pagination={pagination}
                        rowKey={record => record.key}
                        dataSource={arr}
                        onChange={e => this.handleStandardTableChange(e, restatus)}
                        columns={columns}
                      />
                    </div>
                  ),
                  key: restatus,
                  closable: false,
                };
                const paness = this.state.panes;
                if (paness.length > 3) {
                  panes2.push(panes);
                } else {
                  panes2.push(panes);
                  if (panes2.length === 1) {
                    const abnTerms = `terms[0].value=4&terms[0].column=recordstatus&pageSize=12&pageIndex=0&sorts[0].name=id&sorts[0].order=desc`;
                    this.query(abnTerms, '2');
                  } else if (panes2.length === 2) {
                    const waitTerms = `terms[0].value=2&terms[0].column=recordstatus&pageSize=12&pageIndex=0&sorts[0].name=id&sorts[0].order=desc`;

                    this.query(waitTerms, '3');
                  }
                }
                setTimeout(
                  this.setState({
                    panes: panes2,
                    panes1: panes2,
                    trackmap,
                    columns,
                  }),
                  0
                );
              }
            });
          }
        });
      }
    });
  };
  
  handleStandardTableChange = (pagination, restatus) => {
    const { form } = this.props;
    form.validateFields(err => {
      if (err) return;
      let terms = '';
      if (restatus === '1') {
        terms = `terms[0].value=3&terms[0].column=recordstatus&pageSize=${
          pagination.pageSize
        }&pageIndex=${pagination.current - 1}&sorts[0].name=id&sorts[0].order=desc`;
        this.setState({
          endindex: pagination.current,
          endsize: pagination.pageSize,
        });
      } else if (restatus === '2') {
        terms = `terms[0].value=4&terms[0].column=recordstatus&pageSize=${
          pagination.pageSize
        }&pageIndex=${pagination.current - 1}&sorts[0].name=id&sorts[0].order=desc`;
        this.setState({
          anroindex: pagination.current,
          anrosize: pagination.pageSize,
        });
      } else if (restatus === '3') {
        terms = `terms[0].value=2&terms[0].column=recordstatus&pageSize=${
          pagination.pageSize
        }&pageIndex=${pagination.current - 1}&sorts[0].name=id&sorts[0].order=desc`;
        this.setState({
          waitindex: pagination.current,
          waitsize: pagination.pageSize,
        });
      }

      this.queryChagne(terms, restatus);
    });
  };
  queryChagne = (terms, restatus) => {
    queryPickup(terms).then(response => {
      if (response && response.status === 200) {
        const arr = response.result.data;
        const trackids = [];
        const userList = [];
        for (let i = 0; i < arr.length; i += 1) {
          trackids.push(arr[i].trackid);
          if (
            `${arr[i].clientid}`.indexOf(':') === -1 &&
            userList.indexOf(arr[i].clientid) === -1
          ) {
            userList.push(arr[i].clientid);
          }
        }
        if (trackids.length === 0) {
          trackids.push(null);
        }
        getTrackStatusForId(trackids).then(res => {
          if (res && res.status === 200) {
            let trackData = [];
            const results = res.result;
            const resultmap = new Map();
            const trackmap = new Map();
            for (const key in results) {
              if (key in results) {
                trackData = results[`${key}`];

                trackData.reverse((a, b) => a.buildtime < b.buildtime);
                resultmap.set(key, trackData[0].type);
                trackmap.set(key, trackData);
              }
            }

            let pagination = {};

            if (restatus === '1') {
              pagination = {
                total: response.result.total,
                current: this.state.endindex,
                pageSize: this.state.endsize,
                showTotal: () => {
                  return `共${response.result.total}条`;
                },
                showQuickJumper: true,
              };
            } else if (restatus === '2') {
              pagination = {
                total: response.result.total,
                current: this.state.anroindex,
                pageSize: this.state.anrosize,
                showTotal: () => {
                  return `共${response.result.total}条`;
                },
                showQuickJumper: true,
              };
            } else if (restatus === '3') {
              pagination = {
                total: response.result.total,
                current: this.state.waitindex,
                pageSize: this.state.waitsize,
                showTotal: () => {
                  return `共${response.result.total}条`;
                },
                showQuickJumper: true,
              };
            }
            if (userList.length === 0) {
              userList.push(null);
            }

            queryListClients(userList).then(lres => {
              if (lres && lres.status === 200) {
                const userData = lres.result;
                if (userData !== undefined) {
                  for (let i = 0; i < arr.length; i += 1) {
                    if (`${arr[i].clientid}`.indexOf(':') === -1) {
                      arr[i].clientid = userData[arr[i].clientid];
                      arr[i].userid = userData[arr[i].clientid];
                    }
                  }
                  const paness = this.state.panes;

                  paness[parseInt(restatus, 10) - 1].content = (
                    <div>
                      <Table
                        pagination={pagination}
                        rowKey={record => record.key}
                        dataSource={arr}
                        onChange={e => this.handleStandardTableChange(e, restatus)}
                        columns={this.state.columns}
                      />
                    </div>
                  );
                  this.setState({
                    panes: paness,

                    trackmap,
                  });
                }
              }
            });
          }
        });
      }
    });
  };


  validate = (e, tag) => {
    const { validateFieldsAndScroll } = this.props.form;
    message.config({
      top: 100,
    });
    const hide = message.loading('正在提交...', 0);
    validateFieldsAndScroll((error, values) => {
      if (tag === 2) {// 生成销售单1
        setTimeout(hide, 100);
        const leftData = this.state.presaleData;
        const heardata = this.state.hearData;
        
        this.pickupToSale(heardata,leftData, values.tableright, tag);
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
  updatePresale = values => {
    const pretarmap = values.tableLeft[values.tableLeft.length - 1];

    values.tableLeft.splice(values.tableLeft.length - 1, 1);
    const dataleft = values.tableLeft;
    const pickupdetail = values.tableright;
    const detailData = [];
    const summaryData = [];

    const updatedata = [];
    const updateMap = new Map();
    for (let s = 0; s < dataleft.length; s++) {
      if (dataleft[s].key.indexOf('concat') === -1) {
        if (dataleft[s].updatenum !== 0) {
          updatedata.push(dataleft[s].productid);
          detailData.push(dataleft[s]);
        }
      } else {
        summaryData.push(dataleft[s]);
      }
    }
    if (pretarmap.size !== undefined && pretarmap.size !== 0) {
      for (const item of pretarmap.keys()) {
        const pickarr = pretarmap.get(item);

        pickarr.forEach(it => {
          if (updatedata.indexOf(it.productid) > -1) {
            updateMap.set(it.goodentryids, it.output);
          }
        });
      }
      for (let s = 0; s < detailData.length; s++) {
        for (let z = 0; z < pickupdetail.length; z++) {
          if (detailData[s].productid === pickupdetail[z].productid) {
            if (updateMap.get(pickupdetail[z].goodentryids)) {
              detailData[s].pickdetailid = pickupdetail[z].id;
              detailData[s].detailnum = updateMap.get(pickupdetail[z].goodentryids);
            } else {
              detailData[s].detailnum = null;
            }
          }
        }
        updatePresaledetail(detailData[s]).then(res => {
          if (res && res.status === 200) {
            message.success('提交成功！');
          }
        });
      }
    }
  };
  validateAnromal = (e, tag, flag) => {
    const { validateFieldsAndScroll } = this.props.form;
    message.config({
      top: 100,
    });
    const hide = message.loading('正在提交...', 0);
    validateFieldsAndScroll((error, values) => {
      if (tag === 2) {
        // 修改预售单详情

        setTimeout(hide, 100);
        this.updatePresale(values);
      } else if (tag === 4) {
        // 生成销售单
        setTimeout(hide, 100);
        
        const leftData = this.state.yichangData;
        const heardata = this.state.yichangTop;
        this.pickupToSale(heardata, leftData, values.tableright, tag);
      } else if (tag === 3) {
        const paramData = {
          details: [],
        };
        const againdata = [];// 重新拣货的产品id
        const pretarmap = values.tableLeft[values.tableLeft.length - 1];
        values.tableLeft.splice(values.tableLeft.length - 1, 1);
        const dataleft = values.tableLeft;
        const pickupList =this.state.yichangPickup;// 右侧拣货单明细
        const detailData = [];// 需要重新拣货产品明细
        const errPickupIdS = [];
        for (let s = 0; s < dataleft.length; s++) {
          if (dataleft[s].key.indexOf('concat') === -1) {
            if (dataleft[s].againnum !== 0) {
              againdata.push(dataleft[s].productid);
              detailData.push(dataleft[s]);
            }
          }
        }

        for(let p=0;p<pickupList.length;p+=1){
          if(pickupList[p].status ===1&&againdata.indexOf(pickupList[p].productid)>-1){
           
            errPickupIdS.push(pickupList[p].id);
          }
          
        }
        const pickupdata = [];
        const productidset = new Set();

        if (pretarmap.size !== undefined && pretarmap.size !== 0) {
          for (const item of pretarmap.keys()) {
            // 遍历map

            const pickarr = pretarmap.get(item).map(items => ({ ...items }));
            // 遍历出来的map ，生成库存明细数组 ，set所有的productId
            for (let it = 0; it < pickarr.length; it++) {
              if (againdata.indexOf(pickarr[it].productid )> -1) {
                const demo = {
                  picknum: pickarr[it].output,
                  goodentryids: pickarr[it].id,
                  batchno: pickarr[it].batchno,
                  productid: pickarr[it].productid,
                  area: pickarr[it].area,
                  location: pickarr[it].locations,
                };

                pickupdata.push(demo);
                productidset.add(pickarr[it].productid);
              }
            }

            paramData.clientid = values.tableTop[0].clientid;
            paramData.supplyid = getSupplyId();

            paramData.details = pickupdata; // 拣货明细
            paramData.presaleid = values.tableTop[0].id;
            paramData.status = values.tableTop[0].ismerge; // 状态
            paramData.takingway = values.tableTop[0].takeway; // 取货方式
            paramData.payment = values.tableTop[0].payway; // 结款方式
            paramData.invoiceid = values.tableTop[0].id; // 单号
          }
       
         
          pickupAgain(paramData).then(res => {
            setTimeout(hide, 100);
            if (res && res.status === 200) {
              message.success('提交成功！');
              updatePickDetailIds(errPickupIdS).then(errRes=>{
                if(errRes && errRes.status ===200){
                  const terms = `terms[0].value=1&terms[0].column=type`;
                 this.query(terms);
                }
              });
              
            } else if (res && res.status === 500) {
              message.error('提交失败！');
            } else if (res && res.status === 404) {
              message.error('已经提交拣货单，不需要再提交！');
            }
          });
        } else {
          setTimeout(hide, 100);
          message.error('请选择库存');
        }
      }
    });
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

  render() {
    const panemap = this.state.panes;
    // panemap[0].content = (
    //   <div>

    //     <Table
    //       pagination={false}

    //       dataSource={this.state.arr}

    //       columns={this.state.columns}
    //     />
    //   </div>

    // );

    return (
      <PageHeaderLayout title="大货拣货单">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>

            <div className={styles.tableListOperator} />

            <Tabs
              hideAdd
              onChange={this.onChange}
              activeKey={this.state.activeKey}
              type="editable-card"
              onEdit={this.onEdit}
            >
              {panemap.map(pane => (
                <TabPanes tab={pane.title} key={pane.key} closable={pane.closable}>
                  {pane.content}
                </TabPanes>
              ))}
            </Tabs>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
