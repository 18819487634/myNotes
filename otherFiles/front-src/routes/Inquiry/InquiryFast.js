import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import {
  
  Card,
  Form,
  message,
 

  Button,
  Select,

  Modal,
  Icon,
 

} from 'antd';
import FooterToolbar from 'components/FooterToolbar';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';


import { queryErpClient,queryColorProduct, tempsaveInquiry, addErpClient, querysupplydictionry, queryPickuptmpdetail, queryGoodsBasic, queryGoods, queryProductids, queryPresaleById, addPickUp, updatePickuptmpdetail, queryProvince, inquery2presale, addpaydetail, queryDeliveryWay } from '../../services/api';
import { getSupplyId } from '../../utils/sessionStorage';

import styles from './InquiryProfile.less';
import TableFastLeft from './TableFastLeft';

import { termsIn, ArrayRepeat, searchProvice } from '../../utils/utils';
import FastTableTop from './FastTableTop';
import Forms from '../Customer/Forms';
import SplitsPickUpTable from './SplitsPickUpTable';
import SplitTableTop from './SplitTableTop';





const {Option} = Select;
let testvalue = "";



let dataTop = [{key:'a1'}];
let dataLeft = [];
let spotnum =0;// 现货拣货费


const CreatForm =  Form.create()(props => {
  const { modalVisible,CancelModalVisible,form,handleAdd} = props;
  const {validateFieldsAndScroll} = form;
  

  
  const titlename="新增客户";



  
  const okHandle =() =>{
   validateFieldsAndScroll((error) => {
     
      if(error){
        return;
      }
        const params = this.formRef.getItemsValue();
        
        if(params.id === ""){
          delete params.id;
        }
      
          const adressArr = params.adress;
        params.saleids = `${params.saleids}`;
        params.directorid = `${params.directorid}`;
        const acceptadressArr = params.acceptadress;
        params.adress = `${adressArr[0]}${adressArr[1]}${adressArr[2]}${params.adressdetails}`;
        params.shippingaddress =`${acceptadressArr[0]}${acceptadressArr[1]}${acceptadressArr[2]}${params.acceptadressdetails}`;
        const contactData = params.table;
        params.issupply =0;
        params.supplyid = getSupplyId();
        const cData =[];
        for(let i=0;i<contactData.length;i++){
          if(contactData[i].contact !== undefined){
            if(contactData[i].id === ""){
              delete  contactData[i].id;
            }
            cData.push(contactData[i]);
          }
        }
        params.contacts = cData;
        handleAdd(params);
        
    });
  }
  const updateRows ={};
  return (
    <Modal
      title={titlename}
      width='68%'
      visible={modalVisible}
      onOk={okHandle}
      maskClosable={false}
      onCancel={() => CancelModalVisible()}
    >
      <Forms eventsOption={updateRows} wrappedComponentRef={(forms) => this.formRef= forms} />
      
    </Modal>);
});

const PickupForm=Form.create()(props => {
  const { modalVisible,CancelPickupModalVisible,form,pickupTmp,handlonsubmit} = props;
  const {validateFieldsAndScroll,getFieldDecorator} = form;
  
  const okHandle =() =>{
    validateFieldsAndScroll((error, values) => {
      handlonsubmit(values);
         
     });
   }
  return (
    <Modal
      title="快速拆分拣货单"
      width='68%'
      visible={modalVisible}
      onOk={okHandle}
      maskClosable={false}
      okText="生成拣货单"
      onCancel={() => CancelPickupModalVisible()}
    >
      <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
        <div >
          {getFieldDecorator('tableTop', {
                  
                    },)(<SplitTableTop dataSource={pickupTmp.dataTop} />)}
        </div>
        <div >
          {getFieldDecorator('splitspickuptable', {
                  
                    },)(<SplitsPickUpTable dataSource={pickupTmp.pickupData} />)}
        </div>
        
      </Form>  
      
      
    </Modal>);
});    
const areaMap = new Map();
  @connect(({ inquiry, loading }) => ({
    inquiry,
    loading: loading.models.inquiry,
  }))
  @Form.create()
  export default class InquiryFast extends PureComponent {
    state ={
     
      modalVisible:false,
      
      showStatus:false,
      dataLeft:[],
      children:[],
      customers:[],
      pickupVisible:false,
      pickupTmp:{
        dataTop:[{"key":"d1"}],
        pickupData:[{"key":"p1"}],
      },
      dataTops:[{key:"a1"}],
    }
    
    componentDidMount(){
      const supplyids = [getSupplyId()];
      const param =`paging=false&terms[0].value=${supplyids}&terms[0].column=supplyid&terms[1].value=0&terms[1].column=issupply`;
      queryErpClient(param).then((response)=>{// 加载客户信息
        if(response && response.status===200){
          const custarr= [];
          const list = response.result.data;
           
            for(let i=0;i<list.length;i++){
              custarr.push(<Option key={i} value={list[i].id}>{`${list[i].name}`}</Option>);
            }
            const params = `terms[0].value=6&terms[0].value=3&terms[0].value=4&terms[0].value=5&terms[0].termType=in&terms[0].column=type&terms[1].value=1&terms[1].column=isact`;
            querysupplydictionry(params).then(res=>{
              if(res && res.status===200){
                const dictionryData = res.result.data;
                let totalweight =null;
                let totalquantity = null;
                let deviation = null;
                dictionryData.forEach(item=>{
                  if(item.type===3){
                    areaMap.set(item.value,item.key);
                  }else if(item.type===4){
                    totalquantity = parseFloat(item.value);
                  }else if(item.type === 5){
                    totalweight = parseFloat(item.value);
                  }else if(item.type === 6){
                    deviation = parseFloat(item.value);
                  }
                });
                
                this.setState({
                  totalquantity,
                  totalweight,
                  customers:custarr,
                  deviation,
                })
              }
            });
            
            // companyDetail({id:getSupplyId()}).then((responses)=>{// 
            //   if(responses &&responses.status === 200){
            //    companys = responses.result.company;
            //    const params =`terms[0].column=username&pageIndex=0&pageSize=10&terms[0].termType=like&terms[0].value=${companys}%25`;
            //    const childarr = [];
            //    queryCompanyUser(params).then((res)=>{
            //       if(res.status ===200){
            //         const lists = res.result.data;
            //         for(let s=0;s<lists.length;s++){
            //           if(lists[s].username !== undefined){
            //            // childarr.push(<Option key={s} value={lists[s].username}>{list[s].username}</Option>);
            //           }
                      
            //         }
            //         this.setState({
            //           children:childarr,
            //           customers:custarr,
            //         })
            //       }
            //    })
            //   }
            // })

          }
        })
    }
    
    
    
    onEdit = (targetKey, action) => {
      this[action](targetKey);
      
    }
    tempsave=(error,values)=>{
        const summaryData = [];
       const detailData = [];
       let parmasData ={};
 
      const dataleft = values.tableLeft;
      // const pretarmap = values.tableLeft[values.tableLeft.length-1];
      dataleft.splice(dataleft.length-1, 1);
     
      for(let e =0;e<dataleft.length;e++){
         if(dataleft[e].key.indexOf("concat")===-1){
           detailData.push(dataleft[e]); 
           
         }else{
           summaryData.push(dataleft[e]);
         }
         
      }
      const tableTops = values.tableTop;
      parmasData = tableTops[0];
      parmasData.usrid = this.state.userid;
      parmasData.comment = tableTops[1].comment;
      parmasData.address = tableTops[2].address;
      parmasData.id = values.usrid;
      parmasData.inquiryDetail01Entities = detailData;
  
      tempsaveInquiry(parmasData).then(res=>{
        if(res && res.status ===200){
          message.success("保存成功！");
        }
      })

    }
    validate = (e,tag) => {
      const {validateFieldsAndScroll} =this.props.form;
      message.config({
        top: 100,
      });
      const hide = message.loading(`正在提交...`, 0);
      validateFieldsAndScroll((error, values) => {
      
      if(tag === 2){
        this.tempsave(error,values);
      }else {
       const pickupdata = [];
       const summaryData = [];
       const detailData = [];
       const Inquiry2Presale ={
        inquiry:{},
        pickup:{
          details:[],
        },
       };
      
      
      if(values.tableLeft === undefined){
        message.error("请编辑询价单后再提交");
        setTimeout(hide,100);
        return;
      }
      if(values.tableTop === undefined){
       const  concatData=
        [{
          key:'comment1',
          usrid:this.state.dataTops[0].comment},
        {
          key:'address1',
          usrid:this.state.dataTops[0].address,
          provice:this.state.dataTops[0].provice,
          shipreceiver:this.state.dataTops[0].shipreceiver,
          shipphone:this.state.dataTops[0].shipphone,
          provicelabel:this.state.dataTops[0].provicelabel,
        }];

        values.tableTop = this.state.dataTops.concat(concatData);
      }
      
      const productidset = new Set();
      const datalefts = values.tableLeft;
      const pretarmap = values.tableLeft[values.tableLeft.length-1];
      const dataleft = [];
      for(let i=0;i<datalefts.length;i+=1){
        if(i !== datalefts.length-1){
          dataleft.push(datalefts[i]);
        }
      }
      // dataleft.splice(dataleft.length-1, 1); 
     
      for(let s =0;s<dataleft.length;s++){
         if(dataleft[s].key.indexOf("concat")===-1){
           detailData.push(dataleft[s]); 
           
         }else{
           summaryData.push(dataleft[s]);
         }
         
      }
      
      
      if(pretarmap &&pretarmap.size!==0){  
                  
        if(pretarmap.id !== undefined){
          message.error("请重新勾选库存");
          setTimeout(hide,100);
          return;
        }
        const nocompletes = [];// 没有整件数的   
       for (const item of pretarmap.keys()) {
         
         const pickarr = pretarmap.get(item).map(items => ({ ...items }));
         pickarr.forEach(it=>{
           const demo={
             picknum:it.output,
             goodentryids:it.id,
             batchno:it.batchno,
             productid:it.productid,
             area:it.area,
             piece:it.piece,
             completestatus:it.completestatus,
             batchnostatus:it.batchnostatus,
           }
           if(it.completestatus === 0){
            nocompletes.push(it);
           }
           pickupdata.push(demo);
           productidset.add(it.productid);
         })
         
       }
       
      for(let c =0;c<nocompletes.length;c+=1){
        for(let p =0;p<pickupdata.length;p++){
        if(pickupdata[p].productid === nocompletes[c].productid && pickupdata[p].batchno === nocompletes[c].batchno){
            pickupdata[p].completestatus =0;
          }
        }
      }
    }

      if(dataleft.chagePriceFlag === false || dataleft.chagePriceFlag === undefined){
        Inquiry2Presale.ischangeprice =0;
     
       }else{
        Inquiry2Presale.ischangeprice =1;
       }
       this.submitHadl(values,summaryData,Inquiry2Presale,detailData,pickupdata,hide,dataleft);
       
    }
       
      });
    };


    submitHadl=(values,summaryData,Inquiry2Presale,detailData,pickupdata,hide,dataleft)=>{// submit（form的值，左边列表的拣货费等明细，传入接口的值，左边产品明细，右边拣货明细，hide是读取效果）
            const Inquiry2Presales = Inquiry2Presale;
            const tableheard = values.tableTop[2];
            let ownnums = 0;// 总欠货数量
            let transnums = 0;// 总胚纱数量
            let rawyarnnums = 0;// 总代销数量
            let prenums = 0;// 总预订货数量
            const inquiry = {
              usrid:this.state.userid,
             clientsupplyid:this.state.userid, // 线下客户可不填
              paystatus:values.tableTop[0].paystatus,
              contenttype:values.tableTop[0].contenttype,
              isauto:1,
              address: values.tableTop[2].usrid,
              comment:values.tableTop[1].usrid,
              takeway:values.tableTop[0].takeway,
              payway:values.tableTop[0].payway,
              ismerge:values.tableTop[0].recordstatus,
              // taxratespot:dataleft[dataleft.length-1].taxrate,
              // taxrateagent:dataleft[dataleft.length-1].taxrate,
              // taxrateown:dataleft[dataleft.length-1].taxrate,
              // taxratepre:dataleft[dataleft.length-1].taxrate,
              taxstatus:dataleft[dataleft.length-1].taxstatus?1:0,
              codeP:values.tableTop[2].provice[0],
              codeC:values.tableTop[2].provice[1],
              codeA:values.tableTop[2].provice[2],
              shipreceiver:values.tableTop[2].shipreceiver,
              shipphone:values.tableTop[2].shipphone,
            };
            if(tableheard.provicelabel.length === 3){
              inquiry.address = `${tableheard.provicelabel[0]}${tableheard.provicelabel[1]}${tableheard.provicelabel[2]}${values.tableTop[2].usrid}`;
            }else{
              inquiry.address = `${tableheard.provicelabel[0]}${tableheard.provicelabel[1]}${values.tableTop[2].usrid}`;
            }          
              summaryData.forEach(item=>{
                if(item.key === "concat1"){// 数量
                  ownnums =item.ownnum;
                  transnums = item.transnum;
                  rawyarnnums = item.rawyarnnum;
                  prenums = item.prenum;
                }
                if(item.key==="concat5"){// 货款
                  inquiry.goodpayOwn = item.ownnum;
                  inquiry.goodpayAgent = item.transnum;
                  inquiry.goodpayYarn = item.rawyarnnum;
                  inquiry.goodpaySpot = item.spotnum;
                  inquiry.pregoodpay = item.prereceivenum;
                }else 
                if(item.key === "concat6"){// 运费
                  inquiry.shippayOwn = ownnums==="0.00"?0:item.ownnum;
                  inquiry.shippayAgent = transnums==="0.00"?0:item.transnum;
                  inquiry.shippayYarn = rawyarnnums==="0.00"?0:item.rawyarnnum;
                  inquiry.shippaySpot = item.spotnum;
                  inquiry.preshippay= item.prereceivenum;
                }else 
                if(item.key === "concat7"){// 保险
                  inquiry.securepayOwn = ownnums==="0.00"?0:item.ownnum;
                  inquiry.securepayAgent = transnums==="0.00"?0:item.transnum;
                  inquiry.securepayYarn =rawyarnnums==="0.00"?0:item.rawyarnnum;
                  inquiry.securepaySpot = item.spotnum;
                  inquiry.presecurepay=item.prereceivenum;
                }else 
                if(item.key === "concat4"){// 结款方式s
                  inquiry.paywayOwn = item.ownnum; 
                  
                  inquiry.paywaySpot = item.spotnum;

                }else
                if(item.key === "concat3"){// 定金/拣货费
                  inquiry.pickpayOwn = ownnums==="0.00"?0:parseFloat(item.ownnum);
                  inquiry.ownpay = parseFloat(item.spotnum===""?0:item.spotnum);
                  inquiry.pickpayAgent =transnums==="0.00"?0:parseFloat(item.ownnum);
                  inquiry.pickpayYarn =rawyarnnums==="0.00"?0:parseFloat(item.ownnum);
                  inquiry.pickpaySpot = parseFloat(item.spotnum===""?0:item.spotnum);
                  spotnum = parseFloat(item.spotnum===""?0:item.spotnum);
                }
                else if(item.key === "concat2"){// 付款比例
                  inquiry.paypercentOwn = ownnums==="0.00"?0:item.ownnum;
                  inquiry.paypercentAgent = transnums==="0.00"?0:item.ownnum;
                  inquiry.paypercentYarn =rawyarnnums==="0.00"?0: item.ownnum;
                  inquiry.paypercentSpot = item.spotnum;

                }
                else if(item.key === "concat10"){// 发票 状态为1才给赋值税点
                  if(inquiry.taxstatus===1){
                    inquiry.taxrateown = ownnums==="0.00"?0: parseFloat(dataleft[dataleft.length-1].taxrate);
                    if(transnums!=="0.00" || rawyarnnums!=="0.00" ){
                      inquiry.taxrateagent =  parseFloat(dataleft[dataleft.length-1].taxrate);
                    }
                   
                    inquiry.taxratepre = prenums==="0.00"?0: parseFloat(dataleft[dataleft.length-1].taxrate);
                    inquiry.taxratespot = parseFloat(dataleft[dataleft.length-1].taxrate);
                  }
                 

                }
                
              });
                      
                      inquiry.paywaySpot= inquiry.paywaySpot===undefined?0: inquiry.paywaySpot;
                      
                      const forMatDetail = [];
                      
                      

                      let demo ={};
                      let sumweight=0;
                      detailData.forEach(dItem=>{
                          demo={
                          
                          productid:dItem.productid,
                          num:dItem.num,
                          colorname:dItem.product01Entity.colorname,
                          price:dItem.price,
                          usefor:dItem.usefor,
                          deliverydate:dItem.deliverydate,
                          comment:dItem.comment,
                          spotnum:dItem.spotnum===undefined?0:parseFloat(dItem.spotnum),
                          
                          // completestatus:dItem.completestatus,
                          prenum:dItem.prereceivenum===undefined?0:dItem.prereceivenum,
                         
                          }
                          sumweight += dItem.spotnum===undefined?0:parseFloat(dItem.spotnum);
                          if(dItem.product01Entity.productattribute ===1){ // 色纱
                            if(dItem.chasebatchno === undefined){
                              demo.ownnum = dItem.ownnum===undefined?0:dItem.ownnum;
                              
                            }else{
                              
                                demo.ownnum=dItem.ownnum===undefined?0:dItem.ownnum;
                               
                                demo.batchno=dItem.chasebatchno === undefined?"":dItem.chasebatchno;
                          
                          }
                        }else if(dItem.product01Entity.productattribute === 2){ // 胚纱
                          if(dItem.transnum === undefined && dItem.rawbatchno === undefined){// 胚纱平台，没有批次
                            demo.ownnum = dItem.ownnum===undefined?0:dItem.ownnum;
                            
                            
                          }else if(dItem.transnum === undefined && dItem.rawbatchno !== undefined){// 胚纱平台，有批次
                            demo.rawyarnnum=dItem.rawyarnnum===undefined?0:dItem.rawyarnnum;
                               
                            demo.batchno=dItem.rawbatchno === undefined?"":dItem.rawbatchno;
                            
                          }else if(dItem.transnum !== undefined && dItem.tbatchon === undefined){// 胚纱代销，没有批次
                            demo.ownnum = dItem.transnum===undefined?0:dItem.transnum;
                          }else if(dItem.transnum !==undefined && dItem.tbatchon !== undefined){// 胚纱代销，有批次
                            demo.transnum=dItem.transnum===undefined?0:dItem.transnum;
                               
                            demo.batchno=dItem.tbatchon === undefined?"":dItem.tbatchon;
                          }
                        }else if(dItem.product01Entity.productattribute !== 2 && dItem.product01Entity.productattribute !== 1){ // 其他代销
                          if(dItem.tbatchon === undefined){
                            demo.ownnum = dItem.transnum===undefined?0:dItem.transnum;
                            
                            
                          }else {
                            demo.transnum=dItem.transnum===undefined?0:dItem.transnum;
                               
                            demo.batchno=dItem.tbatchon === undefined?"":dItem.tbatchon;
                            
                          }
                        }
                          
                          forMatDetail.push(demo);
                          for(let a =0;a<pickupdata.length;a+=1){
                            if(dItem.productid === pickupdata[a].productid){
                              pickupdata[a].comment = dItem.comment;
                              
                            } 
                          }
                      })
                      inquiry.inquiryDetail01Entities = forMatDetail;
                      let actnums = 0;
                      for(let i=0;i<forMatDetail.length;i+=1){// 检验数量符合询价数量；
                       const valilownum = forMatDetail[i].ownnum===undefined?0:forMatDetail[i].ownnum;
                       const valiltransnum = forMatDetail[i].rawyarnnum===undefined?0:forMatDetail[i].rawyarnnum;
                       const valilrawyarnnum = forMatDetail[i].rawyarnnum===undefined?0:forMatDetail[i].rawyarnnum;
                       let quicknums = forMatDetail[i].num;
                       if(this.state.deviation){
                        quicknums -= this.state.deviation;
                       }
                       const nums =  forMatDetail[i].spotnum+forMatDetail[i].prenum+valilownum+valiltransnum+valilrawyarnnum;
                        if(quicknums>nums){
                          message.warning(`色号${forMatDetail[i].colorname}下单数量小于询价数量`);
                          setTimeout(hide,100);
                          return;

                        }
                        if(forMatDetail[i].spotnum >0){
                          actnums +=1;// 有现货的产品个数
                        }
                      }
                  
                  Inquiry2Presales.inquiry =inquiry;
                  Inquiry2Presales.pickup.details =pickupdata;
                  setTimeout(hide,100);
                  this.props.dispatch({
                    type: 'inquiry/submitQuickInuqiry',
                    payload: Inquiry2Presales,
                    callback:(response)=>{
                      if(response && response.status === 200){
                        const presaleids = response.result.presaleid;
                        if(this.state.totalquantity || this.state.totalweight){
                          if(sumweight >0 && (this.state.totalquantity <actnums || this.state.totalweight < sumweight)  ){
                            
                            message.success("提交成功!总数量与总重量超过标准值,请拆单",3);
                            
                            this.splitorder(response.result.presaleid);
                            
                          }else{
                            if(sumweight>0 && spotnum === 0){
                              const params = {
                                id:presaleids,
                                clientid:this.state.userid,
                              };
                              this.payeDetail(params);
                            }else{
                              message.success("提交成功！");
                            this.props.dispatch(routerRedux.push(`/order/newnopayment`));
                            }
                            this.props.dispatch(routerRedux.push(`/order/newnopayment`));
                            
                          }
                        }
                        
                        
                        
                      }else if(response && (response.status === 400 || response.status === 500)){
                        message.error(`${response.message}`);
                        setTimeout(hide,100);
                      }
                      setTimeout(hide,100);
                    },
                })
    }

    payeDetail = (parmas)=>{
      const  payload= {
        presaleid:parmas.id,
        clientid:parmas.clientids,
        // clientsupplyid:record,
        supplyid:getSupplyId(),
        contenttype:1,
        amount:0,
        paytype:0,
        comment:'',
        validstatus:1,
      };
       addpaydetail(payload).then((response)=>{
        if(response && response.status===200){
          message.success("提交成功！");
          this.props.dispatch(routerRedux.push(`/order/newnopayment`));  
        }
      });
    }
    handlonsubmit=(values)=>{ // 拆单提交
      const params = values;
      message.config({
        top: 100,
      });
      const hide = message.loading(`正在提交...`, 0);
      if(params.splitspickuptable === undefined){
        message.error("请选择需要拆单的缸号");
        setTimeout(hide,100);
        return;
      }
      const splitData = params.splitspickuptable;
      const topData = params.tableTop;
      const splictParmas ={
        status:topData[0].ismerge,
        clientid:topData[0].clientid,
        comment:topData[0].comment,
        area:topData[0].area,
        presaleid:topData[0].id,
        supplyid:getSupplyId(),
      }
    

      const areas =[];
     
      const details =[];
      for(let i =0;i<splitData.length;i+=1){
        if(splitData[i].status===1){
          const vail = {
            productid:splitData[i].productid,
            area:splitData[i].area,
            picknum:splitData[i].output,
            originalpicknum:splitData[i].picknum,
            piece:splitData[i].outpiece,
            originalpiece:splitData[i].piece,
            batchno:splitData[i].batchno,
            ids:splitData[i].id,
            completestatus:splitData[i].completestatus,
            locations:splitData[i].locations,
            goodentryids:splitData[i].goodentryid,
            supplyid:getSupplyId(),
          }
          if(areas.indexOf(splitData[i].area) ===-1 ){
            areas.push(splitData[i].area);
          }
          details.push(vail);
        }
        
      }
      if(areas.length === 0 || areas.length >1){
        message.warning("勾选的缸号必须得同区域");
        setTimeout(hide,100);
        return;
      }else{
        const areaVail = areas[0];
        splictParmas.area = areaVail;
      }
      if(details.length ===0){
        message.error("请选择需要拆单的缸号");
        setTimeout(hide,100);
        return;
      }
      splictParmas.details = details;
      addPickUp(splictParmas).then(dres=>{
        if(dres && dres.status === 200){
          setTimeout(hide,100);
          const tmpList =[];
          for(let i =0;i<details.length;i+=1){
            const vail ={ id:details[i].ids};
            if(details[i].completestatus ===1 ){
              
              vail.picknum=parseFloat(details[i].originalpicknum) -parseFloat(details[i].picknum);
              vail.piece =parseFloat(details[i].originalpiece) -parseFloat(details[i].piece);
              
            }else{
              
               vail.picknum=parseFloat(details[i].originalpicknum) -parseFloat(details[i].picknum);
              
            }
           
            
            tmpList.push(vail);
          }
          updatePickuptmpdetail(tmpList).then(uVail=>{
            if(uVail && uVail.status ===200){

                message.success("提交成功");
                
                this.splitorder(topData[0].id);
              
              
            }
          })
        }

      })
     
      
    }

    splitorder =(presaleid)=>{
      message.config({
        top: 100,
      });
      const hide = message.loading(`正在读取...`, 0);
      const params = `terms[0].value=${presaleid}&terms[0].column=presaleid`;
      queryPickuptmpdetail(params).then(res=>{
        if(res && res.status ===200){
          const tmpDatas = res.result.data;
          const tmpData = [];
          if(tmpDatas.length===0){
            setTimeout(hide,100);
            message.warning("此单不需要拆单");
            this.props.dispatch(routerRedux.push(`/order/newnopayment`));
            return;
          }
          const productidList =[];
          const batchnoNo = [];
          tmpDatas.forEach(item=>{
            if(item.completestatus ===1 && item.piece !==0){
              // 有整件数的
              
              productidList.push(item.productid);
              batchnoNo.push(item.batchno);
              tmpData.push(item);
              
            }
            if( item.completestatus ===0 &&item.picknum !==0){
              // 没有整件数的
              productidList.push(item.productid);
              batchnoNo.push(item.batchno);
              tmpData.push(item);
            }
            

          });
          let terms = "";
          if(tmpData.length===0){
            setTimeout(hide,100);
            message.warning("此单已经拆单完成");
            if(spotnum ===0){
              const paramss = {
                id:presaleid,
                clientid:this.state.userid,
              };
              this.payeDetail(paramss);
            }else{
              this.setState({ pickupVisible:false});
              this.props.dispatch(routerRedux.push(`/order/newnopayment`));
              return;
            }
            
           
          }
          
          batchnoNo.forEach(item=>{
             terms += `terms[0].value=${item}&`;
          })
          terms+=`terms[0].termType=in&terms[0].column=batchno&paging=false`;
          queryGoodsBasic(terms).then(gres=>{
            if(gres && gres.status===200){
              const goodsData = gres.result.data;
              const goodsMap = new Map();
              let goodterms = "terms[0].column=id&";
              for(let g =0;g<goodsData.length;g+=1){
                if(productidList.indexOf(goodsData[g].productid >-1)){
                  goodsMap.set(goodsData[g].id,goodsData[g]); 
                  goodterms += `terms[0].value=${goodsData[g].goodid}&`;  
                }
                
               
              }
              goodterms += "terms[0].termType=in";
          queryGoods(goodterms).then(goodsres=>{
            if(goodsres && goodsres.status === 200){
              const gData = goodsres.result.data;
              const goodArea  = new Map();
              
              gData.forEach(item=>{
                goodArea.set(item.id,item.area);
                
              });
              if(productidList.length === 0){
                productidList.push(null);
              }

              queryProductids(productidList).then(Pres=>{
                if(Pres && Pres.status === 200){
                  const productData = Pres.result;
                  for(let i=0;i<tmpData.length;i+=1){
                    for(let z=0;z<productData.length;z+=1){
                      if(tmpData[i].productid === productData[z].id){
                        const product01Entity ={
                        picture :productData[z].picture,
                        seriesname :productData[z].productseries.seriesname,
                        kindname :productData[z].productkind.kindname,
                        productname:productData[z].productname,
                        colorname : productData[z].colorname,
                        
                        }
                        
                        tmpData[i].product01Entity =product01Entity;
                        
                      }
                    }
                    tmpData[i].key=`tmp${i}`;
                    tmpData[i].status=0;
                    tmpData[i].output=tmpData[i].picknum;
                    tmpData[i].outpiece = tmpData[i].piece;
                 //   tmpData[i].goodentryids = goodsMap.get(tmpData[i].batchno).id;
                    tmpData[i].remainnum=tmpData[i].picknum;
                    tmpData[i].pieceweight = goodsMap.get(tmpData[i].goodentryid).pieceweight;// 每包净重
                    tmpData[i].locations = goodsMap.get(tmpData[i].goodentryid).locations;// 位置信息
                    tmpData[i].area = goodArea.get(goodsMap.get(tmpData[i].goodentryid).goodid);// 区域位置
                    tmpData[i].areas = areaMap.get(`${tmpData[i].area}`);
                  }
               
                  
                  
    
                  queryPresaleById(presaleid).then(inquiryRes =>{
                    if(inquiryRes && inquiryRes.status === 200){
                      const presaleData = inquiryRes.result;
                      const paramss = `paging=false&terms[0].value=${presaleData.clientid}&terms[0].column=id`;
                      const wayTerm = `paging=false`;
                      queryErpClient(paramss).then(userRes=>{
                        if(userRes && userRes.status === 200){
                          const userList = userRes.result.data;
                          presaleData.clientids = userList[0].name;
                          presaleData.credit = userList[0].credit;
                          queryDeliveryWay(wayTerm).then(wayres=>{
                            if(wayres && wayres.status ===200){
                              const wayData = wayres.result.data;
                              wayData.forEach(item=>{
                                if(`${presaleData.takeway}` === item.value){
                                  presaleData.takewayname = item.name;
                                }
                              })
                              const pickupTmp = {
                                pickupData:tmpData,
                                dataTop:[presaleData],
                               }
                               setTimeout(hide,100);
                               this.setState({
                                 pickupTmp,
                                 pickupVisible:true,
                               })
                            }
                          })
                          
                        }
                      });
                      
                    }
                  })
                }
              })
            }
          });


            }
          });
          
          
        }
      });
    }
    
    search=()=>{
       const userids = this.state.userid;
       const usernames = this.state.username;
       let colorname = testvalue.toUpperCase();
       if(userids===undefined ){ 
        message.error("请选择客户");
        return;
      }
       
       if(colorname==="" || colorname===undefined ){
          message.error("请输入所查询产品");
          return;
       }
       if(colorname.indexOf(" ") ===-1 ){
        message.error("请按照格式正确输入产品和数量,例：色称 数量",5);
        return;
      }
     
       const numMap = new Map();
       colorname =colorname.replace(/[\r\n]/g," ");
       const valueArrs = `${colorname}`.split(" ");
       const valueArr = valueArrs.filter( (s)=> {
        return s && s.trim(); // 注：IE9(不包含IE9)以下的版本没有trim()方法
    });
       const colornameArr = [];
       for(let i=0;i<valueArr.length;i+=1){// 拆成数组后，名称做key，数量做value存进map
        if(i%2===0){
          numMap.set(valueArr[i],parseFloat(valueArr[i+1]));
          colornameArr.push(valueArr[i]);
        }
       }
      
       const errorName = ArrayRepeat(colornameArr);
      if(errorName !== "" ){
        message.warning(`色称：${errorName}有重复输入，请确认`,5);
        return;
      }
       
       if(valueArr.length>1){
         
         
         message.config({
          top: 100,
        });
        const hide = message.loading(`正在查询...`, 0);
        const parmas =termsIn(colornameArr,'colorname');
        queryColorProduct(parmas).then((response)=>{
            dataLeft=[];
            setTimeout(hide,100);
              if(response && response.status===200){
                const datas = response.result.data;
                const startTime = moment().format('YYYY-MM-DD');
                if(datas.length===0){
                  message.error("没有找到该产品，请确认！");
                  this.setState({showStatus:false});
                  
                }else{
                for(let j=0;j<datas.length;j+=1){
                  const variable = {
                    key:`inuqry_fast_${j}`,
                    num:numMap.get(datas[j].colorname),
                    price:datas[j].price,
                    usrid:userids,
                    product01Entity:datas[j],
                    usefor:'大货',
                    deliverydate:startTime,
                    comment:'',
                    completestatus:0,
                    spotnum:0,
                    productid:datas[j].id,
                  }
                  dataLeft.push(variable);
                 }
                 dataLeft.paywaySpot =0;
                 const startTimes = moment().add(+5,'day').toDate();
                 
                 // 保留一个查询客户等级的接口
                 dataTop = [
                  {   key:"fast_top_1",
                      contenttype:0,
                      address:'广州',
                      comment:``,
                      inquiryDetail01Entities:[],
                      ismerge:0,
                      paystatus:0,
                      payway:0,
                      paywayChase:0,
                      paywayOwn:0,
                      paywaySpot:0,
                      recordstatus:0,
                      takeway:0,
                      deliverydate:moment(startTimes).format("YYYY-MM-DD"),
                      usrid:usernames,
              
                  },
              
              ];
              const params = `paging=false&terms[0].value=${userids}&terms[0].column=id`;
                 queryErpClient(params).then((res)=>{
                   if(res && res.status===200){
                      const dataList = res.result.data;
                      dataTop[0].user = dataList[0].name;
                      dataTop[0].address = dataList[0].shippingaddress;
                      
                      dataTop[0].credit = dataList[0].credit;
                      dataTop[0].shipreceiver =dataList[0].shipreceiver;
                      dataTop[0].shipphone =dataList[0].shipphone;
                      dataTop[0].provice = [dataList[0].codeP,dataList[0].codeC,dataList[0].codeA==="undefined"?"":dataList[0].codeA];
                      dataLeft.taxrate = dataList[0].taxrate===undefined?0.06:dataList[0].taxrate;
                      dataLeft.pickuppay = dataList[0].pickuppay===undefined?0:dataList[0].pickuppay;
                      dataLeft.earnest = dataList[0].earnest===undefined?0:dataList[0].earnest;
                      const proparams = `paging=false&terms[0].value=${dataList[0].codeP}&terms[0].column=codeP`;
                      queryProvince(proparams).then(pres =>{
                        
                        if(pres && pres.status === 200){
                          let provicename ="";
                        let cityname ="";
                        let areaname = "";
                          const provicelist = pres.result.data[0].children;
                           provicename = pres.result.data[0].name;
                          for(let i =0;i<provicelist.length;i+=1){
                            if(provicelist[i].codeC === dataList[0].codeC){
                               cityname = provicelist[i].name;
                              if(dataList[0].codeA!=="undefined"){
                                const arealist = provicelist[i].areas;
                                for(let j=0;j<arealist.length;j+=1){
                                  if(dataList[0].codeA === arealist[j].codeA){
                                    areaname = arealist[j].name;
                                    break;
                                  }
                                 
                                }
                              }
                            }
                          }
                          dataTop[0].provicelabel = [provicename,cityname,areaname];

                          this.setState({userid:userids,showStatus:true,dataLeft,dataTops:dataTop});
                        }
                      });
                   }
                 
                 })
                 
            }
              }else{
                this.setState({showStatus:false});
              }
          })
       }
       // 获取数据，setstate数据源，重新编写
      //  dataLeft = [

      //   {
      //       key:"data2ef",
      //       comment:"紧急",
      //   id:"2fd574271c852553acbaaf37ad6ce43f",
      //   inquiryid:"cb9f8a44e38db5ca208eac28759dfa3",
      //   num:15.62,
      //   price:141.123,
      //   picknum:32,
      //   product01Entity:
      //   {colorname:"CA001",
      //   colorproduct:{a:60.14,b:57.19,begindate:"2018-01-01 10:45:19",enddate:"2019-01-01 10:45:19",hex:"#e84c22",id:802,l:55.35,lrv:"23",
      //   productid:"1533697589676000005",rgb:"232,76,34",status:1,supplyid:"cb564b09127e4e1d8cd1fcd7a35b03a9"},
      //   id:782,kind:"膨体棉晴·2/16支·60%棉·40%晴",largetype:"膨体棉晴",location:"1-01-01",picture:"http://47.95.202.38/upload/20180808/6743237244707997.png",
      //   price:36.0,productid:"1533697589676000005",productname:"火龙桔",recommande:10.0,series:"膨体棉晴",supplyid:"cb564b09127e4e1d8cd1fcd7a35b03a9"},
      //   productid:"1533697589676000005"},
      // ];
      
      }


    handlSelectChange=(e,a)=>{
       
        this.setState({
            userid:e,
            username:a.props.children,
        })
    }
    
    handlTextChange=(e,b)=>{
        
        testvalue = e.target.value
        
    }  
    handleAdd=(params)=>{
      addErpClient(params);
      const paramss =`terms[0].value=${getSupplyId()}&terms[0].column=supplyid&terms[1].value=0&terms[1].column=issupply&pageIndex=0&pageSize=10`;
      this.searchErpClient(paramss);
      
      this.setState({
        modalVisible:false,
      });
     
      
    }
   
  CancelModalVisible=()=>{
    this.setState({
        modalVisible:false,
    })
    }
    CancelPickupModalVisible=()=>{
      message.success("定单生成成功！");
      this.setState({
        pickupVisible:false,
      })
      this.props.dispatch(routerRedux.push(`/order/newnopayment`));
      }
    add=(e,flag)=>{
        this.setState({
          modalVisible:flag, 
          
        })
    }
    render(){
        
        const {form} = this.props;
        const {getFieldDecorator} = form;
        const {modalVisible,dataTops,pickupVisible,pickupTmp} = this.state;
        const parentMethods = {
      
            CancelModalVisible: this.CancelModalVisible,
            handleAdd:this.handleAdd,
          };
          const pickupParentMethods = {
      
            CancelPickupModalVisible: this.CancelPickupModalVisible,
            handlonsubmit:this.handlonsubmit,
          };
        return(            
          <PageHeaderLayout title="询价单">
            <Card bordered={false}>
              <div className={styles.tableList}>
                <div>

                  <div className={styles.searchtable}>
                    <div className={styles.searchToptable}>
                      <span style={{display:'inline-block',marginLeft:8}}>客户:</span>
                      <Select placeholder="请选择" style={{width:'80%',display:'inline-block',marginLeft:8}} showSearch filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}  onChange={(e,a) => this.handlSelectChange(e,a)}>
                        {this.state.customers}
                      </Select><Icon type="plus-square"style={{fontSize:27,color:'green'}} onClick={e=>this.add(e,true)} />
                    </div>
                    <div  className={styles.searchTab}><span>产品信息</span></div>
                    
                    <div>
                      <div className={styles.searchTooltip}>
                        <div style={{marginLeft:30}}>
                          <li>请在右侧输入</li>
                          <li><span className={styles.fontcolor}>色号 数量</span>(每行一个产品)</li>
                          <li className={styles.fontcolor}>AC145 800</li>
                          <li className={styles.fontcolor}>AC148 500</li>
                          <li className={styles.fontcolor}>AC456 1200</li>
                        </div>  
                      </div>
                      <textarea className={styles.searchText} onChange={e => this.handlTextChange(e)} spellCheck="false" />
                    </div>
                    <Button style={{marginLeft:250}} onClick={this.search}>查询</Button>
                  </div>  
                </div>
                <div className={this.state.showStatus?styles.tableshow:styles.tablenone}>
                  <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
                    <div >
                      {getFieldDecorator('tableTop', {
                            
                              },)(<FastTableTop dataSource={dataTops} />)}
                    
                      <div style={{width:"100%",overflowX: "auto"}}>
                        
                          
                        {getFieldDecorator('tableLeft', {
                              
                            },)(<TableFastLeft dataSource={this.state.dataLeft} />)}
                        <div >
                        
                          <FooterToolbar style={{ width: this.state.width }}>
                              
                            <Button type="primary" onClick={e=>this.validate(e,1)}>
                            提交
                            </Button>
                            {/* <Button type="primary"  onClick={e=>this.validate(e,2)}>
                            暂存
                            </Button> */}
                          </FooterToolbar>
                        </div>
                      </div>
                      
                    </div>
                  </Form> 
                </div>         
                   
                  
                
              </div>
            </Card>
            <CreatForm {...parentMethods} modalVisible={modalVisible} titlename={this.state.titlename} childrens={this.state.children} />
            <PickupForm {...pickupParentMethods} modalVisible={pickupVisible} pickupTmp={pickupTmp} />
          </PageHeaderLayout>
        );
    }
    
  }