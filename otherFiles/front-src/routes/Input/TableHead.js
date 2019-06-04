import React, { PureComponent, Fragment } from 'react';
import moment from 'moment';
import { Table, message, Select, DatePicker, Input } from 'antd';

const { Option } = Select;
export default class TableHead extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.dataSource,
      loading: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value ===undefined) {
      this.setState({
        data: nextProps.dataSource,
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
  handleFieldChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData });
    }
    this.props.onChange(newData);
  }
  handleFieldSelectChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      this.setState({ data: newData });
    }
    this.props.onChange(newData);
  }
  handleFieldDateChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = moment(e).format('YYYY-MM-DD HH:mm:ss');
      this.setState({ data: newData });
    }
    this.props.onChange(newData);
  }
  saveRow(e, key) {
    e.persist();
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(key) || {};
      if (!target.workId || !target.name || !target.department) {
        message.error('请填写完整成员信息。');
        e.target.focus();
        this.setState({
          loading: false,
        });
        return;
      }
      delete target.isNew;
      this.toggleEditable(e, key);
      this.props.onChange(this.state.data);
      this.setState({
        loading: false,
      });
    }, 500);
  }
  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.setState({ data: newData });
    this.clickedCancel = false;
  }
  render() {
    const columns = [
      {
        title: '采购单号',
        dataIndex: 'id',
        key: 'id',
        width: '10%',
      },
      {
        title: '供应商',
        dataIndex: 'supplyid',
        key: 'supplyid',
        width: '10%',
        render: (text, record) => {
          return (
            <Select
              defaultValue={0}
              onChange={e => this.handleFieldSelectChange(e, 'supplyid', record.key)}
            >
              <Option value={0}>江门染厂</Option>
              <Option value={1}>湖北染厂</Option>
              <Option value={2}>江苏染厂</Option>
            </Select>
          );
        },
      },
      {
        title: '送货单号',
        dataIndex: 'goid',
        key: 'goid',
        width: '10%',
      },
      {
        title: '入库日期',
        dataIndex: 'takeway',
        key: 'takeway',
        width: '10%',
        render: (text, record) => {
          return (
            <DatePicker onChange={e => this.handleFieldDateChange(e, 'takeway', record.key)} />
          );
        },
      },
      {
        title: '备注',
        dataIndex: 'remack',
        key: 'remack',
        width: '30%',
        render: (text, record) => {
          return (
            <Input value={text} onChange={e => this.handleFieldChange(e, 'remack', record.key)} />
          );
        },
      },
    ];

    return (
      <Fragment>
        <Table
          title={() => <span style={{ fontWeight: 600, fontSize: 26 }}>手动入库</span>}
          loading={this.state.loading}
          columns={columns}
          dataSource={this.state.data}
          pagination={false}
        />
      </Fragment>
    );
  }
}
