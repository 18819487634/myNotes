import React, { PureComponent, Fragment } from 'react';
import { Table, InputNumber,Modal,Form, Button, Checkbox} from 'antd';
import moment from 'moment';
import styles from './SaleProfile.less';
import { queryGoodsBasic, queryPresale, queryPresaleById, queryGoods, querysupplydictionry } from '../../services/api';

import { getMyDate, trackiList } from '../../utils/utils';


let arrData = [];
const FormItem = Form.Item; 
// const own = "ownnum";
// const chase = "chasenum";
// const spot = "spotnum";
const operateProducts = new Map();

export default class DeliveryTable extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      data: props.dataSource,
      selectedRows:[],
    };
    
  }
  componentDidMount(){
   
  }
  

  

  
  // ss

   
   
  
  
  
  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
  


  handlePieceChange(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    const numfieldname = "weight"; 
    
    const remai = target.weights;
    const maxPieces =  target.maxPiece;
    const pieceweight = remai/maxPieces;
    if (target) {
      const sijinum = e>maxPieces?maxPieces:e;
      target[fieldName] =sijinum;
      
      target[numfieldname] = ((pieceweight)*sijinum).toFixed(2); 
      this.setState({ data: newData },()=>{
          const {selectedRows} =this.state;
        const selectData = [];
        for(let i=0;i<selectedRows.length;i+=1){
            selectData.push(newData[selectedRows[i]]);
        }
        this.props.onChange(selectData);
      });
     
     
    }
    
  }
  handleSelectRows = (rowskey,rows) => {
    this.setState({
      selectedRows: rowskey,
      selectedRowlist : rows,
    },()=>{
        this.props.onChange(rows);
    });
  };

  
 

  render() {
  
    
    const dataSource = this.state.data;
    const {selectedRows} = this.state;
    const rowSelection = {
        selectedRows,
       
        onChange : this.handleSelectRows,
      };
    arrData =dataSource;
    const columns = [
      {
        title: '拣货单号',
        dataIndex: 'sysuuid',
        key: 'sysuuid',
        width: '10%',
        
      
      },
      {
        title: '车次/待货区',
        dataIndex: 'numlocation',
        key: 'numlocation',
        width: '5%',
        render:(val,record)=>{
            return(
              <div>
                <li>{record.finishnum}</li>
                <li>{record.location}</li>
              </div>
            )
        },
      },
      {
        title: '色号/色称',
        dataIndex: 'incommedate',
        key: 'incommedate',
        width: '5%',
        render: (val, record) => {
            return (
              <div>
                <li>{record.colorname}</li>
                <li>{record.productname}</li>
              </div>
            );
        },
      },
      {
        title: '缸号',
        dataIndex: 'batchno',
        key: 'batchno',
        width: '3%',
      },
      
      {
        title: '净重(KG)',
        dataIndex: 'weight',
        key: 'weight',
        width: '5%',
      
      },
      {
        title: '零散个数',
        dataIndex: 'num',
        key: 'num',
        width: '5%',
      
      },
      {
        title: '仓库',
        dataIndex: 'areas',
        key: 'areas',
        width: '5%',
      },
      {
        title: '件数',
        dataIndex: 'totalpiece',
        key: 'totalpiece',
        width: '5%',
        render:(val,record)=>{
          
            return (
              <div>
                <InputNumber
                  value={record.totalpiece}
                  min={0.0}
                  onChange={e => this.handlePieceChange(e, 'totalpiece', record.key)}
                />
                
                
              </div>
              );
          
            
        },
        
      
      },


      
    ];

    return (
      <Fragment>
      
        <Table
          columns={columns}
          rowKey={record => record.key}
          dataSource={arrData}
          pagination={false}
          rowSelection={rowSelection}
          id="deliveryId" 
          width="50%"
        />
          
      </Fragment>
    );
  }
}
