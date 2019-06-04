import React, { PureComponent, Fragment } from 'react';
import { Table, message, InputNumber, Button,Checkbox,Tooltip } from 'antd';
import moment from 'moment';
import styles from '../Inquiry/TableRight.less';
import { queryGoodsBasic, querysupplydictionry } from '../../services/api';

let beforeProductid = '';
let selectedRowss = [];
const areaMap = new Map();
const selectRowMap = new Map();
const operateProducts = new Map();
export default class TableRight extends PureComponent {
  constructor(props) {
    console.log("props",props);
    super(props);

    this.state = {
      data: props.dataSource,
      loading: false,
      selectedRows: [],
      colorname: props.dataSource.colorname,
      pageindex: 1,
      pagesize: 10,
      productid: props.productid,
      total: props.total,
    };
  }

  componentWillMount() {
    selectedRowss = [];
    const params = 'terms[0].value=3&terms[0].column=type';
    querysupplydictionry(params).then(res => {
      if (res && res.status === 200) {
        const datas = res.result.data;
        datas.forEach(item => {
          areaMap.set(item.value, item.key);
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.value === undefined){
      this.setState({
        data: nextProps.dataSource,
        colorname: nextProps.dataSource.colorname,
        productname:nextProps.dataSource.productname,
        total: nextProps.total,
        productid: nextProps.productid,
      });
    }
    
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

      
      oncedata.tag = true;
      selectRowMap.set(this.state.colorname,oncedata);
      this.setState({
        selectedRows:oncedata,
      });
      this.props.onChange(oncedata);
    }else{
      oncedata.push( target);
      oncedata.colorname = this.state.colorname;
      oncedata.productname = this.state.productname;

      oncedata.tag = true;
      selectRowMap.set(this.state.colorname,oncedata);
      this.props.onChange(oncedata);
    }
    
  }
  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }

  handleSelectRows = (selectedRowKeys, selectedRows) => {
    const selectData = selectedRows;
  
    this.props.onChange(selectData);
    this.setState({
      selectedRows,
    });
  };
  handleStandardTableChange = pagination => {
    this.setState({
      pageindex: pagination.current,
      pagesize: pagination.pageSize,
    });
    const terms = `terms[0].value=${this.state.productid}&terms[0].column=productid&pageSize=${
      pagination.pageSize
    }&pageIndex=${pagination.current - 1}&sorts[0].name=id&sorts[0].order=desc`;
    queryGoodsBasic(terms).then(res => {
      if (res && res.status === 200) {
        this.setState({
          pageindex: pagination.current,
          pagesize: pagination.pageSize,
          total: res.result.total,
          data: res.result.data,
        });
      }
    });
  };

  handleRightChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    selectedRowss = this.state.selectedRows === undefined ? [] : this.state.selectedRows;

    const oncedata = [];

    const target = this.getRowByKey(key, newData);

    if (target) {
      target[fieldName] = e;

      this.setState({ data: newData },()=>{
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
          this.props.onChange(oncedata);
        }else{
         
          oncedata.push( target);
          selectRowMap.set(this.state.colorname,oncedata);
          this.props.onChange(oncedata);
        }
      });
    }

   
  }
  
  handleRighPiecetChange(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));  
    const oncedata = [];
    
    const target = this.getRowByKey(key, newData);
    
    const numfieldname = "output"; 
    const weight =  parseFloat(target.totalnw/target.allpiecenum).toFixed(2);
    const maxPieces = target.maxpiece;
    if (target) {
      const sijinum = e>maxPieces?maxPieces:e;
      target[fieldName] =sijinum;
      
      target[numfieldname] = ((weight)*sijinum).toFixed(2); 
      this.setState({ data: newData },()=>{
        oncedata.colorname = this.state.colorname;
      oncedata.productname = this.state.productname;
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
      this.props.onChange(oncedata);
    }else{
     
      oncedata.push( target);
      selectRowMap.set(this.state.colorname,oncedata);
      this.props.onChange(oncedata);
    }
      });
    }
    
  }

  render() {
    const { selectedRows, data } = this.state;
    console.log("Data",data);
    const pagination = {
      total: this.state.total,
      current: this.state.pageindex,
      pageSize: this.state.pagesize,
      showTotal: () => {
        return `共${this.state.total}条`;
      },
      showQuickJumper: false,
    };
    const rowSelection = {
      selectedRows,
      getCheckboxProps: record => ({
        disabled: record.status === -1,
      }),
      onChange: this.handleSelectRows,
    };

    const BatchColumns = [
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

    return (
      <Fragment>
        <Table
          title={() => `产品色号:${this.state.colorname}`}
          loading={this.state.loading}
          columns={BatchColumns}
          dataSource={data}
          bordered
          pagination={false}
          onChange={(e, record) => this.handleStandardTableChange(e, record)}
          rowKey={record => record.key}
          rowSelection={rowSelection}
        />
      </Fragment>
    );
  }
}
