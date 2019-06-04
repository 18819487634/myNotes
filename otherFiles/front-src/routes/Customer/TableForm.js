import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, message, Popconfirm, Divider, Tag } from 'antd';
import styles from './CustomerProfile.less';

import { queryExpressCost, saveOrupdateContact, deleteContact, queryErpClientContact } from '../../services/api';

const arrData = [];

export default class TableForm extends PureComponent {
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
    }else if( nextProps.dataSource.erpid !== this.state.erpid  ){
      this.setState({
        data: nextProps.dataSource,
        erpid: nextProps.dataSource.erpid,
      });
    }
    
    // if( nextProps.dataSource.erpid !== ""  && nextProps.dataSource.erpid !== this.state.erpid){
    //   this.setState({
    //     data: nextProps.dataSource,
    //   });
    // }
    
    
    
    
    
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
  remove(record) {
    // this.props.dispatch({
    //   type: 'erpclient/deleteContacts',
    //   payload: record,
    //   callback: () => {
       
    //   },
    // });

    deleteContact(record).then(res=>{
      if(res && res.status ===200){
        message.success("删除成功！");
        const newData = this.state.data.filter(item => item.key !== record.key);
        this.setState({ data: newData });
       this.props.onChange(newData);
      }
    })
    
  }
  newMember = () => {
    const newData = this.state.data.map(item => ({ ...item }));
    newData.push({
      key: `contact_${this.index}`,
      id: '',
      contact: '',
      clientid:this.state.erpid,
      duties: '',
      phone: '',
      centerid: '',
      qq: '',
      weixin: '',
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
    // if(this.state.erpid === ""){
    //   this.setState({
    //     erpid:'1',
    //   })
    // }
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData }, () => {
        this.props.onChange(this.state.data);
      });
    }
  }

  searchProvice = e => {
    const params = `terms[0].value=${e.id}&terms[0].column=expressid`;
    queryExpressCost(params).then();
  };

  showTable = (e, flag) => {
    this.searchProvice(e);

    this.setState({
      flag,
      name: e.company,
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
      if(target.id === ''){
        delete target.id;
      }
      delete target.isNew;
      saveOrupdateContact(target).then(response => {
        if (response && response.status === 200) {
          this.toggleEditable(e, key);
          const terms = `terms[0].value=${target.clientid}&terms[0].column=clientid`;
          queryErpClientContact(terms).then(res=>{
            if(res && res.status===200){
              const resultData = res.result.data;
              message.success("添加成功!");
              for(let i =0;i<resultData.length;i+=1){
                resultData[i].key = `concatList${i}`
              }
              this.setState({
                loading: false,
                data:resultData,
              },()=>{
                this.props.onChange(this.state.data);
              });
              
            }
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
    const {data}  =this.state;
    const columns = [
      {
        title: '联系人',
        dataIndex: 'contact',
        key: 'contact',
        width: '10%',
        render: (text, record) => {
          return (
            <Input maxlength="50" value={text} onChange={e => this.handleFieldChange(e, 'contact', record.key)} />
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
            <Input maxlength="50" value={text} onChange={e => this.handleFieldChange(e, 'duties', record.key)} />
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
            <Input maxlength="30" value={text} onChange={e => this.handleFieldChange(e, 'phone', record.key)} />
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
          return <Input maxlength="30" value={text} onChange={e => this.handleFieldChange(e, 'qq', record.key)} />;
        },
      },
      {
        title: '微信',
        dataIndex: 'weixin',
        key: 'weixin',
        width: '10%',
        render: (text, record) => {
          return (
            <Input maxlength="30" value={text} onChange={e => this.handleFieldChange(e, 'weixin', record.key)} />
          );
        },
      },
      {
        title: '操作',
        key: 'action',
        width: '10%',
        render: (text, record) => {
          if (!!record.editable && this.state.loading) {
            return null;
          }
          // if (record.erpid && record.editable) {
          //   if (record.isNew) {
          //     return (
          //       <span>
          //         <a onClick={e => this.saveRow(e, record.key)}>添加</a>
          //         <Divider type="vertical" />
          //         <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
          //           <a>删除</a>
          //         </Popconfirm>
          //       </span>
          //     );
          //   }
          //   return (
          //     <span>
          //       <a onClick={e => this.saveRow(e, record.key)}>保存</a>
          //       <Divider type="vertical" />
          //       <a onClick={e => this.cancel(e, record.key)}>取消</a>
          //     </span>
          //   );
          // }
          if(record.id === ""){
            return (
              <span>
                {/* <a onClick={e => this.toggleEditable(e, record.key)}>编辑</a> */}
                <a onClick={e => this.saveRow(e, record.key)}>保存</a>
                
              </span>
            ); 
          }else if(record.clientid!==""){
            return (
              <span>
                {/* <a onClick={e => this.toggleEditable(e, record.key)}>编辑</a> */}
                <a onClick={e => this.saveRow(e, record.key)}>保存</a>
                <Divider type="vertical" />
                <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record)}>
                  <a>删除</a>
                </Popconfirm>
              </span>
            );
          }
          
        },
      },
    ];
   
    if(this.state.erpid === "" ){
      columns.splice(columns.length-1,1);
    }

    return (
      <Fragment>
        <div className={styles.tableList}>
          <div style={{ width: 800 }}>
            <div>
              <Button onClick={this.newMember}>添加</Button>
            </div>
            <div className={styles.tableList}>
              <Table
                title={() => '业务联系人'}
                loading={this.state.loading}
                columns={columns}
                dataSource={data}
                pagination={false}
                rowKey="id"
                bordered
              />
            </div>
            {/* <div style={{ width: 875, float: 'left' }}>
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
              /> */}

              {/* <Button
                style={{ width: 875, marginTop: 16, marginBottom: 8 }}
                type="dashed"
                onClick={this.newMember}
                icon="plus"
              >
                新增
              </Button> */}
            {/* </div> */}

          </div>
        </div>
      </Fragment>
    );
  }
}
