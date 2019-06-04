import React, { PureComponent, Fragment } from 'react';
import { Table } from 'antd';
import styles from './SaleProfile.less';
import { getMyDate, creditList } from '../../utils/utils';

const takewayArr = ['自提', '快递', '物流', '送货上门'];
const paywayArr = ['在线支付', '货到付款', '物流代收', '现金'];
const recordstatusArr = ['正常', '加急'];

export default class TableTop extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: props.dataSource,
      loading: false,
    };
  }
  componentWillReceiveProps(nextProps) {
      this.setState({
        data: nextProps.dataSource,
      });
    
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
    this.props.onChange({ newData: { ...newData } });
  }

  render() {
    const renderContent = (value, row, index) => {
      const obj = {
        children: value,
        props: {},
      };
      // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
      if (
        index === dataSource.length ||
        index - 1 === dataSource.length ||
        index - 2 === dataSource.length ||
        index - 3 === dataSource.length ||
        index - 4 === dataSource.length ||
        index - 5 === dataSource.length ||
        index - 6 === dataSource.length ||
        index - 7 === dataSource.length ||
        index - 8 === dataSource.length
      ) {
        obj.props.colSpan = 0;
      }
      return obj;
    };
    const dataSource = this.state.data;
    let arrData = [];
   
    if (dataSource.length > 0) {
      const concatData = [
        {
          id: `备注:${dataSource[0].comment}`,
        },
        {
          id: `收货地址:${dataSource[0].address}`,
        },
      ];
      arrData = dataSource.concat(concatData);
    } else {
      arrData = dataSource;
    }
    console.log("value",arrData);
    const columns = [
      {
        title: '销售单编号',
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
                colSpan: 7,
              },
            };
          } else {
            return (
              <div>
                <li>{dataSource[0].id}</li>
                <li>{getMyDate(dataSource[0].makedate)}</li>
              </div>
            );
          }
        },
      },
      {
        title: '客户',
        dataIndex: 'clientname',
        key: 'clientname',
        width: '10%',
        render: renderContent,
        
      },
      //  {
      //   title: '最早货期',
      //   dataIndex: 'deliverydate',
      //   key: 'deliverydate',
      //   width: '10%',
      //   render: renderContent,
      // },
      {
        title: '取货方式',
        dataIndex: 'takewayname',
        key: 'takewayname',
        width: '10%',

        render: value => {
          if (value !== undefined) {
            return <span>{value}</span>;
          } else {
            const obj = {
              children: value,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0

            obj.props.colSpan = 0;
            return obj;
          }
        },
      },
      {
        title: '支付方式',
        dataIndex: 'payway',
        key: 'payway',
        width: '10%',
        
        render: value => {
          if (value !== undefined) {
            
            return <span>{paywayArr[value]}</span>;
          } else {
            const obj = {
              children: value,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0

            obj.props.colSpan = 0;
            return obj;
          }
        },
      },
      {
        title: '客户评级 ',
        dataIndex: 'credit',
        key: 'credit',
        width: '5%',
        render: value => {
          if (value !== undefined) {
            return <span>{creditList[value]}</span>;
          } else {
            const obj = {
              children: value,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0

            obj.props.colSpan = 0;
            return obj;
          }
        },
      },
      {
        title: '销售单状态',
        dataIndex: 'ismerge',
        key: 'ismerge',
        width: '10%',
        filters: [
          {
            text: recordstatusArr[0],
            value: 0,
          },
          {
            text: recordstatusArr[1],
            value: 1,
          },
        ],
        onFilter: (value, record) => record.ismerge.toString() === value,
        render: value => {
          if (value !== undefined) {
            return <span>{recordstatusArr[value]}</span>;
          } else {
            const obj = {
              children: value,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0

            obj.props.colSpan = 0;
            return obj;
          }
        },
      },
    ];

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
