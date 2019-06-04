import React, { PureComponent,Fragment } from 'react';
import {   Table } from 'antd';



import styles from '../Inquiry/TableRight.less'
import { queryGoodslocation, querycartno } from '../../services/api';





export default class GoodsStockCartnoPaging extends PureComponent {
    constructor(props) {
        super(props);
    
        this.state = {
          data: props.dataSource,
          pagination:props.pagination,
          title: props.title,
          cartnoTerms:props.cartnoTerms,
          areaMap:props.areaMap,
          goodMap:props.goodMap,
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
handleStandardTableChange = pagination => {

    
    let terms = this.state.cartnoTerms;  
    terms= terms.replace("&pageSize=10&pageIndex=0",`&pageSize=${pagination.pageSize}&pageIndex=${pagination.current-1}`);
    querycartno(terms).then(res=>{
      if(res && res.status===200){
        const paginations = {
          total: res.result.total,
          current:  pagination.current,
          pageSize: pagination.pageSize,
          showTotal: () => {
            return `共${res.result.total}条`;
          },
        };
        const cartnoData = res.result.data;
        for(let i=0;i<cartnoData.length;i+=1){
          cartnoData[i].key = `${cartnoData[i].id}`;
          const areavalue =`${this.state.goodMap.get(cartnoData[i].goodid)}`;
          cartnoData[i].area =this.state.goodMap.get(cartnoData[i].goodid);
          cartnoData[i].areas =this.state.areaMap.get(areavalue); 
      }
        this.setState({
          pagination:paginations,
          data:res.result.data,
        })
      }
    })

}
expand=(e,record)=>{
  if(e===true){
    const terms = `terms[0].value=${record.cartno}&terms[0].column=parentcartno&pageSize=30&pageIndex=0`;
  queryGoodslocation(terms).then(res=>{
    if(res && res.status ===200){
      const chilrendata = res.result.data;
      const datas = this.state.data.map(item => ({ ...item }));
      for(let i =0;i<chilrendata.length;i+=1){
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
    
    const {data,title,pagination} = this.state;

//   const temp = {}; // 当前重复的值,支持多列
//     const mergeCells = (text, array, columns) => {
//     let i = 0;
//     if (text !== temp[columns]) {
//       temp[columns] = text;
//       array.forEach((item) => {
//         if (item.parentcartno === temp[columns]) {
//           i += 1;
//         }
//       });
//     }
//     return i;
// };
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
        title: '仓库',
        dataIndex: 'areas',
        key: 'areas',
        
        width:'10%',
      },
      {
        title: '父包',
        dataIndex: 'parentcartno',
        key: 'parentcartno',
        
        width:'20%',
        // render: (text, record) => {
        //   const obj = {
        //     children: text,
        //     props: {},
        //   };
        //   obj.props.rowSpan = mergeCells(record.parentcartno, data, 'parentcartno');
        //   return obj;
        // },
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
          <div style={{height:780,overflowY:'auto'}}>
            <Table
              title={()=>{return <span className={styles.titleStyle}>{title}</span>}}
              loading={this.state.loading}
              columns={columns}
              onExpand={(e,record)=>this.expand(e,record)}
              dataSource={data}
              pagination={pagination}
              onChange={this.handleStandardTableChange}
              rowKey={record => record.key}
              id="goodsCartno" 
                
            
                
            />
          </div> 
        </div>
      </Fragment>
    );
  }
}
