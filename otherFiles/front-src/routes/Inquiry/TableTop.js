import React, { PureComponent, Fragment } from 'react';
import { Table, message,Select,Input,DatePicker} from 'antd';
import moment from 'moment';
import styles from './InquiryProfile.less';

import { getMyDate } from '../../utils/utils';


const {Option} = Select;
export default class TableForm extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      
      data: props.value,
      loading: false,
    };
  }
  componentDidMount(){
  
    this.props.onChange(this.state.data);
    
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
  handleDatachange(e,b, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = b;     
      this.setState({ data: newData });
      
     
    }
    
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

    const  dataSource =  this.state.data;
    let arrData = [];
  
    const renderContent = (value, row, index) => {
      const obj = {
        children: value,
        props: {},
      };
      // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
      if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length ) {
        obj.props.colSpan = 0;
      }
      return obj;
    };
    
    if(dataSource.length >0){
      
      const   concatData = [{
        usrid:`备注:${dataSource[0].comment}`,
  
      },
      {
        usrid:`收货地址:${dataSource[0].address}`,
      },
      ]
      arrData= dataSource.concat(concatData); 
      
    }else{
      arrData = dataSource;
    }
 
    
    const columns = [
      {
        title: '询价单编号',
        dataIndex: 'id',
        key: 'id',
        width: '10%',
        render:(text,record,index)=>{
          if(`${record.usrid}`.indexOf("备注") >-1 || `${record.usrid}`.indexOf("地址") >-1){
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length ) {
              obj.props.colSpan = 0;
            }
            return obj;
          }else{
          return (
            <div>
              <li>
                {dataSource[0].id}
              </li>
              <li>
                {getMyDate(dataSource[0].makedate)}
              </li>  
                 
            </div>
          );
        }
        },
        
       
      
      },
      {
        title: '客户',
        dataIndex: 'usrid',
        key: 'usrid',
        width: '10%',
        render:(val)=>{
          if( `${val}`.indexOf("地址") >-1){
            return { 
              children :<span style={{ fontWeight: 600,float:"left",marginLeft:'3%' }}>{val}</span>,
                  props:{
                    colSpan:8,
                  },
                }
          }else if(`${val}`.indexOf("备注") >-1 && val.length<3){
            return { 
              children :<div><span>备注</span><Input style={{ fontWeight: 600,float:"left",marginLeft:'3%',width:200 }} /></div>,
                  props:{
                    colSpan:8,
                  },
                }
          }
          else if(`${val}`.indexOf("备注") >-1){
            return { 
              children :<span style={{ fontWeight: 600,float:"left",marginLeft:'3%' }}>{val}</span>,
                  props:{
                    colSpan:8,
                  },
                }
          }else{
          return (
            <div>{val}</div>
          );
        }
        },
      
      }, {
        title: '最迟货期',
        dataIndex: 'deliverydate',
        key: 'deliverydate',
        width:'10%',
        render: (text, record,index) => {
          
          if(`${record.usrid}`.indexOf("备注") >-1 || `${record.usrid}`.indexOf("地址") >-1){
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length ) {
              obj.props.colSpan = 0;
            }
            return obj;
          }else{
            return (
              <DatePicker  onChange={(e,b)=>this.handleDatachange(e,b,'deliverydate',record.key)} />);
          }
          
        },
      }, {
        title: '取货方式',
        dataIndex: 'takeway',
        key: 'takeway',
        width: '10%',
        render: (text, record,index) => {
          
          if(`${record.usrid}`.indexOf("备注") >-1 || `${record.usrid}`.indexOf("地址") >-1){
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length ) {
              obj.props.colSpan = 0;
            }
            return obj;
          }else{
            return (
            
              <Select  defaultValue={dataSource[0].takeway}   onChange={e => this.handleFieldSelectChange(e, 'takeway', record.key)}>
                <Option value={0}>自提</Option>
                <Option value={1}>快递</Option>
                <Option value={2}>物流</Option>
              </Select>
            );
          }
          
        },
      },{
        title: '支付方式',
        dataIndex: 'payway',
        key: 'payway',
        width: '10%',
        render: (text, record,index) => {
          if(`${record.usrid}`.indexOf("备注") >-1 || `${record.usrid}`.indexOf("地址") >-1){
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length ) {
              obj.props.colSpan = 0;
            }
            return obj;
          }else{
          return (
            
            <Select   defaultValue={dataSource[0].payway}   onChange={e => this.handleFieldSelectChange(e, 'payway', record.key)}>
              <Option value={0}>在线</Option>
              <Option value={1}>货到付款</Option>
              <Option value={2}>现金</Option>
            </Select>
          );
        }
        },
        
      },
       {
        title: '客户评级 ',
        dataIndex: 'credit',
        key: 'credit',
        width: '5%',
        render:renderContent,
      }, 
      {
        title: '询价状态',
        dataIndex: 'recordstatus',
        key: 'recordstatus',
        width: '10%',
        render: (text, record,index) => {
          if(`${record.usrid}`.indexOf("备注") >-1 ||`${record.usrid}`.indexOf("地址") >-1){
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length ) {
              obj.props.colSpan = 0;
            }
            return obj;
          }else{
          return (
            
            <Select  defaultValue={dataSource[0].recordstatus}   onChange={e => this.handleFieldSelectChange(e, 'recordstatus', record.key)}>
              <Option value={0}>正常</Option>
              <Option value={1}>加急</Option>
              
            </Select>
          );
        }
        },
        
      },
      // {
      //   title: '支付类型',
      //   dataIndex: 'paywaytype',
      //   key: 'paywaytype',
      //   width: '10%',
      //   render: (text, record) => {
          
      //     return (
            
      //       <Select  defaultValue={dataSource[0].paywaytype}   onChange={e => this.handleFieldSelectChange(e, 'paywaytype', record.key)}>
      //         <Option value={0}>拣货费/定金</Option>
      //         <Option value={1}>全款</Option>
      //         <Option value={2}>无需担保</Option>
      //       </Select>
      //     );
      //   },
        
      // },
      // {
      //   title: '支付比例',
      //   dataIndex: 'paypercent',
      //   key: 'paypercent',
      //   width: '10%',
        
      //   render: (text, record) => {
         
      //       return (
      //         <InputNumber
      //           defaultValue={dataSource[0].paypercent}
      //           min={0}
      //           max={100}
      //           formatter={value => `${value}%`}
      //           parser={value => value.replace('%', '')}
                
      //           onChange={e => this.handleFieldSelectChange(e, 'paypercent', record.key)}
      //         />
      //       );
          
      //   },
      // },
      {
        title: '超时提醒',
        dataIndex: 'paystatus',
        key: 'paystatus',
        width: '10%',
        render: (text, record,index) => {
          if(`${record.usrid}`.indexOf("备注") >-1 || `${record.usrid}`.indexOf("地址") >-1){
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length ) {
              obj.props.colSpan = 0;
            }
            return obj;
          }else{
          return (
            
            <Select defaultValue={dataSource[0].paystatus} onChange={e => this.handleFieldSelectChange(e, 'paystatus', record.key)}>
              <Option value={0}>1小时</Option>
              <Option value={1}>4小时</Option>
              <Option value={2}>12小时</Option>
              <Option value={3}>24小时</Option>
              <Option value={4}>无</Option>
            
            </Select>
          );
        }
        },
        
      },
      
    ];
    if(dataSource[0].id===undefined){
      columns.splice(0,1);
    }

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
