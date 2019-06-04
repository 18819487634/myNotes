import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Row,
  Col,
  Select,
  Button,
  Table,
  Tabs,
  Input,
  message,
  DatePicker,
} from 'antd';
import FooterToolbar from 'components/FooterToolbar';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './DeliverProfile.less';
import TableTop from './TableTop';
import TableLeft from './TableLeft';

import {
  querySaleDetail,
  queryProductids,
  queryPresaleById,
  queryPickupForid,
  queryactualdetails,
  querycartnodetail,
  queryDelivery,
  queryDeliveryForId,
  getTrackStatusForId,
  updateDelivery,
  queryErpClient,
  queryListClients,
} from '../../services/api';
import { routerRedux } from 'dva/router';
import { trackiList, recordstatusList } from '../../utils/utils';
import DeliveryDetails from './DeliveryDetails';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Option } = Select;
let dataList = [];
const TabPanes = Tabs.TabPane;

const takewayArr = ['自提', '快递', '物流', '送货上门'];

const recordstatusArr = ['正常', '加急'];

@connect(({ delivery, loading }) => ({
    delivery,
  loading: loading.models.delivery,
}))
@Form.create()
export default class DeliverProfile extends PureComponent {
  state = {
    panes: [{ key: '1' }],
    activeKey: '1',
  };

  componentDidMount() {
    const terms = `pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
    this.props.dispatch({
        type:'delivery/fetch',
        payload:terms,
    })
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  query = terms => {
    queryDelivery(terms).then(response => {
      if (response && response.status === 200) {
        const arr = response.result.data;
        const trackids = [];
        const userList = [];
        for (let i = 0; i < arr.length; i += 1) {
          arr[i].key = `deliver${i}`;
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
            const trackMap = new Map();
            for (const key in results) {
              if (key in results) {
                trackData = results[`${key}`];

                trackData.reverse((a, b) => a.buildtime < b.buildtime);
                resultmap.set(key, trackData[0].type);
                trackMap.set(key, trackData);
              } 
            } 
            for (let z = 0; z < arr.length; z += 1) {
              arr[z].recordstatus = resultmap.get(arr[z].trackid);
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
                    }
                  }
                  const columns = [
                    {
                      title: '出库单编号',
                      dataIndex: 'id',
                      key: 'id',
                      // render: (val, index, record) => (
                      //   <a onClick={e => this.hadl(e, val, record)}>{val}</a>
                      // ),
                    },
                    {
                      title: '客户',
                      dataIndex: 'clientid',
                      key: 'clientid',
                    },
                    // {
                    //   title: '出库单状态',
                    //   dataIndex: 'status',
                    //   key: 'status',
                    // },
                    {
                      title: '销售单号 ',
                      dataIndex: 'saleid',
                      key: 'saleid',
                    },
                    // , {
                    //   title: '送货方式',
                    //   dataIndex: 'mode',
                    //   key: 'mode',
                    // }, {
                    //     title: '车牌/物流单号',
                    //     dataIndex: 'number',
                    //     key: 'number',
                    //   }, {
                    //     title: '配送人',
                    //     dataIndex: 'giver',
                    //     key: 'giver',

                    //   },{
                    //     title: '手机',
                    //     dataIndex: 'phone',
                    //     key: 'phone',

                    //   }, {
                    //   title: '备注',
                    //   dataIndex: 'comment',
                    //   key: 'comment',
                    //   render:val=>val===undefined?`￥ 0`:`￥ ${val}`,
                    // },
                    {
                      title: '跟踪状态',
                      dataIndex: 'recordstatus',
                      key: 'recordstatus',

                      render(val) {
                        return <span>{recordstatusList[val]}</span>;
                      },
                    },
                  ];

                  const panes = [
                    {
                      title: '出库单列表',
                      content: (
                        <div>
                          <Table pagination={false} dataSource={arr} columns={columns} />
                        </div>
                      ),
                      key: '1',
                      closable: false,
                    },
                  ];
                  this.setState({
                    panes,
                    arr,
                    columns,
                    trackMap,
                  });
                }
              }
            });

            // const arr =dataTop;
          }
        });
      }
    });
  };
  validate = () => {
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((error, values) => {
      
      const params = {};
      const tableTops = values.tableTop;

      params.sendplace = tableTops[0].address;
      params.id = tableTops[0].id;
      params.expressno = tableTops[0].expressno;
      params.deliveryman = tableTops[0].deliveryman;
      params.deliveryphone = tableTops[0].deliveryphone;
      params.status = tableTops[0].status;
      params.takeway = tableTops[0].takeway;
      // params.expressid = tableTop[0].expressno;
     

      updateDelivery(params).then(res => {
        if (res && res.status === 200) {
          message.success('提交成功!');
          this.props.dispatch(routerRedux.push(`/order/sale`));
        }
      });
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

  hadl = (e, val, record) => {
    message.config({
      top: 100,
    });
    const hide = message.loading('正在读取，请稍候...', 0);
    const paness = this.state.panes;
    const { getFieldDecorator } = this.props.form;

    const params = {id :record.id,clientname:record.clientname};
    setTimeout(hide, 100);
    if (paness.length === 1) {
      const activeKey = '2';
      paness.push({
        title: '出库单详情',
        content: (
          <Form
            onSubmit={this.validate}
            layout="vertical"
            hideRequiredMark
          >
            <div>

              <div style={{ width: '100%', overflowX: 'auto' }}>
                {getFieldDecorator('tableLeft', {
                })(<DeliveryDetails dataSource={params} />)}
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
            <FormItem label="出库单编号">
              {getFieldDecorator('id')(<Input placeholder="" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="客户">
              {getFieldDecorator('userid')(<Input placeholder="" />)}
            </FormItem>
          </Col>

          <Col md={6} sm={24}>
            <FormItem label=" 出库单状态">
              {getFieldDecorator('status')(
                <Select placeholder="">
                  <Option value={0}>正常</Option>
                  <Option value={1}>加急</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="送货方式">
              {getFieldDecorator('mode')(
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

        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="车牌/物流单号">
              {getFieldDecorator('number')(<Input placeholder="" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="配送人">
              {getFieldDecorator('giver')(<Input placeholder="" />)}
            </FormItem>
          </Col>

          <Col md={6} sm={24}>
            <FormItem label=" 跟踪状态">
              {getFieldDecorator('status')(
                <Select placeholder="">
                  <Option value={0}>等待</Option>
                  <Option value={1}>送货中</Option>
                  <Option value={2}>已完成</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="备注">
              {getFieldDecorator('comment')(<Input placeholder="" />)}
            </FormItem>
          </Col>
        </Row>

        <Row gutter={{ md: 4, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="日期">
              {getFieldDecorator('dateRange')(
                <RangePicker placeholder={['开始日期', '结束日期']} style={{ width: '100%' }} />
              )}
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
    const {delivery:{data},loading} = this.props;
    let  pagination = {}
    

    if (data && data.status === 200 && data.result.data) {
      data.list = data.result.data;
      pagination = {
        total: data.result.total,
        current: this.state.pageindex,
        pageSize: this.state.pagesize,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: false,
      };
      dataList = data.list;
    }
    const columns = [
        {
          title: '出库单编号',
          dataIndex: 'id',
          key: 'id',
          // render: (val, index, record) => (
          //   <a onClick={e => this.hadl(e, val, record)}>{val}</a>
          // ),
        },
        {
          title: '客户',
          dataIndex: 'clientname',
          key: 'clientname',
        },
        {
          title: '销售单号 ',
          dataIndex: 'saleid',
          key: 'saleid',
        },

        {
          title: '跟踪状态',
          dataIndex: 'recordstatus',
          key: 'recordstatus',

          render(val) {
            return <span>{recordstatusList[val]}</span>;
          },
        },
      ];
    return (
      <PageHeaderLayout title="出库单">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator} />

            <Table 
              rowKey="id"
              loading={loading}
              dataSource={dataList}
              columns={columns}
              pagination={pagination}
              bordered
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
