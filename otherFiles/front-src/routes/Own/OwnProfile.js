import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Row, Col, Select, Button, Table, Tabs, Input, message } from 'antd';
import FooterToolbar from 'components/FooterToolbar';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './OwnProfile.less';
import TableTop from './TableTop';
import TableLeft from './TableLeft';
import { queryPresaleSpecial } from '../../services/api';
import { recordstatusList } from '../../utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
let dataTop = [
  {
    id: '208007200143425',
    makedate: '2017-07-06',
    usrid: '人生无限有限公司',
    deliverydate: '2018-04-02',
    takeway: 0,
    payway: 0,
    credit: '优质客户',
    status: 0,
  },
];
let dataLeft = [
  {
    comment: '紧急',
    id: '2fd574271c852553acbaaf37ad6ce43f',
    inquiryid: 'cb9f8a44e38db5ca208eac28759dfa3',
    num: 15.62,
    price: 141.123,
    key: '13123321',
    product01Entity: {
      colorname: 'CA001',
      colorproduct: {
        a: 60.14,
        b: 57.19,
        begindate: '2018-01-01 10:45:19',
        enddate: '2019-01-01 10:45:19',
        hex: '#e84c22',
        id: 802,
        l: 55.35,
        lrv: '23',
        productid: '1533697589676000005',
        rgb: '232,76,34',
        status: 1,
        supplyid: 'cb564b09127e4e1d8cd1fcd7a35b03a9',
      },
      id: 782,
      kind: '膨体棉晴·2/16支·60%棉·40%晴',
      largetype: '膨体棉晴',
      location: '1-01-01',
      picture: 'http://47.95.202.38/upload/20180808/6743237244707997.png',
      price: 36.0,
      productid: '1533697589676000005',
      productname: '火龙桔',
      recommande: 10.0,
      series: '膨体棉晴',
      supplyid: 'cb564b09127e4e1d8cd1fcd7a35b03a9',
    },
    productid: '1533697589676000005',
    usefor: '自用',
  },
  {
    comment: '紧急',
    key: '121211sss',
    id: '50b365fdbc612e3909afccb3a18bdf28',
    inquiryid: 'cb9f8a44e38db5ca208eac28759dfa3',
    num: 20.62,
    price: 141.123,
    product01Entity: {
      colorname: 'CA002',
      colorproduct: {
        a: 55.46,
        b: 58.9,
        begindate: '2018-01-01 11:06:50',
        enddate: '2019-01-01 11:06:50',
        hex: '#f6632b',
        id: 803,
        l: 61.27,
        lrv: '30',
        productid: '1533697729089000000',
        rgb: '246,99,43',
        status: 1,
        supplyid: 'cb564b09127e4e1d8cd1fcd7a35b03a9',
      },
      id: 783,
      kind: '膨体棉晴·2/16支·60%棉·40%晴',
      largetype: '膨体棉晴',
      location: '1-01-02',
      picture: 'http://47.95.202.38/upload/20180808/6743368622129332.png',
      price: 36.0,
      productid: '1533697729089000000',
      productname: '桔红',
      recommande: 10.0,
      series: '膨体棉晴',
      supplyid: 'cb564b09127e4e1d8cd1fcd7a35b03a9',
    },
    productid: '1533697729089000000',
    usefor: '自用',
  },
];
const TabPanes = Tabs.TabPane;

const takewayArr = ['自提', '快递', '物流', '送货上门'];

const recordstatusArr = ['正常', '加急'];

@connect(({ inquiry, loading }) => ({
  inquiry,
  loading: loading.models.inquiry,
}))
@Form.create()
export default class OwnProfile extends PureComponent {
  state = {
    panes: [{ key: '1' }],
    activeKey: '1',
  };

  componentDidMount() {
    const terms = `terms[0].value=0&terms[0].column=type`;
    this.query(terms);
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  query = terms => {
    queryPresaleSpecial(terms).then(response => {
      if (response && response.status === 200) {
        const arr = response.result.data;
        for (let i = 0; i < arr.length; i += 1) {
          arr[i].key = `inquiryAll${i}`;
        }

        // const arr =dataTop;
        const columns = [
          {
            title: '欠货单编号',
            dataIndex: 'id',
            key: 'id',
            render: val => <a onClick={e => this.hadl(e, val)}>{val}</a>,
          },
          {
            title: '客户',
            dataIndex: 'usrid',
            key: 'usrid',
          },
          // {
          //   title: '最早货期',
          //   dataIndex: 'de liverydate',
          //   key: 'deliverydate',
          // },
          {
            title: '时间 ',
            dataIndex: 'makedate',
            key: 'makedate',
          },
          {
            title: '备注',
            dataIndex: 'comment',
            key: 'comment',
          },
          {
            title: '取货方式',
            dataIndex: 'takeway',
            key: 'takeway',
            filters: [
              {
                text: takewayArr[0],
                value: 0,
              },
              {
                text: takewayArr[1],
                value: 1,
              },
              {
                text: takewayArr[2],
                value: 2,
              },
              {
                text: takewayArr[3],
                value: 3,
              },
              {
                text: takewayArr[4],
                value: 4,
              },
            ],
            onFilter: (value, record) => record.paystatus.toString() === value,
            render(val) {
              return <span>{takewayArr[val]}</span>;
            },
          },
          {
            title: '数量（Kg）',
            dataIndex: 'num',
            key: 'num',
          },
          {
            title: '金额',
            dataIndex: 'price',
            key: 'price',
            render: val => (val === undefined ? `￥ 0` : `￥ ${val}`),
          },
          {
            title: '状态',
            dataIndex: 'recordstatus',
            key: 'recordstatus',
            
            render(val) {
              return <span>{recordstatusList[val]}</span>;
            },
          },
        ];

        const panes = [
          {
            title: '欠货单',
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
        });
      }
    });
  };
  validate = () => {
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((error, values) => {
      const pretarmap = values.tableLeft[values.tableLeft.length - 1];
      const pickupdata = [];
      const productidset = new Set();
      const countMap = new Map();
      let count = 0;
      if (pretarmap.size !== 0) {
        for (const item of pretarmap.keys()) {
          // 遍历map
          count = 0;
          const pickarr = pretarmap.get(item).map(items => ({ ...items }));
          // 遍历出来的map ，生成库存明细数组 ，set所有的productId
          for (let it = 0; it < pickarr.length; it++) {
            const demo = {
              picknum: pickarr[it].output,
              goodentryids: pickarr[it].id,
              batchno: pickarr[it].batchno,
              productid: pickarr[it].productid,
            };
            count += Number(pickarr[it].output);
            pickupdata.push(demo);
            productidset.add(pickarr[it].productid);
          }

          countMap.set(pickarr[0].productid, count);
        }
      } else {
        message.error('请选择库存');
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

  hadl = (e, val) => {
    const paness = this.state.panes;
    const { getFieldDecorator } = this.props.form;

    const params = `terms[0].value=${val}&terms[0].column=id`;

    queryPresaleSpecial(params).then(response => {
      if (response && response.status === 200) {
        dataTop = [];
        dataTop.push(response.result);
        for (let i = 0; i < dataTop.length; i += 1) {
          dataTop[i].key = `ownTop${i}`;
        }
        dataLeft = response.result.inquiryDetail01Entities;
        if (dataLeft === undefined) {
          return;
        }
        for (let i = 0; i < dataLeft.length; i += 1) {
          dataLeft[i].key = `ownLeft${i}`;
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
                      <Button type="primary" onClick={this.validate}>
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
              {getFieldDecorator('status')(
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
    panemap[0].content = (
      <div>
        <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
        <Table pagination={false} dataSource={this.state.arr} columns={this.state.columns} />
      </div>
    );

    return (
      <PageHeaderLayout title="欠货单">
        <Card bordered={false}>
          <div className={styles.tableList}>
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
