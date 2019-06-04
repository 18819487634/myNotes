import React, { PureComponent,Fragment } from 'react';
import {   Table } from 'antd';



import styles from '../Inquiry/TableRight.less';



export default class GoodsStockOut extends PureComponent {
    constructor(props) {
        super(props);
       
        this.state = {
          data: props.dataSource,
          columns: props.columns,
         
        };
      }
  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
      
    this.setState({
      data: nextProps.dataSource,
      columns:nextProps.columns,
    });
}
 

  render() {
    
    const {data,columns} = this.state;

    return (
      <Fragment>
        <div className={styles.tableList}>
          
          <Table
            title={()=>{return <span className={styles.titleStyle}>出库明细</span>}}
            loading={this.state.loading}
            columns={columns}
            dataSource={data}
            pagination={false}
            rowKey={record => record.key}
            
                
            id="goodsOutput" 
                
          />
           
        </div>
      </Fragment> 
    );
  }
}
