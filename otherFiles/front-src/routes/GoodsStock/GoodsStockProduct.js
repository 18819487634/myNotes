import React, { PureComponent,Fragment } from 'react';
import {   Table } from 'antd';



import styles from '../Inquiry/InquiryProfile.less'



export default class GoodsStockProduct extends PureComponent {
    constructor(props) {
        super(props);
    
        this.state = {
          data: props.dataSource,
        };
      }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
      
    this.setState({
      data: nextProps.dataSource,
    });
}
 

  render() {
    
    const {data} = this.state;
    const rednerder = (value, row, index) => {
        const obj = {
          children: value,
          props: {},
        };
        if (index === 0) {
            obj.props.rowSpan = 3;
          }
        if (index === 1) {
          obj.props.rowSpan = 0;
        }
        // These two are merged into above cell
        if (index === 2) {
          obj.props.rowSpan = 0;
        }
        
        return obj;
      };

    const productColumns = [
   
      {
        title: '色号',
        dataIndex: 'colorname',
        key: 'colorname',
        render:rednerder,
        
      },
      {
        title: '色称',
        dataIndex: 'productname',
        key: 'productname',
        render:rednerder,
      },
      {
        title: '缸号',
        dataIndex: 'batchno',
        key: 'batchno',
        render:rednerder,
      },
      {
        title: '纱别',
        dataIndex: 'yarn',
        key: 'yarn',
        render:rednerder,
      },
      {
        title: '系列',
        dataIndex: 'seriesname',
        key: 'seriesname',
        render:rednerder,
      },
      {
        title: '品名',
        dataIndex: 'brandname',
        key: 'brandname',
        render:rednerder,
      },
      {
        title: '',
        dataIndex: 'totalname',
        key: 'totalname',
        
      },
      {
        title: '总入库-',
        dataIndex: 'input',
        key: 'input',
      },
      {
        title: '总出库=',
        dataIndex: 'output',
        key: 'output',
      },
      {
        title: '库存量',
        dataIndex: 'remainnum',
        key: 'remainnum',
      },
    ];

    return (
      <Fragment>
        <div className={styles.tableList}>
          
          <Table
            loading={this.state.loading}
            columns={productColumns}
            dataSource={data}
            pagination={false}
            rowKey={record => record.key}
            
                
            id="goodsProduct" 
                
          />
           
        </div>
      </Fragment>
    );
  }
}
