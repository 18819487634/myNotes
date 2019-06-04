import React, { PureComponent, Fragment } from 'react';

import { Table, Input, InputNumber, Button } from 'antd';

export default class TableXiMa extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.value,
      loading: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        data: nextProps.value,
      });
    }
  }
  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
  index = 0;
  cacheOriginData = {};
  toggleEditable = (e, key) => {
    e.preventDefault();
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      // 进入t) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: newData });
    }
  };
  remove(key) {
    const newData = this.state.data.filter(item => item.key !== key);
    this.setState({ data: newData });
    this.props.onChange(newData);
  }

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }
  addxima1 = () => {
    const a = this.state.data.map(item => ({ ...item }));
    a.push({
      key: 1,
      id: '',
      gross: '',
      suttle: '',
      onlynum: '',
      acer: '',
    });
    this.setState({ data: a });
  };
  handleFieldChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData });
    }
    this.props.onChange(newData);
  }
  handleFieldNumChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      this.setState({ data: newData });
    }
    this.props.onChange(newData);
  }

  render() {
    const columns = [
      {
        title: '箱号',
        dataIndex: 'id',
        key: 'id',
        width: '10%',
        render: (text, record) => {
          return (
            <Input value={text} onChange={e => this.handleFieldChange(e, 'remack', record.key)} />
          );
        },
      },
      {
        title: '毛重(KG)',
        dataIndex: 'gross',
        key: 'gross',
        width: '10%',
        render: (text, record) => {
          return (
            <InputNumber
              value={text}
              min={0}
              onChange={e => this.handleFieldNumChange(e, 'gross', record.key)}
            />
          );
        },
      },
      {
        title: '净重(KG)',
        dataIndex: 'suttle',
        key: 'suttle',
        width: '10%',
        render: (text, record) => {
          return (
            <InputNumber
              value={text}
              min={0}
              onChange={e => this.handleFieldNumChange(e, 'suttle', record.key)}
            />
          );
        },
      },
      {
        title: '只数',
        dataIndex: 'onlynum',
        key: 'onlynum',
        width: '10%',
        render: (text, record) => {
          return (
            <InputNumber
              value={text}
              min={0}
              onChange={e => this.handleFieldNumChange(e, 'onlynum', record.key)}
            />
          );
        },
      },
      {
        title: '存放区域',
        dataIndex: 'acer',
        key: 'acer',
        width: '10%',
        render: (text, record) => {
          return (
            <Input value={text} onChange={e => this.handleFieldChange(e, 'acer', record.key)} />
          );
        },
      },
    ];

    return (
      <Fragment>
        <div>
          <Button onClick={this.addxima1}>添加</Button>
        </div>
        <Table
          loading={this.state.loading}
          columns={columns}
          dataSource={this.state.data}
          pagination={false}
        />
      </Fragment>
    );
  }
}
