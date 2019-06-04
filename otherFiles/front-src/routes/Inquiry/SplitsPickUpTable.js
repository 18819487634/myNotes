import React, { PureComponent, Fragment } from 'react';
import { Table, InputNumber, Checkbox} from 'antd';
import styles from './InquiryProfile.less';
import {  queryPresaleById } from '../../services/api';



let arrData = [];

// const own = "ownnum";
// const chase = "chasenum";
// const spot = "spotnum";
const operateProducts = new Map(); 

const butes = ["","色纱","胚纱","代销色纱","代销胚纱"];
const completestatusArr = ["","√"];


export default class SplitsPickUpTable extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      data: props.dataSource,
      
    };
   
  }
  componentDidMount(){
   
    
  }
  
  componentWillReceiveProps(nextProps,nextState) {
    
    const datas = nextProps.dataSource;
    const dataz = this.state.data;
   
    if(nextProps.value===undefined){
      
      this.setState({
        data: nextProps.dataSource,
        
      });
   }else{
     if(datas.length !== dataz.length){
      this.setState({
        data: nextProps.dataSource,
        
      });
     }
    for(let i=0;i<datas.length;i++){
      for(let j=0;j<dataz.length;j++){
        if(datas[i].batchno === dataz[j].batchno &&datas[i].id === dataz[j].id && (datas[i].picknum !== dataz[j].picknum || datas[i].piece !== dataz[j].piece)){
          this.setState({
            data: nextProps.dataSource,
            
          });
        }
      }
    }
   }
  
    
  }
  

  
 

   
   
  
  
  
  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
  

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }
  

  
  handleFieldChange(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;     
      this.setState({ data: newData },()=>{
        this.props.onChange(newData);
      });
     
     
    }
    
  }
  handlePieceChange(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    const numfieldname = "output"; 
    const weight = target.pieceweight;
    const remai = target.remainnum;
    const maxPiece = parseInt(remai/weight,10);
    if (target) {
      const sijinum = e>maxPiece?maxPiece:e;
      target[fieldName] =sijinum;
      
      target[numfieldname] = ((target.pieceweight)*sijinum).toFixed(2); 
      this.setState({ data: newData },()=>{
        this.props.onChange(newData);
      });
     
     
    }
    
  }
  changStatus=(e,fieldName,key)=>{
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.checked?1:0;     
      this.setState({ data: newData },()=>{
        
      this.props.onChange(newData);
      });
      
    }
  }
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  
  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
      updateFlag:false,
      abnormaFlag:false,
    });
  };

  changeTwoDecimalf=(x) =>{
    try {
        const fx1 = parseFloat(x);
        if (isNaN(fx1)) {
            return x;
        }
        const fx = Math.round(x * 100) / 100;
        let sx = fx.toString();
        let posdecimal = sx.indexOf('.');
        if (posdecimal < 0) {
            posdecimal = sx.length;
            sx += '.';
        }
        while (sx.length <= posdecimal + 2) {
            sx += '0';
        }
        return sx;
    } catch (e) {
        return '0.00';
    }

     
    
    
    
   
  }
  handlclick=(fieldsValue,flag)=>{
      let num =0;
      if(fieldsValue){
      
        for(let z=0;z<fieldsValue.length;z+=1){
          
            num += fieldsValue[z].output;
            operateProducts.set(fieldsValue[z].productid,fieldsValue);
        }
        const newdata= this.state.data;
        for(let i=0;i<newdata.length;i+=1){
          if(newdata[i].productid ===fieldsValue[0].productid){
            if(flag){
              newdata[i].againnum = num;
            }else{
              newdata[i].updatenum = num;
            }
          
          }
        }
      
        this.setState({
          data:newdata,
          modalVisible:false,
        },()=>{
          this.generalSum();
          const data = this.state.data.concat(operateProducts);
        this.props.onChange(data);
        })
        
      }
  }
  
  handleRightChange(e, fieldName, key) {
    
    const newData = this.state.dataRight.map(item => ({ ...item }));
   
   
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      
    }
    this.setState({
      dataRight:newData,
    })
    
    
  }
  
  updateCilck= (e,record)=>{
    let arr =[];
    
    queryPresaleById(record.presaleid).then((response)=>{
      if(response && response.status ===200){ 
        const pickupList = response.result.pickups;
        const detailsPickup = []
        for(let i =0;i< pickupList.length;i+=1){
          const detailss = pickupList[i].details;
          for(let d =0;d< detailss.length;d+=1){
            if(detailss[d].productid === record.productid
            && detailss[d].status===0 && detailss[d].ok !==-1){
              detailss[d].key= `pickDetails${d}`;
              detailss[d].output=detailss[d].picknum;
              detailsPickup.push(detailss[d]);
            }
           
                    
          }
                  
        }
        detailsPickup.colorname=record.product01Entity.colorname;
        this.setState({
          dataRight:detailsPickup,
          modalVisible:true,
          updateFlag:true,
          
        })
      }
    })

  }

  render() {
  
    
    const dataSource = this.state.data;
    
    arrData =dataSource;
    const columns = [
      {
        title: '产品信息',
        children:[{
          dataIndex:'product01Entity',
          key:'picture',
          width:'10%',
          render:(val, record,index)=>{
            
            if(arrData[index].id!=="" ){
              return (
                <div>
                
                  <li>
                    <img src={val.picture} alt={val.picture} width={100} height={35}  />
                  </li>  
                  <li>
                    {`${val.kindname}${val.seriesname}`}
                  </li>
                      
                </div>
              );
            }
          },
        },
        {
          dataIndex:'product01Entity',
          key:'product01Entity',
          width:'3%',
          render:(val,record)=>{ 
            
            if( typeof(val)!=="string"){
              
              return (
                <div>
                  
                  <li>
                    {val.colorname}
                    {/* <a onClick={e=>this.openBatch(e,`${val.productid}`)}>{val.colorname}</a> */}
                  </li>  
                  <li>
                    {val.productname}
                  </li>
                  <li>
                    {butes[val.productattribute]}
                  </li>     
                </div>
              );
            
            }
            else{
              return { 
              children :<span style={{ fontWeight: 600,float:"right" }}>{val}</span>,
                  props:{
                    colSpan:8,
                  },
                }
              }
            
          },
         
        },
        ],
        key: 'product',
        
        
      },
      {
        title: '整件',
        dataIndex: 'completestatus',
        key: 'completestatus',
        width: '3%',
        render:(val)=>{
          return completestatusArr[val];
          
        },
        
      
      },
      {
        title: '缸号',
        dataIndex: 'batchno',
        key: 'batchno',
        width: '5%',
      },
      {
        title: '仓库',
        dataIndex: 'areas',
        key: 'areas',
        width:'5%',
      },
      {
        title: '数量',
        dataIndex: 'picknum',
        key: 'picknum',
        width: '3%',
      },
      {
        title: '整件数',
        dataIndex: 'piece',
        key: 'piece',
        width: '3%',
      },
      
      {
        title: '分配拣货(KG)',
        dataIndex: 'output',
        key: 'output',
        width: '5%',
        render:(val,record)=>{
          if(record.completestatus === 1){
            return (
              <div>
                <InputNumber
                  disabled
                  max={record.piece}
                  value={record.outpiece}
                  onChange={e => this.handlePieceChange(e, 'outpiece', record.key)}
                />
                
                
              </div>
              );
          }else{
            return (
              <div>
                <InputNumber
                  
                  max={record.picknum}
                  value={record.output}
                  onChange={e => this.handleFieldChange(e, 'output', record.key)}
                />
                
                
              </div>
              );
          }
           
        },
        
      
      },
      {
        title: '分配整件数',
        dataIndex: 'outpiece',
        key: 'outpiece',
        width: '5%',
        render:(val,record)=>{
          if(record.completestatus === 0){
            return (
              <div>
                <InputNumber
                  disabled
                  max={record.piece}
                  value={record.outpiece}
                  onChange={e => this.handlePieceChange(e, 'outpiece', record.key)}
                />
                
                
              </div>
              );
          }else{
            return (
              <div>
                <InputNumber
                  
                  max={record.piece}
                  value={record.outpiece}
                  onChange={e => this.handlePieceChange(e, 'outpiece', record.key)}
                />
                
                
              </div>
              );
          }
            
        },
        
      
      },
      {
        title: '拆单',
        dataIndex: 'status',
        key: 'status',
        width: '5%',
        render:(val,record)=>{
          
         return (
           
           <div>
             <Checkbox checked={record.status===1}  onChange={e=>this.changStatus(e, 'status', record.key)} />
           </div>
         )
        },
        
      
      },

      
    ];

    return (
      <Fragment>
      
        <Table
          loading={this.state.loading}
          columns={columns}
          dataSource={arrData}
          pagination={false}
          // onRow={(e,b,c) => ({
          //   onClick: () => {
              
          //     this.saveBatch(e,b,c);

          //   },
          // })}
          id="tableLeft" 
          width="50%"
        />
          
      </Fragment>
    );
  }
}
