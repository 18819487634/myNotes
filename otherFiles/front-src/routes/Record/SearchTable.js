import React, { PureComponent, Fragment } from 'react';
import { Table, DatePicker, Select, Input, Button } from 'antd';
import { connect } from 'dva';
import styles from '../Finance/Cashier.less'

const { RangePicker } = DatePicker;
const payTypeArr = ["现金", "支付宝", "微信", "银行"];
const validStatusArr = ["未审核", "通过", "失败"];


@connect(({ receiptrecord, loading }) => ({
  receiptrecord,
  loading: loading.models.paydetail,
}))
export default class SearchTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // time: [],
      // paytype: '',
      // validstatus: '',
      // presaleid:'',
      // clientname:'',
      // createid: '',
    }
  };

  // saveDate = (data, dataString) => {
  //   const dateArr = [];
  //   const start = new Date(dataString[0].replace(/-/g, '/'));
  //   const end = new Date(dataString[1].replace(/-/g, '/'));

  //   const startTime = start.getTime();
  //   const endTime = end.getTime();
  //   dateArr.push(startTime);
  //   dateArr.push(endTime)
  //   this.setState({
  //     time: dateArr,
  //   })
  //   this.props.dispatch({
  //     type: 'receiptrecord/submitDate',
  //     payload: dateArr,
  //   })
  // }
  
  searchData = () => {
    const data = {};
    data.presaleid = this.state.presaleid;

    // data.time = this.state.time;
    data.paytype = payTypeArr.indexOf(this.state.paytype);
    data.validstatus = validStatusArr.indexOf(this.state.validstatus)
    data.clientname = this.state.clientname;
    // data.createid = this.state.createid;
    this.props.handleSearch(data);
  };

  render() {
    const columns = [{
      title: '收款日期',
      dataIndex: 'time',
      key: 'time',
      align: 'center',
      render: () => {
        return (
          <RangePicker
            style={{width: 230}}
            placeholder={['开始日期', '结束日期']}
            onChange={(data, dataString) => this.props.saveDate(data, dataString)}
          />
        )
      },
    },{
      title: '收款方式',
      dataIndex: 'paytype',
      key: 'paytype',
      align: 'center',
      render: () => {
        return (
          <Select
            placeholder="请选择"
            allowClear
            style={{width: 90}}
            onChange={(value) => this.setState({
              paytype: value,
            })}
          >
            {payTypeArr && payTypeArr.map((item, index) =>
              // eslint-disable-next-line react/no-array-index-key
              <Select.Option key={index} value={item}>{item}</Select.Option>
            )}
          </Select>
        )
      },
    },{
      title: '审核状态',
      dataIndex: 'validstatus',
      key: 'validstatus',
      align: 'center',
      render: () => {
        return (
          <Select
            placeholder="请选择"
            allowClear
            style={{width: 90}}
            onChange={(value) => this.setState({
              validstatus: value,
            })}
          >
            {validStatusArr && validStatusArr.map((item, index) =>
              // eslint-disable-next-line react/no-array-index-key
              <Select.Option key={index} value={item}>{item}</Select.Option>
            )}
          </Select>
        )
      },
    },{
      title: '单号',
      dataIndex: 'presaleid',
      key: 'presaleid',
      align: 'center',
      render: () => {
        return (
          <Input
            onBlur={(e) => this.setState({presaleid: e.target.value})}
            style={{width: 180}}
            placeholder="请输入单号"
          />
        )
      },
    },{
      title: '客户',
      dataIndex: 'clientname',
      key: 'clientname',
      align: 'center',
      render: () => {
        return (
          <Input
            onBlur={(e) => this.setState({clientname: e.target.value})}
            style={{width: 110}}
            placeholder="请输入客户"
          />
        )
      },
    },
   /*  {
      title: '业务员',
      dataIndex: 'createid',
      key: 'createid',
      align: 'center',
      render: () => {
        return (
          <Input
            onBlur={(e) => this.setState({createid: e.target.value})}
            style={{width: 110}}
            placeholder="请输入业务员"
          />
        )
      },
    }, */
    {
      title: '搜索',
      dataIndex: 'search',
      key: 'search',
      align: 'center',
      render: () => {
        return (
          <Fragment>
            <Button onClick={() => this.searchData()} type="primary" shape="circle" icon="search" />
          </Fragment>
        )
      },
    }];

    const data = [{
      time: '',
      paytype: '',
      validstatus: '',
      presaleid: '',
      createid: '',
      search: '',
      key: 0,
    }]

    return (
      <div className={styles.tableList}>
        <Table
          rowkey={record => record.id}
          loading={false}
          bordered
          columns={columns}
          dataSource={data}
          pagination={false}
          style={{marginBottom: 20}}
        />
      </div>
    )
  }
}
