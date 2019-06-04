import React, { PureComponent, Fragment } from 'react';
import { Table, Input } from 'antd';

import styles from './CustomerProfile.less';
import { Button } from 'antd/lib/radio';

const arrData = [];

// const productData = new Map();

export default class NewTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.dataSource === undefined ? [] : props.dataSource,
      erpid: props.dataSource.erpid,
      loading: false,
    };
  }
  componentDidMount() {
    this.props.onChange({ data: arrData });
  }
  componentWillReceiveProps(nextProps) {
  
    if(nextProps.value === undefined){
      this.setState({
        data: nextProps.dataSource,
      });
    }
    
    if(nextProps.dataSource.erpid !== "" && nextProps.dataSource.erpid !== this.state.erpid){
      this.setState({
        data: nextProps.dataSource,
      });
    }
    
    
    
    
  }
  

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }

  handleFieldChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    if(this.state.erpid === ""){
      this.setState({erpid:'1'});
    }
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData });
    }
    this.props.onChange(this.state.data);
  }
  addContact = () => {
    
    const newData = this.state.data.map(item => ({ ...item }));
    const col = {
      id: '',
      contact: '',
      duties: '',
      phone: '',
      centerid: '',
      qq: '',
      weixin: '',
    };
    newData.push(col);
    this.setState({
      data: newData,
    });
  };

  render() {
    const columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        width: '2%',
      },
      {
        title: '联系人',
        dataIndex: 'contact',
        key: 'contact',
        width: '10%',
        render: (text, record) => {
          return (
            <Input value={text} onChange={e => this.handleFieldChange(e, 'contact', record.key)} />
          );
        },
      },
      {
        title: '职务',
        dataIndex: 'duties',
        key: 'duties',
        width: '10%',
        render: (text, record) => {
          return (
            <Input value={text} onChange={e => this.handleFieldChange(e, 'duties', record.key)} />
          );
        },
      },
      {
        title: '电话',
        dataIndex: 'phone',
        key: 'phone',
        width: '10%',
        render: (text, record) => {
          return (
            <Input value={text} onChange={e => this.handleFieldChange(e, 'phone', record.key)} />
          );
        },
      },
      {
        title: '联系人平台ID',
        dataIndex: 'centerid',
        key: 'centerid',
        width: '10%',
        render: (text, record) => {
          return (
            <Input disabled value={text} onChange={e => this.handleFieldChange(e, 'centerid', record.key)} />
          );
        },
      },
      {
        title: 'QQ',
        dataIndex: 'qq',
        key: 'qq',
        width: '10%',
        render: (text, record) => {
          return <Input value={text} onChange={e => this.handleFieldChange(e, 'qq', record.key)} />;
        },
      },
      {
        title: '微信',
        dataIndex: 'weixin',
        key: 'weixin',
        width: '10%',
        render: (text, record) => {
          return (
            <Input value={text} onChange={e => this.handleFieldChange(e, 'weixin', record.key)} />
          );
        },
      },
    ];

    return (
      <Fragment>
        <div>
          <Button onClick={this.addContact}>添加</Button>
        </div>
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
