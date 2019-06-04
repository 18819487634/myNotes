import React, { PureComponent, Fragment } from 'react';
import { Table } from 'antd';

import styles from './CustomerProfile.less';

// const productData = new Map();

export default class ContactTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.dataSource,
    };
  }
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    if (nextProps.value === undefined) {
      this.setState({
        data: nextProps.dataSource,
      });
    }
  }

  render() {
    const columns = [
        // {
        //   title: '序号',
        //   dataIndex: 'ids',
        //   key: 'ids',
        //   width:'2%',
        //   render:val=>return val;     
        // },
        {
          title: '联系人',
          dataIndex: 'contact',
          key: 'contact',
          width: '10%',
        },{
          title: '职务',
          dataIndex: 'duties',
          key: 'duties',
          width: '10%',
                 
        },{
          title: '电话',
          dataIndex: 'phone',
          key: 'phone',
          width: '10%',        
        }, {
          title: '联系人平台ID',
          dataIndex: 'centerid',
          key: 'centerid',
          width: '10%',        
        },
        {
          title: 'QQ',
          dataIndex: 'qq',
          key: 'qq',
          width: '10%',        
        },
        {
          title: '微信',
          dataIndex: 'weixin',
          key: 'weixin',
          width: '10%',        
        },
        
      ];

    return (
      <Fragment>
        <div className={styles.tableList}>
          <Table
            title={() => '业务联系人'}
            loading={this.state.loading}
            columns={columns}
            dataSource={this.state.data}
            pagination={false}
            rowKey="id"
            bordered
          />
        </div>
      </Fragment>
    );
  }
}
