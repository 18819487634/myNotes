import React, { PureComponent, Fragment } from 'react';
import { Table,InputNumber,Select,Input,Button} from 'antd';

import styles from './InquiryProfile.less';



const {Option} = Select;
let arrData = [];
const own = "ownnum";
const chase = "chasenum";
const spot = "spotnum";
const operateProducts = new Map();

const Demodata=[{
  productid:"1533697589676000005",
  batchno:"K12134",
  incommedate:"2018-06-04",
  total:132,
},
{
  productid:"1533697589676000005",
  batchno:"K2223",
  incommedate:"2018-06-04",
  total:67,
},
{
  productid:"1533697589676000005",
  batchno:"K1144",
  incommedate:"2018-06-04",
  total:1345,
},{
  productid:"1533697589676000005",
  batchno:"K88999",
  incommedate:"2018-06-04",
  total:98,
}];

const Demodata1=[{
  productid:"1533697729089000000",
  batchno:"D313",
  incommedate:"2018-05-13",
  total:693,
},
{
  productid:"1533697729089000000", 
  batchno:"D3414",
  incommedate:"2018-11-04",
  total:32,
},
{
  productid:"1533697729089000000",
  batchno:"D367",
  incommedate:"2018-12-04",
  total:1345,
},{
  productid:"1533697729089000000",
  batchno:"D879",
  incommedate:"2018-06-04",
  total:20147,
}];


// const productData = new Map();

export default class NewTable extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      data: props.dataSource,
      dataRight:[],
      loading: false,
      
      
    };
  }
  componentDidMount(){
   
    this.props.onChange({data:arrData});
    
  }


  onChildChanged= (newState)=> {
    if(typeof(newState) !== "string"){
     
      operateProducts.set(newState[0].productid,newState);
     
    }else{
      operateProducts.delete(newState);
    }
    const newData = this.state.data.map(item => ({ ...item }));

    const goodsData = this.state.dataRight.map(item => ({ ...item }));
  
    const fieldName = "spotnum";
    let keys="";
    for(let i =0;i<goodsData.length;i++){ // set后会重新给tableRight渲染，值还是读取接口的值，重新赋值完成input的onchage的效果
      const productDatas = operateProducts.get(goodsData[i].productid);
      if(productDatas!==undefined){
        for(let j=0;j<productDatas.length;j++){
        
          if(goodsData[i].batchno === productDatas[j].batchno){
            goodsData[i].output =productDatas[j].output;
          }
          
        }
      }
      
      
    }
    newData.forEach(item=>{ // 给现货累加赋值，没有为0
      const productData =operateProducts.get(item.productid);
      
      if(productData !== undefined){
        let spotnum= 0;
        
        
        if(item.productid === productData[0].productid){
          keys = item.key;
          productData.forEach(items=>{
            spotnum += Number(items.output);
          })
        }
        const target = this.getRowByKey(keys, newData);
        if (target) {
          target[fieldName] = spotnum;     
          
          
        
        }  
      }else{
        keys = item.key;
        
        const target = this.getRowByKey(keys, newData);
        if (target) {
          target[fieldName] = 0;     
          
          
        
        } 
      }
    })
    
    this.setState({ data: newData,dataRight:goodsData });

    this.generalSum();
   
  
  }
  
  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
  

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }
  
generalSum(){
  const newData1 = this.state.data;
    const newConcat= this.state.concatSoure.map(item => ({ ...item }));
    // 获取到数量
    const targetNum = this.getRowByKey("concat1", newConcat);
    // 获取到定金
    const targetDeposit = this.getRowByKey("concat3", newConcat);
    // 获取到货款
    const targetGoods = this.getRowByKey("concat5", newConcat);
    // 获取到小计
    const targetPlan = this.getRowByKey("concat8", newConcat);
     // 获取到总计
     const targetSum = this.getRowByKey("concat9", newConcat);

    let ownnum = 0;
    let chasenum =0;
    let spotnum =0;

    let Deownnum =0;
    let Dechasenum=0;
    let Despotnum= 0;

    let Goodsownnum =0;
    let Goodsasenum=0;
    let Goodspotnum= 0;

    let sumown = 0;
    let sumchase =0;
    let sumspot =0;
    
    let sum =0;
    
    newData1.forEach(item=>{

     
      // 计算数量
      ownnum += Number(item.ownnum===undefined?0:item.ownnum);
      chasenum += Number(item.chasenum===undefined?0:item.chasenum);
      spotnum += Number(item.spotnum===undefined?0:item.spotnum);
      

      // 计算定金
      Deownnum += Number(item.ownnum===undefined?0:item.ownnum) * Number(item.price===undefined?0:item.price) *(Number(newConcat[1].ownnum===""?0:newConcat[1].ownnum)/100);
      Dechasenum += Number(item.chasenum===undefined?0:item.chasenum) * Number(item.price===undefined?0:item.price) *(Number(newConcat[1].chasenum===""?0:newConcat[1].chasenum)/100);
      Despotnum += (Number(item.spotnum===undefined?0:item.spotnum)/1000*(Number(newConcat[1].spotnum===""?0:newConcat[1].spotnum)));


      // 计算贷款

      Goodsownnum += Number(item.ownnum===undefined?0:item.ownnum) * Number(item.price===undefined?0:item.price);
      Goodsasenum += Number(item.chasenum===undefined?0:item.chasenum) * Number(item.price===undefined?0:item.price);
      Goodspotnum += Number(item.spotnum===undefined?0:item.spotnum)* Number(item.price===undefined?0:item.price);

      // 计算小计
    
        
      sumown = Goodsownnum+  Number(newConcat[5].ownnum===undefined?0:newConcat[5].ownnum) +Number(newConcat[6].ownnum===undefined?0:newConcat[6].ownnum);
      sumchase = Goodsasenum +Number(newConcat[5].chasenum===undefined?0:newConcat[5].chasenum) +Number(newConcat[6].chasenum===undefined?0:newConcat[6].chasenum);
      sumspot =Goodspotnum+ Number(newConcat[5].spotnum===undefined?0:newConcat[5].spotnum) +Number(newConcat[6].spotnum===undefined?0:newConcat[6].spotnum);

      sum = sumown+sumchase+sumspot;
       
    });
     // 再计算贷款(-定金)
    Goodsownnum  -=  Deownnum;
    Goodsasenum -=  Dechasenum;
    Goodspotnum -= Despotnum;
    
    targetNum[own] = this.changeTwoDecimalf(ownnum);
    targetNum[chase] = this.changeTwoDecimalf(chasenum);
    targetNum[spot] = this.changeTwoDecimalf(spotnum);

    targetDeposit[own] = this.changeTwoDecimalf(Deownnum);
    targetDeposit[chase] = this.changeTwoDecimalf(Dechasenum);
    targetDeposit[spot] = this.changeTwoDecimalf(Despotnum);


    targetGoods[own] = this.changeTwoDecimalf(Goodsownnum);
    targetGoods[chase] = this.changeTwoDecimalf(Goodsasenum);
    targetGoods[spot] = this.changeTwoDecimalf(Goodspotnum);


    targetPlan[own] = this.changeTwoDecimalf(sumown);
    targetPlan[chase] = this.changeTwoDecimalf(sumchase);
    targetPlan[spot] = this.changeTwoDecimalf(sumspot);
    
    targetSum[own] = this.changeTwoDecimalf(sum);
    this.setState({ concatSoure: newConcat });
    
    const result = this.state.data.concat(this.state.concatSoure,operateProducts);
    
    this.props.onChange(result);
}
  
  handleFieldChange(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;     
      this.setState({ data: newData });
      
     
    }
    this.props.onChange(this.state.data);
  }

  
  
  render() {
    
   
    const dataSource = this.state.data;
    const dataConcat = this.state.concatSoure;
    const dataBatch = this.state.dataRight;






    
    
    const renderContent = (value, row, index) => {
      const obj = {
        children: value,
        props: {},
      };
      // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
      if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
        || index-5 === dataSource.length|| index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length) {
        obj.props.colSpan = 0;
      }
      return obj;
    };
     
    if(dataSource.length){
      arrData= dataSource.concat(dataConcat);
      
    }else{
      arrData =dataSource;
    }
    
    const columns = [
        {
          title: '序号',
          dataIndex: 'id',
          key: 'id',
          width:'2%',     
        },
        {
          title: '联系人',
          dataIndex: 'linkman',
          key: 'linkman',
          width: '10%',
          render:(text,record)=>{
            return (
              <Input
                value={text}
               
                onChange={e => this.handleFieldChange(e, 'linkman', record.key)}
              />
              );
            
        },        
        },{
          title: '职务',
          dataIndex: 'job',
          key: 'job',
          width: '10%',
          render:(text,record)=>{
            return (
              <Input
                value={text}
               
                onChange={e => this.handleFieldChange(e, 'job', record.key)}
              />
              );
            
        },        
        },{
          title: '电话',
          dataIndex: 'phone',
          key: 'phone',
          width: '10%',
          render:(text,record)=>{
            return (
              <Input
                value={text}
                
                onChange={e => this.handleFieldChange(e, 'phone', record.key)}
              />
              );
            
        },        
        }, {
          title: '联系人平台ID',
          dataIndex: 'platformid',
          key: 'platformid',
          width: '10%',
          render:(text,record)=>{
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'platformid', record.key)}
              />
              );
            
        },        
        },
        {
          title: 'QQ',
          dataIndex: 'QQ',
          key: 'QQ',
          width: '10%',
          render:(text,record)=>{
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'QQ', record.key)}
              />
              );
            
        },        
        },
        {
          title: '微信',
          dataIndex: 'wechat',
          key: 'wechat',
          width: '10%',
          render:(text,record)=>{
            return (
              <Input
                value={record.wechat}
                
                onChange={e => this.handleFieldChange(e, 'wechat', record.key)}
              />
              );
            
        },        
        },
        
      ];

    return (
      <Fragment>
        
        <Table
          title={() => '业务联系人'}
          loading={this.state.loading}
          columns={columns}
          dataSource={this.state.data} 
          pagination={false}
          rowKey='id'
          bordered
          
        />
        
      </Fragment>
    );
  }
}
