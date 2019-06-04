import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, message, Popconfirm, Divider } from 'antd';
import styles from './InsuranceProfile.less';
import TableAdress from '../Express/TableAdress';

const sdata = [
  {
    key: 'guangdong',
    adress: '广东省',
    firstweight: 60,
    firstprice: 30,
    continued: 40,
    checked: false,
    children: [
      {
        key: 'guangdong-1',
        adress: '广州市',
        firstweight: 42,
        firstprice: 30,
        continued: 28,
      },
      {
        key: 'guangdong-2',
        adress: '清远市',
        firstweight: 42,
        firstprice: 30,
        continued: 28,
      },
    ],
  },
  {
    key: 'shangdon',
    adress: '山东省',
    firstweight: 60,
    firstprice: 30,
    continued: 40,
    checked: false,
    children: [
      {
        key: 'shangdon-1',
        adress: '济南市',
        firstweight: 42,
        firstprice: 30,
        continued: 28,
      },
      {
        key: 'shangdon-2',
        adress: '德州市',
        firstweight: 42,
        firstprice: 30,
        continued: 28,
      },
    ],
  },
  {
    key: 'neimenggu',
    adress: '内蒙古自治区',
    firstweight: 60,
    firstprice: 30,
    continued: 40,
    checked: false,
    children: [
      {
        key: 'neimenggu-1',
        adress: '呼和浩特市',
        firstweight: 42,
        firstprice: 30,
        continued: 28,
      },
      {
        key: 'neimenggu-2',
        adress: '锡林郭勒盟',
        firstweight: 42,
        firstprice: 30,
        continued: 28,
      },
    ],
  },
];

export default class TableForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.value,
      loading: false,
      flag: false,
      name: '无',
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
  newMember = () => {
    const newData = this.state.data.map(item => ({ ...item }));
    newData.push({
      key: `adress_${this.index}`,

      name: '',
      network: '',
      networkphone: '',
      liable: '',
      liablephone: '',
      collector: '',
      collectorphone: '',
      editable: true,
      isNew: true,
    });
    this.index += 1;
    this.setState({ data: newData });
  };
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
      this.setState({ data: newData }, () => {
        this.props.onChange(this.state.data);
      });
    }
  }
  showTable = (e, flag) => {
    this.setState({
      flag,
      name: e.name,
    });
  };
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
      // if (!target.workId || !target.name || !target.department) {
      //   message.error('请填写完整成员信息。');
      //   e.target.focus();
      //   this.setState({
      //     loading: false,
      //   });
      //   return;
      // }
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
    const companyName = this.state.name;
    const columns = [
      {
        title: '保险公司名称',
        dataIndex: 'name',
        key: 'name',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.name}
                autoFocus
                onChange={e => this.handleFieldChange(e, 'name', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="保险公司名称"
              />
            );
          }
          return text;
        },
      },
      {
        title: '网点地址',
        dataIndex: 'network',
        key: 'network',
        width: '20%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.network}
                onChange={e => this.handleFieldChange(e, 'network', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="网点地址"
              />
            );
          }
          return text;
        },
      },
      {
        title: '网点电话',
        dataIndex: 'networkphone',
        key: 'networkphone',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.networkphone}
                onChange={e => this.handleFieldChange(e, 'networkphone', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="网点电话"
              />
            );
          }
          return text;
        },
      },
      {
        title: '网点负责人',
        dataIndex: 'liable',
        key: 'liable',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.liable}
                onChange={e => this.handleFieldChange(e, 'liable', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="网点电话"
              />
            );
          }
          return text;
        },
      },
      {
        title: '负责人电话',
        dataIndex: 'liablephone',
        key: 'liablephone',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.liablephone}
                onChange={e => this.handleFieldChange(e, 'liablephone', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="负责人电话"
              />
            );
          }
          return text;
        },
      },
      {
        title: '收件员',
        dataIndex: 'collector',
        key: 'collector',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.collector}
                onChange={e => this.handleFieldChange(e, 'collector', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="收件员"
              />
            );
          }
          return text;
        },
      },
      {
        title: '收件员电话',
        dataIndex: 'collectorphone',
        key: 'collectorphone',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.collectorphone}
                onChange={e => this.handleFieldChange(e, 'collectorphone', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="收件员电话"
              />
            );
          }
          return text;
        },
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          if (!!record.editable && this.state.loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, record.key)}>添加</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, record.key)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, record.key)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, record.key)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];

    return (
      <Fragment>
        <div className={styles.tableList}>
          <div style={{ width: 1800 }}>
            <div style={{ width: 875, float: 'left' }}>
              <Table
                loading={this.state.loading}
                columns={columns}
                dataSource={this.state.data}
                pagination={false}
                onRow={e => ({
                  onClick: () => {
                    this.showTable(e, true);
                  },
                })}
                rowClassName={record => {
                  return record.editable ? styles.editable : '';
                }}
                rowKey={record => record.key}
              />

              <Button
                style={{ width: 875, marginTop: 16, marginBottom: 8 }}
                type="dashed"
                onClick={this.newMember}
                icon="plus"
              >
                新增
              </Button>
            </div>
            <div
              className={this.state.flag ? styles.tableshow : styles.tablenone}
              style={{ overflowY: 'auto', float: 'right', width: 800, height: 500 }}
            >
              <TableAdress
                title={`${companyName}`}
                loading={this.state.loading}
                callbackParent={this.onChildChanged}
                dataSource={sdata}
                pagination={false}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
