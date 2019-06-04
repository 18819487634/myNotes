import React, { PureComponent, Fragment } from 'react';
import { Table,InputNumber,Select,Input,DatePicker} from 'antd';

import styles from './InquiryProfile.less';

import TableRight from './TableRight';
import { queryGoodsBasic } from '../../services/api';


const {Option} = Select;
let arrData = [];
let defaultProductid="";
const own = "ownnum";
const chase = "transnum";
const spot = "spotnum";
const raw = "rawyarnnum";
const operateProducts = new Map();
const butes = ["","色纱","胚纱","代销色纱","代销胚纱"];



// const productData = new Map();

export default class TableLeft extends PureComponent {
  constructor(props) {
    super(props);
    defaultProductid="";
    this.state = {
      data: props.dataSource,
      dataRight:[],
     
      loading: false,
      flag:false,
      concatSoure:[{
        key:'concat1',
        id:'',
        product01Entity: '数量',
       
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        spotnum:"",
      },
      { 
        key:'concat2',
        id:'',
        product01Entity: '支付比例/拣货费计价',
       
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        spotnum:"",
      },
      {
        key:'concat3',
        id:'',
        product01Entity: '定金/拣货费',
      
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        spotnum:"",
      },{
        key:'concat4',
        id:'',
        product01Entity: '结款方式',
       
        takeway:"",
        ownnum:props.dataSource.paywayOwn,
        transnum:props.dataSource.paywayChase,
        rawyarnnum:props.dataSource.paywayChase,
        spotnum:props.dataSource.paywaySpot,
      },{
        key:'concat5',
        id:'',
        product01Entity: '货款',
       
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        spotnum:"",
      },{
        key:'concat6',
        id:'',
        product01Entity: '运费',
       
        takeway:"",
        ownnum:props.dataSource.shippayOwn,
        transnum:props.dataSource.shippayChase,
        rawyarnnum:props.dataSource.shippayChase,
        spotnum:props.dataSource.shippaySpot,
      },{
        key:'concat7',
        id:'',
        product01Entity: '保险',
       
        takeway:"",
        ownnum:props.dataSource.securepayOwn,
        transnum:props.dataSource.securepayChase,
        rawyarnnum:props.dataSource.securepayChase,
        spotnum:props.dataSource.securepaySpot,
      },{
        key:'concat8',
        id:'',
        product01Entity: '小计',
       
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        spotnum:"",
      },{
        key:'concat9',
        id:'',
        product01Entity: '合计',
       
        takeway:"",
        ownnum:"",
        transnum:"",
        rawyarnnum:"",
        spotnum:"",
      }],
    };
  }
  componentDidMount(){
    const data = arrData.concat(operateProducts);
    operateProducts.clear();
    this.props.onChange(data);
    
  }
  componentWillReceiveProps(nextProps) {
    operateProducts.clear();
    if(nextProps.value.length>0){
      const nextValue = nextProps.value;
      nextValue.splice(nextValue.length-1,1);
      this.setState({
        data: nextValue,
        
        
      });
    }else{
    this.setState({
      data: nextProps.dataSource,
      
      
    });
    
  }

 
  // this.setState({
  //   data: nextProps.dataSource,
    
    
  // });
  
}
componentWillUpdate(){
 
  const data = arrData.concat(operateProducts);
  this.props.onChange(data);
}
componentDidUpdate(prevProps, prevState) {
  const data = arrData.concat(operateProducts);
  this.props.onChange(data);
}
componentWillUnmount(prevProps, prevState) {
 
  const data = arrData.concat(operateProducts);
  this.props.onChange(data);
}

  

  onChildChanged= (newState)=> {
    if(newState.tag === true){
     
      operateProducts.set(newState[0].productid,newState);
     
    }else{
      operateProducts.delete(newState.id);
    }
    const newData = this.state.data.map(item => ({ ...item }));

    const goodsData = this.state.dataRight.map(item => ({ ...item }));
    goodsData.colorname = newState.colorname;
    goodsData.productname = newState.productname;
    const fieldName = "spotnum";
    let keys="";
    for(let i =0;i<goodsData.length;i++){ // set后会重新给tableRight渲染，值还是读取接口的值，重新赋值完成input的onchage的效果
      const productDatas = operateProducts.get(goodsData[i].productid);
      if(productDatas!==undefined){
        for(let j=0;j<productDatas.length;j++){
        
          if(goodsData[i].id === productDatas[j].id){
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
    
    this.setState({ data: newData,dataRight:goodsData },()=>{
      this.generalSum();
   
    });

    
  
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

    let ownnum = 0; // 欠货
    let transnum =0;// 代销
    let rawyarnnum =0;// 胚纱
    let spotnum =0;// 现货

    let Deownnum =0;
    let Detransnum=0;
    let Derawyarnnum =0;
    let Despotnum= 0;

    let Goodsownnum =0;
    let Goodsasenum=0;
    let Goodsrawyarnnum =0;
    let Goodspotnum= 0;

    let sumown = 0;
    let sumchase =0;
    let sumraw=0;
    let sumspot =0;
    
    let sum =0;
    
    newData1.forEach(item=>{

     
      // 计算数量
      ownnum += Number(item.ownnum===undefined?0:item.ownnum);
      transnum += Number(item.transnum===undefined?0:item.transnum);
      rawyarnnum += Number(item.rawyarnnum===undefined?0:item.rawyarnnum);
      spotnum += Number(item.spotnum===undefined?0:item.spotnum);
      

      // 计算定金
      Deownnum += Number(item.ownnum===undefined?0:item.ownnum) * Number(item.price===undefined?0:item.price) *(Number(newConcat[1].ownnum===""?0:newConcat[1].ownnum)/100);
      Detransnum += Number(item.transnum===undefined?0:item.transnum) * Number(item.price===undefined?0:item.price) *(Number(newConcat[1].transnum===""?0:newConcat[1].transnum)/100);
      Derawyarnnum += Number(item.rawyarnnum===undefined?0:item.rawyarnnum) * Number(item.price===undefined?0:item.price) *(Number(newConcat[1].rawyarnnum===""?0:newConcat[1].rawyarnnum)/100);
      Despotnum += (Number(item.spotnum===undefined?0:item.spotnum)/1000*(Number(newConcat[1].spotnum===""?0:newConcat[1].spotnum)));


      // 计算贷款

      Goodsownnum += Number(item.ownnum===undefined?0:item.ownnum) * Number(item.price===undefined?0:item.price);
      Goodsasenum += Number(item.transnum===undefined?0:item.transnum) * Number(item.price===undefined?0:item.price);
      Goodsrawyarnnum += Number(item.rawyarnnum===undefined?0:item.rawyarnnum) * Number(item.price===undefined?0:item.price);
      Goodspotnum += Number(item.spotnum===undefined?0:item.spotnum)* Number(item.price===undefined?0:item.price);

      // 计算小计
    
        
      sumown = Goodsownnum+  Number(newConcat[5].ownnum===undefined?0:newConcat[5].ownnum) +Number(newConcat[6].ownnum===undefined?0:newConcat[6].ownnum);
      sumchase = Goodsasenum +Number(newConcat[5].transnum===undefined?0:newConcat[5].transnum) +Number(newConcat[6].transnum===undefined?0:newConcat[6].transnum);
      sumraw = Goodsrawyarnnum +Number(newConcat[5].rawyarnnum===undefined?0:newConcat[5].rawyarnnum) +Number(newConcat[6].rawyarnnum===undefined?0:newConcat[6].rawyarnnum);
      sumspot =Goodspotnum+ Number(newConcat[5].spotnum===undefined?0:newConcat[5].spotnum) +Number(newConcat[6].spotnum===undefined?0:newConcat[6].spotnum);

      sum = sumown+sumchase+sumspot+sumraw;
       
    });
     // 再计算贷款(-定金)
    Goodsownnum  -=  Deownnum;
    Goodsasenum -=  Detransnum;
    Goodspotnum -= Despotnum;
    Goodsrawyarnnum -= Derawyarnnum;
    
    targetNum[own] = this.changeTwoDecimalf(ownnum);
    targetNum[chase] = this.changeTwoDecimalf(transnum);
    targetNum[raw] = this.changeTwoDecimalf(rawyarnnum);
    targetNum[spot] = this.changeTwoDecimalf(spotnum);

    targetDeposit[own] = this.changeTwoDecimalf(Deownnum);
    targetDeposit[chase] = this.changeTwoDecimalf(Detransnum);
    targetDeposit[raw] = this.changeTwoDecimalf(Derawyarnnum);
    targetDeposit[spot] = this.changeTwoDecimalf(Despotnum);


    targetGoods[own] = this.changeTwoDecimalf(Goodsownnum);
    targetGoods[chase] = this.changeTwoDecimalf(Goodsasenum);
    targetGoods[raw] = this.changeTwoDecimalf(Goodsrawyarnnum);
    targetGoods[spot] = this.changeTwoDecimalf(Goodspotnum);


    targetPlan[own] = this.changeTwoDecimalf(sumown);
    targetPlan[chase] = this.changeTwoDecimalf(sumchase);
    targetPlan[raw] = this.changeTwoDecimalf(sumraw);
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
      target[fieldName] = e;     
      this.setState({ data: newData },()=>{
        this.generalSum();
      });
      
     
    }
    
  }

  handlechange(e, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;     
      this.setState({ data: newData },()=>{
        this.generalSum();
      });
      
     
    }
    
  }

  handleDatachange(e,b, fieldName, key) {
    
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = b;     
      this.setState({ data: newData },()=>{
        this.generalSum();
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
    
    const result = this.state.data.concat(this.state.concatSoure,operateProducts);
    
    this.props.onChange(result);
  }

  ProportionBlur=()=>{
    this.generalSum();
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
    
    const result = this.state.data.concat(this.state.concatSoure,operateProducts);
    
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
      this.setState({ concatSoure: newData });
    }
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
    const result = this.state.data.concat(this.state.concatSoure,operateProducts);
    
    this.props.onChange(result);
    
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

  openBatch=(id,colorname,productname)=>{
    let arr =[];
    
    
      const param =`terms[0].value=${id}&terms[0].column=productid&terms[1].value=0&terms[1].column=status&terms[1].value=-1&terms[1].termType=in`;
      queryGoodsBasic(param).then((response)=>{
        if(response && response.status===200){
         arr =response.result.data
          // if(id==='1533697589676000005'){
            
          //   arr =Demodata;
          // }else{
          //   arr =Demodata1;
          // }
          for(let i =0;i< arr.length;i+=1){
            arr[i].key= `Goodsdetail${i}`;
            arr[i].output=0;
          
          }
          arr.colorname = colorname;
          arr.productname =productname;
          if(operateProducts.get(id)){
            const data = arr;
      
            const selectdata = operateProducts.get(id);
            
            for(let i = 0;i<data.length;i++){
              for(let j=0;j<selectdata.length;j++){
                  if(data[i].batchno === selectdata[j].batchno){
                    data[i].output = selectdata[j].output;
                  }
              }
            }
            this.setState({
              dataRight:data,
              
              
            })
          }
          
          this.setState({
            dataRight:arr,
            
            flag:true,
          }
          );      
        }
      }
    )

     
    
    

    
  }
  saveBatch=(e)=>{
    if(defaultProductid==="" || defaultProductid !== e.productid){
      defaultProductid = e.productid;
      if(e.productid !== undefined){
        this.openBatch(e.productid,e.product01Entity.colorname,e.product01Entity.productname);
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
    
    const result = this.state.data.concat(this.state.concatSoure,operateProducts);
    
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
        title: '产品信息',
        children:[{
          dataIndex:'product01Entity.picture',
          key:'picture',
          render:(val, record,index)=>{
            
            if(arrData[index].takeway!=="" ){
              return <img src={val} alt={val} width={100} height={35}  />
            }else{
              const obj = {
                children: val,
                props: {},
              };
              // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
              if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
                || index-5 === dataSource.length || index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length) {
                obj.props.colSpan = 0;
              }
              return obj;
            }
          },
        },
        
        {
          dataIndex:'product01Entity',
          key:'product01Entity',
          width:'20%',
          render:(val)=>{
            
            if( typeof(val)!=="string"){
              return (
                <div>
                  <li>
                    {`${val.productkind.kindname}${val.productseries.seriesname}`}
                  </li>
                  <li>
                    
                    <a onClick={e=>this.openBatch(e,`${val.id}`)}>{val.colorname}</a>
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
                    colSpan:7,
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
        width: '5%',
        render: renderContent,
      }, {
        title: '数量(KG)',
        dataIndex: 'num',
        key: 'num',
        width: '5%',
        render: renderContent,
      },
       {
        title: '用途 ',
        dataIndex: 'usefor',
        key: 'usefor',
        width: '10%',
        render: (text, record,index) => {
          
          if(typeof(record.product01Entity)==="string"){
            
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
              || index-5 === dataSource.length || index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length) {
              obj.props.colSpan = 0;
            }
            return obj;
          }else if(record.usefor===""){
            return (
              <Select  defaultValue={dataConcat[3].transnum} onChange={e => this.handleFieldChange(e, 'usefor', record.key)}>
                <Option value={0}>大货</Option>
                <Option value={1}>打样</Option>
                <Option value={2}>混色</Option>
                <Option value={3}>纯色</Option>
              </Select>)
            
          }else if(record.usefor!==""){
            return <span>{text}</span>
          }
        },
      },
      {
        title: '货期 ',
        dataIndex: 'deliverydate',
        key: 'deliverydate',
        width: '5%',
        render: (text, record,index) => {
          
          if(typeof(record.product01Entity)==="string"){
            
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
              || index-5 === dataSource.length || index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length) {
              obj.props.colSpan = 0;
            }
            return obj;
          }else if(record.deliverydate===""){
            return (
              <DatePicker onChange={(e,b)=>this.handleDatachange(e,b,'deliverydate',record.key)} />)
            
          }else if(record.deliverydate!==""){
            return <span>{text}</span>
          }
        },
      },
      {
        title: '备注 ',
        dataIndex: 'comment',
        key: 'comment',
        width: '10%',
        render: (text, record,index) => {
          
          if(typeof(record.product01Entity)==="string"){
            
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
              || index-5 === dataSource.length || index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length) {
              obj.props.colSpan = 0;
            }
            return obj;
          }else if(record.comment===""){
            return (
              <Input
                placeholder="备注"
                onBlur={e => this.InputNumberBlur(e)}
                onChange={e => this.handlechange(e, 'comment', record.key)}
              />)
            
          }else if(record.comment!==""){
            return <span>{text}</span>
          }
        },
      },
      // {
      //   title: '库存',
      //   dataIndex: 'takeway',
      //   key: 'takeways',
      //   width: '5%',
      //   render: renderContent,
      // 1 色纱 2胚纱 3 代销色纱 4 代销胚纱
      // },
      {
        title: '欠货(下染)',
        children:[{
        dataIndex: 'ownnum',
        key: 'ownnum',
        width: '10%',
        editable:false,
        render: (text, record,index) => {
          if(arrData[index].product01Entity==="结款方式"){
            return { 
              children:
  <Select  defaultValue={dataConcat[3].ownnum} onChange={e => this.handlSelectChange(e, 'ownnum', record.key)}>
    <Option value={0}>全款</Option>
    <Option value={1}>月结</Option>
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
                colSpan:2,
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
                colSpan:2,
              },
            }
          }
        
          else if(arrData[index].takeway===""){return { 
            children :<span style={{ fontWeight: 600,float:"right" }}>{text}</span>,
                props:{
                  colSpan:2,
                },
              }}else if(arrData[index].product01Entity.productattribute ===1){
            
            return (
              <div>
                <InputNumber
                  onBlur={e => this.InputNumberBlur(e)}
                  onChange={e => this.handleFieldChange(e, 'ownnum', record.key)}
                />
               
                
              </div>
            );
          }
          },
          
      },{
        dataIndex:'chasebatchno',
          key:'chasebatchno',
          width: '10%',
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
              const obj = {
                children: val,
                props: {},
              };
              // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
              if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
                || index-5 === dataSource.length || index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length) {
                obj.props.colSpan = 0;
              }
              return obj;
            }
          },

      }],
    },
      {
        title: '代销(平台)',
        children:[{
        dataIndex: 'transnum',
        key: 'transnum',
        width: '10%',
        editable:false,
        render: (text, record,index) => {
          if(arrData[index].product01Entity==="结款方式"){
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
              || index-5 === dataSource.length || index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length) {
              obj.props.colSpan = 0;
            }
            return obj;
          }
          else if(arrData[index]. product01Entity==="支付比例/拣货费计价"){
            return {
              children:<InputNumber
                value={record.transnum}
                min={0.0}
                max={100}
                onBlur={e => this.ProportionBlur(e)}
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
                onChange={e => this.handleInputNumberChange(e, 'transnum', "concat2")} 
              />,
              props:{
                colSpan:2,
              },
            }
          }
          else if(arrData[index].product01Entity==="定金/拣货费"  ){
            return {
              children:<InputNumber
                min={0.0} 
                value={record.transnum}
                onChange={e => this.handleConcatChange(e, 'transnum', "concat3")}  
              />,
              props:{
                colSpan:2,
              },
            }
          }
        
          else if(arrData[index].takeway===""){return { 
            children :<span style={{ fontWeight: 600,float:"right" }}>{text}</span>,
                props:{
                  colSpan:2,
                },
              }}else if(arrData[index].product01Entity.productattribute !== 1 ){
            
            return (
              <div>
                <InputNumber
                  onBlur={e => this.InputNumberBlur(e)}
                  onChange={e => this.handleFieldChange(e, 'transnum', record.key)}
                />
               
                
              </div>
            );
          }
          },
          
      },{
        dataIndex:'tbatchon',
          key:'tbatchon',
          width: '10%',
          render:(val, record,index)=>{
            
            if(arrData[index].takeway!=="" && arrData[index].product01Entity.productattribute !==1){
              return(
                <Input
                  placeholder="缸号或批号"
                  onBlur={e => this.InputNumberBlur(e)}
                  onChange={e => this.handlechange(e, 'tbatchon', record.key)}
                  styel={{width:100}}
                />
              );
              

            }else{
              const obj = {
                children: val,
                props: {},
              };
              // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
              if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
                || index-5 === dataSource.length || index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length) {
                obj.props.colSpan = 0;
              }
              return obj;
            }
          },

      }],
      },
      {
        title: '胚纱(平台)',
        children:[{
        dataIndex: 'rawyarnnum',
        key: 'rawyarnnum',
        width: '10%',
        editable:false,
        render: (text, record,index) => {
          if(arrData[index].product01Entity==="结款方式"  ){
            const obj = {
              children: text,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
              || index-5 === dataSource.length || index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length) {
              obj.props.colSpan = 0;
            }
            return obj;
          }
          else if(arrData[index]. product01Entity==="支付比例/拣货费计价"){
            return {
              children:<InputNumber
                value={record.rawyarnnum}
                min={0.0}
                max={100}
                onBlur={e => this.ProportionBlur(e)}
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
                onChange={e => this.handleInputNumberChange(e, 'rawyarnnum', "concat2")} 
              />,
              props:{
                colSpan:2,
              },
            }
          }
          else if(arrData[index].product01Entity==="定金/拣货费"  ){
            return {
              children:<InputNumber
                min={0.0} 
                value={record.rawyarnnum}
                onChange={e => this.handleConcatChange(e, 'rawyarnnum', "concat3")}  
              />,
              props:{
                colSpan:2,
              },
            }
          }
        
          else if(arrData[index].takeway===""){return { 
            children :<span style={{ fontWeight: 600,float:"right" }}>{text}</span>,
                props:{
                  colSpan:2,
                },
              }}else if(arrData[index].product01Entity.productattribute===2 ){
            
            return (
              <div>
                <InputNumber
                  onBlur={e => this.InputNumberBlur(e)}
                  onChange={e => this.handleFieldChange(e, 'rawyarnnum', record.key)}
                />
               
                
              </div>
            );
          }
          },
          
      },{
        dataIndex:'rawbatchno',
        key:'rawbatchno',
        width: '10%',
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
            const obj = {
              children: val,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
            if (index === dataSource.length || index-1 === dataSource.length || index-2=== dataSource.length || index-3 === dataSource.length || index-4 === dataSource.length
              || index-5 === dataSource.length || index-6 === dataSource.length|| index-7 === dataSource.length|| index-8 === dataSource.length) {
              obj.props.colSpan = 0;
            }
            return obj;
          }
        },

    }],
      },
      {
        title: '现货',
        dataIndex: 'spotnum',
        key: 'spotnum',
        width: '5%',
        editable:false,
        render: (text, record,index) => {
           if(arrData[index].product01Entity==="结款方式"){
            return ( 
              <Select  defaultValue={dataConcat[3].spotnum} onChange={e => this.handlSelectChange(e, 'spotnum', record.key)}>
                <Option value={0}>全款</Option>
                <Option value={1}>月结</Option>
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
      
      
    ];

    return (
      <Fragment>
        <div className={styles.tableList}>
          <div style={{width:2000}}>
            <div style={{width:1500,float:"left"}}>
              <Table
                loading={this.state.loading}
                columns={columns}
                dataSource={arrData}
                pagination={false}
                rowKey={record => record.key}
                onRow={(e) => ({
                  onClick: () => {
                    this.saveBatch(e);
                  },
                })}
                
                id="tableLeft" 
                
              />
            </div>
            <div className={this.state.flag?styles.tableBatchShow:styles.tableBatchNone}  style={{overflowY: "auto",width:360,float:"right",height:50}}> 
              <TableRight
                loading={this.state.loading}
                callbackParent={this.onChildChanged}
                
                dataSource={dataBatch}
                pagination={false}
                
              
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
