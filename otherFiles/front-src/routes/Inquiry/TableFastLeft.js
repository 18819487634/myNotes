import React, { PureComponent, Fragment } from 'react';
import { Table,InputNumber,Select,Input,DatePicker, Checkbox, Radio,message} from 'antd';
import RadioGroup from 'antd/lib/radio/group';
import moment from 'moment';
import styles from './InquiryProfile.less';

import TableRight from './TableRight';
import { queryGoodsBasic, queryGoods, queryDescBatchno, queryGoodslocation, queryGoodsBasicNoPaging } from '../../services/api';



const {Option} = Select;
let arrData = [];

const own = "ownnum";
const chase = "transnum";
const spot = "spotnum";
const raw = "rawyarnnum";
const pre = "prereceivenum";
const operateProducts = new Map();
const butes = ["","色纱","代销色纱","胚纱","代销胚纱"];
// const productData = new Map();

export default class TableFastLeft extends PureComponent {
    
  constructor(props) {
    super(props);
    
    this.state = {
      data: props.dataSource,
      dataRight:[],
      total:0,
      productid:"",
      loading: false,
      chagePriceFlag:false,
      defaultProductids:"",
      freightFlag:false,
      freightValue:0,
      taxstatus:false,
      invoiceValue:0,
      concatSoure:[{
        key:'concat1',
        id:'',
        product01Entity: '数量',
       
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        prereceivenum:"",
        spotnum:"",
      },
      { 
        key:'concat2',
        id:'',
        product01Entity: '支付比例/拣货费计价',
       
        takeway:"",
        ownnum:props.dataSource.earnest,
        transnum:"",
        rawyarnnum:"",
        prereceivenum:"",
        spotnum:props.dataSource.pickuppay,
      },
      {
        key:'concat3',
        id:'',
        product01Entity: '定金/拣货费',
      
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        prereceivenum:"",
        spotnum:"",
      },{
        key:'concat4',
        id:'',
        product01Entity: '结款方式',
       
        takeway:"",
        ownnum:0,
        prereceivenum:0,
        spotnum:0,
      },{
        key:'concat5',
        id:'',
        product01Entity: '货款',
       
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        prereceivenum:"",
        spotnum:"",
      },{
        key:'concat6',
        id:'',
        product01Entity: (<div><span>运费:</span><RadioGroup onChange={this.onChangeFreight} value={0}><Radio value={0} >到付</Radio> <Radio  value={1}>预付</Radio></RadioGroup></div> ) ,
       
        takeway:"",
        ownnum:props.dataSource.shippayOwn,
        transnum:props.dataSource.shippayChase,
        rawyarnnum:props.dataSource.shippayChase,
        prereceivenum:"",
        spotnum:props.dataSource.shippaySpot,
      },{
        key:'concat7',
        id:'',
        product01Entity: '保险',
       
        takeway:"",
        ownnum:props.dataSource.securepayOwn,
        transnum:props.dataSource.securepayChase,
        rawyarnnum:props.dataSource.securepayChase,
        prereceivenum:"",
        spotnum:props.dataSource.securepaySpot,
      },{
        key:'concat10',
        id:'',
        product01Entity: (
          <div>   
            <div><span>发票:<Checkbox onChange={this.onChangeInvoice} /> 开发票需要加收 6% 税金：</span></div><br />
            <div><span>发票类型:</span><RadioGroup onChange={this.onChangeInvoiceType} value={0}><Radio  value={0}>总额</Radio> <Radio value={1}>明细</Radio></RadioGroup></div>
          </div> ) ,
       
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        prereceivenum:"",
        spotnum:"",
      },{
        key:'concat8',
        id:'',
        product01Entity: '小计',
       
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        prereceivenum:"",
        spotnum:"",
      },{
        key:'concat9',
        id:'',
        product01Entity: '合计',
       
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        prereceivenum:(<div><span>申请改变价格:</span><Checkbox onChange={this.onChangePrice} /> </div> ),
        spotnum:"",
      }],
    };
  }
  componentDidMount(){
    operateProducts.clear();
  
    
  }

  componentWillReceiveProps(nextProps) {
  
   if(nextProps.value===undefined){
      const concatSoures = this.state.concatSoure;
      concatSoures[1].ownnum =  nextProps.dataSource.earnest;
      concatSoures[1].spotnum =  nextProps.dataSource.pickuppay;
      this.setState({
            data: nextProps.dataSource,
            taxrate: nextProps.dataSource.taxrate,
          });
   }
    
  
  
}


  onChildChanged= (newState)=> {
    if(newState.tag === true){
     
      operateProducts.set(newState[0].productid,newState);
      this.setState({
        dataRight:newState,
      })
    }else{
      operateProducts.delete(newState.id);
    }
    
    const newData = this.state.data.map(item => ({ ...item }));

    const goodsData = this.state.dataRight.map(item => ({ ...item }));
    goodsData.colorname = newState.colorname;
    goodsData.productname = newState.productname;
    goodsData.inquirynum = newState.inquirynum;
    goodsData.recentBatchno = newState.recentBatchno;
    const fieldName = "spotnum";
    let keys="";
    for(let i =0;i<goodsData.length;i++){ // set后会重新给tableRight渲染，值还是读取接口的值，重新赋值完成input的onchage的效果
      const productDatas = operateProducts.get(goodsData[i].productid);
      if(productDatas!==undefined){
        for(let j=0;j<productDatas.length;j++){
        
          if(goodsData[i].id === productDatas[j].id){
            goodsData[i].output =productDatas[j].output;
            goodsData[i].piece =productDatas[j].piece;
            goodsData[i].completestatus = productDatas[j].completestatus;
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
          target[fieldName] = parseFloat(spotnum).toFixed(2);     
          
          
        
        }  
      }else{
        keys = item.key;
        
        const target = this.getRowByKey(keys, newData);
        if (target) {
          target[fieldName] = 0;     
          
          
        
        } 
      }
    })
   
    this.setState({ data: newData,dataRight:goodsData },()=>{
      this.generalSum(true,spot);
   
    });

    
  
  }
  onChangePrice=(e)=>{
   
     
    const Data = this.state.data;
    Data.chagePriceFlag = e.target.checked;
    this.setState({
      data:Data,
      chagePriceFlag:e.target.checked,  
    })
    const datas = this.state.data;
    const datass = this.state.concatSoure;
    datass[9].taxrate =  this.state.taxrate;
    datass[9].taxstatus = this.state.taxstatus;
     const result = datas.concat(datass,operateProducts);
    
     this.props.onChange(result);
     
   }
   onChangeInvoice=(e)=>{
    
    
    this.setState({
      taxstatus:e.target.checked,
      
    },()=>{
    //   const datas = this.state.data;
    //   const result = datas.concat(this.state.concatSoure,operateProducts);
    //  result.taxrate = this.state.taxrate;
    //  result.taxstatus = this.state.taxstatus;
    //   this.props.onChange(result);
      this.generalSum(false);
    })
    
     
   }
   onChangeFreight = (e) => {
    const values =  e.target.value;
    this.setState({
      freightValue: values?1:0,
    },()=>{
      this.generalSum(false);
    })
     // this.compute(values);
   
  }
  onChangeInvoiceType = (e) => {
    this.setState({
      invoiceValue: e.target.value,
      freightValue:e.target.value===1?0:this.state.freightValue,
      freightFlag:e.target.value===1,
  },()=>{
    this.generalSum(false);
  });
  }
  onChangeWhole(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.checked?1:0;     
      this.setState({ data: newData },()=>{
        
        this.generalSum(false);
      });
      
     
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
  generalDepositSum(){
    const newData1 = this.state.data.map(item => ({ ...item }));
    newData1.chagePriceFlag = this.state.chagePriceFlag;
  
      const newConcat= this.state.concatSoure.map(item => ({ ...item }));
      

      // 获取到定金
      const targetDeposit = this.getRowByKey("concat3", newConcat);
       const taxrate = "taxrate";
       const taxstatus = "taxstatus";
      // 获取到运费的详情
      const firstFreight = 10; // 首重重量(KG)
      const firstFreightPrice=20;// 首重金额
      const continuedFreight=5;// 续重(/kg)每kg多少钱
      
      // 保险
      const firstInsurance = 10; // 首重重量(KG)
      const firstInsurancePrice=20;// 首重金额
      const continuedInsurance=5;// 续重(/kg)每kg多少钱
      // 税金预设值
      const invoice =  this.state.taxrate!== undefined?this.state.taxrate:0.06; // 要从客户信息加载出来
      // 数量
      let ownnum = 0; // 欠货
      let transnum =0;// 代销
      let rawyarnnum =0;// 胚纱
      let prenum=0;
      let spotnum =0;// 现货
  
      let invoiceownnum=0;// 发票税收
      let invoicespotnum=0;// 发票税收
      let invoicespre = 0;
  
      // 定金
      let Deownnum =0;
      let Detransnum=0;
      let Derawyarnnum =0;
      let Derprenum = 0;
      let Despotnum= 0;
      // 货款
      let Goodsownnum =0;
      let Goodsasenum=0;
      let Goodsrawyarnnum =0;
      let Goodsprenum=0;
      let Goodspotnum= 0;
  
      
      newData1.forEach(item=>{
  

        
  
        
  
  
        // 计算贷款
  
        Goodsownnum += Number(item.ownnum===undefined?0:item.ownnum) * Number(item.price===undefined?0:item.price);
        Goodsasenum += Number(item.transnum===undefined?0:item.transnum) * Number(item.price===undefined?0:item.price);
        Goodsrawyarnnum += Number(item.rawyarnnum===undefined?0:item.rawyarnnum) * Number(item.price===undefined?0:item.price);
        Goodsprenum += Number(item.prereceivenum===undefined?0:item.prereceivenum) * Number(item.price===undefined?0:item.price);
        Goodspotnum += Number(item.spotnum===undefined?0:item.spotnum)* Number(item.price===undefined?0:item.price);
  
  
      
         
      });
        // 计算小计
      
          
        // sumown = Goodsownnum+  Number(newConcat[5].ownnum===undefined?0:newConcat[5].ownnum) +Number(newConcat[6].ownnum===undefined?0:newConcat[6].ownnum);
        // sumchase = Goodsasenum +Number(newConcat[5].transnum===undefined?0:newConcat[5].transnum) +Number(newConcat[6].transnum===undefined?0:newConcat[6].transnum);
        // sumraw = Goodsrawyarnnum +Number(newConcat[5].rawyarnnum===undefined?0:newConcat[5].rawyarnnum) +Number(newConcat[6].rawyarnnum===undefined?0:newConcat[6].rawyarnnum);
        // sumpre = Goodsprenum +Number(newConcat[5].prereceivenum===undefined?0:newConcat[5].prereceivenum) +Number(newConcat[6].prereceivenum===undefined?0:newConcat[6].prereceivenum);
        // sumspot =Goodspotnum+ Number(newConcat[5].spotnum===undefined?0:newConcat[5].spotnum) +Number(newConcat[6].spotnum===undefined?0:newConcat[6].spotnum);
  // 计算定金
  Deownnum += Goodsownnum *(Number(newConcat[1].ownnum===""?0:newConcat[1].ownnum)/100);
  Detransnum += Goodsasenum *(Number(newConcat[1].ownnum===""?0:newConcat[1].ownnum)/100);
  Derawyarnnum +=Goodsrawyarnnum *(Number(newConcat[1].ownnum===""?0:newConcat[1].ownnum)/100);
  
   Despotnum += (Math.ceil(Number(spotnum===undefined?0:spotnum)/1000)*(Number(newConcat[1].spotnum===""?0:newConcat[1].spotnum)));
  
      Derprenum = Goodsprenum;
      
      
      // 定金
      targetDeposit[own] = this.changeTwoDecimalf(Deownnum);
      targetDeposit[chase] = this.changeTwoDecimalf(Detransnum);
      targetDeposit[raw] = this.changeTwoDecimalf(Derawyarnnum);
      targetDeposit[pre] = this.changeTwoDecimalf(Derprenum);
      targetDeposit[spot] = this.changeTwoDecimalf(Despotnum);


  
     
      this.setState({ concatSoure: newConcat },()=>{
        const datas = this.state.data;
      
      const result = datas.concat(this.state.concatSoure,operateProducts);
   
      this.props.onChange(result);
      });
      
     
  }

generalSum(flag,signname){
  const newData1 = this.state.data.map(item => ({ ...item }));
  newData1.chagePriceFlag = this.state.chagePriceFlag;

    const newConcat= this.state.concatSoure.map(item => ({ ...item }));
    
    // 获取到数量
    const targetNum = this.getRowByKey("concat1", newConcat);
    // 获取到定金
    const targetDeposit = this.getRowByKey("concat3", newConcat);
    // 获取到货款
    const targetGoods = this.getRowByKey("concat5", newConcat);
    // 获取到运费
    const targetFreight = this.getRowByKey("concat6", newConcat);
    // 获取到保险
    const targetInsurance = this.getRowByKey("concat7", newConcat);
     // 获取到发票
     const targetInvoice = this.getRowByKey("concat10", newConcat);
    // 获取到小计
    const targetPlan = this.getRowByKey("concat8", newConcat);
     // 获取到总计
     const targetSum = this.getRowByKey("concat9", newConcat);
     const taxrate = "taxrate";
     const taxstatus = "taxstatus";
    // 获取到运费的详情
    const firstFreight = 10; // 首重重量(KG)
    const firstFreightPrice=20;// 首重金额
    const continuedFreight=5;// 续重(/kg)每kg多少钱
    
    // 保险
    const firstInsurance = 10; // 首重重量(KG)
    const firstInsurancePrice=20;// 首重金额
    const continuedInsurance=5;// 续重(/kg)每kg多少钱
    // 税金预设值
    const invoice =  this.state.taxrate!== undefined?this.state.taxrate:0.06; // 要从客户信息加载出来
    // 数量
    let ownnum = 0; // 欠货
    let transnum =0;// 代销
    let rawyarnnum =0;// 胚纱
    let prenum=0;
    let spotnum =0;// 现货

    let invoiceownnum=0;// 发票税收
    let invoicespotnum=0;// 发票税收
    let invoicespre = 0;

    // 定金
    let Deownnum =0;
    let Detransnum=0;
    let Derawyarnnum =0;
    let Derprenum = 0;
    let Despotnum= 0;
    // 货款
    let Goodsownnum =0;
    let Goodsasenum=0;
    let Goodsrawyarnnum =0;
    let Goodsprenum=0;
    let Goodspotnum= 0;

    // 小计
    let sumown = 0;
    let sumchase =0;
    let sumraw=0;
    let sumpre=0;
    let sumspot =0;
    
    // 总计
    let sum =0;
    
    // 运费
    let Freownnum =0;
    let Frepre=0;
    // const Frerawyarnnum =0;
    let Frespotnum= 0; 
    
    // 保险
    let Insownnum =0;
    let Inspre=0;
    // const Insrawyarnnum =0;
    let Insspotnum= 0;
    
    newData1.forEach(item=>{

     
      // 计算数量
      ownnum += Number(item.ownnum===undefined?0:item.ownnum);
      transnum += Number(item.transnum===undefined?0:item.transnum);
      rawyarnnum += Number(item.rawyarnnum===undefined?0:item.rawyarnnum);
      prenum += Number(item.prereceivenum===undefined?0:item.prereceivenum);
      spotnum += Number(item.spotnum===undefined?0:item.spotnum);
      

      


      // 计算贷款

      Goodsownnum += Number(item.ownnum===undefined?0:item.ownnum) * Number(item.price===undefined?0:item.price);
      Goodsasenum += Number(item.transnum===undefined?0:item.transnum) * Number(item.price===undefined?0:item.price);
      Goodsrawyarnnum += Number(item.rawyarnnum===undefined?0:item.rawyarnnum) * Number(item.price===undefined?0:item.price);
      Goodsprenum += Number(item.prereceivenum===undefined?0:item.prereceivenum) * Number(item.price===undefined?0:item.price);
      Goodspotnum += Number(item.spotnum===undefined?0:item.spotnum)* Number(item.price===undefined?0:item.price);


    
       
    });
      // 计算小计
    
        
      // sumown = Goodsownnum+  Number(newConcat[5].ownnum===undefined?0:newConcat[5].ownnum) +Number(newConcat[6].ownnum===undefined?0:newConcat[6].ownnum);
      // sumchase = Goodsasenum +Number(newConcat[5].transnum===undefined?0:newConcat[5].transnum) +Number(newConcat[6].transnum===undefined?0:newConcat[6].transnum);
      // sumraw = Goodsrawyarnnum +Number(newConcat[5].rawyarnnum===undefined?0:newConcat[5].rawyarnnum) +Number(newConcat[6].rawyarnnum===undefined?0:newConcat[6].rawyarnnum);
      // sumpre = Goodsprenum +Number(newConcat[5].prereceivenum===undefined?0:newConcat[5].prereceivenum) +Number(newConcat[6].prereceivenum===undefined?0:newConcat[6].prereceivenum);
      // sumspot =Goodspotnum+ Number(newConcat[5].spotnum===undefined?0:newConcat[5].spotnum) +Number(newConcat[6].spotnum===undefined?0:newConcat[6].spotnum);
// 计算定金
Deownnum += Goodsownnum *(Number(newConcat[1].ownnum===""?0:newConcat[1].ownnum)/100);
Detransnum += Goodsasenum *(Number(newConcat[1].ownnum===""?0:newConcat[1].ownnum)/100);
Derawyarnnum +=Goodsrawyarnnum *(Number(newConcat[1].ownnum===""?0:newConcat[1].ownnum)/100);

 Despotnum += (Math.ceil(Number(spotnum===undefined?0:spotnum)/1000)*(Number(newConcat[1].spotnum===""?0:newConcat[1].spotnum)));

    Derprenum = Goodsprenum;
    // 计算欠货运费和保险
    if((ownnum>0 || transnum>0 || rawyarnnum>0) && this.state.freightValue ===1){
      Freownnum = firstFreightPrice+(ownnum-firstFreight<0?0:ownnum-firstFreight)*continuedFreight;
      Insownnum = firstInsurancePrice+(ownnum-firstInsurance<0?0:ownnum-firstFreight)*continuedInsurance;
    }else{
      Freownnum =0;
      Insownnum = 0;
    }
    sumown = Goodsownnum+Freownnum+Insownnum;
    sumchase =Goodsasenum+Freownnum+Insownnum;
    sumraw =Goodsrawyarnnum+Freownnum+Insownnum;
    // 计算预定运费和保险
    if(prenum>0 && this.state.freightValue ===1){
      Frepre = firstFreightPrice+(prenum-firstFreight<0?0:prenum-firstFreight)*continuedFreight;
      Inspre = firstInsurancePrice+(prenum-firstInsurance<0?0:prenum-firstFreight)*continuedInsurance;
    }else{
      Frepre =0;
      Inspre = 0;
    }
    sumpre =Goodsprenum+Frepre+Inspre;

    // 计算现货运费和保险
    if(spotnum>0 && this.state.freightValue ===1){
      
      Frespotnum = firstFreightPrice+(spotnum-firstFreight<0?0:spotnum-firstFreight)*continuedFreight;
      
      Insspotnum = firstInsurancePrice+(spotnum-firstInsurance<0?0:spotnum-firstFreight)*continuedInsurance;
    }else{
      Frespotnum =0;
      Insspotnum = 0;
    }
    sumspot =Goodspotnum+Frespotnum+Insspotnum;

    sum = sumown+sumchase+sumspot+sumraw+sumpre;
     // Goodsownnum  -=  Deownnum;
     Goodsownnum = Goodsownnum+Goodsasenum+Goodsrawyarnnum;
     if(this.state.taxstatus === true){
       console.log("this.state.taxstatus ",this.state.taxstatus );
       targetSum[taxstatus] = this.state.taxstatus;
      invoicespotnum = Goodspotnum*(invoice);
      sumspot+=invoicespotnum;
      // 计算税收
      invoiceownnum = Goodsownnum *(invoice);
      sumown+=invoiceownnum;

      invoicespre =Goodsprenum*(invoice);
      sumpre+=invoicespre;
      sumraw+=invoiceownnum;
      sumchase+=invoiceownnum;
     }else{
      targetSum[taxstatus] =false;
     }
     sum = sum+invoicespotnum+invoiceownnum+invoicespre;
     // sum += invoicespotnum+invoiceownnum+invoiceownnum;
     if(Goodsasenum !==0){
      Goodsasenum -=  Detransnum;
     }
     if(Goodsrawyarnnum !==0){
      Goodsrawyarnnum -=  Derawyarnnum;
     }
    // Goodspotnum -= Despotnum;
    
    // 给各自的拣货费什么赋值
    
    // 数量
    targetNum[own] = this.changeTwoDecimalf(ownnum);
    targetNum[chase] = this.changeTwoDecimalf(transnum);
    targetNum[raw] = this.changeTwoDecimalf(rawyarnnum);
    targetNum[pre] = this.changeTwoDecimalf(prenum);
    targetNum[spot] = this.changeTwoDecimalf(spotnum);
    
    // 定金
    if(flag){
      if(signname === own){
        targetDeposit[signname] = this.changeTwoDecimalf(Deownnum);
      }else if(signname === chase){
        targetDeposit[signname] = this.changeTwoDecimalf(Detransnum);
      }else if(signname === raw){
        targetDeposit[signname] = this.changeTwoDecimalf(Derawyarnnum);
      }
      else if(signname === pre){
        targetDeposit[signname] = this.changeTwoDecimalf(Derprenum);
      }
      else if(signname === spot){
        targetDeposit[signname] = this.changeTwoDecimalf(Despotnum);
      }
      
    // targetDeposit[chase] = this.changeTwoDecimalf(Detransnum);
    // targetDeposit[raw] = this.changeTwoDecimalf(Derawyarnnum);
    // targetDeposit[pre] = this.changeTwoDecimalf(Derprenum);
    // targetDeposit[spot] = this.changeTwoDecimalf(Despotnum);
    }
    

    // 税金
    targetInvoice[own] = this.changeTwoDecimalf(invoiceownnum);
    targetInvoice[pre] = this.changeTwoDecimalf(invoicespre);
    targetInvoice[spot] = this.changeTwoDecimalf(invoicespotnum);

    // 货款
    targetGoods[own] = this.changeTwoDecimalf(Goodsownnum);
    targetGoods[chase] = this.changeTwoDecimalf(Goodsasenum);
    targetGoods[raw] = this.changeTwoDecimalf(Goodsrawyarnnum);
    targetGoods[pre] = this.changeTwoDecimalf(Goodsprenum);
    targetGoods[spot] = this.changeTwoDecimalf(Goodspotnum);

    // 小计
    targetPlan[own] = this.changeTwoDecimalf(sumown);
    targetPlan[chase] = this.changeTwoDecimalf(sumchase);
    targetPlan[raw] = this.changeTwoDecimalf(sumraw);
    targetPlan[pre] = this.changeTwoDecimalf(sumpre);
    targetPlan[spot] = this.changeTwoDecimalf(sumspot);

    targetFreight[own] = this.changeTwoDecimalf(Freownnum);
    // targetFreight[chase] = this.changeTwoDecimalf(Fretransnum);
    // targetFreight[raw] = this.changeTwoDecimalf(Frerawyarnnum);
    targetFreight[pre] = this.changeTwoDecimalf(Frepre);
    targetFreight[spot] = this.changeTwoDecimalf(Frespotnum);

    targetInsurance[own] = this.changeTwoDecimalf(Insownnum);
    targetInsurance[pre] = this.changeTwoDecimalf(Inspre);
    // targetInsurance[raw] = this.changeTwoDecimalf(Instransnum);
    // targetInsurance[chase] = this.changeTwoDecimalf(Insrawyarnnum);
    targetInsurance[spot] = this.changeTwoDecimalf(Insspotnum);


    
    
    targetSum[spot] = this.changeTwoDecimalf(sum);

    
    targetSum[taxrate] = this.state.taxrate;
   
    this.setState({ concatSoure: newConcat },()=>{
      const datas = this.state.data;
    
    const result = datas.concat(this.state.concatSoure,operateProducts);
 
    this.props.onChange(result);
    });
    
   
}
  
  handleFieldChange(e, fieldName, key,signname) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;     
      this.setState({ data: newData },()=>{
        
        this.generalSum(true,signname);
      });
      
     
    }
    
  }

  handleNumChange(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;     
      this.setState({ data: newData },()=>{
        this.generalSum(false);
      });
      
     
    }
    
  }


  handlechange(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;     
      this.setState({ data: newData },()=>{
        this.generalSum(false);
      });
      
     
    }
    
  }

  handleDatachange(e,b, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = b;     
      this.setState({ data: newData },()=>{
        this.generalSum(false);
      });
      
     
    }
    
  }

  
  handlSelectChange(e, fieldName, key) {
    const newData = this.state.concatSoure.map(item => ({ ...item }));
   
   
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
     
      
      this.setState({ concatSoure: newData });
    }
    const datas = this.state.data;
    const datass = this.state.concatSoure;
    datass[9].taxrate =  this.state.taxrate;
    datass[9].taxstatus = this.state.taxstatus;
    const result = datas.concat(datass,operateProducts);
   
    this.props.onChange(result);
  }

  ProportionBlur=()=>{
    this.generalSum(true);
    // const newData1 = this.state.data;
    // newData1.chagePriceFlag = this.state.chagePriceFlag;
    // const newConcat= this.state.concatSoure.map(item => ({ ...item }));
   
    // // 获取到定金
    // const targetDeposit = this.getRowByKey("concat3", newConcat);
    // // 获取到货款
    // const targetGoods = this.getRowByKey("concat5", newConcat);
    // // 获取到小计
    // const targetPlan = this.getRowByKey("concat8", newConcat);
    //  // 获取到总计
    //  const targetSum = this.getRowByKey("concat9", newConcat);

  

    //  let Deownnum =0;
    //  let Detransnum=0;
    //  let Derawyarnnum =0;
    //  let Despotnum= 0;
 
    //  let Goodsownnum =0;
    //  let Goodsasenum=0;
    //  let Goodsrawyarnnum =0;
    //  let Goodspotnum= 0;
 
    //  let sumown = 0;
    //  let sumchase =0;
    //  let sumraw=0;
    //  let sumspot =0;
    
    // let sum =0;
    // newData1.forEach(item=>{

     
      
      

    //   // 计算定金
    //   Deownnum += Number(item.ownnum===undefined?0:item.ownnum) * Number(item.price===undefined?0:item.price) *(Number(newConcat[1].ownnum===""?0:newConcat[1].ownnum)/100);
    //   Detransnum += Number(item.transnum===undefined?0:item.transnum) * Number(item.price===undefined?0:item.price) *(Number(newConcat[1].ownnum===""?0:newConcat[1].ownnum)/100);
    //   Derawyarnnum += Number(item.rawyarnnum===undefined?0:item.rawyarnnum) * Number(item.price===undefined?0:item.price) *(Number(newConcat[1].ownnum===""?0:newConcat[1].ownnum)/100);
    //   Despotnum += (Number(item.spotnum===undefined?0:item.spotnum)/1000*(Number(newConcat[1].spotnum===""?0:newConcat[1].spotnum)));


    //   // 计算贷款

    //   Goodsownnum += Number(item.ownnum===undefined?0:item.ownnum) * Number(item.price===undefined?0:item.price);
    //   Goodsasenum += Number(item.transnum===undefined?0:item.transnum) * Number(item.price===undefined?0:item.price);
    //   Goodsrawyarnnum += Number(item.rawyarnnum===undefined?0:item.rawyarnnum) * Number(item.price===undefined?0:item.price);
    //   Goodspotnum += Number(item.spotnum===undefined?0:item.spotnum)* Number(item.price===undefined?0:item.price);

    //   // 计算小计
    
        
    //   sumown = Goodsownnum+  Number(newConcat[5].ownnum===undefined?0:newConcat[5].ownnum) +Number(newConcat[6].ownnum===undefined?0:newConcat[6].ownnum);
    //   sumchase = Goodsasenum +Number(newConcat[5].transnum===undefined?0:newConcat[5].transnum) +Number(newConcat[6].transnum===undefined?0:newConcat[6].transnum);
    //   sumraw = Goodsrawyarnnum +Number(newConcat[5].rawyarnnum===undefined?0:newConcat[5].rawyarnnum) +Number(newConcat[6].rawyarnnum===undefined?0:newConcat[6].rawyarnnum);
    //   sumspot =Goodspotnum+ Number(newConcat[5].spotnum===undefined?0:newConcat[5].spotnum) +Number(newConcat[6].spotnum===undefined?0:newConcat[6].spotnum);

    //   sum = sumown+sumchase+sumspot;
       
    // });
    // // 再计算贷款(-定金)
    // // Goodsownnum  -=  Deownnum;
    // // Goodsasenum -=  Detransnum;
    // // Goodsrawyarnnum -=Derawyarnnum;
    // // Goodspotnum -= Despotnum;
    // Goodsownnum = Goodsownnum+Goodsasenum+Goodsrawyarnnum;
    // targetDeposit[own] = this.changeTwoDecimalf(Deownnum);
    // // targetDeposit[chase] = this.changeTwoDecimalf(Detransnum);
    // // targetDeposit[raw] = this.changeTwoDecimalf(Derawyarnnum);
    // targetDeposit[spot] = this.changeTwoDecimalf(Despotnum);


    // targetGoods[own] = this.changeTwoDecimalf(Goodsownnum);
    // // targetGoods[chase] = this.changeTwoDecimalf(Goodsasenum);
    // // targetGoods[raw] = this.changeTwoDecimalf(Goodsrawyarnnum);
    // targetGoods[spot] = this.changeTwoDecimalf(Goodspotnum);






    // targetPlan[own] = this.changeTwoDecimalf(sumown);
    // // targetPlan[chase] = this.changeTwoDecimalf(sumchase);
    // targetPlan[spot] = this.changeTwoDecimalf(sumspot);
    
    // targetSum[own] = this.changeTwoDecimalf(sum);
    // this.setState({ concatSoure: newConcat });
    
    // const result = this.state.data.concat(this.state.concatSoure,operateProducts);
    
    // this.props.onChange(result);
  }
  handleInputNumberChange(e, fieldName, key) {
    
    const newData = this.state.concatSoure.map(item => ({ ...item }));
   
    // 计算定金(每个数量*单价*支付比例)

    // 计算小计(定金+货款+运费+保险)

    // 计算总计(三个小计之和)

   
    const target = this.getRowByKey(key, newData);
    if (target) {
   
      target[fieldName] = e;
     
 
      this.setState({ concatSoure: newData });
    }
    const datas = this.state.data;
    const datass = this.state.concatSoure;
      datass[9].taxrate =  this.state.taxrate;
      datass[9].taxstatus = this.state.taxstatus;
    
    const result = datas.concat(datass,operateProducts);

    this.props.onChange(result);
    
  }

  handleConcatChange(e, fieldName, key) {
    let sumown = 0;
    let sumchase =0;
    let sumspot =0;
    
    let sum =0;
    const newData = this.state.concatSoure.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      this.setState({ concatSoure: newData },()=>{
        newData.forEach(item=>{
          // 计算小计
          
          if(item.key === "concat5" || item.key === "concat6" || item.key === "concat7" ){
            sumown += Number(item.ownnum===undefined?0:item.ownnum);
            sumchase += Number(item.transnum===undefined?0:item.transnum);
            sumspot += Number(item.spotnum===undefined?0:item.spotnum);
    
            sum = sumown+sumchase+sumspot;
          }
    
          
    
          
        });
    
        // 获取到小计
        const targetNum = this.getRowByKey("concat8", newData);
        // 获取到总计
        const targetSum = this.getRowByKey("concat9", newData);
        targetNum[own] = this.changeTwoDecimalf(sumown);
        targetNum[chase] = this.changeTwoDecimalf(sumchase);
        targetNum[spot] = this.changeTwoDecimalf(sumspot);
    
        targetSum[own] = this.changeTwoDecimalf(sum);
    
    
        this.setState({ concatSoure: newData });
        const datas = this.state.data;
        const datass = this.state.concatSoure;
        datass[9].taxrate =  this.state.taxrate;
        datass[9].taxstatus = this.state.taxstatus;
        const result = datas.concat(datass,operateProducts);
    
        this.props.onChange(result);
      }); 
    }
    
    
  }

  sumTotal=(num =0)=>{
    let snum = 0;
    snum += Number(num);
    return snum;
  }

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
  
 compare=(property)=>{
  return (a,b)=>{
      const value1 = a[property];
      const value2 = b[property];
      return value1 - value2;
  }
}
  
  openBatch=(id,colorname,productname,num,usrids)=>{
    message.config({
      top: 100,
    });
    const hide = message.loading(`正在查询...`, 30);
    setTimeout(hide,100);
    let arr =[];
    
      const inuqiry ={
        usrid:usrids,
        inquiryDetail01Entities:{
          "productid":id,
        },
      }
      const param =`terms[0].value=${id}&terms[0].column=productid&terms[1].value=${0}&terms[1].value=${-1}&terms[1].column=status&terms[1].termType=in`;
      queryGoodsBasicNoPaging(param).then((response)=>{
        if(response && response.status===200){
         arr =response.result;
          // if(id==='1533697589676000005'){
            
          //   arr =Demodata;
          // }else{
          //   arr =Demodata1;
          // }
          const goodids = [];
          let goodterms = "terms[0].column=id&";
        
          for(let i =0;i< arr.length;i+=1){
            arr[i].key= `Goodsdetail${arr[i].id}${i}`;
            arr[i].output=0;
            arr[i].piece=0;
            arr[i].completestatus=0;
            if(goodids.indexOf(arr[i].goodid)===-1){
              goodids.push(arr[i].goodid);
              goodterms += `terms[0].value=${arr[i].goodid}&`;
              
              
            }
           
          }
          
        
          //  arr = arr.sort((a,b)=>{
          //   return a.localeCompare(b,'zh-CN');
          //   });
          goodterms += "terms[0].termType=in";
          queryDescBatchno(inuqiry).then(inres=>{
            if(inres && inres.status === 200){
              let batchno = "";
              if(inres.result !== undefined){
                batchno = inres.result;
              }
              queryGoods(goodterms).then(goodsres=>{
                if(goodsres && goodsres.status === 200){
                  const goodsData = goodsres.result.data;
                  const goodArea  = new Map();
                  const goodDate = new Map();
                  goodsData.forEach(item=>{
                    goodArea.set(item.id,item.area);
                    goodDate.set(item.id,item.deliverydate);
                  });
                  arr.colorname =colorname;
                  arr.productname =productname;
                  arr.inquirynum = num;
                  arr.recentBatchno = batchno;
                  const locationTerms = `terms[0].value=${id}&terms[0].column=productid&paging=false&terms[1].column=recordstatus&terms[1].value=0`;
                  queryGoodslocation(locationTerms).then(lores=>{
                    if(lores && lores.status===200){
                     
                      const piecemap = new Map();// 计算整件数
                      const scatpiecemap = new Map();// 计算包数
                      const cartnoData = lores.result.data;
                     
                      if(operateProducts.get(id)){
                        const data = arr;
                  
                        const selectdata = operateProducts.get(id);
                        for(let z=0;z<data.length;z+=1){
                          const cartnoChildren =[];// 子包
                          const cartnoList = [];// 父包
                          for(let s=0;s<cartnoData.length;s+=1){
                            if(data[z].id === cartnoData[s].detailid){
                              if(cartnoData[s].newnw === cartnoData[s].weight){
                                cartnoList.push(cartnoData[s].id);
                              }else{
                                cartnoChildren.push(cartnoData[s].id);
                              }
                              
                             }
                          }
                          piecemap.set(data[z].id,cartnoList.length);
                          scatpiecemap.set(data[z].id,cartnoChildren.length);
                          
                          
                        }
                        for(let i = 0;i<data.length;i+=1){
        
                          for(let j=0;j<selectdata.length;j+=1){
                              if(data[i].batchno === selectdata[j].batchno && data[i].id === selectdata[j].id){
                                data[i].output = selectdata[j].output;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
                                data[i].piece = selectdata[j].piece;
                                data[i].completestatus = selectdata[j].completestatus;
                                data[i].piecenums =piecemap.get(data[i].id);
                                data[i].splitnums = scatpiecemap.get(data[i].id);
                                data[i].maxpiece = Math.ceil(selectdata[j].remainnum/(selectdata[j].totalnw /selectdata[j].allpiecenum));
                              }
                          }
                          data[i].area = goodArea.get (data[i].goodid);
                          data[i].deliverydate =goodDate.get(data[i].goodid);
                        }
                        
                        
                        this.setState({
                          dataRight:data,
                          total:response.result.total,
                          productid:id,
                          defaultProductids:id,
                        })
                      }else{
                        for(let z=0;z<arr.length;z+=1){
                          const cartnoChildren =[];// 子包
                          const cartnoList = [];// 父包
                          for(let s=0;s<cartnoData.length;s+=1){
                            if(arr[z].id === cartnoData[s].detailid){
                              if(cartnoData[s].parentcartno ===undefined && cartnoData[s].newnw === cartnoData[s].weight){// 没有拆过算整件
                                cartnoList.push(cartnoData[s].id);
                              }else{
                                cartnoChildren.push(cartnoData[s].id);
                              }
                              
                             }
                          }
                          piecemap.set(arr[z].id,cartnoList.length);
                          scatpiecemap.set(arr[z].id,cartnoChildren.length);
                          
                          
                        }
                     
                        for(let i = 0;i<arr.length;i+=1){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                            arr[i].area = goodArea.get (arr[i].goodid);
                            arr[i].piecenums =piecemap.get(arr[i].id);
                            arr[i].splitnums = scatpiecemap.get(arr[i].id);
                            arr[i].deliverydate =goodDate.get(arr[i].goodid);
                            arr[i].maxpiece = Math.ceil(arr[i].remainnum/( arr[i].totalnw / arr[i].allpiecenum));
                         }
                          
                        
                      }
                     
                      this.setState({
                        dataRight:arr,
                        total:response.result.total,
                        productid:id,
                        defaultProductids:id,
                      }
                      ); 
                    }
                  });
                  
                }
              });
            }
          });
          
               
        }
      }
    )

  }
  saveBatch=(e)=>{
    const  defaultProductid = this.state.defaultProductids;
    if(defaultProductid==="" || defaultProductid !== e.productid){
      
      if(e.productid !== undefined){
        this.openBatch(e.productid,e.product01Entity.colorname,e.product01Entity.productname,e.num,e.usrid);
      }
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
  InputNumberBlur(){
    const datass = this.state.concatSoure;
      datass[9].taxrate =  this.state.taxrate;
      datass[9].taxstatus = this.state.taxstatus;
    const result = this.state.data.concat(datass,operateProducts);

    this.props.onChange(result);
  }

  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.setState({ data: newData });
    this.clickedCancel = false;
  }
  renderContents=(value, dataSource, index)=>{
    const obj = {
      children: value,
      props: {},
    };
    // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
    if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
      || index-5 === dataSource.length|| index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length || index-9 === dataSource.length) {
      obj.props.colSpan = 0;
    }
    return obj;
  }
  render() {

   
    const dataSource = this.state.data;
    const dataConcat = this.state.concatSoure;
   const tasx = parseFloat(this.state.taxrate)*100;
 dataConcat[5].product01Entity=(<div><span>运费:</span><RadioGroup onChange={this.onChangeFreight} value={this.state.freightValue}><Radio value={0} >到付</Radio> <Radio disabled={this.state.freightFlag} value={1}>预付</Radio></RadioGroup></div> );
 dataConcat[7].product01Entity=(<div><div><span>发票:<Checkbox onChange={this.onChangeInvoice} /> {`开发票需要加收 ${tasx}% 税金：`}</span></div><br /><div><span>发票类型:</span><RadioGroup onChange={this.onChangeInvoiceType} value={this.state.invoiceValue}><Radio  value={0}>总额</Radio> <Radio value={1}>明细</Radio></RadioGroup></div></div> ) ;
    const dataBatch = this.state.dataRight;
    
    

    const startTime = moment().format('YYYY-MM-DD');
    
    
    
    const renderContent = (value, row, index) => {
      const obj = {
        children: value,
        props: {},
      };
      // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
      if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
        || index-5 === dataSource.length|| index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length || index-9 === dataSource.length) {
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
        title: '产品信息',
        children:[{
          dataIndex:'product01Entity',
          key:'picture',
          width:'8%',
          render:(val, record,index)=>{
            
            if(arrData[index].takeway!=="" ){
              return (
                <div>
                  <li>
                    <img src={val.picture} alt={val.picture} width={100} height={35}  />
                  </li>
                  <li>
                    {`${val.productkind.kindname}${val.productseries.seriesname}`}
                  </li>
                </div>)
            }else{
              return renderContent(val, record,index);
             
            }
          },
        },
        {
          dataIndex:'product01Entity',
          key:'product01Entity',
          width:'3%',
          render:(val)=>{
          
            if( typeof(val)!=="string" && val.type !== "div"){
             
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
            
            else{return { 
              children :<span style={{ fontWeight: 600,float:"right" }}>{val}</span>,
                  props:{
                    colSpan:4,
                  },
                }}
            
          },
         
        },
        ],
        key: 'product',
        
        
      },
      {
        title: '单价',
        dataIndex: 'price',
        key: 'price',
        width: '3%',
        render: (value, row, index) => {
          const obj = {
            children: (<span className={styles.fontbigsize}>￥{value}</span>),
            props: {},
          };
          // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
          if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
            || index-5 === dataSource.length|| index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length || index-9 === dataSource.length) {
            obj.props.colSpan = 0;
          }
          return obj;
        },
      }, {
        title: '数量(KG)',
        dataIndex: 'num',
        key: 'num',
        width: '3%',
        render:(value, row, index) => {
          const obj = {
            children: (
              <InputNumber
                className={styles.fontbigsize}
                min={0.0}

                value={value}
                onChange={e => this.handleNumChange(e, 'num', row.key)}
            
              
              />
            ),
            props: {},
          };
          // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
          if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
            || index-5 === dataSource.length|| index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length || index-9 === dataSource.length) {
            obj.props.colSpan = 0;
          }
          return obj;
        },
      },
      //  {
      //   title: '用途 ',
      //   dataIndex: 'usefor',
      //   key: 'usefor',
      //   width: '10%',
      //   render: (val, record,index) => {
          
      //     if(typeof(record.product01Entity)==="string"|| record.product01Entity.type === "div"){
            
      //       return renderContent(val, record,index);
      //     }else{
      //       return (
      //         <Select  defaultValue="大货" onChange={e => this.handleFieldChange(e, 'usefor', record.key)}>
      //           <Option value='大货'>大货</Option>
      //           <Option value='打样'>打样</Option>
      //           <Option value='混色'>混色</Option>
      //           <Option value='纯色'>纯色</Option>
      //         </Select>)
            
      //     }
      //   },
      // },
     
      // {
      //   title: '是否为整件',
      //   dataIndex: 'completestatus',
      //   key: 'completestatus',
      //   width: '10%',
      //   render: (val, record,index) => {
          
      //     if(typeof(record.product01Entity)==="string"|| record.product01Entity.type === "div"){
      //       return renderContent(val,record,index);
          
      //     }else{
      //       return (
      //         <div><span>整件数:<Checkbox onChange={e=>this.onChangeWhole(e, 'completestatus', record.key)} /></span></div>)
            
      //     }
      //   },
      // },
     
      {
        title: '现货',
        dataIndex: 'spotnum',
        key: 'spotnum',
        width: '5%',
        render: (text, record,index) => {
           if(arrData[index].product01Entity==="结款方式"){
      
            return ( 
              
              <Select  defaultValue={0} onChange={e => this.handlSelectChange(e, 'spotnum', record.key)}>
                <Option value={0}>全款</Option>
                <Option value={1}>月结</Option>
                <Option value={2}>预收</Option>
              </Select>)
          }
          else if(arrData[index].product01Entity==="支付比例/拣货费计价"){
            return (
              <InputNumber
                onBlur={e => this.ProportionBlur(e)}
                min={0.0}
                value={record.spotnum}
                formatter={value => `${value}/吨`}
                parser={value => value.replace('/吨', '')}
                onChange={e => this.handleInputNumberChange(e, 'spotnum', "concat2")}
              
                
              />)
          } else if(arrData[index].product01Entity==="定金/拣货费"  ){
            return (
              <InputNumber
                
                min={0.0}

                value={record.spotnum}
                onChange={e => this.handleConcatChange(e, 'spotnum', "concat3")}
              
                
              />)
          }
          
          else if(arrData[index].takeway==="" ){
            return <span style={{ fontWeight: 600 }}>{text}</span>;
          }
          else{
            return (
              <span>{record.spotnum}</span>
            );
          }
          },
          
      },
      {
        title: '预订货',
        dataIndex: 'prereceivenum',
        key: 'prereceivenum',
        width: '5%',
        render: (text, record,index) => {
           if(arrData[index].product01Entity==="结款方式"){
      
            return ( 
              
              <Select  defaultValue={0} onChange={e => this.handlSelectChange(e, 'prereceivenum', record.key)} disabled>
                <Option value={0}>全款</Option>
                <Option value={1}>月结</Option>
                <Option value={2}>预收</Option>
              </Select>)
          }
          else if(arrData[index].product01Entity==="支付比例/拣货费计价"){
            return (
              <InputNumber
                onBlur={e => this.ProportionBlur(e)}
                min={0.0}
                value={100}
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
                onChange={e => this.handleInputNumberChange(e, 'prereceivenum', "concat2")}
                disabled
                
              />)
          } else if(arrData[index].product01Entity==="定金/拣货费"  ){
            return (
              <InputNumber
                
                min={0.0}

                value={record.prereceivenum}
                onChange={e => this.handleConcatChange(e, 'prereceivenum', "concat3")}
              
                
              />)
          }
          
          else if(arrData[index].takeway==="" ){
            return <span style={{ fontWeight: 600 }}>{text}</span>;
          }
          else{
            return (
              <div>
                <InputNumber
                  onBlur={e => this.InputNumberBlur(e)}
                  onChange={e => this.handleFieldChange(e, 'prereceivenum', record.key,pre)}
                />
               
                
              </div>
            );
          }
          },
          
      },
      {
        title: '欠货(下染)',
        children:[{
        dataIndex: 'ownnum',
        key: 'ownnum',
        width: '5%',
        editable:false,
        render: (val, record,index) => {
          if(arrData[index].product01Entity==="结款方式"){
            return { 
              children:
  <Select  defaultValue={dataConcat[3].ownnum} onChange={e => this.handlSelectChange(e, 'ownnum', record.key)}>
    <Option value={0}>全款</Option>
    <Option value={1}>月结</Option>
    <Option value={2}>预收</Option>
  </Select>,
            props:{
              colSpan:6,
            },  
            }
          }
          else if(arrData[index]. product01Entity==="支付比例/拣货费计价"){
            return {
              children:<InputNumber
                value={record.ownnum}
                min={0.0}
                max={100}
                onBlur={e => this.ProportionBlur(e)}
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
                onChange={e => this.handleInputNumberChange(e, 'ownnum', "concat2")} 
              />,
              props:{
                colSpan:6,
              },
            }
          }
          else if(arrData[index].product01Entity==="定金/拣货费"  ){
            return {
              children:<InputNumber
                min={0.0} 
                value={record.ownnum}
                onChange={e => this.handleConcatChange(e, 'ownnum', "concat3")}  
              />,
              props:{
                colSpan:6,
              },
            }
          }
          else if(arrData[index].product01Entity==="数量" ){
            return { 
              children :<span style={{ fontWeight: 600,float:"right" }}>{val}</span>,
                  props:{
                    colSpan:2,
                  },
                }
          }
          else if(arrData[index].takeway==="" &&arrData[index].product01Entity!=="数量"){
            return { 
            children :<span style={{ fontWeight: 600,float:"right" }}>{val}</span>,
                props:{
                  colSpan:6,
                },
              }
            }
            
            else if(arrData[index].product01Entity.productattribute ===1){
            
            return (
              <div>
                <InputNumber
                  onBlur={e => this.InputNumberBlur(e)}
                  onChange={e => this.handleFieldChange(e, 'ownnum', record.key,own)}
                />
               
                
              </div>
            );
          }
          },
          
      },{
        dataIndex:'chasebatchno',
          key:'chasebatchno',
          width: '5%',
          render:(val, record,index)=>{
            
            if(arrData[index].takeway!=="" && arrData[index].product01Entity.productattribute ===1){
              return(
                <Input
                  placeholder="缸号"
                  onBlur={e => this.InputNumberBlur(e)}
                  onChange={e => this.handlechange(e, 'chasebatchno', record.key)}
                  styel={{width:100}}
                />
              );
              

            }else{
              return renderContent(val, record,index);
            }
          },

      }],
    },
      {
        title: '代销(平台)',
        children:[{
        dataIndex: 'transnum',
        key: 'transnum',
        width: '5%',
        render: (val, record,index) => {
          if(arrData[index].product01Entity==="结款方式" || arrData[index]. product01Entity==="支付比例/拣货费计价"
        || arrData[index].product01Entity==="定金/拣货费"){
            return renderContent(val, record,index);
          }
         
          else if(arrData[index].product01Entity==="数量" ){
            return { 
              children :<span style={{ fontWeight: 600,float:"right" }}>{val}</span>,
                  props:{
                    colSpan:2,
                  },
                }
          }
          else if(arrData[index].takeway===""  &&arrData[index].product01Entity!=="数量"){
            return renderContent(val, record,index);
            }else if(arrData[index].product01Entity.productattribute !== 1 ){
            
            return (
              <div>
                <InputNumber
                  onBlur={e => this.InputNumberBlur(e)}
                  onChange={e => this.handleFieldChange(e, 'transnum', record.key,chase)}
                />
               
                
              </div>
            );
          }
          },
          
      },{
        dataIndex:'tbatchon',
          key:'tbatchon',
          width: '5%',
          render:(val, record,index)=>{
            
            if(arrData[index].takeway!=="" && arrData[index].product01Entity.productattribute !==1){
              return(
                <Input
                  placeholder="缸号或批号"
                  onBlur={e => this.InputNumberBlur(e)}
                  onChange={e => this.handlechange(e, 'tbatchon', record.key)}
                  style={{ width: 100 }}
                />
              );
              

            }else{
              return renderContent(val, record,index);
            }
          },

      }],
      },
      {
        title: '胚纱(平台)',
        children:[{
        dataIndex: 'rawyarnnum',
        key: 'rawyarnnum',
        width: '5%',
        
        render: (val, record,index) => {
          if(arrData[index].product01Entity==="结款方式" || arrData[index]. product01Entity==="支付比例/拣货费计价"
          || arrData[index].product01Entity==="定金/拣货费"){
              return renderContent(val, record,index);
            }
        
          else if(arrData[index].product01Entity==="数量" ){
            return { 
              children :<span style={{ fontWeight: 600,float:"right" }}>{val}</span>,
                  props:{
                    colSpan:2,
                  },
                }
          }
          else if(arrData[index].takeway===""  &&arrData[index].product01Entity!=="数量"){
            return renderContent(val, record,index);
            }else if(arrData[index].product01Entity.productattribute===2 ){
            
            return (
              <div>
                <InputNumber
                  onBlur={e => this.InputNumberBlur(e)}
                  onChange={e => this.handleFieldChange(e, 'rawyarnnum', record.key,raw)}
                />
               
                
              </div>
            );
          }
          },
          
      },{
        dataIndex:'rawbatchno',
        key:'rawbatchno',
        width: '5%',
        render:(val, record,index)=>{
          
          if(arrData[index].takeway!=="" && arrData[index].product01Entity.productattribute===2){
            return(
              <Input
                placeholder="缸号或批号"
                onBlur={e => this.InputNumberBlur(e)}
                onChange={e => this.handlechange(e, 'rawbatchno', record.key)}
                style={{ width: 100 }}
              />
            );
            

          }else{
            return renderContent(val, record,index);
          }
        },

    }],
      },
      
      {
        title: '货期 ',
        dataIndex: 'deliverydate',
        key: 'deliverydate',
        width: '10%',
        render: (val, record,index) => {
          
          if(typeof(record.product01Entity)==="string"|| record.product01Entity.type === "div"){
            
            return renderContent(val, record,index);
          }else{
            return (
              <DatePicker defaultValue={moment(startTime,'YYYY-MM-DD')} onChange={(e,b)=>this.handleDatachange(e,b,'deliverydate',record.key)} styel={{width:70}} />)
            
          }
        },
      },
      {
        title: '备注/用途 ',
        dataIndex: 'comment',
        key: 'comment',
        width: '10%',
        render: (val, record,index) => {
          
          if(typeof(record.product01Entity)==="string"|| record.product01Entity.type === "div"){
            
            return renderContent(val, record,index);
          }else{
            return (
              <Input
                placeholder="备注"
                onBlur={e => this.InputNumberBlur(e)}
                onChange={e => this.handlechange(e, 'comment', record.key)}
              />)
            
          }
        },
      },
      
      
    ];

    return (
      <Fragment>
        <div className={styles.tableList}>
          <div style={{width:3000}}>
            <div   style={{overflowY: "auto",width:480,height:500,float:"left",display:"inline-block"}}> 
              <TableRight
                loading={this.state.loading}
                callbackParent={this.onChildChanged}
                total={this.state.total}
                productid={this.state.productid}
                dataSource={dataBatch}
            
                
              
              />
            </div>
            <div style={{width:2000,display:"inline-block"}}>
              <Table
                loading={this.state.loading}
                columns={columns}
                dataSource={arrData}
                pagination={false}

                onRow={(e) => ({
                  onClick: () => {
                    this.saveBatch(e);
                  },
                })}
                
              />
            </div>
            
          </div>
        </div>
      </Fragment>
    );
  }
}
