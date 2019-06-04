import React, { PureComponent, Fragment } from 'react';
import { Table, message, Select, Input } from 'antd';
import styles from './DeliverProfile.less';
import { removeCompanyAddress } from '../../services/api';

const { Option } = Select;
export default class TableForm extends PureComponent {
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
  handlechange(e, fieldName, key) {
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

  render() {
    const dataSource = this.state.data;
    let arrData = [];

    const renderContent = (value, row, index) => {
      const obj = {
        children: value,
        props: {},
      };
      // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
      if (
        index === dataSource.length ||
        index - 1 === dataSource.length ||
        index - 2 === dataSource.length
      ) {
        obj.props.colSpan = 0;
      }
      return obj;
    };
    if (dataSource.length) {
      const concatData = [
        {
          id: `备注:${dataSource[0].remake}`,
        },
        {
          id: `收货地址:${dataSource[0].address}`,
        },
      ];
      arrData = dataSource.concat(concatData);
    } else {
      arrData = dataSource;
    }

    const columns = [
      {
        title: '出库单编号',
        dataIndex: 'id',
        key: 'id',
        width: '10%',
        render: val => {
          if (val.indexOf('备注') > -1 || val.indexOf('地址') > -1) {
            return {
              children: (
                <span style={{ fontWeight: 600, float: 'left', marginLeft: '3%' }}>{val}</span>
              ),
              props: {
                colSpan: 9,
              },
            };
          } else {
            return (
              <div>
                <li>{dataSource[0].id}</li>
                <li>{dataSource[0].makedate}</li>
              </div>
            );
          }
        },
      },
      {
        title: '客户',
        dataIndex: 'clientid',
        key: 'clientid',
        width: '10%',
        render: renderContent,
      },
      // {
      //   title: '最迟货期',
      //   dataIndex: 'deliverydate',
      //   key: 'deliverydate',
      //   width: '10%',
      //   render:renderContent,
      // },
      {
        title: '出库单状态',
        dataIndex: 'status',
        key: 'status',
        width: '10%',
        render: (text, record, index) => {
          if (`${record.id}`.indexOf('备注') > -1 || `${record.id}`.indexOf('地址') > -1) {
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (
              index === dataSource.length ||
              index - 1 === dataSource.length ||
              index - 2 === dataSource.length
            ) {
              obj.props.colSpan = 0;
            }
            return obj;
          } else {
            return (
              <Select
                defaultValue={dataSource[0].payway}
                onChange={e => this.handleFieldSelectChange(e, 'status', record.key)}
              >
                <Option value={0}>正常</Option>
                <Option value={1}>加急</Option>
              </Select>
            );
          }
        },
      },
      {
        title: '送货方式',
        dataIndex: 'takeway',
        key: 'takeway',
        width: '10%',
        render: (text, record, index) => {
          if (`${record.id}`.indexOf('备注') > -1 || `${record.id}`.indexOf('地址') > -1) {
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (
              index === dataSource.length ||
              index - 1 === dataSource.length ||
              index - 2 === dataSource.length
            ) {
              obj.props.colSpan = 0;
            }
            return obj;
          } else {
            return (
              <Select
                defaultValue={dataSource[0].takeway}
                onChange={e => this.handleFieldSelectChange(e, 'takeway', record.key)}
              >
                <Option value={0}>自提</Option>
                <Option value={1}>快递</Option>
                <Option value={2}>物流</Option>
              </Select>
            );
          }
        },
      },

      {
        title: '车牌/物流单号',
        dataIndex: 'expressno',
        key: 'expressno',
        width: '15%',
        render: (text, record, index) => {
          if (`${record.id}`.indexOf('备注') > -1 || `${record.id}`.indexOf('地址') > -1) {
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (
              index === dataSource.length ||
              index - 1 === dataSource.length ||
              index - 2 === dataSource.length
            ) {
              obj.props.colSpan = 0;
            }
            return obj;
          } else {
            return (
              <Input
                placeholder=""
                onChange={e => this.handlechange(e, 'expressno', record.key)}
                style={{ width: 100 }}
              />
            );
          }
        },
      },
      // {
      //   title: '物流/快递单号',
      //   dataIndex: 'no',
      //   key: 'no',
      //   width: '10%',
      //   render: (text, record,index) => {
      //     if(`${record.id}`.indexOf("备注") >-1 ||`${record.id}`.indexOf("地址") >-1){
      //       const obj = {
      //         children: text,
      //         props: {},
      //       };
      //       // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
      //       if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length ) {
      //         obj.props.colSpan = 0;
      //       }
      //       return obj;
      //     }else{
      //     return (

      //       <Input
      //         placeholder=""
      //         onChange={e => this.handlechange(e, 'no', record.key)}
      //         style={{ width: 100 }}
      //       />
      //     );
      //   }
      //   },

      // },
      {
        title: '配送人',
        dataIndex: 'deliveryman',
        key: 'deliveryman',
        width: '10%',
        render: (text, record, index) => {
          if (`${record.id}`.indexOf('备注') > -1 || `${record.id}`.indexOf('地址') > -1) {
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (
              index === dataSource.length ||
              index - 1 === dataSource.length ||
              index - 2 === dataSource.length
            ) {
              obj.props.colSpan = 0;
            }
            return obj;
          } else {
            return (
              <Input
                placeholder=""
                onChange={e => this.handlechange(e, 'deliveryman', record.key)}
                style={{ width: 100 }}
              />
            );
          }
        },
      },
      {
        title: '配送人电话',
        dataIndex: 'deliveryphone',
        key: 'deliveryphone',
        width: '10%',
        render: (text, record, index) => {
          if (`${record.id}`.indexOf('备注') > -1 || `${record.id}`.indexOf('地址') > -1) {
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (
              index === dataSource.length ||
              index - 1 === dataSource.length ||
              index - 2 === dataSource.length
            ) {
              obj.props.colSpan = 0;
            }
            return obj;
          } else {
            return (
              <Input
                placeholder=""
                onChange={e => this.handlechange(e, 'deliveryphone', record.key)}
                style={{ width: 100 }}
              />
            );
          }
        },
      },
    ];

    if (dataSource[0].id === undefined) {
      columns.splice(0, 1);
    }
    if (dataSource[0].takeway === 0) {
      columns.splice(5, 3);
    }

    return (
      <Fragment>
        <Table
          loading={this.state.loading}
          columns={columns}
          dataSource={arrData}
          pagination={false}
          rowClassName={record => {
            return record.editable ? styles.editable : '';
          }}
        />
      </Fragment>
    );
  }
}
