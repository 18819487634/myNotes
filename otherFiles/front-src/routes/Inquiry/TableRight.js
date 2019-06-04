import React, { PureComponent, Fragment } from 'react';
import { Table,InputNumber, Tooltip, Checkbox} from 'antd';
import moment from 'moment';
import styles from './TableRight.less'
import {  querysupplydictionry } from '../../services/api';


let beforeProductid ="";
let selectedRowss=[];
const areaMap = new Map();
const selectRowMap = new Map();
export default class TableRight extends PureComponent {
  
  constructor(props) {
    super(props);

    this.state = {
      data: props.dataSource,
      colorname:"",
      productname:"",
      recentBatchno:"",
      loading: false,
      selectedRows:[],
    };
  }
 
  componentDidMount(){
    const params = "terms[0].value=3&terms[0].column=type";
    querysupplydictionry(params).then(res=>{
      if(res && res.status === 200){
        const datas = res.result.data;
        datas.forEach(item=>{
          areaMap.set(item.value,item.key);
        });
      }
    });
 
  }
  
  
  componentWillReceiveProps(nextProps) {
      
      this.setState({
        data: nextProps.dataSource,
        colorname:nextProps.dataSource.colorname,
        productname:nextProps.dataSource.productname,
        inquirynum:nextProps.dataSource.inquirynum,
        recentBatchno:nextProps.dataSource.recentBatchno,
      });
    
    
  }
  componentDidUpdate(nextProps, nextState) {

    if(selectRowMap.get(nextState.data.colorname)){
     selectedRowss = selectRowMap.get(nextState.data.colorname);
     
    }else{
      selectedRowss =[];
    };

    this.state = {
      data: nextState.data,
      loading: false,
      selectedRows:selectedRowss,
      colorname: nextState.data.colorname,
      productname:nextState.data.productname,
      inquirynum:nextState.data.inquirynum,
      recentBatchno:nextState.data.recentBatchno,
      total:nextState.total,
      productid:nextState.productid,
    };
   
   
  }
  onChangeWhole(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    const oncedata = [];
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.checked?1:0;
     
      this.setState({ data: newData });
    }
    
    if(selectedRowss.length!==0){
      newData.forEach(item=>{
        selectedRowss.forEach(sItem=>{
          if(item.key === sItem.key){
            oncedata.push(item);
          }
        })
        
      })
      oncedata.colorname = this.state.colorname;
      oncedata.productname = this.state.productname;
      oncedata.inquirynum = this.state.inquirynum;
      oncedata.recentBatchno = this.state.recentBatchno;
      
      oncedata.tag = true;
      selectRowMap.set(this.state.colorname,oncedata);
      this.setState({
        selectedRows:oncedata,
      });
      this.props.callbackParent(oncedata);
    }else{
      oncedata.push( target);
      oncedata.colorname = this.state.colorname;
      oncedata.productname = this.state.productname;
      oncedata.inquirynum = this.state.inquirynum;
      oncedata.recentBatchno = this.state.recentBatchno;
      oncedata.tag = true;
      selectRowMap.set(this.state.colorname,oncedata);
      this.props.callbackParent(oncedata);
    }
    
  }
 
  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
 

  handleSelectRows = (selectedRowKeys,selectedRows) => {
    const selectData = selectedRows;
    selectRowMap.set(this.state.colorname,selectedRows);
    if(selectData.length !== 0){
      beforeProductid=selectData[0].productid;
      selectData.colorname =this.state.colorname;
      selectData.productname =this.state.productname;
      selectData.inquirynum = this.state.inquirynum;
      selectData.recentBatchno = this.state.recentBatchno;
      selectData.tag = true;
      this.props.callbackParent(selectData);
    }else{
      selectData.id = beforeProductid;
      selectData.colorname = this.state.colorname;
      selectData.productname = this.state.productname;
      selectData.inquirynum = this.state.inquirynum;
      selectData.recentBatchno = this.state.recentBatchno;
      selectData.tag = false;
      this.props.callbackParent(selectData);
    }
   
    
    // this.setState({
    //   selectedRows,
      
    // });
 
  };
  handleRightChange(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));  
    const oncedata = [];
    
    const target = this.getRowByKey(key, newData);
    const numfieldname = "piece"; 
    const weight =  parseFloat((target.totalnw/target.allpiecenum).toFixed(2));
    const maxPieces = target.maxpiece;
    if (target) {
      target[fieldName] = e;
      target[numfieldname]= e===""?0:Math.ceil(e/weight)>maxPieces?maxPieces:Math.ceil(e/weight);
      this.setState({ data: newData });
    }
    oncedata.colorname = this.state.colorname;
      oncedata.productname = this.state.productname;
      oncedata.inquirynum = this.state.inquirynum;
      oncedata.recentBatchno = this.state.recentBatchno;
      oncedata.tag = true;
    if(selectedRowss.length!==0){
      
      newData.forEach(item=>{
        selectedRowss.forEach(sItem=>{
          if(item.key === sItem.key){
            oncedata.push(item);
          }
        })
        
        
      })
      if(oncedata.length===0){
        oncedata.push( target);
      }
      selectRowMap.set(this.state.colorname,oncedata);
      this.setState({
        selectedRows:oncedata,
      });
      this.props.callbackParent(oncedata);
    }else{
     
      oncedata.push( target);
      selectRowMap.set(this.state.colorname,oncedata);
      this.props.callbackParent(oncedata);
    }
  }
  
  handleRighPiecetChange(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));  
    const oncedata = [];
    
    const target = this.getRowByKey(key, newData);
    
    const numfieldname = "output"; 
    const weight =  parseFloat((target.totalnw/target.allpiecenum).toFixed(2));
    const maxPieces = target.maxpiece;
    if (target) {
      const sijinum = e>maxPieces?maxPieces:e;
      const weights = parseFloat(((weight)*sijinum).toFixed(2));
      target[fieldName] =sijinum;
      
      target[numfieldname] =weights>target.remainnum?target.remainnum:weights; 
      this.setState({ data: newData });
    }
    oncedata.colorname = this.state.colorname;
      oncedata.productname = this.state.productname;
      oncedata.inquirynum = this.state.inquirynum;
      oncedata.recentBatchno = this.state.recentBatchno;
      oncedata.tag = true;
    if(selectedRowss.length!==0){
      
      newData.forEach(item=>{
        selectedRowss.forEach(sItem=>{
          if(item.key === sItem.key){
            oncedata.push(item);
          }
        })
      })
      if(oncedata.length===0){
        oncedata.push( target);
      }
      selectRowMap.set(this.state.colorname,oncedata);
      this.setState({
        selectedRows:oncedata,
      });
      this.props.callbackParent(oncedata);
    }else{
     
      oncedata.push( target);
      selectRowMap.set(this.state.colorname,oncedata);
      this.props.callbackParent(oncedata);
    }
  }

  
    
  
  render() {

   
    
    const { selectedRows,data } = this.state;
    
    const rowSelection = {
      selectedRows,
      getCheckboxProps: record => ({
        disabled: record.status === -1, 
       
      }),
      onChange : this.handleSelectRows,
    };
    
   const BatchColumns = [
    // {
    //   title: '',
    //   dataIndex:'selectStatus',
    //   key: 'selectStatus',
    //   width: '20%',
    //   render:(val,record)=>{
    //     return <span className={record.status===-1?styles.redfont:styles.blackfont}>{val}</span>;
    //   },
    // },
      {
        title: '缸号',
        dataIndex:'batchno',
        key: 'batchno',
        width: '20%',
        render:(val,record)=>{
          return <span className={record.status===-1?styles.redfont:styles.blackfont}>{val}</span>;
        },
      },
      {
        title: '仓库',
        dataIndex: 'area',
        key: 'area',
        render:val=>areaMap.get(`${val}`),
        width:'10%',
      }, {
        title: '库存',
        dataIndex: 'remainnum',
        key: 'remainnum',
        width:'10%',
        render:(val,record)=>{
          return(
            <Tooltip title={`${moment(record.deliverydate).format('YYYY-MM-DD')} 整件数${record.piecenums}件 拆包件数${record.splitnums}件`}>
              <span className={styles.titleStyle}>{val}</span>
            </Tooltip>
          ) 
        },
      }, {
        title: '出库 ',
        dataIndex: 'output',
        key: 'output',
        width:70,
        render: (text, record) => {
           if(record.status===-1){
            return (
              <InputNumber
                
                min={0.0}
                
                value={record.output}
                disabled
                style={{width:70}}
                onChange={e => this.handleRightChange(e, 'output',record.key)}
              
                
              />)
           }else{
            return (
              <InputNumber
                
                min={0.0}
                value={record.output}
                max={record.remainnum}
                style={{width:70}}
                onChange={e => this.handleRightChange(e, 'output',record.key)}
              
                
              />)
           }
           
      },
    },
    {
      title: '整件数',
      dataIndex: 'piece',
      key: 'piece',
      width:50,
      render: (text, record) => {
        if(record.status===-1){
          return (
            <InputNumber
              
              min={0.0}
              value={record.piece}
              disabled
              style={{width:50}}
              onChange={e => this.handleRighPiecetChange(e, 'piece',record.key)}
            
              
            />)
         }else{
          return (
            <InputNumber
              
              min={0.0}
              value={record.piece}
              style={{width:50}}
              onChange={e => this.handleRighPiecetChange(e, 'piece',record.key)}
            
              
            />)
         }
        
         
    },
    
  },
  {
    title: '',
    dataIndex: 'completestatus',
    key: 'completestatus',
    width:30,
    render: (text, record) => {
      if(record.status===-1){
        return (
          <div><Checkbox checked={record.completestatus===1} disabled onChange={e=>this.onChangeWhole(e, 'completestatus', record.key)} /></div>)
       }else{
        return (
          <div><Checkbox checked={record.completestatus===1} onChange={e=>this.onChangeWhole(e, 'completestatus', record.key)} /></div>)
       }
      
       
  },
  
},
      
      
    ];
const colorname =this.state.colorname === undefined?"无":this.state.colorname;
const productname =this.state.productname === undefined?"无":this.state.productname;
const inquirynum =this.state.inquirynum === undefined?"0":this.state.inquirynum;
const recentBatchno =this.state.recentBatchno === undefined?"":this.state.recentBatchno;
    return (
      <Fragment>
        
        <Table
          title={()=>{return <span className={styles.titleStyle}>{colorname}-{productname} {inquirynum} {recentBatchno}</span>}}
          loading={this.state.loading}
          columns={BatchColumns}
          dataSource={data}
          bordered
          pagination={false}
          onChange={(e,record)=>this.handleStandardTableChange(e,record)}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          
        />
        
      </Fragment>
    );
  }
}
