import React, { PureComponent, Fragment } from 'react';
import { Table, message, InputNumber, Button } from 'antd';
import moment from 'moment';
import { queryGoodsBasic } from '../../services/api';

let beforeProductid = '';
let selectedRowss = [];
const areaMap = new Map();
export default class UpdatePickups extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.dataSource,
      loading: false,
      selectedRows: [],
      colorname: props.dataSource.colorname,
      pageindex: 1,
      pagesize: 10,
      productid: props.productid,
      total: props.total,
    };
  }

  componentDidMount() {
    selectedRowss = [];
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.dataSource,
      colorname: nextProps.dataSource.colorname,
      total: nextProps.total,
      productid: nextProps.productid,
    });
  }
  // componentDidUpdate(nextProps, nextState) {

  //   this.state = {
  //     data: nextState.data,
  //     loading: false,
  //     selectedRows:selectedRowss,
  //     colorname: nextState.data.colorname,
  //     total:nextState.total,
  //     productid:nextState.productid,
  //   };

  // }

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }

  handleSelectRows = (selectedRowKeys, selectedRows) => {
    const selectData = selectedRows;

    // if(selectData.length !== 0){
    //   beforeProductid=selectData[0].productid;
    //   selectData.colorname =this.state.colorname;
    //   selectData.tag = true;
    //   this.props.callbackParent(selectData);
    // }else{
    //   selectData.id = beforeProductid;
    //   selectData.colorname = this.state.colorname;
    //   selectData.tag = false;
    //   this.props.callbackParent(selectData);
    // }

    // this.setState({
    //   selectedRows,

    // });
    this.props.onChange(selectData);
    this.setState({
      selectedRows,
    });
  };
  handleStandardTableChange = pagination => {
    this.setState({
      pageindex: pagination.current,
      pagesize: pagination.pageSize,
    });
    const terms = `terms[0].value=${this.state.productid}&terms[0].column=productid&pageSize=${
      pagination.pageSize
    }&pageIndex=${pagination.current - 1}&sorts[0].name=id&sorts[0].order=desc`;
    queryGoodsBasic(terms).then(res => {
      if (res && res.status === 200) {
        this.setState({
          pageindex: pagination.current,
          pagesize: pagination.pageSize,
          total: res.result.total,
          data: res.result.data,
        });
      }
    });
  };

  handleRightChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    selectedRowss = this.state.selectedRows === undefined ? [] : this.state.selectedRows;

    const oncedata = [];

    const target = this.getRowByKey(key, newData);

    if (target) {
      target[fieldName] = e;

      this.setState({ data: newData });
    }

    if (selectedRowss.length !== 0) {
      newData.forEach(item => {
        selectedRowss.forEach(sItem => {
          if (item.key === sItem.key) {
            oncedata.push(item);
          }
        });
      });
      oncedata.colorname = this.state.colorname;
      oncedata.tag = true;
      this.setState({
        selectedRows: oncedata,
        data: newData,
      });
      this.props.onChange(oncedata);
    }
  }

  render() {
    const { selectedRows, data } = this.state;
    const pagination = {
      total: this.state.total,
      current: this.state.pageindex,
      pageSize: this.state.pagesize,
      showTotal: () => {
        return `共${this.state.total}条`;
      },
      showQuickJumper: false,
    };
    const rowSelection = {
      selectedRows,
      getCheckboxProps: record => ({
        disabled: record.status === 1,
      }),
      onChange: this.handleSelectRows,
    };

    const BatchColumns = [
      {
        title: '缸号',
        dataIndex: 'batchno',
        key: 'batchno',
        width: '20%',
      },
      {
        title: '出库 ',
        dataIndex: 'output',
        key: 'output',
        render: (text, record) => {
          return (
            <InputNumber
              min={0.0}
              max={record.picknum}
              defaultValue={record.output}
              onChange={e => this.handleRightChange(e, 'output', record.key)}
            />
          );
        },
      },
    ];

    return (
      <Fragment>
        <Table
          title={() => `产品色号:${this.state.colorname}`}
          loading={this.state.loading}
          columns={BatchColumns}
          dataSource={data}
          bordered
          pagination={false}
          onChange={(e, record) => this.handleStandardTableChange(e, record)}
          rowKey={record => record.key}
          rowSelection={rowSelection}
        />
      </Fragment>
    );
  }
}
