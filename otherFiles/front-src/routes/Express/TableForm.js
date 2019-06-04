import React, { PureComponent, Fragment } from 'react';
import {connect} from 'dva';
import { Table, Button, Input, message, Popconfirm, Divider } from 'antd';
import styles from './ExpressProfile.less';
import TableAdress from './TableAdress';
import { saveOrupdateExpress } from '../../services/api';

@connect(({ express, loading }) => ({
  express,
  loading: loading.models.express,
}))
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

  onChildChanged = newState => {
    console.log(newState)
  };
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

      company: '',
      network: '',
      networkphone: '',
      dotcharge: '',
      dotphone: '',
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

  searchProvice = e => {
    window.sessionStorage.setItem('expressid', e.id)
    const params = `terms[0].value=${e.id}&terms[0].column=expressid&paging=false`;
    this.props.dispatch({
      type: 'express/getLogisticsData',
      payload: params,
      callback: (res) => {
        this.setState({
          expressdata: res,
        })
      },
    })
  };

  showTable = (e, flag) => {
    this.searchProvice(e);

    this.setState({
      flag,
      name: e.company,
      id: e.id,
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
      saveOrupdateExpress(target).then(response => {
        if (response && response.status === 200) {
          this.toggleEditable(e, key);
          this.props.onChange(this.state.data);
          this.setState({
            loading: false,
          });
        }
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
        title: '快递公司名称',
        dataIndex: 'company',
        key: 'company',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.company}
                autoFocus
                onChange={e => this.handleFieldChange(e, 'company', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="快递公司名称"
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
        dataIndex: 'phone',
        key: 'phone',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.phone}
                onChange={e => this.handleFieldChange(e, 'phone', record.key)}
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
        dataIndex: 'dotcharge',
        key: 'dotcharge',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.liable}
                onChange={e => this.handleFieldChange(e, 'dotcharge', record.key)}
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
        dataIndex: 'dotphone',
        key: 'dotphone',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.liablephone}
                onChange={e => this.handleFieldChange(e, 'dotphone', record.key)}
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
          <div>
            <div >
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
                rowKey={record => record.id}
              />

              <Button
                style={{ position: 'absolute', width: '96%', marginTop: 16, marginBottom: 8 }}
                type="dashed"
                onClick={this.newMember}
                icon="plus"
              >
                新增
              </Button>
            </div>

            <div
              className={this.state.flag ? styles.tableshow : styles.tableshow}
              style={{ overflowY: 'auto', height: 500, marginTop: 50 }}
            >
              <TableAdress
                title={`${companyName}`}
                loading={this.state.loading}
                callbackParent={this.onChildChanged}
                pagination={false}
                saveData={this.props.saveData}
                expressid={this.state.id}
                expressdata={this.state.expressdata}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
