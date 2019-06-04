import React, { PureComponent, Fragment } from 'react';
import { Table, message, InputNumber, Button } from 'antd';
import styles from './DeliverProfile.less';

let beforeProductid = '';
let selectedRowss = [];
export default class TableRight extends PureComponent {
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
    const { selectedRows, data } = this.state;

    const rowSelection = {
      selectedRows,

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
        title: '毛重',
        dataIndex: 'grossweight',
        key: 'grossweight',
        editable: false,
      },
      {
        title: '整件',
        dataIndex: 'whole',
        key: 'whole',
        editable: false,
      },
      {
        title: '零散个数 ',
        dataIndex: 'scattered',
        key: 'scattered',
      },
    ];

    return (
      <Fragment>
        <Table
          loading={this.state.loading}
          columns={BatchColumns}
          dataSource={data}
          pagination={false}
          rowSelection={rowSelection}
          rowKey="id"
        />
      </Fragment>
    );
  }
}
