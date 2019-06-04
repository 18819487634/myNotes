import React, { PureComponent, Fragment } from 'react';
import { Table, message,Select,Input,DatePicker,Cascader} from 'antd';
import moment from 'moment';
import styles from './InquiryProfile.less';

import { getMyDate, takeWayEnum, payWayEnum } from '../../utils/utils';
import { queryProvince, queryDeliveryWay } from '../../services/api';


const {Option} = Select;
const creditArr=["优","良","中","差"];
export default class FastTableTop extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      
      data: props.dataSource,
      loading: false,
      deliveryways:[], 
      concatData:
        [{
          key:'comment1',
          usrid:""},
    
         
        {
          key:'address1',
          usrid:"",
          provice:"",
          shipphone:"",
          shipreceiver:"",
          provicelabel:"",
        },
        ],
      
    };
  }
  componentDidMount() {
    
    queryProvince().then((ress=>{
      if(ress && ress.status===200){
        
        const proviceDatas= ress.result.data;
        for(let i=0;i<proviceDatas.length;i++){
          proviceDatas[i].key=`${proviceDatas[i].codeP}`;
          proviceDatas[i].value=`${proviceDatas[i].codeP}`;
          proviceDatas[i].label=`${proviceDatas[i].name}`;
          const childrendatas = proviceDatas[i].children;
          for(let j=0;j<childrendatas.length;j++){
            childrendatas[j].value=`${childrendatas[j].codeC}`;
            childrendatas[j].key=`${childrendatas[j].codeC}`;
            childrendatas[j].label=`${childrendatas[j].name}`;
            const childrenAear = childrendatas[j].areas;
            for(let z=0;z<childrenAear.length;z++){
              childrenAear[z].value=`${childrenAear[z].codeA}`;
              childrenAear[z].key=`${childrenAear[z].codeA}`;
              childrenAear[z].label=`${childrenAear[z].name}`;
            }
            proviceDatas[i].children[j].children =childrenAear;
          }
          proviceDatas[i].children =childrendatas;
        }
        const deliveryTerms = `paging=false&sorts[0].value=no&sort[0].order=asc`;
        queryDeliveryWay(deliveryTerms).then(res=>{
          if(res && res.status === 200){
           const deliveryways =[];
           const results = res.result.data;
           for(let r =0;r<results.length;r+=1){
            const valil = {
              value : parseInt(results[r].value,10),
              key : results[r].name,
              id :results[r].id,
            }
            deliveryways.push(valil);
           }
           this.setState({
            options:proviceDatas,
            deliveryways,
          }) 
          }
        });
       
      }
      }))
      
    }
  componentWillReceiveProps(nextProps) {

    
    
    if(nextProps.value !== undefined){
      const value1 = nextProps.value[nextProps.value.length - 2];
      const value2 = nextProps.value[nextProps.value.length - 1];
     
      const values = [value1,value2];
      
      this.setState({
        
        concatData:values,
      })
    }else{
      const datas = nextProps.dataSource;
      const concat1 = this.state.concatData;
      concat1[0].usrid = datas[0].comment;
      concat1[1].shipreceiver = datas[0].shipreceiver;
      concat1[1].shipphone = datas[0].shipphone;
      concat1[1].usrid = datas[0].address;
      concat1[1].provice = datas[0].provice;
      concat1[1].provicelabel = datas[0].provicelabel;
      this.setState({
        data:datas,
        concatData:concat1,
      })
    }
    
  }
  //   if(nextProps.value.length>0){
  //     const nextValue = nextProps.value;
  //     nextValue.splice(nextValue.length-1,1);
  //     this.setState({
  //       data: nextValue,
        
        
  //     });
  //   }else{
  //   this.setState({
  //     data: nextProps.dataSource,
      
      
  //   });
    
  // }
  
  // componentDidUpdate(prevProps, prevState) {
  //   const nextValue = prevProps.value;

  //  // this.props.onChange(nextValue);
  // }
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
    this.props.onChange(newData.concat(this.state.concatData));
  }

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }
  handleFieldChange(e, fieldName, key) {
    
    const newData = this.state.concatData.map(item => ({ ...item }));
   
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ concatData: newData },()=>{
        this.props.onChange(this.state.data.concat(newData));
      });
      
    }
    
  }
  handleFieldSelectChange(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
   
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      this.setState({ data: newData });
      
    }
    this.props.onChange(newData.concat(this.state.concatData));
  }

  handleFieldCascaderChange(e,option, fieldName, key) {
    
    const newData = this.state.concatData.map(item => ({ ...item }));
    const fieldName1 = "provicelabel";
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      const labels = [option[0].name,option[1].name];
      if(option.length === 3){
        labels.push(option[2].name);
      }
      target[fieldName] = e;
      target[fieldName1] = labels;
      this.setState({ concatData: newData },()=>{
        this.props.onChange(this.state.data.concat(this.state.concatData));
      });
      
    }
    
  }
  handleDatachange(e,b, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = b;     
      this.setState({ data: newData });
      this.props.onChange(newData.concat(this.state.concatData));
     
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
  cascaderonChange =(value)=>{

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
    const {deliveryways} = this.state;
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
      
      
      arrData= dataSource.concat(this.state.concatData); 
      
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
          if(`${record.key}`=== "comment1" ||`${record.key}`=== "address1"){
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
        render:(val,record)=>{
          if( `${record.key}`=== "address1"){
            return { 
              children :
  <div>
    <span style={{ fontWeight: 600,float:"left" ,width:100,marginTop:8}} >地址</span>
    {/* <Cascader style={{ fontWeight: 600,float:"left",width:400 }} options={this.state.options} placeholder="省/市/区" onChange={this.cascaderonChange} />   */}
    <Cascader  value={record.provice}  style={{ fontWeight: 600,float:"left",width:300 }}  options={this.state.options} placeholder="省/市/区"  onChange={(e,o)=> this.handleFieldCascaderChange(e, o,'provice', record.key)} />   
    <Input value={record.usrid} style={{ fontWeight: 600,float:"left",width:200 }} onChange={e => this.handleFieldChange(e, 'usrid', record.key)}  />
    <span style={{ fontWeight: 600,float:"left" ,width:60,marginTop:8}} >收件人</span>
    <Input value={record.shipreceiver} style={{ fontWeight: 600,float:"left",width:100 }} onChange={e => this.handleFieldChange(e, 'shipreceiver', record.key)}  />
    <span style={{ fontWeight: 600,float:"left" ,width:60,marginTop:8}} >电话</span>
    <Input value={record.shipphone} style={{ fontWeight: 600,float:"left",width:150 }} onChange={e => this.handleFieldChange(e, 'shipphone', record.key)}  />
  </div>,
             
                  props:{
                    colSpan:8,
                  },
                }
          }
          else if(`${record.key}`=== "comment1" ){
            return { 
              children :<div  ><span  style={{ fontWeight: 600,float:"left" ,width:100,marginTop:8}}>备注</span><Input value={record.usrid} style={{ fontWeight: 600,float:"left",width:400 }} onChange={e => this.handleFieldChange(e, 'usrid', record.key)} /></div>,
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
          
          if(`${record.key}`=== "comment1" ||`${record.key}`=== "address1"){
            return renderContent(text, record,index);
          }else{
            return (
              <DatePicker defaultValue={moment(text,'YYYY-MM-DD')} onChange={(e,b)=>this.handleDatachange(e,b,'deliverydate',record.key)} />);
          }
          
        },
      }, {
        title: '取货方式',
        dataIndex: 'takeway',
        key: 'takeway',
        width: '10%',
        render: (text, record,index) => {
          
          if(`${record.key}`=== "comment1" ||`${record.key}`=== "address1"){
            return renderContent(text, record,index);
          }else{
            return (
            
              <Select  defaultValue={dataSource[0].takeway}   onChange={e => this.handleFieldSelectChange(e, 'takeway', record.key)}>
                {deliveryways.map(takewayData=><Option key={takewayData.id} value={takewayData.value} >{takewayData.key}</Option>)}
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
          if(`${record.key}`=== "comment1" ||`${record.key}`=== "address1"){
            return renderContent(text, record,index);
          }else{
          return (
            
            <Select   defaultValue={dataSource[0].payway}   onChange={e => this.handleFieldSelectChange(e, 'payway', record.key)}>
              {payWayEnum.map(paywayData=><Option key={paywayData.value} value={paywayData.value} >{paywayData.key}</Option>)}
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
        render:(value, row, index) => {
          const obj = {
            children: creditArr[value],
            props: {},
          };
          // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
          if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length ) {
            obj.props.colSpan = 0;
          }
          return obj;
        },
        
      }, 
      {
        title: '询价状态',
        dataIndex: 'recordstatus',
        key: 'recordstatus',
        width: '10%',
        render: (text, record,index) => {
          if(`${record.key}`=== "comment1" ||`${record.key}`=== "address1"){
           return renderContent(text, record,index);
          }else{
          return (
            
            <Select  defaultValue={dataSource[0].recordstatus}   onChange={e => this.handleFieldSelectChange(e, 'recordstatus', record.key)}>
              <Option value={0}>正常</Option>
              <Option value={1}>加急</Option>
              <Option value={2}>现场</Option>
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
          if(`${record.key}`=== "comment1" ||`${record.key}`=== "address1"){
            return renderContent(text, record,index);
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
