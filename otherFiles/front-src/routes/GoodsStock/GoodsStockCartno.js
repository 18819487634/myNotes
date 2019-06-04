import React, { PureComponent,Fragment } from 'react';
import {   Table } from 'antd';



import styles from '../Inquiry/TableRight.less'
import { queryGoodslocation } from '../../services/api';





export default class GoodsStockCartno extends PureComponent {
    constructor(props) {
        super(props);
    
        this.state = {
          data: props.dataSource,
         
          title: props.title,
        };
      }
  componentDidMount() {
   
  }

  componentWillReceiveProps(nextProps) {
    
    this.setState({
        data: nextProps.dataSource,
       
        title:nextProps.title,
      });
   
}
getRowByKey(key, newData) {
  return (newData || this.state.data).filter(item => item.key === key)[0];
}
expand=(e,record)=>{
  if(e===true){
    const terms = `terms[0].value=${record.cartno}&terms[0].column=parentcartno&pageSize=30&pageIndex=0`;
  queryGoodslocation(terms).then(res=>{
    if(res && res.status ===200){
      const chilrendata = res.result.data;
      const datas = this.state.data.map(item => ({ ...item }));
      for(let i =0;i<chilrendata.length;i+=1){
        chilrendata[i].key =  chilrendata[i].id;
        chilrendata[i].areas =  record.areas;
      }
      const fieldname = "children";
      const target = this.getRowByKey(record.key, datas);
      if(target){
        target[fieldname] = chilrendata;

      }
      this.setState({
        data:datas,
      })
    }
  });
  }

  
}


  render() {
    
    const {data,title} = this.state;
    const columns = [
      
      {
        title: '箱号',
        dataIndex: 'cartno',
        key: 'cartno',
        width:'20%',
        render:(val,record)=>{
          
          return <span className={record.recordstatus===2?styles.lineThrough:styles.none}>{val}</span>
        },
      },
      {
        title: '序号',
        dataIndex: 'tagno',
        key: 'tagno',
        
        width:'5%',
      },
      {
        title: '仓库',
        dataIndex: 'areas',
        key: 'areas',
        
        width:'20%',
      },
      {
        title: '库存毛重(Kg)',
        dataIndex: 'newgw',
        key: 'newgw',
        width:'5%',
      },
      {
        title: '库存净重(Kg)',
        dataIndex: 'newnw',
        key: 'newnw',
        width:'5%',
      },
      
      
      {
        title: '只数',
        dataIndex: 'newnum',
        key: 'newnum',
        width:'5%',
      },
      {
        title: '存放区域',
        dataIndex: 'location',
        key: 'location',
        width:'10%',
      },
    ];
   
    return (
      <Fragment>
        <div className={styles.tableList}>
          <div style={{height:500,overflowY:'auto'}}>
            <Table
              title={()=>{return <span className={styles.titleStyle}>{title}</span>}}
              loading={this.state.loading}
              columns={columns}
              onExpand={(e,record)=>this.expand(e,record)}
              dataSource={data}
              pagination={false}
              rowKey={record => record.key}
              id="goodsCartno" 
                
            
                
            />
          </div> 
        </div>
      </Fragment>
    );
  }
}
