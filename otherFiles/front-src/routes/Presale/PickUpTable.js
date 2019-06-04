import React, { PureComponent, Fragment } from 'react';
import { Table, message, InputNumber, Button, Checkbox } from 'antd';
import { forEach } from 'gl-matrix/src/gl-matrix/vec2';
import { stringify } from 'querystring';

let beforeProductid = '';
let selectedRowss = [];
export default class PickUpTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.dataSource,
      loading: false,
      tag: props.dataSource.tag,
    };
  }

  componentDidMount() {
    this.props.onChange(this.state.data);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.dataSource,
    });
  }
  componentDidUpdate(nextProps, nextState) {
    this.state = {
      data: nextState.dataSource,
      loading: false,
      selectedRows: selectedRowss,
    };
  }

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }

  handleSelectRows = (selectedRowKeys, selectedRows) => {
    this.props.onChange(selectedRows);
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
  CheckboxChange = (e, record) => {
    const Data = this.state.data;
    const checkData = [];
    Data.forEach(item => {
      if (item.sysuuid === record.uuid) {
        checkData.push(item);
      }
    });
    this.props.onChange(checkData);
  };

  render() {
    const { selectedRows, data } = this.state;

    // const rowSelection = {
    //   selectedRows,

    //   onChange : this.handleSelectRows,
    // };

    const BatchColumns = [
      {
        dataIndex: 'checkBox',
        key: 'checkBox',
        render: (val, record) => {
          if (record.uuid === '') {
            return <span />;
          } else {
            return <Checkbox onChange={e => this.CheckboxChange(e, record)} />;
          }
        },
      },
      {
        title: '拣货单号',
        dataIndex: 'uuid',
        key: 'uuid',

        width: '20%',
      },
      {
        title: '色号/色称',
        dataIndex: 'incommedate',
        key: 'incommedate',

        render: (val, record) => {
          if (record.status === 1) {
            return (
              <div style={{ backgroundColor: '#E83632' }}>
                <li>{record.colorname}</li>
                <li>{record.productname}</li>
              </div>
            );
          }else if(record.status===3){
            return (
              <div style={{backgroundColor:'#E83632' }}>
                <li style={{textDecoration:'line-through'}}>{record.colorname}</li>
                <li style={{textDecoration:'line-through'}}>{record.productname}</li>
              </div>
            );
          }
          else if (record.status === 0 && record.flag === false) {
            return (
              <div style={{ backgroundColor: '#CCCCCC' }}>
                <li>{record.colorname}</li>
                <li>{record.productname}</li>
              </div>
            );
          } else {
            return (
              <div>
                <li>{record.colorname}</li>
                <li>{record.productname}</li>
              </div>
            );
          }
        },
      },
      {
        title: '缸号',
        dataIndex: 'batchno',
        key: 'batchno',
        render:(val,record)=>{
          if(record.status===3){
            return (
              <div >
                <li style={{textDecoration:'line-through'}}>{val}</li>
               
              </div>
            );
          }
        },
        
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
        title: '整件数',
        dataIndex: 'piece',
        key: 'piece',
        editable: false,
      },
      {
        title: '零散个数',
        dataIndex: 'num',
        key: 'num',
        editable: false,
      },
    ];
    if (this.state.tag === 2) {
      BatchColumns.splice(0, 1);
    }

    return (
      <Fragment>
        <Table
          loading={this.state.loading}
          columns={BatchColumns}
          dataSource={data}
          pagination={false}
          rowKey={record => record.key}
          // rowSelection={rowSelection}
        />
      </Fragment>
    );
  }
}
