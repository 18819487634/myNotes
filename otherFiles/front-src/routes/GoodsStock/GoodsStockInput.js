import React, { PureComponent,Fragment } from 'react';
import {   Table } from 'antd';



import styles from '../Inquiry/TableRight.less'
import { getMyDate } from '../../utils/utils';



export default class GoodsStockInput extends PureComponent {
    constructor(props) {
        super(props);
    
        this.state = {
          data: props.dataSource,
          columns: props.columns,
          title: props.title,
        };
      }
  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
      
    this.setState({
      data: nextProps.dataSource,
      columns:nextProps.columns,
      title:nextProps.title,
    });
}
 

  render() {
    
    const {data,columns,title} = this.state;
    const inputColumns = [
      
      {
        title: columns[0],
        dataIndex: 'inputids',
        key: 'inputids',
        render:(val,record)=>{
            return (<div><li>{record.entryId}</li><li>{getMyDate(record.entryDate)}</li></div>)
        },
      },
      {
        title: '采购单号/送货单号',
        dataIndex: 'list',
        key: 'list',
        render:(val,record)=>{
            return (<div><li>{record.purchaseid}</li><li>{record.deliveryid==="0"?"":record.deliveryid}</li></div>)
        },
      },
      {
        title: '总毛重(Kg)',
        dataIndex: 'totalGw',
        key: 'totalGw',
      },
      {
        title: '总净重(Kg)',
        dataIndex: 'totalNw',
        key: 'totalNw',
      },
      {
        title: '总件数',
        dataIndex: 'allpiecenum',
        key: 'allpiecenum',
      },
      {
        title: '总只数',
        dataIndex: 'piecenum',
        key: 'piecenum',
      },
      {
        title: '存放区域',
        dataIndex: 'locations',
        key: 'locations',
      },
    ];
    if(title.indexOf("调拨")>-1){
        inputColumns.splice(1,1);
    }
    return (
      <Fragment>
        <div className={styles.tableList}>
          
          <Table
            title={()=>{return <span className={styles.titleStyle}>{title}</span>}}
            loading={this.state.loading}
            columns={inputColumns}
            dataSource={data}
            pagination={false}
            rowKey={record => record.key}
            
                
            id="goodsInput" 
                
          />
           
        </div>
      </Fragment>
    );
  }
}
