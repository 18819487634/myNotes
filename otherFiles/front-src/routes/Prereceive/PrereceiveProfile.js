import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  
  Card,
  Form,
  Row,
  Col,
  Select,
  Button,
  Table,
  Tabs,
  Input,
  message,
  Modal,
  InputNumber,
} from 'antd';
import FooterToolbar from 'components/FooterToolbar';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './PrereceiveProfile.less';

import TableTop from './TableTop';
import TableLeft from './TableLeft';

import {   queryProductids,  updatePrease, getTrackStatusForId, queryPrereceive, queryPrereceivepForid, queryInquireBasic, addpaydetail, queryErpClient, queryListClients, querypaydetail, querysupplydictionry, queryPresale, queryPresaleById, queryGoods, queryGoodsBasic, queryPickuptmpdetail, addPickUp, updatePickuptmpdetail, queryDeliveryWay } from '../../services/api';
import { getMyDate, trackiList, ismergeList,toDecimal } from '../../utils/utils';
import { getSupplyId, getUserCompany } from '../../utils/sessionStorage';
import TableFastLeft from '../Inquiry/TableFastLeft';
import FastTableTop from './FastTableTop';
import PreInquiry from '../Inquiry/PreInquiry';
import PrintingProfile from '../Sale/PrintingProfile';
import SplitsPickUpTable from '../Inquiry/SplitsPickUpTable';
import SplitTableTop from '../Inquiry/SplitTableTop';



const FormItem = Form.Item;
const { Option } = Select;
let dataTop = [];
let dataLeft = [];
const takewayMap = new Map();
const TabPanes = Tabs.TabPane;
const payTypeArr =["未收款","已收款"];
const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible,params } = props;
  
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue,params);
    });
  };
  return (
    <Modal
      title="收款"
      visible={modalVisible}
      onOk={okHandle}
      maskClosable={false}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="金额">
        {form.getFieldDecorator('price', {
          rules: [{ required: true, message: '请输入金额' }],
        })(<InputNumber placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="支付方式">
        {form.getFieldDecorator('paytype', {
          rules: [{ required: true, message: '请输入金额' }],  initialValue: 0,
        },)(
          <Select placeholder="请选择" style={{ width: '100%' }} >
            <Option value={0}>现金</Option>
            <Option value={1}>微信支付</Option>
            <Option value={2}>支付宝支付</Option>
            <Option value={3}>银行支付</Option>
          </Select>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="收款类型">
        {form.getFieldDecorator('contenttype', {
          rules: [{ required: true, message: '收款类型' }],initialValue:4,
        })(
          <Select placeholder="请选择" style={{ width: '100%' }} disabled>
            <Option value={1}>拣货费</Option>
            <Option value={2}>欠货拣货费</Option>
            <Option value={4}>预收款</Option>
            
          </Select>)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
        {form.getFieldDecorator('remake', )(<Input  />)}
      </FormItem>
     
    </Modal>
  );
});
const PrintTable = Form.create()(props => {
  const { modalVisible, dataList, handleModalVisibles } = props;
  const okHandle = () => { handleModalVisibles(false)};
  return (
    <Modal
      title="打印"
      visible={modalVisible}
      width={800}
      onOk={okHandle}
      onCancel={() => handleModalVisibles(false)}
    >
      <PrintingProfile dataSource={dataList} />
    </Modal>
  );
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
  export default class PrereceiveProfile extends PureComponent {
    state ={
      printingFlag:false,
      panes:[{key:"1"}],
      activeKey:'1',
      pickupVisible:false,
      pickupTmp:{
        dataTop:[{"key":"d1"}],
        pickupData:[{"key":"p1"}],
      },
    
    }
    
    componentDidMount() {


      const supplyids = [getSupplyId()];
      const param =`paging=false&terms[0].value=${supplyids}&terms[0].column=supplyid&terms[1].value=0&terms[1].column=issupply`;
      queryErpClient(param).then((response)=>{// 加载客户信息
        if(response && response.status===200){ 
          const custarr= [];
          const list = response.result.data;
           
            for(let i=0;i<list.length;i++){
              custarr.push(<Option key={i} value={list[i].id}>{`${list[i].name}`}</Option>);
            }
            const params = `terms[0].value=3&terms[0].value=4&terms[0].value=5&terms[0].termType=in&terms[0].column=type&terms[1].value=1&terms[1].column=isact`;
            querysupplydictionry(params).then(res=>{
              if(res && res.status===200){
                const dictionryData = res.result.data;
                let totalweight =null;
                let totalquantity = null;
                let deviation = null;
                dictionryData.forEach(item=>{
                  if(item.ttpe===3){
                    areaMap.set(item.value,item.key);
                  }else if(item.type===4){
                    totalquantity = parseFloat(item.value);
                  }else if(item.type === 5){
                    totalweight = parseFloat(item.value);
                  }else if(item.type === 6){
                    deviation = parseFloat(item.value);
                  }
                });
                const wayTerms = `paging=false&sorts[0].name=no&sorts[0].order=asc`;
                queryDeliveryWay(wayTerms).then(wayres=>{
                  if(wayres && wayres.status === 200){
                    const wayResult = wayres.result.data;
                    wayResult.forEach(item=>{
                      takewayMap.set(parseInt(item.value,10),item.name);
                    })
                    const terms =`terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
                      this.query(terms);
                      this.setState({
                        totalquantity,
                        totalweight,
                        custarr,
                        deviation,
                      })
                  }
                });
                
              }
            });
           
            
              
            
          }
        })
        
      
    }

    
    
    
    onChange = (activeKey) => {
      
      this.setState({ activeKey });
    }
    onEdit = (targetKey, action) => {
      this[action](targetKey);
      
    }
    query =(terms)=>{
        
        queryPrereceive(terms).then((response)=>{
            if(response && response.status===200){
              const arr = response.result.data;
              const trackids =[];
              for(let i =0;i< arr.length;i+=1){
                arr[i].sum = (arr[i].goodpay + arr[i].shippay + arr[i].securepay +(arr[i].goodpay*arr[i].taxrate)).toFixed(2);
                trackids.push(arr[i].trackid);
              }
              const userList =[];
              arr.reverse((a,b)=>a.makedate < b.makedate);
              if(trackids.length===0){
                trackids.push(null);
              }
              getTrackStatusForId(trackids).then(res=>{
                if(res && res.status===200){
                  let trackData  =[];
                  const results = res.result;
                  const resultmap = new Map();
                  const trackmap = new Map();
                  for(const key in results){
                    if(key in results){
                      trackData = results[`${key}`];
                      trackData.reverse((a,b)=>{
                        if(a.buildtime === b.buildtime){
                          return a.type > b.type
                        }else{
                          return a.buildtime < b.buildtime
                        }
                        
                    });
                      resultmap.set(key,trackData[0].type);
                      trackmap.set(key,trackData);
                    }
                   
                  }
                  for(let z =0;z< arr.length;z+=1){
                    arr[z].key= `presaleAll${z}`;
                    arr[z].status = resultmap.get(arr[z].trackid);
                    userList.push(arr[z].clientid);
                  }
                  if(userList.length ===0){
                    userList.push(null);
                  }
                  queryListClients(userList).then(cres=>{
                    if(cres && cres.status === 200){
                      const userData = cres.result;
                      for (let i = 0; i < arr.length; i += 1) {
                        
                        if(`${arr[i].clientid}`.indexOf(":")===-1){
                        //  arr[i].clientids = arr[i].clientid;
                          arr[i].clientname = userData[arr[i].clientid];
                          
                        }
                       
                      }


                      const pagination ={
                        total: response.result.total,
                        current:  this.state.pageindex,
                        pageSize: this.state.pagesize,
                        showTotal: () => {
                          return `共${response.result.total}条`;
                        },
                        showQuickJumper: true,
                      }
                      const columns=[{
                        title: '预订货款单编号',
                        dataIndex: 'id',
                        key: 'id',
                        render:(val,record)=>{return <a onClick={e=>this.hadl(e,val,record)}>{val}</a>},
                      }, {
                        title: '询价单号',
                        dataIndex: 'inquiryid',
                        key: 'inquiryid',
                      }, {
                        title: '客户',
                        dataIndex: 'clientname',
                        key: 'clientname',
                      }, 
                       {
                        title: '时间 ',
                        dataIndex: 'makedate',
                        key: 'makedate',
                        render:val=>getMyDate(val),
                      },
                      //  {
                      //   title: '备注',
                      //   dataIndex: 'comment',
                      //   key: 'comment',
                      // }, {
                      //   title: '取货方式',
                      //   dataIndex: 'takeway',
                      //   key: 'takeway',
                       
                      //   render(val) {
                      //     return <span >{takewayArr[val]}</span>;
                      //   },
                      // }, {
                      //   title: '数量（Kg）',
                      //   dataIndex: 'num',
                      //   key: 'num',
                      // }, 
                      {
                        title: '金额',
                        dataIndex: 'sum',
                        key: 'sum',
                        render:val=>val===undefined?`￥ 0`:`￥ ${val}`,
                      }, {
                        title: '收款',
                        dataIndex: 'paytype',
                        key: 'paytype',
                        render(val) {
                          return <span >{payTypeArr[val]}</span>;
                        },
                      }, {
                        title: '跟踪状态',
                        dataIndex: 'status',
                        key: 'status',
                        render(val) {
                          return <span >{trackiList[val]}</span>;
                        },
                      },{
                        title: '询价',
                        dataIndex: 'inquiry',
                        key: 'inquiry',
                        render:(val,record) =>{
                          return (
                            <div>
                              <li><a onClick={e=>this.inquiry(e,record)}>询价</a></li>
                              <li><a onClick={e=>this.paymentClick(record)}>收款</a></li>
                            </div>
                        );
                        },
                      }];
                     
                      this.setState({
                        pagination,
                        trackmap,
                        arr,
                      },()=>{

                        const panes1 = {
                          title:'预订货款列表',
                          content:(
                            <Table 
                              pagination={this.state.pagination}
                              
                              dataSource={this.state.arr}
                              onChange={this.handleStandardTableChange}
                              columns={columns}
                            />
                          ),
                          key:'1',
                          closable:false}
                          const paness1=[];
                        if(this.state.panes.length===1){
                          paness1.push(panes1);
                        }else{
                          const panes2 =this.state.panes[1];
                          paness1.push(panes1);
                          paness1.push(panes2);
                        }
                          this.setState({
                            panes:paness1,
                            arr,
                            columns,
                            trackmap,
                          })
                        
                      })

                      
                    }
                  });
                  
                }
              })
            
    
    
    
         
          }
          })
    }

    updatePrice =(error,values)=>{
       
       
          
      const dataParams = values.tableLeft;
      dataParams.splice(dataParams.length-1, 1);
      const detailData = [];
      const summaryData = [];
      for(let e =0;e<dataParams.length;e++){
        if(dataParams[e].key.indexOf("concat")===-1){
          detailData.push(dataParams[e]); 
          
        }else{
          summaryData.push(dataParams[e]);
        }
        
     }
     const params = {};
     params.id = values.tableTop[0].id;
     params.type = 0;
     params.details =detailData;
     
      updatePrease(params).then(res=>{ 
        if(res && res.status ===200){
           message.success("修改价格成功！");
        }
      })
      
    
  }
  validates=(e,tag,record,dataLefts)=>{
    if(tag===2){
      e.preventDefault();
      
      this.paymentClick(record);
      
    }else if(tag ===3 ){
      this.printing("11",record,dataLefts);
    }
  }
  printing = (ep, dataTops, dataLefts, pickupDetail) => {
    const data = [];
    let datanum = 0;
    queryInquireBasic(dataTop[0].inquiryid).then(res =>{
      if(res && res.status ===200){
    dataLefts.forEach(item => {
      const valueList = {
        key: item.productid,
        kindname: item.product01Entity.kindname,
        seriesname: item.product01Entity.seriesname,
        productname: item.product01Entity.productname,
        colorname: item.product01Entity.colorname,
        num: item.num,
        unit: 'KG',
        price: item.price,
        piece: item.piece,
        sum: Number(Number(item.num) * Number(item.price)).toFixed(0),
        comment: item.comment,
        batchno: item.batchno,
        scattered: item.scattered,
      };
      datanum += parseFloat(item.num);
      data.push(valueList);
    });
    data.user = dataTops[0].user;
    data.address = dataTops[0].address;
    data.weight = datanum;
    // data.needpay = res.result.pregoodpay;
    data.id = dataTops[0].id;
    const company = JSON.parse(getUserCompany());
    data.user = dataTop[0].user;
    data.address = dataTop[0].address;
    // data.weight = dataLeft.weight;
    data.taxstnum =res.result.pregoodpay * res.result.taxratepre;
    data.needpay = parseFloat((dataLeft.goodpay+ dataLeft.shippay+ dataLeft.securepay+data.taxstnum).toFixed(2));
    data.shippay = (dataLeft.shippay +dataLeft.securepay).toFixed(2);
    // data.id = dataTop[0].id;
    data.shipphone =res.result.shipphone;
    data.date = getMyDate(dataTop[0].makedate);
    data.company = {
      fullname : company.fullname,
      address : company.address,
      telphone : company.telphone,
      logo : company.logo,
      fax : company.fax,
    };
    this.setState({
      printData: data,
      printingFlag: true,
    });
  }
  })
  };
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

    
    
    
    const productidset = new Set();
    const datalefts = values.tableLeft;
      const pretarmap = values.tableLeft[values.tableLeft.length-1];
      const dataleft = [];
      for(let i=0;i<datalefts.length;i+=1){
        if(i !== datalefts.length-1){
          dataleft.push(datalefts[i]);
        }
      }
   
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
     for (const item of pretarmap.keys()) {
       const nocompletes = [];
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
       for(let c =0;c<nocompletes.length;c+=1){
        for(let p =0;p<pickupdata.length;p++){
        if(pickupdata[p].productid === nocompletes[c].productid && pickupdata[p].batchno === nocompletes[c].batchno){
            pickupdata[p].completestatus =0;
          }
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
          let ownnums = 0;// 总欠货数量
          let transnums = 0;// 总胚纱数量
          let rawyarnnums = 0;// 总代销数量
          const inquiry = {
            usrid:this.state.userid,
            paystatus:values.tableTop[0].paystatus,
            contenttype:0,
            
            isauto:1,
            address:values.tableTop[0].address,
            comment:values.tableTop[1].usrid,
            takeway:values.tableTop[0].takeway,
            payway:values.tableTop[0].payway,
            ismerge:values.tableTop[0].recordstatus,
            prereceiveid:values.tableTop[0].prereceiveid,
            // taxratespot:dataleft.taxrate,
            //   taxrateagent:dataleft.taxrate,
            //   taxrateown:dataleft.taxrate,
            taxstatus:dataleft[dataleft.length-1].taxstatus,
              codeP:values.tableTop[2].provice[0],
              codeC:values.tableTop[2].provice[1],
              codeA:values.tableTop[2].provice[2],
              shipreceiver:values.tableTop[2].shipreceiver,
              shipphone:values.tableTop[2].shipphone,
          };
          if(values.tableTop[0].address !== values.tableTop[2].usrid){
            inquiry.address= values.tableTop[2].usrid;
          }
            summaryData.forEach(item=>{
              if(item.key === "concat1"){// 数量
                ownnums =item.ownnum;
                transnums = item.transnum;
                rawyarnnums = item.rawyarnnum;
              }else
              if(item.key==="concat5"){// 货款
                inquiry.goodpayOwn = parseFloat(item.ownnum);
                inquiry.goodpayAgent = parseFloat(item.transnum);
                inquiry.goodpayYarn = parseFloat(item.rawyarnnum);
                inquiry.goodpaySpot = parseFloat(item.spotnum);
              //  inquiry.pregoodpay = parseFloat(item.ownnum) + parseFloat(item.transnum) + parseFloat(item.rawyarnnum);
              }else 
              if(item.key === "concat6"){// 运费
                inquiry.shippayOwn = parseFloat(ownnums==="0.00"?0:item.ownnum);
                inquiry.shippayAgent = parseFloat(transnums==="0.00"?0:item.transnum);
                inquiry.shippayYarn = parseFloat(rawyarnnums==="0.00"?0:item.rawyarnnum);
                inquiry.shippaySpot = parseFloat(item.spotnum);
              //  inquiry.preshippay= parseFloat(item.ownnum) + parseFloat(item.transnum) + parseFloat(item.rawyarnnum);
              }else 
              if(item.key === "concat7"){// 保险
                inquiry.securepayOwn = parseFloat(ownnums==="0.00"?0:item.ownnum);
                inquiry.securepayAgent =parseFloat(transnums==="0.00"?0: item.transnum);
                inquiry.securepayYarn = parseFloat(rawyarnnums==="0.00"?0:item.rawyarnnum);
                inquiry.securepaySpot = parseFloat(item.spotnum);
               // inquiry.presecurepay= parseFloat(item.ownnum) + parseFloat(item.transnum) + parseFloat(item.rawyarnnum);
              }else 
              if(item.key === "concat4"){// 结款方式
                inquiry.paywayOwn =this.state.paywayData.paywayOwn; 
                
                inquiry.paywaySpot =this.state.paywayData.paywaySpot;

              }else
              if(item.key === "concat3"){// 定金/拣货费
                inquiry.pickpayOwn = ownnums==="0.00"?0:parseFloat(item.ownnum);
                inquiry.ownpay = parseFloat(item.spotnum===""?0:item.spotnum);
                inquiry.pickpayAgent =transnums==="0.00"?0:parseFloat(item.ownnum);
                inquiry.pickpayYarn =rawyarnnums==="0.00"?0:parseFloat(item.ownnum);
                inquiry.pickpaySpot = parseFloat(item.spotnum===""?0:item.spotnum);
              }
              else if(item.key === "concat2"){// 收款比例
                inquiry.paypercentOwn = ownnums==="0.00"?0:item.ownnum;
                inquiry.paypercentAgent =transnums==="0.00"?0: item.ownnum;
                inquiry.paypercentYarn = rawyarnnums==="0.00"?0:item.ownnum;
                inquiry.paypercentSpot = item.spotnum;

              } else if(item.key === "concat10"){// 发票 状态为1才给赋值税点
                if(inquiry.taxstatus===1){
                  inquiry.taxrateown = ownnums==="0.00"?0: parseFloat(dataleft[dataleft.length-1].taxrate);
                  if(transnums!=="0.00" || rawyarnnums!=="0.00" ){
                    inquiry.taxrateagent =  parseFloat(dataleft[dataleft.length-1].taxrate);
                  }
                  inquiry.taxratespot = parseFloat(dataleft[dataleft.length-1].taxrate);
                }
               

              }
              
            });
                    
                    inquiry.paywaySpot= inquiry.paywaySpot===undefined?0: inquiry.paywaySpot;
                    
                    const forMatDetail = [];
                    
                    

                    let demo ={};
                    let sumweight = 0;
                    let actnums = 0;
                    detailData.forEach(dItem=>{
                        demo={
                        
                        productid:dItem.productid,
                        colorname:dItem.product01Entity.colorname,
                        num:dItem.num,
                        price:dItem.price,
                        usefor:dItem.usefor,
                        deliverydate:dItem.deliverydate,
                        comment:dItem.comment,
                        spotnum:dItem.spotnum===undefined?0:parseFloat(dItem.spotnum),
                        

                        }
                        sumweight += dItem.spotnum===undefined?0:parseFloat(dItem.spotnum);
                        
                        if(dItem.product01Entity.productattribute ===1){ // 色纱
                          if(dItem.chasebatchno === undefined){
                            demo.ownnum = dItem.ownnum===undefined?0:dItem.ownnum;
                            
                          }else{
                            
                              demo.chasenum=dItem.ownnum===undefined?0:dItem.ownnum;
                             
                              demo.batchno=dItem.chasebatchno === undefined?"":dItem.chasebatchno;
                        
                        }
                      }else if(dItem.product01Entity.productattribute === 2){ // 胚纱
                        if(dItem.transnum === undefined && dItem.rawbatchno === undefined){// 胚纱平台，没有批次
                          demo.ownnum = dItem.ownnum===undefined?0:dItem.ownnum;
                          
                          
                        }else if(dItem.transnum === undefined && dItem.rawbatchno !== undefined){// 胚纱平台，有批次
                          demo.chasenum=dItem.rawyarnnum===undefined?0:dItem.rawyarnnum;
                             
                          demo.batchno=dItem.rawbatchno === undefined?"":dItem.rawbatchno;
                          
                        }else if(dItem.transnum !== undefined && dItem.tbatchon === undefined){// 胚纱代销，没有批次
                          demo.ownnum = dItem.transnum===undefined?0:dItem.transnum;
                        }else if(dItem.transnum !==undefined && dItem.tbatchon !== undefined){// 胚纱代销，有批次
                          demo.chasenum=dItem.transnum===undefined?0:dItem.transnum;
                             
                          demo.batchno=dItem.tbatchon === undefined?"":dItem.tbatchon;
                        }
                      }else if(dItem.product01Entity.productattribute !== 2 && dItem.product01Entity.productattribute !== 1){ // 其他代销
                        if(dItem.tbatchon === undefined){
                          demo.ownnum = dItem.transnum===undefined?0:dItem.transnum;
                          
                          
                        }else {
                          demo.chasenum=dItem.transnum===undefined?0:dItem.transnum;
                             
                          demo.batchno=dItem.tbatchon === undefined?"":dItem.tbatchon;
                          
                        }
                      }
                        
                        forMatDetail.push(demo);
                    })
                    inquiry.inquiryDetail01Entities = forMatDetail;

                    for(let i=0;i<forMatDetail.length;i+=1){// 检验数量符合询价数量；
                      const valilownum = forMatDetail[i].ownnum===undefined?0:forMatDetail[i].ownnum;
                      const valiltransnum = forMatDetail[i].rawyarnnum===undefined?0:forMatDetail[i].rawyarnnum;
                      const valilrawyarnnum = forMatDetail[i].rawyarnnum===undefined?0:forMatDetail[i].rawyarnnum;
                      const nums =  forMatDetail[i].spotnum+valilownum+valiltransnum+valilrawyarnnum;
                      let quicknums = forMatDetail[i].num;
                       if(this.state.deviation){
                        quicknums -= this.state.deviation;
                       }
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
                this.props.dispatch({
                  type: 'inquiry/submitQuickInuqiry',
                  payload: Inquiry2Presales,
                  callback:(response)=>{
                    if(response && response.status === 200){
                      if(this.state.totalquantity || this.state.totalweight){
                        if(sumweight >0 && (this.state.totalquantity <actnums || this.state.totalweight < sumweight)  ){
                          
                          message.success("提交成功!总数量与总重量超过标准值,请拆单",3);
                          
                          this.splitorder(response.result.presaleid);
                          
                        }else{
                          
                            message.success("提交成功！");
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
  handlonsubmit=(values)=>{ // 拆单提交
    const params = values;
    if(params.splitspickuptable === undefined){
      message.error("请选择需要拆单的缸号");
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
      return;
    }else{
      const areaVail = areas[0];
      splictParmas.area = areaVail;
    }
    if(details.length ===0){
      message.error("请选择需要拆单的缸号");
      return;
    }
    splictParmas.details = details;
    addPickUp(splictParmas).then(dres=>{
      if(dres && dres.status === 200){
  
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
            this.setState({ pickupVisible:false});
            this.props.dispatch(routerRedux.push(`/order/newnopayment`));
            return;
          
          
         
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
              
                    queryErpClient(paramss).then(userRes=>{
                      if(userRes && userRes.status === 200){
                        const userList = userRes.result.data;
                        presaleData.clientids = userList[0].name;
                        presaleData.credit = userList[0].credit;
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
  CancelPickupModalVisible=()=>{
    message.success("定单生成成功！");
    this.setState({
      pickupVisible:false,
    })
    this.props.dispatch(routerRedux.push(`/order/newnopayment`));
    }
  paymentClick=(rec) =>{

    // 收款页面  linjiefeng
    const tmpurl = this.props.location.pathname;
    const params = `terms[0].value=${rec.id}&terms[0].column=preceiveid&terms[1].value=1&terms[1].column=validstatus&terms[2].value=0&terms[2].column=cancelstatus&terms[3].value=4&terms[3].column=contenttype&terms[3].termType=not`;
      querypaydetail(params).then(res=>{
        if(res && res.status === 200){
          const datas = res.result.data;
          const  remainmoney = toDecimal(rec.goodpay)+toDecimal(rec.shippay)+toDecimal(rec.securepay)+toDecimal(rec.goodpay*(rec.taxrate===undefined?0:rec.taxrate));
          let total = 0;
          datas.forEach(item => {
             total += toDecimal(item.amount);
          });
          const tmpmoney = remainmoney - total; 
          if(tmpmoney<=0){
            message.error("已经收款");
            return;

          };
          this.props.dispatch(
            routerRedux.push({
            pathname:'/finance/paydetail',
            state:{
              returnurl:tmpurl,
              address:rec.address,
              clientname:rec.clientname,
              clientid:rec.clientid,
              preceiveid:rec.id,
              money: toDecimal(tmpmoney),
              contenttype:2,// 尾款
              paytype:0,// 现金
            },
            }));
          
        }
      }).catch(e => {
        message.config({
          top: 100,
        });
        message.error(e);
      });

    // const params = record;  
    // if(params.userid !== undefined){
    //   params.clientid = params.userid;
    // }
    //   this.setState({
    //       modalVisible: !!flag,
    //       params,
    //     });
  }
  handleModalVisibles = flag => {
    this.setState({
      printingFlag: !!flag,
    });
  };
    handleSearch = () => {
        const { validateFieldsAndScroll } = this.props.form;
        validateFieldsAndScroll((error, values) => {    
            const terms =this.formatTerms(values);
            this.query(terms);
        });
      };
    
    formatTerms=(params)=>{
        const keys =[];
        const values =[];
        Object.keys(params).forEach((key)=>{
            
            if(params[key] !== undefined && params[key] !== "" ){
                keys.push(key);
                values.push(params[key]);
            }
            
       
       });
       let terms = `terms[0].value=0&terms[0].column=type`;
       if(keys.length>0){
        terms+= `&`;
       }
       
       for(let i=0;i<keys.length;i++){
         if(keys.length===1){
            terms += `terms[1].value=${values[i]}&terms[1].column=${keys[i]}`;
         }else{
            terms += `terms[${i+1}].value=${values[i]}&terms[${i+1}].column=${keys[i]}`;
            if(keys.length !== i+1){
                terms +='&'
            } 
         }
       }
       
       return terms;
    }
    
    hadl=(e,val,record)=>{
     
      const paness = this.state.panes;
      const {getFieldDecorator} = this.props.form;
      
      const productids = [];
      
          queryPrereceivepForid(val).then((response)=>{
            if(response && response.status ===200){ 
              dataTop=[];
         
              dataTop.push(response.result);
              for(let i =0;i< dataTop.length;i+=1){
                dataTop[i].key= `prereceTop${i}`;
                dataTop[i].comment = undefined?"":dataTop[i].comment;
           
              }
              
              dataLeft = response.result.details;
              for(let i =0;i< dataLeft.length;i+=1){
                dataLeft[i].key= `prereceLeft${i}`;
              
                productids.push(dataLeft[i].productid);
              }
              const map = this.state.trackmap;
             
              // dataLeft.goodpay = response.result.goodpay;
              
              // dataLeft.securepay = response.result.securepay;
              // dataLeft.shippay = response.result.shippay;
              // dataLeft.needpay = dataLeft.goodpay+dataLeft.pickwaste+dataLeft.securepay+dataLeft.shippay;
              dataLeft.trackData = map.get(record.trackid);
              let productweightnum = 0;
              queryProductids(productids).then((res)=>{
                if(res && res.status ===200){
                  const productData = res.result;
  
                  
                    for(let j = 0;j<productData.length;j+=1){
                      for(let z=0;z<dataLeft.length;z+=1){
                        if(productData[j].id === dataLeft[z].productid){
                          const product01Entity ={
                            picture : productData[j].picture,
                            seriesname :productData[j].productseries.seriesname,
                            kindname:productData[j].productkind.kindname,
                           productname:productData[j].productname,
                           colorname : productData[j].colorname,
                          }
                        
                          productweightnum +=   parseFloat(dataLeft[z].num); 
                          dataLeft[z].product01Entity = product01Entity;
                        }
                       
                    }
                    
                  }
                  queryInquireBasic(response.result.inquiryid).then(inquiryRes=>{
                  if(inquiryRes && inquiryRes.status === 200){
                    const inquiryData = inquiryRes.result;
                    const startTimes = moment().add(+5,'day').toDate();
                    dataTop[0].usrid = inquiryData.usrid;
                    dataTop[0].clientid = record.clientid;
                    dataTop[0].clientname = record.clientname;
                    dataTop[0].takeway = inquiryData.takeway;
                    dataTop[0].takewayname = takewayMap.get(inquiryData.takeway);
                    dataTop[0].payway = inquiryData.payway;
                    dataTop[0].recordstatus = inquiryData.ismerge;
                    dataTop[0].paystatus = inquiryData.paystatus;
                   // dataTop[0].comment = inquiryData.comment;
                    dataTop[0].address = inquiryData.address;
                    dataTop[0].id = inquiryData.id;
                    dataTop[0].prereceiveid = record.id;
                    dataTop[0].deliverydate=moment(startTimes).format("YYYY-MM-DD");
                    dataLeft.goodpay = inquiryData.pregoodpay;
                    dataLeft.productweightnum = productweightnum;
                    dataLeft.securepay = inquiryData.presecurepay;
                    dataLeft.shippay =inquiryData.preshippay;
                    dataLeft.taxpay = parseFloat((inquiryData.taxratepre * dataLeft.goodpay).toFixed(2));
                    dataLeft.needpay = parseFloat(dataLeft.goodpay+dataLeft.securepay+dataLeft.shippay+dataLeft.taxpay).toFixed(2);
                    const params = `paging=false&terms[0].value=${record.clientid}&terms[0].column=id`;
                    queryErpClient(params).then((eres)=>{ 
                      if(eres && eres.status===200){
                        const dataList = eres.result.data;
                        dataTop[0].user = dataList[0].name;
                        dataTop[0].address = inquiryData.address;
                        dataTop[0].comment =inquiryData.comment;
                        dataTop[0].credit = dataList[0].credit;
                        dataTop[0].ismerge = inquiryData.ismerge;
                        dataTop[0].shipreceiver =inquiryData.shipreceiver;
                        dataTop[0].shipphone =inquiryData.shipphone;
                        dataTop[0].provice = [dataList[0].codeP,dataList[0].codeC,dataList[0].codeA==="undefined"?"":dataList[0].codeA];
                      //  dataLeft.taxrate = dataList[0].taxrate===undefined?0.06:dataList[0].taxrate;
                        dataLeft.pickuppay = dataList[0].pickuppay===undefined?0:dataList[0].pickuppay;
                        dataLeft.earnest = dataList[0].earnest===undefined?0:dataList[0].earnest;
                      
                        
                        const activeKey =`${paness.length+1}`;
                      paness.push({ title: '订货单详情', content: (
                        <Form onSubmit={this.validates} layout="vertical" hideRequiredMark>
                          <div >
                            {getFieldDecorator('tableTop', {
                                    initialValue:dataTop,
                                    },)(<TableTop />)}
                          
                            <div style={{width:"100%",overflowX: "auto"}}>
                              
                                
                              {getFieldDecorator('tableLeft', {
                                  initialValue:dataLeft,
                                  },)(<TableLeft />)}
                              <div>
                                
                                <FooterToolbar style={{ width: this.state.width }}>
                                
                                  <Button type="primary" onClick={e=>this.paymentClick(record)}>
                                   收款
                                  </Button>
                                  {/* <Button type="primary" onClick={e=>this.validate(e,2)}>
                                   生成销售单
                                  </Button> */}
                                  <Button type="primary" onClick={ed=>this.validates(ed,3,dataTop,dataLeft)}>
                                   打印销售单
                                  </Button>
                                </FooterToolbar>
                              </div>
                            </div>
                          </div>
                        </Form> 
                      ), key: activeKey });
                      
                      this.setState({ panes:paness, activeKey });
                      }
                    });

                }
              })
             
                  
                    
                      
                      
                }
              })
            }
            
            
             
            
           })
     
      
     
      
      
    }
    inquiry=(e,record)=>{
      
        const paness = this.state.panes;
        const {getFieldDecorator} = this.props.form;
        message.config({
          top: 100,
        });
        
        const hide = message.loading(`正在读取...`, 0);
        const productids = [];
        if(record.paytype === 0){
          setTimeout(hide,0);
          message.warning("请先收款!");
          return;
        }
            queryPrereceivepForid(record.id).then((response)=>{
              if(response && response.status ===200){ 
                dataTop=[];
                
                dataTop.push(response.result);
                for(let i =0;i< dataTop.length;i+=1){
                  dataTop[i].key= `prereceTop${i}`;
             
                }
                
                dataLeft = response.result.details;
                for(let i =0;i< dataLeft.length;i+=1){
                  dataLeft[i].key= `prereceLeft${i}`; 
                  dataLeft[i].deliverydate = getMyDate( dataLeft[i].deliverydate);
                  productids.push(dataLeft[i].productid);
                }
                const map = this.state.trackmap;
               
                dataLeft.goodpay = response.result.goodpay;
                dataLeft.taxrate = response.result.taxrate;
              
                dataLeft.securepay = response.result.securepay;
                dataLeft.shippay = response.result.shippay;
                dataLeft.shippayOwn =response.result.shippay;
                dataLeft.shippayChase =response.result.shippay;
                dataLeft.needpay = dataLeft.goodpay+dataLeft.pickwaste+dataLeft.securepay+dataLeft.shippay;
                dataLeft.trackData = map.get(record.trackid);
                queryProductids(productids).then((res)=>{
                  if(res && res.status ===200){
                    const productData = res.result;
             
                    for(let j = 0;j<productData.length;j+=1){
                      for(let z=0;z<dataLeft.length;z+=1){
                        if(productData[j].id === dataLeft[z].productid){
                          const product01Entity ={
                            picture : productData[j].picture,
                            seriesname :productData[j].productseries.seriesname,
                            kindname:productData[j].productkind.kindname,
                            productattribute:productData[j].productattribute,
                           productname:productData[j].productname,
                           colorname : productData[j].colorname,
                          }
                        
                          // productweightnum +=   parseFloat(dataLeft[z].num); 
                          dataLeft[z].product01Entity = product01Entity;
                        }
                       
                    }
                    
                  }
                  
                    
                    queryInquireBasic(response.result.inquiryid).then(inquiryRes=>{
                        if(inquiryRes && inquiryRes.status === 200){
                            const inquiryData = inquiryRes.result;
                            const startTimes = moment().add(+5,'day').toDate();
                            const paywayData = {
                              paywayOwn:inquiryData.paywayOwn,
                              paywaySpot:inquiryData.paywaySpot,
                            }
                            dataTop[0].usrid = record.clientid;
                            
                            dataTop[0].takeway = inquiryData.takeway;
                            dataTop[0].payway = inquiryData.payway;
                            dataTop[0].recordstatus = inquiryData.ismerge;
                            dataTop[0].paystatus = inquiryData.paystatus;
                            dataTop[0].comment = inquiryData.comment;
                            dataTop[0].address = inquiryData.address;
                            dataTop[0].id = inquiryData.id;
                            dataTop[0].prereceiveid = record.id;
                            dataTop[0].deliverydate=moment(startTimes).format("YYYY-MM-DD");
                            for(let i =0;i< dataLeft.length;i+=1){

                              dataLeft[i].usrid = inquiryData.usrid;
                            }
                            const params = `paging=false&terms[0].value=${response.result.clientid}&terms[0].column=id`;
                            queryErpClient(params).then((eres)=>{ 
                              if(eres && eres.status===200){
                                const dataList = eres.result.data;
                                dataTop[0].user = dataList[0].name;
                                dataTop[0].address = inquiryData.address;
                                dataTop[0].credit = dataList[0].credit;;
                                dataTop[0].shipreceiver =inquiryData.shipreceiver;
                                dataTop[0].shipphone =inquiryData.shipphone;
                                dataTop[0].provice = [inquiryData.codeP,inquiryData.codeC,inquiryData.codeA==="undefined"?"":inquiryData.codeA];
                                dataLeft.taxratepre = dataList[0].taxrate===undefined?0.06:dataList[0].taxrate;// inquiryData.taxratepre;
                                dataLeft.preshippay = inquiryData.preshippay;
                                dataLeft.presecurepay = inquiryData.presecurepay;

                                if(dataLeft.preshippay!== 0 &&   dataLeft.presecurepay !==0){// 运费保险有的话，状态为1
                                  dataLeft.freightValue = 1;
                                }else{
                                  dataLeft.freightValue =0;
                                }

                                dataLeft.taxstatus = inquiryData.taxstatus;
                                
                                // dataLeft.taxrate = inquiryData.taxrate===undefined?0.06:dataList[0].taxrate;
                                // dataLeft.pickuppay = inquiryData.pickuppay===undefined?0:dataList[0].pickuppay;
                                // dataLeft.earnest = inquiryData.earnest===undefined?0:dataList[0].earnest;
                                const payTerms = `terms[0].value=${record.id}&terms[0].column=preceiveid&terms[1].value=1&terms[1].column=validstatus&terms[2].value=0&terms[2].column=cancelstatus&terms[3].value=4&terms[3].column=contenttype&terms[3].termType=not`;
                                querypaydetail(payTerms).then(payres=>{
                                  if(payres && payres.status === 200){
                                    const payData = payres.result.data;
                                    let payment = 0;
                                    if(payData.length === 0){
                                      setTimeout(hide,100);
                                      message.warn("请先收款");
                                      return;
                                    }
                                    payData.forEach(item=>{
                                      payment += item.amount;
                                    });
                                    dataLeft.payment = payment.toFixed(2);
                                    dataLeft.payid = payData[0].id;
                                    const activeKey =`${paness.length+1}`;
                            
                                setTimeout(hide,100);
                                this.setState({ userid: inquiryData.usrid ,dataTops:dataTop,dataLeft},()=>{
                                  paness.push({ title: '询价', content: (
                                    <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
                                      <div >
                                        {getFieldDecorator('tableTop', {
                                             
                                                },)(<FastTableTop dataSource={this.state.dataTops} />)}
                                      
                                        <div style={{width:"100%",overflowX: "auto"}}>
                                          
                                            
                                          {getFieldDecorator('tableLeft', {
                                              
                                              },)(<PreInquiry dataSource={this.state.dataLeft} />)}
                                          <div>
                                            
                                            <FooterToolbar style={{ width: this.state.width }}>
                                              <Button type="primary" onClick={ed=>this.validate(ed,3)}>
                                               提交询价
                                              </Button>
                                              {/* <Button type="primary" onClick={es=>this.validate(es,2)}>
                                               暂存
                                              </Button> */}
                                              {/* <Button type="primary" onClick={e=>this.validate(e,2)}>
                                               生成销售单
                                              </Button> */}
                                              
                                            </FooterToolbar>
                                          </div>
                                        </div>
                                      </div>
                                    </Form> 
                                  ), key: activeKey });this.setState({ panes:paness, activeKey,userid: inquiryData.usrid,paywayData});
                                });
                        
                                  }
                                });
                                
                        
                        
                              }
                           // this.setState({userid:userids,showStatus:true,dataLeft,});
                            })
                           
                          
                            
                        }
                    })
                    
                    
                        
                        
                  }
                })
              }
              
              
               
              
             })
       
        
       
              
    }
    handleAdd = (fields,parmas) => {

    const  payload= {
  
        preceiveid:parmas.id,
        clientid:parmas.clientid,
        // clientsupplyid:record,
        supplyid:getSupplyId(),
        amount:fields.price,
        paytype:0,
        comment:fields.remake,
        
      
        
      };
      
       addpaydetail(payload).then((response)=>{
        if(response && response.status===200){
            message.success("收款成功！");
            const terms =`terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
            this.query(terms);
            this.setState({
              modalVisible: false,
             
            });
            
        }
      });
      
  
  }
  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };
    remove = (targetKey) => {
      let activeKeys = this.state.activeKey;
      let lastIndex;
      this.state.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const panes = this.state.panes.filter(pane => pane.key !== targetKey);
      if (lastIndex >= 0 && activeKeys === targetKey) {
        activeKeys = panes[lastIndex].key;
      }
      this.setState({ panes, activeKey:activeKeys });
    }

    
    renderAdvancedForm() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Form onSubmit={this.handleSearch} layout="inline">
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={6} sm={24}>
              <FormItem label="编号">
                {getFieldDecorator('id')(<Input placeholder="请输入" />)}
              </FormItem>
            </Col>
            <Col md={6} sm={24}>
              <FormItem label="客户">
                {getFieldDecorator('clientid')(
                  <Select placeholder="">
                    {this.state.custarr}
                  </Select>
              )}
              </FormItem>
            </Col>
            <Col md={6} sm={24}>
              <FormItem label=" 状态">
                {getFieldDecorator('ismerge')(
                  <Select placeholder="">

                    {ismergeList.map((item,index)=><Option key={item} value={index}>{item}</Option>)}

                     
                  </Select>
                 )}
              </FormItem>
            </Col>
            <Col md={6} sm={24}>
              <FormItem label="取货方式">
                {getFieldDecorator('takeway')(
                  <Select placeholder="">
                    <Option value={0}>自提</Option>
                    <Option value={1}>快递</Option>
                    <Option value={2}>物流</Option>
                    <Option value={3}>送货上门</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
         
         
         
  
          <Row gutter={{ md: 4, lg: 24, xl: 48 }}>
            
            {/* <Col md={6} sm={24}>
              <FormItem label="结款方式">
                {getFieldDecorator('payway')(
                  <Select placeholder="">
                    <Option value={0}>日结</Option>
                    <Option value={1}>月结</Option>
                    <Option value={2}>全款</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={6} sm={24}>
              <FormItem label="客户评级">
                {getFieldDecorator('credit')(
                  <Select placeholder="">
                    <Option value={0}>A</Option>
                    <Option value={1}>B</Option>
                    <Option value={2}>C</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col md={6} sm={24}>
              <FormItem label="备注">
                {getFieldDecorator('comment')(<Input placeholder="请输入" />)}
              </FormItem>
            </Col> */}
            <Col md={6} sm={24}>
          
              <div style={{ overflow: 'hidden' }}>
                <span style={{ float: 'right', marginBottom: 24 }}>
                  <Button type="primary" htmlType="submit">
                      查询
                  </Button>
                  <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                      重置
                  </Button>
                
                </span>
              </div>
            </Col>
          </Row>
        </Form>
      );
    }
    
      
    render(){

     
       
        const {modalVisible,params,pickupVisible,pickupTmp} = this.state;
        const parentMethods = {
        handleAdd: this.handleAdd,
        handleModalVisible: this.handleModalVisible,
        };
        const parentMethodss = {
          handleModalVisibles: this.handleModalVisibles,
        };
        const pickupParentMethods = {
      
          CancelPickupModalVisible: this.CancelPickupModalVisible,
          handlonsubmit:this.handlonsubmit,
        };

        const panemap = this.state.panes;
        // panemap[0].content = (
        //   <div>
        //     <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>          
        //     <Table 
        //       pagination={false}
                
        //       dataSource={this.state.arr}
                
        //       columns={this.state.columns}
        //     />
        //   </div>

        // );
        
        
       
        return(
          <PageHeaderLayout title="预订单">
            <Card bordered={false}>
              <div className={styles.tableList}>
                
                <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
                <div className={styles.tableListOperator} />
                
                <Tabs
                  hideAdd
                  onChange={this.onChange}
                  activeKey={this.state.activeKey}
                  type="editable-card"
                  onEdit={this.onEdit}
                >
                  {panemap.map(pane => <TabPanes tab={pane.title} key={pane.key} closable={pane.closable}>{pane.content}</TabPanes>)}
                        
                </Tabs>
                
                <CreateForm {...parentMethods} modalVisible={modalVisible} params={params} />
                  
                <PrintTable
                  modalVisible={this.state.printingFlag}
                  dataList={this.state.printData}
                  {...parentMethodss}
                />
                <PickupForm {...pickupParentMethods} modalVisible={pickupVisible} pickupTmp={pickupTmp} />
              </div>
            </Card>
            
          </PageHeaderLayout>
        );
    }
    
  }