import React, { PureComponent, Fragment } from 'react';
import { Table } from 'antd';
import styles from './PickUpProfile.less';
import { getMyDate } from '../../utils/utils';


let arrData = [];
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

  componentDidMount() {
    this.props.onChange(this.state.data);
  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        data: nextProps.dataSource,
      });
    }
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

    if (dataSource.length > 0) {
      const concatData = [
        {
          key:"comment1",
          id: `备注:${dataSource[0].comment}`,
        },
        {
          key:'adress1',
          id: `收货地址:${dataSource[0].address}`,
        },
      ];
      arrData = dataSource.concat(concatData);
    } else {
      arrData = dataSource;
    }

    const columns = [
      {
        title: '预售单编号',
        dataIndex: 'id',
        key: 'id',
        width: '10%',
        render: (val, recode) => {
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
                <li key={recode.id}>{dataSource[0].id}</li>
                <li key={recode.makedate}>{getMyDate(dataSource[0].makedate)}</li>
              </div>
            );
          }
        },
      },
      {
        title: '客户',
        dataIndex: 'userids',
        key: 'userids',
        width: '10%',
        render: renderContent,
      },
      // {
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
        render: (value) => {
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
       
        render: (value) => {
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
        render: renderContent,
      },
      {
        title: '拣货单状态',
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
        render: (value) => {
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
          rowKey={record => record.key}
          rowClassName={record => {
            return record.editable ? styles.editable : '';
          }}
        />
      </Fragment>
    );
  }
}
