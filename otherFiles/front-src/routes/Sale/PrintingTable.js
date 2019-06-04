import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Card, Button, Form, Table, message } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
// import { fixedZeroTo4Bit } from '../../utils/utils';
// import styles from './Funds.less';
// import { isEmptyObject } from '../../utils/reg';
// import { Yuan } from '../../utils/math';
// import watermark from '../../assets/icon/revocation.png';

@connect(({ finance, loading }) => ({
  finance,
  loading: loading.models.list,
}))
@Form.create()
export default class PrintingTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    // const code = !isEmptyObject(this.props.match) ? this.props.match.params.id : 0;
    // this.statisticalInfo({ receiptsCode: code });
  }

  // 结算单列表详情
  //   statisticalInfo(params) {
  //     this.props.dispatch({
  //       type: 'finance/statisticalInfo',
  //       payload: params,
  //     }).then(() => {
  //       this.setState({
  //         loading: false,
  //       })
  //     });
  //   }

  // 撤销操作
  fetchRevocation(params) {
    this.props
      .dispatch({
        type: 'finance/fetchRevocation',
        payload: params,
      })
      .then(() => {
        const { finance: { revocationData } } = this.props;
        const { code } = revocationData;
        if (code === 200) {
          message.info('撤销货款单成功!').then(() => {
            window.location.href = '/funds/loansettlement';
          });
        } else {
          message.info('撤销货款单失败!');
        }
      });
  }

  // 撤销
  cancer = () => {
    // const code = !isEmptyObject(this.props.match) ? this.props.match.params.id : 0;
    // this.fetchRevocation({
    //   receiptsCode: code,
    // });
  };

  // 返回
  back = () => {
    window.history.back();
  };

  // 打印
  print() {
    window.document.body.innerHTML = window.document.getElementById('billDetails').innerHTML;
    window.print();
    window.location.reload();
  }

  render() {
    const { loading } = this.props;
    let data = [],
      createName,
      createTime;
    // if (statisticalInfo && !Array.isArray(statisticalInfo)) {
    //   data = statisticalInfo;
    //   createName = statisticalInfo.createName;
    //   createTime = statisticalInfo.createTime;
    // }

    // if (statisticalInfo != undefined) {
    //   data = statisticalInfo.goodsVos;
    // }

    let _data = [],
      receiptsCode;
    // if (statisticalInfo && !Array.isArray(statisticalInfo)) {
    //   _data = statisticalInfo;
    //   receiptsCode = statisticalInfo.receiptsCode;
    // }
    const { supplierName, carNo, stallName, startTime, endTime, enable } = _data;

    const len = data.length;

    const columns = [
      {
        title: '品种',
        dataIndex: 'attrName',
        align: 'center',
      },
      {
        title: '销售货款',
        dataIndex: 'goodsAmount',
        align: 'left',
        // render: (text, record, index) => {
        //   const { goodsAmount, goodsPaymentStr } = record;
        //   const type = goodsPaymentStr !== null ? goodsPaymentStr.split('负').length : -1;
        //   if (index < len - 1) {
        //     return <span>{goodsAmount ? Yuan(goodsAmount, 2) : ''}</span>;
        //   }
        //   return {
        //     children:
        //       type == 2 ? (
        //         <span className={styles.neg}>{goodsPaymentStr}</span>
        //       ) : (
        //         <span className={styles.bold}>{goodsPaymentStr}</span>
        //       ),
        //     props: {
        //       colSpan: 7,
        //     },
        //   };
        // },
      },
      {
        title: '件数',
        dataIndex: 'number',
        align: 'center',
        render: (text, record, index) => {
          const { number } = record;
          if (index < len - 1) {
            return <span>{number ? number : ''}</span>;
          }
          return {
            children: '',
            props: {
              colSpan: 0,
            },
          };
        },
      },
      {
        title: '重量',
        dataIndex: 'weight',
        align: 'center',
        render: (text, record, index) => {
          const { weight } = record;
          if (index < len - 1) {
            return <span>{weight ? weight : ''}</span>;
          }
          return {
            children: '',
            props: {
              colSpan: 0,
            },
          };
        },
      },
      {
        title: '平均售价',
        dataIndex: 'averageAmount',
        align: 'center',
        // render: (text, record, index) => {
        //   const { averageAmount } = record;
        //   if (index < len - 1) {
        //     return <span>{averageAmount ? Yuan(averageAmount, 2) : ''}</span>;
        //   }
        //   return {
        //     children: '',
        //     props: {
        //       colSpan: 0,
        //     },
        //   };
        // },
      },
      {
        title: '平均重量',
        dataIndex: 'averageWeight',
        align: 'center',
        render: (text, record, index) => {
          const { averageWeight } = record;
          if (index < len - 1) {
            return <span>{averageWeight ? averageWeight : ''}</span>;
          }
          return {
            children: '',
            props: {
              colSpan: 0,
            },
          };
        },
      },
      {
        title: '费用类型',
        dataIndex: 'type',
        align: 'center',
        render: (text, record, index) => {
          const { type } = record;
          if (index < len - 1) {
            return <span>{type}</span>;
          }
          return {
            children: '',
            props: {
              colSpan: 0,
            },
          };
        },
      },
      {
        title: '扣款金额',
        dataIndex: 'amount',
        align: 'center',
        // render: (text, record, index) => {
        //   const { amount } = record;
        //   if (index < len - 1) {
        //     return <span>{amount !== null ? Yuan(amount, 2) : ''}</span>;
        //   }
        //   return {
        //     children: '',
        //     props: {
        //       colSpan: 0,
        //     },
        //   };
        // },
      },
    ];

    return (
      <PageHeaderLayout>
        <div id={'billDetails'}>
          <Card bordered={false} title="">
            <div>
              <div style={{ display: 'flex', height: '60px', lineHeight: '60px' }}>
                <h1 style={{ flex: 1, textAlign: 'center' }}>{stallName}</h1>
                <span
                  style={{
                    position: 'absolute',
                    right: '10px',
                    color: '#FF6666',
                    fontWeight: '600',
                  }}
                >{`NO:${receiptsCode !== undefined ? receiptsCode : ''}`}</span>
              </div>

              <div style={{ display: 'flex' }}>
                <h2 style={{ flex: 1, textAlign: 'center' }}>商品销售车次结算单</h2>
                <div style={{ position: 'absolute', right: '10px' }}>
                  <Button
                    type="primary"
                    onClick={this.cancer}
                    disabled={!enable}
                    style={{ marginRight: '5px' }}
                  >
                    撤销
                  </Button>
                  <Button onClick={this.print.bind(this)} style={{ marginRight: '5px' }}>
                    打印
                  </Button>
                  <Button type="primary" onClick={this.back} style={{ marginRight: '5px' }}>
                    返回
                  </Button>
                </div>
              </div>

              <div style={{ display: 'flex' }}>
                <h3 style={{ flex: 1, textAlign: 'left' }}>
                  {`货老板：${supplierName !== undefined ? supplierName : ''} ${carNo}车`}
                </h3>
                <h3 style={{ flex: 1 }}>{`到货时间：${moment(startTime).format('YYYY-MM-DD')}`}</h3>
                <h3 style={{ flex: 1 }}>{`售罄时间：${moment(endTime).format('YYYY-MM-DD')}`}</h3>
              </div>

              {/* // <img src={watermark} hidden={enable} style={{position: 'absolute', width: '100px', height: '100px', top: '120px', right: '80px',zIndex: 100}} /> */}
            </div>
          </Card>
          <Card bordered={false} title="" bodyStyle={{ padding: '0 16px' }}>
            <Table
              dataSource={data}
              columns={columns}
              bordered
              pagination={false}
              loading={this.state.loading}
            />
          </Card>
          <Card style={{ border: 0 }}>
            <div style={{ display: 'flex' }}>
              <h3 style={{ flex: 1 }}>{`结算人：${createName !== undefined ? createName : ''}`}</h3>
              <h3 style={{ flex: 1, textAlign: 'right' }}>{`结算时间:${moment(createTime).format(
                'YYYY-MM-DD'
              )}`}</h3>
            </div>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}
