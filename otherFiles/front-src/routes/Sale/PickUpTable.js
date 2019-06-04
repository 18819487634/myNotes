import React, { PureComponent, Fragment } from 'react';
import { Table } from 'antd';

let beforeProductid = '';
let selectedRowss = [];
export default class PickUpTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.dataSource,
      loading: false,
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.dataSource,
    });
  }
  componentDidUpdate(nextProps, nextState) {
    this.state = {
      data: nextState.data,
      loading: false,
      selectedRows: selectedRowss,
    };
  }

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }

  handleSelectRows = (selectedRowKeys, selectedRows) => {
    if (selectedRows.length !== 0) {
      beforeProductid = selectedRows[0].productid;
      this.props.callbackParent(selectedRows);
    } else {
      this.props.callbackParent(beforeProductid);
    }

    this.setState({
      selectedRows,
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
      this.props.callbackParent(oncedata);
    }
  }

  render() {
    const { data } = this.state;

    const BatchColumns = [
      {
        title: '拣货单号',
        dataIndex: 'sysuuid',
        key: 'sysuuid',
        width: '20%',
      },
      {
        title: '色号/色称',
        dataIndex: 'incommedate',
        key: 'incommedate',
        editable: false,
      },
      {
        title: '缸号',
        dataIndex: 'batchno',
        key: 'batchno',
        editable: false,
      },
      {
        title: '毛重(Kg)',
        dataIndex: 'glossweight',
        key: 'glossweight',
        editable: false,
      },
      {
        title: '净重(Kg)',
        dataIndex: 'weight',
        key: 'weight',
        editable: false,
      },
      {
        title: '整件',
        dataIndex: 'piece',
        key: 'piece',
        editable: false,
      },
      {
        title: '零散个数',
        dataIndex: 'scattered',
        key: 'scattered',
        editable: false,
      },
    ];

    return (
      <Fragment>
        <Table
          loading={this.state.loading}
          columns={BatchColumns}
          dataSource={data}
          pagination={false}
          rowKey={record => record.key}
        />
      </Fragment>
    );
  }
}
