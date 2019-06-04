import React, { PureComponent,Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Row,
  Table,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './DeliverProfile.less';


@Form.create()
export default class Detail extends PureComponent {
    constructor(props) {
        super(props);
        this.state={
            data:props.dataSource,
            loading:props.loading,
        } 
    }


  componentDidMount() {
  }
  componentWillReceiveProps(n){
    if(n.value === undefined){
      this.setState({
        data:n.dataSource,
        loading:n.loading,
      })
    }
    
  }


  render() {
    const {data,loading} = this.state;
    const renderContents=(value)=>{
      const obj = {
        children: value,
        props: {},
      };
      // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
      obj.props.colSpan = 0;
      return obj;
    }
  const columns = [
      {
        title: '货品名称',
        dataIndex: 'brandname',
        key: 'brandname',
        width:'30%',
        render: (val, record, index) => {
          if(val==="合计"){
              return { 
                  children :<span style={{ fontWeight: 600,float:"right" }}>{val}</span>,
                      props:{
                        colSpan:4,
                      },
                    }
          }else{
              return val;
          }
        
        },
      },
      {
        title: '色称-色号',
        dataIndex: 'name',
        key: 'name',
        width:'20%',
        render:(val,record,index)=>{
          if(record.brandname === "合计"){
           return  renderContents(val);
          }else{
              return `${record.colorname}-${record.productname}`
          }
         
        },
      },
      {
        title: '缸号(批号) ',
        dataIndex: 'batchno',
        key: 'batchno',
        width:'15%',
        render:(val,record,index)=>{
          if(record.brandname === "合计"){
              return  renderContents(val);
          }else{
              return val;
          }
         
        },
      },

      {
        title: '单位',
        dataIndex: 'recordstatus',
        key: 'recordstatus',
        width:'5%',
        render:(val,record,index)=>{
          if(record.brandname === "合计"){
              return  renderContents(val);
          }else{
              return `KG`
          }
         
        },
      },
      
      {
          title: '数量',
          dataIndex: 'num',
          key: 'num',
          width:'10%',
          render:(val,record,index)=>{
              return val===undefined?0:val;
             
            },
        },
        {
          title: '整件',
          dataIndex: 'piece',
          key: 'piece',
          width:'10%',
          render:(val,record,index)=>{
              return val===undefined?0:val;
             
            },
        },
        {
          title: '散只',
          dataIndex: 'scattered',
          key: 'scattered',
          width:'10%',
          render:(val,record,index)=>{
              return val===undefined?0:val;
             
            },
        },
    ];
    return (
      <Fragment>
        <div>
          <Table 
            rowKey="id"
            loading={loading}
            dataSource={data}
            columns={columns}
            bordered
            pagination={false}
          />
      </div>
      </Fragment>
    );
  }
}
