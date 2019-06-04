import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Row, Col, Select, Button, Table, Tabs, Input, message } from 'antd';
import FooterToolbar from 'components/FooterToolbar';
import { routerRedux } from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './ChaseProfile.less';
import TableTop from './TableTop';
import TableLeft from './TableLeft';

import {
  queryPresale,
  queryPresaleById,
  queryProductids,
  addPickUp,
  canChangePrice,
  updatePrease,
  getTrackStatusForId,
  queryErpClient,
  querysupplydictionry,
  queryListClients,
  queryDeliveryWay,
} from '../../services/api';
import { getMyDate, trackiList, recordstatusList, ismergeList } from '../../utils/utils';
import { getSupplyId } from '../../utils/sessionStorage';

const FormItem = Form.Item;
const { Option } = Select;
let dataTop = [];
let dataLeft = [];
const TabPanes = Tabs.TabPane;

const takewayArr = ['自提', '快递', '物流', '送货上门'];

const recordstatusArr = ['正常', '加急'];
const areaMap = new Map();
const takewayMap = new Map();

@connect(({ inquiry, loading }) => ({
  inquiry,
  loading: loading.models.inquiry,
}))
@Form.create()
export default class ChaseProfile extends PureComponent {
  state = {
    panes: [{ key: '1' }],
    activeKey: '1',
  };

  componentDidMount() {

    const supplyids = [getSupplyId()];
      const param =`terms[0].value=${supplyids}&terms[0].column=supplyid&terms[1].value=0&terms[1].column=issupply`;
      queryErpClient(param).then((response)=>{// 加载客户信息 
        if(response && response.status===200){
          const custarr= [];
          const list = response.result.data;
           
            for(let i=0;i<list.length;i++){
              custarr.push(<Option key={i} value={list[i].id}>{`${list[i].name}`}</Option>);
            }
            const params = 'terms[0].value=3&terms[0].column=type';
            querysupplydictionry(params).then(res => {
            if (res && res.status === 200) {
             
              const datas = res.result.data;
              datas.forEach(item => {
                areaMap.set(item.value, item.key);
                
              });
              const wayterms = `sorts[0].value=no&sorts[0].order=asc`;
              queryDeliveryWay(wayterms).then(resp=>{
                if(resp && resp.status ===200){
                  resp.result.data.forEach(item=>{
                    takewayMap.set(item.value,item.name);
                  })
                  this.setState({
                    custarr,
                  })
                  const terms =`terms[0].value=1&terms[0].column=type&pageIndex=0&pageSize=10&sorts[0].name=makedate&sorts[0].order=desc`;
                  this.query(terms); 
                }
              })
            
            }
          });
              
            
          }
        })
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  query = terms => {
    queryPresale(terms).then(response => {
      if (response && response.status === 200) {
        const arr = response.result.data;
        const trackids = [];
        const userList = [];
        for (let i = 0; i < arr.length; i += 1) {
          if(`${arr[i].clientid}`.indexOf(":")===-1 &&userList.indexOf(arr[i].clientid)===-1){
            userList.push(arr[i].clientid);
          }
          trackids.push(arr[i].trackid);
        }

        arr.reverse((a, b) => a.makedate < b.makedate);
        if (trackids.length === 0) {
          trackids.push(null);
        }
        if(userList.length===0){
          userList.push(null);
        }
        
        queryListClients(userList).then(cres=>{
          if(cres && cres.status === 200){
            const userData = cres.result;
            for (let i = 0; i < arr.length; i += 1) {
              
              if(`${arr[i].clientid}`.indexOf(":")===-1){
                
                arr[i].clientids = userData[arr[i].clientid];
                
              }
             
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
                    trackData.reverse((a, b) => {
                      if (a.buildtime === b.buildtime) {
                        return a.type > b.type;
                      } else {
                        return a.buildtime < b.buildtime;
                      }
                    });
                    resultmap.set(key, trackData[0].type);
                    trackmap.set(key, trackData);
                  }
                }
                for (let z = 0; z < arr.length; z += 1) {
                  arr[z].key = `presaleAll${z}`;
                  arr[z].status = resultmap.get(arr[z].trackid);
                  arr[z].takewayname = takewayMap.get(`${arr[z].takeway}`);
                }
                const pagination ={
                  total: response.result.total,
                  current:  this.state.pageindex,
                  pageSize: this.state.pagesize,
                  showTotal: () => {
                    return `共${response.result.total}条`;
                  },
                  showQuickJumper: true,
                }
                const columns = [
                  {
                    title: '欠货单编号',
                    dataIndex: 'id',
                    key: 'id',
                    render: (val, record) => {
                      return <a onClick={e => this.hadl(e, val, record)}>{val}</a>;
                    },
                  },
                  {
                    title: '客户',
                    dataIndex: 'clientids',
                    key: 'clientids',
                  },
                  {
                    title: '时间 ',
                    dataIndex: 'makedate',
                    key: 'makedate',
                    render: val => getMyDate(val),
                  },
                  {
                    title: '备注',
                    dataIndex: 'comment',
                    key: 'comment',
                  },
                  {
                    title: '取货方式',
                    dataIndex: 'takewayname',
                    key: 'takewayname',
                  },
                  // {
                  //   title: '数量（Kg）',
                  //   dataIndex: 'num',
                  //   key: 'num',
                  // },
                  {
                    title: '金额',
                    dataIndex: 'goodpay',
                    key: 'goodpay',
                    render: val => (val === undefined ? `￥ 0` : `￥ ${val}`),
                  },
                  {
                    title: '状态',
                    dataIndex: 'ismerge',
                    key: 'ismerge',
                    render(val) {
                      return <span>{recordstatusList[val]}</span>;
                    },
                  },
                  {
                    title: '跟踪状态',



                    dataIndex: 'status',
                    key: 'status',
                    render(val) {
                      return <span>{trackiList[val]}</span>;
                    },
                  },
                ];
                this.setState({
                  arr,
                  trackmap,
                },()=>{
                  const panes1 = {
                    title:'欠货单列表',
                    content:(
                      <Table 
                        pagination={pagination}
                        
                        dataSource={this.state.arr}
                        onChange={this.handleStandardTableChange}
                        columns={columns}
                      />
                    ),
                    key:'1',
                    closable:false}
                    const paness1=[];
                  if(this.state.panes.length===1){
                    paness1.push(panes1);
                  }else{
                    const panes2 =this.state.panes[1];
                    paness1.push(panes1);
                    paness1.push(panes2);
                  }
                  
      
                    this.setState({
                      panes:paness1,
                    })
                });
                
                
              }
            });
          }
        });
        
      }
    });
  };

  updatePrice = (error, values) => {
    const dataParams = values.tableLeft;
    dataParams.splice(dataParams.length - 1, 1);
    const detailData = [];
    const summaryData = [];
    for (let e = 0; e < dataParams.length; e++) {
      if (dataParams[e].key.indexOf('concat') === -1) {
        detailData.push(dataParams[e]);
      } else {
        summaryData.push(dataParams[e]);
      }
    }
    const params = {};
    params.id = values.tableTop[0].id;
    params.type = 0;
    params.details = detailData;

    updatePrease(params).then(res => {
      if (res && res.status === 200) {
        message.success('修改价格成功！');
      }
    });
  };
  validate = (e, tag, flag) => {
    const { validateFieldsAndScroll } = this.props.form;
    message.config({
      top: 100,
    });
    const hide = message.loading('正在提交...', 0);
    validateFieldsAndScroll((error, values) => {
      if (tag === 1 && flag === true) {
        this.updatePrice(error, values);
        setTimeout(hide, 100);
      } else if (tag === 1 && flag === false) {
        message.error('您没有权限处理');
        setTimeout(hide, 100);
      } else if (tag === 3) {
       
        const paramData = {
          details: [],
        };
        const pretarmap = values.tableLeft[values.tableLeft.length - 1];
        const pickupdata = [];
        const productidset = new Set();

        if (pretarmap && pretarmap.size !== 0) {
          for (const item of pretarmap.keys()) {
            // 遍历map

            const pickarr = pretarmap.get(item).map(items => ({ ...items }));
            // 遍历出来的map ，生成库存明细数组 ，set所有的productId
            for (let it = 0; it < pickarr.length; it++) {
              const demo = {
                picknum: pickarr[it].output,
                goodentryids: pickarr[it].id,
                batchno: pickarr[it].batchno,
                productid: pickarr[it].productid,
                batchnostatus: pickarr[it].batchnostatus,
                area: pickarr[it].area,
                piece:pickarr[it].piece,
                completestatus:pickarr[it].completestatus,
              };
             
              pickupdata.push(demo);
              productidset.add(pickarr[it].productid);
            }
            paramData.details = pickupdata; // 拣货明细
            paramData.presaleid = values.tableTop[0].id;
            paramData.supplyid = getSupplyId();
            paramData.clientid = values.tableTop[0].clientid;

            paramData.status = values.tableTop[0].ismerge; // 状态
            paramData.takingway = values.tableTop[0].takeway; // 取货方式
            paramData.payment = values.tableTop[0].payway; // 结款方式
            paramData.invoiceid = values.tableTop[0].id; // 单号
          }
          addPickUp(paramData).then(res => {
            setTimeout(hide, 100);
            if (res && res.status === 200) {
              message.success('提交成功！');
              this.props.dispatch(routerRedux.push(`/goods/goodsstock`));
            } else if (res.status === 500) {
              message.error('提交失败！');
            } else if (res.status === 404) {
              message.error('已经提交拣货单，不需要再提交！');
            }
          });
        } else {
          message.error('请选择库存');
        }
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

 
  formatTerms=(params)=>{
    const keys =[];
    const values =[];
    Object.keys(params).forEach((key)=>{
        
        if(params[key] !== undefined && params[key] !== "" ){
            keys.push(key);
            values.push(params[key]);
        }
        
   
   });
   let terms = `pageIndex=0&pageSize=10&sorts[0].name=makedate&sorts[0].order=desc&terms[0].value=1&terms[0].column=type`;
   if(keys.length>0){
    terms+= `&`;
   }
   
   for(let i=0;i<keys.length;i++){
     if(keys.length===1){
        terms += `terms[1].value=${values[i]}&terms[1].column=${keys[i]}`;
     }else{
        terms += `terms[${i+1}].value=${values[i]}&terms[${i+1}].column=${keys[i]}`;
        if(keys.length !== i+1){
            terms +='&'
        } 
     }
   }
   
   return terms;
}
  hadl = (e, val, record) => {
    const paness = this.state.panes;
    const { getFieldDecorator } = this.props.form;

    const productids = [];
    let changeTag = false;
    canChangePrice(`clientid=${record.usrid}`).then(resn => {
      if (resn && resn.status === 200) {
        if (resn.result === true) {
          changeTag = true;
        }
      } else if (resn.status === 403) {
        message.error(resn.message);
      }
      queryPresaleById(val).then(response => {
        if (response && response.status === 200) {
          dataTop = [];

          dataTop.push(response.result);
          dataTop[0].takewayname = record.takewayname;
          dataTop[0].clientids = record.clientids;
          for (let i = 0; i < dataTop.length; i += 1) {
            dataTop[i].key = `ownTop${i}`;
          }

          dataLeft = response.result.details;
          for (let i = 0; i < dataLeft.length; i += 1) {
            dataLeft[i].key = `ownLeft${i}`;
            dataLeft[i].changeTag = changeTag;
            dataLeft[i].usrid = record.usrid;
            productids.push(dataLeft[i].productid);
          }
          const map = this.state.trackmap;
          
          dataLeft.payment = response.result.payment;
          dataLeft.goodpay = response.result.goodpay;
          dataLeft.payway = response.result.payway;
          dataLeft.taxrate = response.result.taxrate;
          dataLeft.taxratenum = parseFloat((dataLeft.goodpay*dataLeft.taxrate).toFixed(2));
          dataLeft.takeway = response.result.takeway;
          dataLeft.pickwaste = response.result.pickwaste;
          dataLeft.securepay = response.result.securepay;
          dataLeft.shippay = response.result.shippay;
          dataLeft.sumneedpay =
           (dataLeft.goodpay  + dataLeft.securepay + dataLeft.shippay +dataLeft.taxratenum).toFixed(2);
           dataLeft.needpay =
           (dataLeft.goodpay  + dataLeft.securepay + dataLeft.shippay +dataLeft.taxratenum-dataLeft.pickwaste).toFixed(2);
          dataLeft.trackData = map.get(record.trackid);
          queryProductids(productids).then(res => {
            if (res && res.status === 200) {
              const productData = res.result;
              
                for (let z = 0; z < dataLeft.length; z += 1) {
                  for (let j = 0; j < productData.length; j += 1) {
                  if (productData[j].id === dataLeft[z].productid) {

                    const product01Entity ={
                      picture :productData[j].picture,
                      seriesname :productData[j].productseries.seriesname,
                      kindname :productData[j].productkind.kindname,
                      productname:productData[j].productname,
                      colorname : productData[j].colorname,
                      productid:productData[j].id, 
                      }
                      
                      
                      dataLeft[z].product01Entity = product01Entity;
                  }
                  
                }
                
              }

              if (paness.length === 1) {
                const activeKey = '2';
                paness.push({
                  title: '欠货单详情',
                  content: (
                    <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
                      <div>
                        {getFieldDecorator('tableTop', {
                          initialValue: dataTop,
                        })(<TableTop />)}

                        <div style={{ width: '100%', overflowX: 'auto' }}>
                          {getFieldDecorator('tableLeft', {
                            initialValue: dataLeft,
                          })(<TableLeft />)}
                          <div>
                            <FooterToolbar style={{ width: this.state.width }}>
                              <Button
                                type="primary"
                                onClick={es => this.validate(es, 1, changeTag)}
                              >
                                修改价格
                              </Button>
                              {/* <Button type="primary" onClick={e=>this.validate(e,2)}>
                                   生成销售单
                                  </Button> */}
                              <Button type="primary" onClick={ed => this.validate(ed, 3)}>
                                生成拣货单
                              </Button>
                            </FooterToolbar>
                          </div>
                        </div>
                      </div>
                    </Form>
                  ),
                  key: activeKey,
                });

                this.setState({ panes: paness, activeKey });
              } else {
                this.setState({ activeKey: '2' });
              }
            }
          });
        }
      });
    });
  };
  handleStandardTableChange = pagination => {
    const { form } = this.props;
    form.validateFields((err,feildvalues) => {
      if (err) return;
      const params = feildvalues;
      params.type = 1;
      this.setState({
        pageindex : pagination.current,
        pagesize : pagination.pageSize,
      })
      const values = this.createTerms(params, pagination.current-1,pagination.pageSize);
     // const terms = `terms[0].value=0&terms[0].column=type&pageSize=${pagination.pageSize}&pageIndex=${pagination.current-1}`
      this.query(values);
      
    });
  }

  createTerms = (obj, pageIndex = 1, pageSize = 12) => {
    let i = 0;
    let params = `pageIndex=${pageIndex}&pageSize=${pageSize}&sorts[0].name=makedate&sorts[0].order=desc`;
    Object.keys(obj).forEach(key => {
      if(obj[key]!==undefined){
        params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=${key}`;
      i += 1;
      }
      
    });

    return params;
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
      <Form  layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="编号">
              {getFieldDecorator('id')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="客户">
              {getFieldDecorator('clientid')(
                <Select placeholder="">
                  {this.state.custarr}
                </Select>
            )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label=" 状态">
              {getFieldDecorator('ismerge')(
                <Select placeholder="">

                  {ismergeList.map((item,index)=><Option key={item} value={index}>{item}</Option>)}

                   
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
          
          {/* <Col md={6} sm={24}>
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
          </Col> */}
          <Col md={6} sm={24}>
        
            <div style={{ overflow: 'hidden' }}>
              <span style={{ float: 'right', marginBottom: 24 }}>
                <Button type="primary" onClick={this.handleSearch}>
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


    return (
      <PageHeaderLayout title="欠货单">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator} />
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
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
