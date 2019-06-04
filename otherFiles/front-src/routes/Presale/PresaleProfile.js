import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
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
} from 'antd';
import FooterToolbar from 'components/FooterToolbar';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './PresaleProfile.less';
import TableTop from './TableTop';
import TableLeft from './TableLeft';
import PickUpTable from '../Pickup/PickUpTable';

import {  queryPresale, queryPresaleById, canChangePrice, queryProductids, updatePrease, getTrackStatusForId, pickupAgain, queryListClients, queryactualdetails, querycartnodetail, updatePresaledetail, querypaydetail, updatePickDetailIds, querysupplydictionry, queryErpClient, queryInquireBasic, queryProvince, addSale, queryGoodsBasicNoPaging, queryDeliveryWay } from '../../services/api';
import { getMyDate, trackiList, ismergeList } from '../../utils/utils';
import { getSupplyId } from '../../utils/sessionStorage';
import SaleTable from '../Pickup/SaleTable';
import SaleTop from '../Pickup/SaleTop';




const FormItem = Form.Item;
const { Option } = Select;


const TabPanes = Tabs.TabPane;

const takewayArr = ["自提","快递","物流","送货上门"];
const areaMap = new Map();
const takewayMap = new Map();
 const ischangepriceArr = ["否","是"];

     
  @connect(({ presale, loading }) => ({
    presale,
    loading: loading.models.presale,
  }))
  @Form.create()
  export default class OwnProfile extends PureComponent {
    state ={
      
      panes:[{key:"1"}],
      activeKey:'1',
      pageindex:1,
      pagesize:10,
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
            const params = 'terms[0].value=3&terms[0].column=type';
            querysupplydictionry(params).then(res => {
            if (res && res.status === 200) {
             
              const datas = res.result.data;
              datas.forEach(item => {
                areaMap.set(item.value, item.key);
                
              });
              queryDeliveryWay().then(wayres=>{
                if(wayres && wayres.status ===200){
                  const wayData =wayres.result.data;
                  wayData.forEach(item=>{
                    takewayMap.set(item.value,item.name);
                  })
                  this.setState({
                    custarr,
                  })
                  const terms =`terms[0].value=0&terms[0].column=type&pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
                  this.query(terms); 
                }
              })
              
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

    onSubmitSale = () => {
      const { validateFieldsAndScroll } = this.props.form;
      message.config({
        top: 100,
      });
      const hide = message.loading('正在提交...', 0);
      validateFieldsAndScroll((error, values) => {
        const inquiryid = this.state.inquiryId;
        const paramsData = {}; // 提交的数据
  
        paramsData.presale = values.tableTop[0].id;
        paramsData.takeway = values.tableTop[0].takeway;
        paramsData.trackid = values.tableTop[0].trackid;
        // 客户id公司
        paramsData.clientid = values.tableTop[0].clientid;
        paramsData.payway = values.tableTop[0].payway;
        paramsData.comment = values.tableTop[0].comment;
        paramsData.address= `${values.tableTop[2].provicelabel[0]}${values.tableTop[2].provicelabel[1]}${values.tableTop[2].provicelabel[2]===undefined?"":values.tableTop[2].provicelabel[2]}${values.tableTop[2].usrid}`;
        paramsData.shipreceiver = values.tableTop[2].shipreceiver;
        paramsData.shipphone = values.tableTop[2].shipphone;
        // paramsData.paystatus = values.tableTop[0].payment;
        paramsData.ismerge = values.tableTop[0].ismerge;
        paramsData.makedate = values.tableTop[0].createdate;
  
        paramsData.inquiryid = inquiryid;
        
        const detailData = values.saletable;
        // const pickupDetail = values.tableright;
        const pickupDetail = this.state.pickupDetails;
        const saleDetails = [];
        const valDetails = [];
        for (let i = 0; i < detailData.length; i += 1) {
          if (`${detailData[i].key}`.indexOf('concat') === -1) {
            saleDetails.push(detailData[i]);
          } else {
            valDetails.push(detailData[i]);
          }
        }
        const saleparams = [];
        for (let sa = 0; sa < saleDetails.length; sa += 1) {
          const detail = `${saleDetails[sa].pickdetail}`.split('  ');
          if (detail.length > 2) {
            detail.splice(detail.length - 1, 1);
            for (let a = 0; a < detail.length; a += 1) {
              const numbatchon = `${detail[a]}`.split(':');
              const batchnos = numbatchon[0];
              const nums = numbatchon[1];
              const saleDetail = {
                productid: saleDetails[sa].productid,
                usefor: saleDetails[sa].usefor,
                num: Number(nums),
                deliverydate: saleDetails[sa].deliverydate,
                sysuuid: saleDetails[sa].sysuuid,
                price: saleDetails[sa].price,
                comment: saleDetails[sa].comment,
                batchno: batchnos,
              };
  
              saleparams.push(saleDetail);
            }
          } else {
            const numbatchon = detail[0].split(':');
            const batchno = numbatchon[0];
            const nums = numbatchon[1];
            saleDetails[sa].batchno = batchno;
            saleDetails[sa].num = nums;
  
            saleparams.push(saleDetails[sa]);
          }
          
        }
        valDetails.forEach(item => {
          if (item.key === 'concat1') {
            // 整件数
            paramsData.piece = item.picknum;
          }
          //  else if (item.key === 'concat2') {
          //   // 零散个数
          //   paramsData.num = item.picknum;
          // } 
          else if (item.key === 'concat3') {
            // 实际净重
            paramsData.num = item.picknum;
          } else if (item.key === 'concat4') {
            // 实际毛重
            paramsData.glossweight = item.picknum;
          } else if (item.key === 'concat5') {
            // 已支付额
            paramsData.pickwaste = item.picknum;
          } else if (item.key === 'concat6') {
            // 结款方式
            paramsData.payment = item.picknum;
          } else if (item.key === 'concat7') {
            // 贷款
            paramsData.goodpay = item.picknum;
          } else if (item.key === 'concat8') {
            // 运费
            paramsData.shippay = item.picknum;
          } else if (item.key === 'concat9') {
            // 保险
            paramsData.securepay = item.picknum;
          } else if (item.key === 'concat10') {
            // 应付合计
            paramsData.needpay = item.picknum;
          }
          else if (item.key === 'concat13') {
            // 发票
            paramsData.taxmoney = item.picknum;
          }
        });
        const pickidList = [];
        for (let a = 0; a < pickupDetail.length; a++) {
          if(pickupDetail[a].uuid!=="" && pickupDetail[a].uuid!==undefined){
            pickidList.push(pickupDetail[a].uuid);
          }
       
        } 
       
        paramsData.num = parseFloat(paramsData.num);
        paramsData.details = saleparams;
       
        const saleData = {
          sale: paramsData,
          pickids: pickidList,
        };
        const presaleData = {
          id:values.tableTop[0].id,
          address:paramsData.address,
          shipreceiver:paramsData.shipreceiver,
          shipphone:paramsData.shipphone,
        }
        addSale(saleData).then(resa => {
          setTimeout(hide, 100);
          if (resa && resa.status === 200) {
            updatePrease(presaleData).then(preres=>{
              if (preres && preres.status === 200) {

                message.success('成功');
                this.props.dispatch(routerRedux.push('/order/sale'));
                //  this.query();
                //  this.setState({
                //    activeKey:'1',
                //  })
              } else {
                message.error('提交失败');
              }
            });
          } 
        });
      });
    };
    query =(terms)=>{
        
        queryPresale(terms).then((response)=>{
            if(response && response.status===200){
              const arr = response.result.data;
              const trackids = [];
              const userList =[];
              
              for(let i =0;i< arr.length;i+=1){
                if(`${arr[i].clientid}`.indexOf(":")===-1 &&userList.indexOf(arr[i].clientid)===-1){
                  userList.push(arr[i].clientid);
                }
                trackids.push(arr[i].trackid);
              }
             
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
                    trackData.reverse((a,b)=>a.buildtime < b.buildtime);
                    resultmap.set(key,trackData[0].type);
                    trackmap.set(key,trackData);
                  }
                 
                }
                for(let z =0;z< arr.length;z+=1){
                  arr[z].key= `presaleAll${z}`;
                  arr[z].status = resultmap.get(arr[z].trackid);
                  arr[z].takewayname = takewayMap.get(`${arr[z].takeway}`);
                }
                if(userList.length===0){
                  userList.push(null);
                }
                
                queryListClients(userList).then(cres=>{
                  if(cres && cres.status === 200){
                    const userData = cres.result;
                    for (let i = 0; i < arr.length; i += 1) {
                      
                      if(`${arr[i].clientid}`.indexOf(":")===-1){
                        arr[i].clientids = arr[i].clientid;
                        arr[i].clientid = userData[arr[i].clientid];
                        
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
                      title: '预售单编号',
                      dataIndex: 'id',
                      key: 'id',
                      
                    render:(val,record)=>{return <a onClick={e=>this.hadl(e,val,record)}>{val}</a>},
                    }, {
                      title: '客户',
                      dataIndex: 'clientid',
                      key: 'clientid',
                    },
                    //  {

                    //   title: '最迟货期',
                    //   dataIndex: 'deliverydate',
                    //   key: 'deliverydate',
                    // },
                     {
                      title: '时间 ',
                      dataIndex: 'makedate',
                      key: 'makedate',
                      render:val=>getMyDate(val),
                    }, {
                      title: '备注',
                      dataIndex: 'comment',
                      key: 'comment',
                    },{
                      title: '改价',
                      dataIndex: 'ischangeprice',
                      key: 'ischangeprice',
                     
                      render(val) {
                        return <span >{ischangepriceArr[val]}</span>;
                      },
                    } ,{
                      title: '取货方式',
                      dataIndex: 'takewayname',
                      key: 'takewayname',
                    },
                    {
                      title: '状态',
                      dataIndex: 'ismerge',
                      key: 'ismerge',
                     
                      render(val) {
                        return <span >{ismergeList[val]}</span>;
                      },
                    },
                    //  {
                    //   title: '数量（Kg）',
                    //   dataIndex: 'num',
                    //   key: 'num',
                    // }, {
                    //   title: '金额',
                    //   dataIndex: 'price',
                    //   key: 'price',
                    //   render:val=>val===undefined?`￥ 0`:`￥ ${val}`,
                    // },
                     {
                      title: '跟踪状态',
                      dataIndex: 'status',
                      key: 'status',
                     
                      render(val) {
                        return <span >{trackiList[val]}</span>;
                      },
                    }];
                    
                    this.setState({
                      pagination,
                      arr,
                      trackmap,
                      
                    },()=>{
                      const panes1 = {
                        title:'预售单列表',
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
                        })
                    
                    })

                  }
                });
                
                
              }
            })
            
             // const arr =dataTop;
            
    
    
    
         
          }
          })
    }
    handleStandardTableChange = pagination => {
      const { form } = this.props;
      form.validateFields((err,feildvalues) => {
        if (err) return;
        const params = feildvalues;
        params.type = 0;
        this.setState({
          pageindex : pagination.current,
          pagesize : pagination.pageSize,
        })
        const values = this.createTerms(params, pagination.current-1,pagination.pageSize);
       // const terms = `terms[0].value=0&terms[0].column=type&pageSize=${pagination.pageSize}&pageIndex=${pagination.current-1}`
        this.query(values);
        
      });
    }

    createTerms = (obj, pageIndex = 1, pageSize = 12) => {
      let i = 0;
      let params = `pageIndex=${pageIndex}&pageSize=${pageSize}&&sorts[0].name=id&sorts[0].order=desc`;
      Object.keys(obj).forEach(key => {
        if(obj[key]!==undefined){
          params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=${key}`;
        i += 1;
        }
        
      });
  
      return params;
    };
    updatePresale =(values)=>{
      
      const pretarmap = values.tableLeft[values.tableLeft.length-1];
    
      values.tableLeft.splice(values.tableLeft.length-1, 1);
      const dataleft = values.tableLeft;
      const pickupdetail  = values.tableright;
      const detailData =[];
      const summaryData = [];
      
      const updatedata = [];
      const updateMap = new Map();
      for(let s =0;s<dataleft.length;s++){
         if(dataleft[s].key.indexOf("concat")===-1){
          if(dataleft[s].updatenum !== 0){
            updatedata.push(dataleft[s].productid);
            detailData.push(dataleft[s]); 
          }
           
           
         }else{
           summaryData.push(dataleft[s]);
         }
         
      }
      if(pretarmap.size !== undefined && pretarmap.size !== 0 ){
        for (const item of pretarmap.keys()) {
         
          const pickarr = pretarmap.get(item);
      
          
        
            
              pickarr.forEach(it=>{
                if(updatedata.indexOf(it.productid) >-1){
                  updateMap.set(it.goodentryids,it.output);
                }
               
               
              })
            
         
          
          
        }
        for(let s =0;s<detailData.length;s++){
            for(let z =0;z<pickupdetail.length;z++){
              if(detailData[s].productid === pickupdetail[z].productid){
                
                if(updateMap.get(pickupdetail[z].goodentryids)){
                  detailData[s].pickdetailid = pickupdetail[z].id;
                  detailData[s].detailnum = updateMap.get(pickupdetail[z].goodentryids);
                 
                }else{
                  detailData[s].detailnum =null;
                }
              }
            }
            updatePresaledetail(detailData[s]).then(res=>{ 
              if(res && res.status===200){
                message.success("提交成功！");
              }
            });
          
          
        }
      }

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
         params.details =detailData;
         
          updatePrease(params).then(res=>{ 
            if(res && res.status ===200){
               message.success("修改价格成功！");
            }
          })
          
        
    }
    generalSum=(dataSale)=>{
      const newData1 = dataSale;
      // let spotnum =0;
       const Despotnum=dataSale.pickwaste===undefined?0:dataSale.pickwaste;
   
        let Goodspotnum= 0;
    
        let needpay = 0;
        
        
        newData1.forEach(item=>{
    
         
          // 计算数量
          
          // spotnum += Number(item.picknum===undefined?0:item.picknum);
          
    
    
    
          // 计算贷款
    
          
          Goodspotnum += Number(item.picknum===undefined?0:item.picknum)* Number(item.price===undefined?0:item.price);
           
        });
         
        
       const amount  =Goodspotnum+Despotnum+dataSale.shippay+dataSale.securepay;
        needpay  =Goodspotnum+dataSale.shippay+dataSale.securepay;
        const numVal = {Goodspotnum,amount,needpay};// 货款，总金额，欠余
        return numVal;
    }   

    pickupToSale(tabletop, tableleft, tableright, tag) {
      // 生成销售单
      if (tableright === undefined) {
        message.error('请选择拣货单！');
        return;
      }
      const tablelefts = tableleft;
      const dataSale = [];
      const sumleft = [];
     
      const tableTop = tabletop;
      tableTop[0].userids = tabletop[0].clientid;// 中文名
      tableTop[0].clientid = tabletop[0].clientids;// id
      const pickupDetail = [];
      const salepickup = [];// 已经生成的拣货单
      for (let a = 0; a < tableright.length; a+=1) {
        if(tableright[a].saleid !== undefined){
          salepickup.push(tableright[a]);
        }
        if (tableright[a].status === 0 && tableright[a].ok === 1 && tableright[a].saleid === undefined) {// 状态为正常，审核为审核通过
          pickupDetail.push(tableright[a]);
        }
      }
      if(salepickup.length === tableright.length){
        message.warning("已经全部生成销售单");
        return;
      }
      if(pickupDetail.length === 0){
        message.warning("没有正常完成的拣货单无法生成销售单",4);
        return;
      }
      for(let i=0;i<tablelefts.length;i+=1){
        if(i !== tablelefts.length-1 && tablelefts[i].id !== ""){
          tablelefts[i].key = `salekey_${i}`;
          dataSale.push(tablelefts[i]);
        }else 
        if(tablelefts[i].id === "" && i !== tablelefts.length-1 ){
          sumleft.push(tablelefts[i]);
        }
      }
      const actSaleData = [];// 实际生成销售单的明细
      
      let goodpays = 0;// 总货款
      let pieces = 0;// 总件数
      let nums = 0;// 总个数
      let weights = 0;// 总净重
      let glossweights =0;// 总毛重
      for(let i=0;i<dataSale.length;i+=1){
        let pickdetails = "";
        let picknums =0;
        dataSale[i].flag = false;// 判断销售产品明细是否有正常完成拣货的产品，缸号
        for(let z=0;z<pickupDetail.length;z+=1){
          if(pickupDetail[z].productid === dataSale[i].productid){
            dataSale[i].flag = true;
            pickdetails += `${pickupDetail[z].batchno}:${pickupDetail[z].weight} `;
            picknums +=  Number(pickupDetail[z].weight);
            pieces += pickupDetail[z].piece;
            nums += pickupDetail[z].num;
            glossweights +=Number(pickupDetail[z].glossweight);
            weights+=  Number(pickupDetail[z].weight);
          }
        }
        if(dataSale[i].flag){
          const vail ={
            picknum :picknums.toFixed(2),
            pickdetail:pickdetails,
            product01Entity:{
              colorname :dataSale[i].product01Entity.colorname,
              kindname :dataSale[i].product01Entity.kindname,
              picture :dataSale[i].product01Entity.picture,
              productid :dataSale[i].product01Entity.productid,
              productname :dataSale[i].product01Entity.productname,
              seriesname :dataSale[i].product01Entity.seriesname,
            },
            productid :dataSale[i].productid,
            attributetype :dataSale[i].attributetype,
            comment :dataSale[i].comment,
            completestatus :dataSale[i].completestatus,
            deliverydate :dataSale[i].deliverydate,
            presaleid :dataSale[i].presaleid,
            status :dataSale[i].status,
            usefor :dataSale[i].usefor,
            id :dataSale[i].id,
            key :dataSale[i].key,
            price :dataSale[i].price,
            money:(picknums*dataSale[i].price).toFixed(2),
          }
          goodpays += parseFloat((picknums*dataSale[i].price).toFixed(2));
          actSaleData.push(vail);
          
        }
        
      }
      actSaleData.goodpay =parseFloat(goodpays.toFixed(2));
      actSaleData.piece = pieces;
      actSaleData.num = nums;
      actSaleData.glossweight = glossweights.toFixed(2);
      actSaleData.weight = weights.toFixed(2);
      
      const paness = this.state.panes;
      const activeKey = `${paness.length + 1}`;
  
      const presaleId = tabletop[0].id;
  
      let inquiryId = '';
      // 查询预售单，获取到货款，运费，保险
      queryPresaleById(presaleId).then(response => {
        if (response && response.status === 200) {
          const data = response.result;
          actSaleData.shippay = data.shippay === undefined ? 38 : data.shippay;
          actSaleData.securepay = data.securepay === undefined ? 42 : data.securepay;
          actSaleData.pickwaste = data.pickwaste;
          actSaleData.payment = data.payment;
          if(data.taxrate===undefined){
            data.taxrate =0;
          }
          actSaleData.taxratenum = parseFloat((goodpays * data.taxrate).toFixed(2));
          inquiryId = data.inquiryid;
          pickupDetail.tag = tag; // 选择框取消的标识
          queryInquireBasic(inquiryId).then(iqres=>{// 询价拿出地址
            if(iqres && iqres.status === 200){
              const inquiryData = iqres.result;
              actSaleData.trackData =this.state.trackData;
              tableTop[0].provice = [inquiryData.codeP,inquiryData.codeC,inquiryData.codeA==="undefined"?"":inquiryData.codeA];
              const proparams = `paging=false&terms[0].value=${inquiryData.codeP}&terms[0].column=codeP`;
              queryProvince(proparams).then(pres =>{
                
                if(pres && pres.status === 200){
                  let provicename ="";
                let cityname ="";
                let areaname = "";
                  const provicelist = pres.result.data[0].children;
                    provicename = pres.result.data[0].name;
                  for(let i =0;i<provicelist.length;i+=1){
                    if(provicelist[i].codeC === inquiryData.codeC){
                        cityname = provicelist[i].name;
                      if(inquiryData.codeA!=="undefined"){
                        const arealist = provicelist[i].areas;
                        for(let j=0;j<arealist.length;j+=1){
                          if(inquiryData.codeA === arealist[j].codeA){
                            areaname = arealist[j].name;
                            break;
                          }
                          
                        }
                      }
                    }
                  }
                  tableTop[0].address = `${tableTop[0].address}`.substring(`${provicename}${cityname}${areaname}`.length);
                  
                  tableTop[0].provicelabel = [provicename,cityname,areaname];
                  const payParmas = `terms[0].value=${presaleId}&terms[0].column=presaleid&terms[1].value=1&terms[1].column=validstatus&terms[2].value=0&terms[2].column=cancelstatus&terms[3].value=4&terms[3].column=contenttype&terms[3].termType=not`;
              querypaydetail(payParmas).then(payres => {
                if (payres && payres.status === 200) {
                  const payData = payres.result.data;
                  let paynum = 0;
                  if (payData.length > 0) {
                    payData.forEach(item => {
                      paynum += item.amount;
                    });
                  }
                  actSaleData.pickwaste = paynum;
                  actSaleData.needpay = (actSaleData.goodpay+actSaleData.shippay+actSaleData.securepay+actSaleData.taxratenum).toFixed(2);
                  actSaleData.oweneedpay = (actSaleData.goodpay+actSaleData.shippay+actSaleData.securepay-paynum+actSaleData.taxratenum).toFixed(2);
                }
                const { getFieldDecorator } = this.props.form;
                console.log("tableTop",tableTop);
                paness.push({
                  title: '销售单明细',
                  content: (
                    <Form onSubmit={this.onSubmitSale} layout="vertical" hideRequiredMark>
                      <div>
                        {getFieldDecorator('tableTop', {})(<SaleTop dataSource={tableTop} />)}
      
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                          <div style={{ width: 1450 }}>
                            <div style={{ width: 800, float: 'left' }}>
                              {getFieldDecorator('saletable', {})(<SaleTable dataSource={actSaleData} />)}
                            </div>
                            <div style={{ width: 500, float: 'right' }}>
                              {getFieldDecorator('pickupDetail', {})(
                                <PickUpTable dataSource={pickupDetail} />
                              )}
                            </div>
                          </div>
      
                          <div>
                            <FooterToolbar style={{ width: this.state.width }}>
                              <Button type="primary" onClick={this.onSubmitSale}>
                                提交
                              </Button>
                            </FooterToolbar>
                          </div>
                        </div>
                      </div>
                    </Form>
                  ),
                  key: activeKey,
                });
                this.setState({ panes: paness, activeKey, inquiryId,pickupDetails:pickupDetail });
              });
                }
              });
             
            }
  
          })
  
          
        }
      });
    }
    createSale(values,tag){
      
      if(values.tableright === undefined){
        message.error("请选择拣货单！");
        return;
      }
      const tablerights = values.tableright;
      const pickupDetail = [];
    for (let a = 0; a < tablerights.length; a+=1) {
      if (tablerights[a].status === 0 && tablerights[a].ok === 1) {// 状态为正常，审核为审核通过
        pickupDetail.push(tablerights[a]);
      }
    }
    if(pickupDetail.length === 0){
      message.warning("没有正常完成的拣货单无法生成销售单",4);
      return;
    }
      const tablelefts = values.tableLeft;
      const dataleft = [];
      const sumleft = [];
      for(let i=0;i<tablelefts.length;i+=1){
        if(i !== tablelefts.length-1 && tablelefts[i].id !== ""){
          tablelefts[i].key = `salekey_${i}`;
          dataleft.push(tablelefts[i]);
        }else 
        if(tablelefts[i].id === "" && i !== tablelefts.length-1 ){
          sumleft.push(tablelefts[i]);
        }
      }
   
      const dataSale = dataleft;
      const tabletop =values.tableTop;
    
     tabletop[0].userids = tabletop[0].clientid;// 中文名
     tabletop[0].clientid = tabletop[0].clientids;// id
     console.log("tabletop",tabletop[0]);
      const paness = this.state.panes;
      const activeKey =`${paness.length+1}`;
     
      const presaleId = tabletop[0].id;
      
      
      // 查询预售单，获取到货款，运费，保险
      queryPresaleById(presaleId).then(response=>{
        if(response && response.status===200){
          const data = response.result;
          // dataSale.shippay = data.shippay===undefined?38:data.shippay;
          // dataSale.securepay = data.securepay===undefined?42:data.securepay;
          // dataSale.pickwaste = data.pickwaste;
          // dataSale.payment = data.payment;
        const  inquiryId = data.inquiryid;
         
          // 赋值总结
          dataSale.pickwaste = sumleft[1].picknum;
          dataSale.payment = sumleft[2].picknum;
          dataSale.goodpay = sumleft[3].picknum;
          dataSale.shippay = sumleft[4].picknum;
          dataSale.securepay = sumleft[5].picknum;
          dataSale.needpay = sumleft[6].picknum;
          dataSale.needpay = sumleft[7].picknum;
          dataSale.trackstatus = sumleft[8].picknum;

          // 整件数，零散个数，毛重，净重
          let piece = 0;
          let scattered =0;
          let weight=0.00;
          let gw = 0.00;
          for(let z=0;z<pickupDetail.length;z+=1){
            piece +=pickupDetail[z].piece;
            scattered +=pickupDetail[z].num;
            weight +=pickupDetail[z].weight;
            gw +=pickupDetail[z].glossweight;
          }
          dataSale.piece =piece;
          dataSale.num = scattered;
          dataSale.weight = parseFloat(weight).toFixed(2);
          dataSale.glossweight = parseFloat(gw).toFixed(2);

        // const numval =   this.generalSum(dataSale);
        
        // dataSale.goodpay =   Number(numval.Goodspotnum).toFixed(4);
        // dataSale.amount = Number(numval.amount).toFixed(4);
        // dataSale.needpay = Number(numval.needpay).toFixed(4);
        pickupDetail.tag = tag;// 选择框取消的标识
        queryInquireBasic(inquiryId).then(iqres=>{// 询价拿出地址 
          if(iqres && iqres.status === 200){
            const inquiryData = iqres.result;
            tabletop[0].provice = [inquiryData.codeP,inquiryData.codeC,inquiryData.codeA==="undefined"?"":inquiryData.codeA];
            const proparams = `paging=false&terms[0].value=${inquiryData.codeP}&terms[0].column=codeP`;
            queryProvince(proparams).then(pres =>{
              
              if(pres && pres.status === 200){
                let provicename ="";
              let cityname ="";
              let areaname = "";
                const provicelist = pres.result.data[0].children;
                  provicename = pres.result.data[0].name;
                for(let i =0;i<provicelist.length;i+=1){
                  if(provicelist[i].codeC === inquiryData.codeC){
                      cityname = provicelist[i].name;
                    if(inquiryData.codeA!=="undefined"){
                      const arealist = provicelist[i].areas;
                      for(let j=0;j<arealist.length;j+=1){
                        if(inquiryData.codeA === arealist[j].codeA){
                          areaname = arealist[j].name;
                          break;
                        }
                        
                      }
                    }
                  }
                }
                tabletop[0].address = `${tabletop[0].address}`.substring(`${provicename}${cityname}${areaname}`.length);
                
                tabletop[0].provicelabel = [provicename,cityname,areaname];
                const payParmas = `terms[0].value=${presaleId}&terms[0].column=presaleid&terms[1].value=1&terms[1].column=validstatus&terms[2].value=0&terms[2].column=cancelstatus&terms[3].value=4&terms[3].column=contenttype&terms[3].termType=not`;
                querypaydetail(payParmas).then(payres=>{
                  if(payres && payres.status === 200){
                    const payData = payres.result.data;
                    let paynum =0;
                    if(payData.length >0){
                      payData.forEach(item=>{
                        paynum += item.amount;
                      })
                    }
                    dataSale.pickwaste = paynum;
                    const {getFieldDecorator} =this.props.form;
                 
                  paness.push({ title: '销售单明细', content: (
                    <Form onSubmit={this.onSubmitSale} layout="vertical" hideRequiredMark>
                      <div >
                        {getFieldDecorator('tableTop', {
                                
                                },)(<SaleTop dataSource={tabletop} />)}
                      
                        <div style={{width:"100%",overflowX: "auto"}}>
                          <div style={{width:1450}}>
                            <div style={{width:800,float:"left"}}>
                              {getFieldDecorator('saletable', {
                                  
                                  },)(<SaleTable
                                    dataSource={dataSale} 
                                  />)}
                            </div>
                            <div style={{width:500,float:"right"}}>
                              {getFieldDecorator('pickupDetail', {
                                  
                                  },)(<PickUpTable
                                    dataSource={pickupDetail} 
                                  />)}
                            </div>  
                          </div> 
                          
                          <div>
                            
                            <FooterToolbar style={{ width: this.state.width }}>
                            
                              <Button type="primary" onClick={this.onSubmitSale}>
                                提交
                              </Button>
                              
                            </FooterToolbar>
                          </div>
                        </div>
                      </div>
                    </Form> 
                  ), key: activeKey });
                  this.setState({ panes:paness, activeKey ,pickupDetails:pickupDetail});
                  }
                  
                });
             
              }
            })
          }
        });
       
      
      
    }
    })
    }
    
    validate = (e,tag,flag) => {
        const { validateFieldsAndScroll } = this.props.form;
        message.config({
          top: 100,
        });
        const  hide = message.loading('正在提交...', 0);
        validateFieldsAndScroll((error, values) => {

          
           if(tag === 1 && flag === true){// 修改价格
            setTimeout(hide, 100);
            this.updatePrice(error,values);
           }else if(tag ===1 && flag === false){// 修改价格
            setTimeout(hide, 100);
              message.error("您没有权限");
           }else if(tag ===2){// 修改预售单详情

            setTimeout(hide,100);
            this.updatePresale(values);
           }else if(tag === 4){// 生成销售单
              this.pickupToSale(values.tableTop, values.tableLeft, values.tableright, tag);
              
              setTimeout(hide,100);
           }
           
           else if(tag === 3){
            const paramData ={
              details:[],
             };
             const againdata = [];
           const pretarmap = values.tableLeft[values.tableLeft.length-1];
           const datalefts = values.tableLeft;
           const dataleft = [];
           for(let i=0;i<datalefts.length;i+=1){
             if(i !== datalefts.length-1){
               dataleft.push(datalefts[i]);
             }
           }
          
           const pickupList =this.state.yichangPickup;// 右侧拣货单明细
           const detailData = [];// 需要重新拣货产品明细
           const errPickupIdS = [];
           const pickupData = values.tableTop[0].pickups;// 拣货单 
           for(let s =0;s<dataleft.length;s++){
            if(dataleft[s].key.indexOf("concat")===-1){
             if(dataleft[s].againnum !== 0){
              againdata.push(dataleft[s].productid);
               detailData.push(dataleft[s]); 
             }
              
              
            }
            
         }
         for(let p=0;p<pickupList.length;p+=1){
          if(pickupList[p].status ===1&&againdata.indexOf(pickupList[p].productid)>-1){
           
            errPickupIdS.push(pickupList[p].id);
          }
          
        }
        let makeids = "";
        pickupData.forEach(item=>{
          if(item.recordstatus === 4){
            makeids = item.makeid;
          }
        })
            const pickupdata =[];
            const productidset = new Set();
            
            if(pretarmap.size !== undefined&& pretarmap.size!==0){               
                for (const item of pretarmap.keys()) {// 遍历map
                  
                const pickarr = pretarmap.get(item).map(items => ({ ...items }));
               // 遍历出来的map ，生成库存明细数组 ，set所有的productId
               
                for(let it =0;it<pickarr.length;it++){
                  if(againdata.indexOf(pickarr[it].productid)>-1){
                    const demo={
                      picknum:pickarr[it].output,
                      goodentryids:pickarr[it].id,
                      batchno:pickarr[it].batchno,
                      productid:pickarr[it].productid,
                      batchnostatus:pickarr[it].batchnostatus,
                      area:pickarr[it].area,
                      location:pickarr[it].locations,
                      }
                      
                      pickupdata.push(demo);
                      productidset.add(pickarr[it].productid);
                  }
                    

                }
                
                paramData.clientid = values.tableTop[0].clientids;
                paramData.supplyid = getSupplyId();  
                paramData.makeid =makeids;
                paramData.details=pickupdata;// 拣货明细
                paramData.presaleid = values.tableTop[0].id;
                paramData.status = values.tableTop[0].ismerge;// 状态
                paramData.takingway = values.tableTop[0].takeway;// 取货方式
                paramData.payment = values.tableTop[0].payway;// 结款方式
                paramData.invoiceid = values.tableTop[0].id;// 单号


              
            
            
            }
            pickupAgain(paramData).then(res=>{
              setTimeout(hide, 100);
              if(res && res.status === 200){
                message.success("提交成功！");
                updatePickDetailIds(errPickupIdS).then(errRes=>{
                 
                  if(errRes && errRes.status ===200){
                    this.props.dispatch(routerRedux.push('/order/pickup')); 
                  }
                });
                
              }else if(res &&res.status === 500){
                message.error("提交失败！");

              }else if(res &&res.status === 404){
                message.error("已经提交拣货单，不需要再提交！");
              }
            })
            
        }else{
          setTimeout(hide, 100);
            message.error("请选择库存");
        }
        }
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
       let terms = `pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc&terms[0].value=0&terms[0].column=type`;
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
      message.config({
        top: 100,
      });
      const  hide = message.loading('正在读取...', 0);
      const paness = this.state.panes;
      const {getFieldDecorator} = this.props.form;
      const productids = [];
      const params = `${val}`;
      let changeTag = false;
      const rightData =[];// 拣货明细
      let saleTag = false;// 已有拣货单生成销售单的标记
      const pickupDetailId = [];
      
          queryPresaleById(params).then((response)=>{
            if(response && response.status ===200){ 
             const dataTop=[];
              dataTop.push(response.result);
              dataTop[0].takewayname = record.takewayname;
              for(let i =0;i< dataTop.length;i+=1){
                dataTop[i].key= `presaleTop${i}`;
                dataTop[i].clientids = record.clientids;
                dataTop[i].clientid = record.clientid;
              }
             const dataLeft = response.result.details;
             const pickupList = response.result.pickups;// 下发的拣货单(可能存在多个)
             dataLeft.payment = response.result.payment;
             dataLeft.goodpay = response.result.goodpay;
             dataLeft.pickwaste = response.result.pickwaste;
             dataLeft.shippay = response.result.shippay;
             dataLeft.taxrate = response.result.taxrate;
             dataLeft.taxratenum = parseFloat((dataLeft.goodpay*dataLeft.taxrate).toFixed(2));
             dataLeft.securepay = response.result.securepay;
             dataLeft.needpay = (dataLeft.shippay+dataLeft.goodpay+ dataLeft.securepay+dataLeft.taxratenum).toFixed(2);
             dataLeft.needpays = dataLeft.needpay - dataLeft.pickwaste;
             const sysuuidArr=[];
              if(dataLeft===undefined){
                message.error("没有数据");
                return;
              }
              
              for(let p =0;p<pickupList.length;p+=1){
                const detail = pickupList[p].details;
                for(let i =0;i< detail.length;i+=1){
                  detail[i].uuid = detail[i].sysuuid;
                  detail[i].recordstatus =pickupList[p].recordstatus;// 拣货单的状态（给修改数量的时候判断用）
                  detail[i].presaleid = pickupList[p].presaleid;
                  if(pickupList[p].saleid !== undefined){// 表示已经有拣货单生成销售单了
                    saleTag = true;
                  }
                  detail[i].saleid = pickupList[p].saleid;
                  detail[i].areas = areaMap.get(`${detail[i].area}`);
                  detail[i].piece = "";// 把整件数为空，这里的整件数是业务填写的整件数，rightData的piece是实际整件数
                  rightData.push(detail[i]);
                  pickupDetailId.push(detail[i].id);
                  
                }
                dataTop[0].makeid = pickupList[p].makeid;
               
              }
              canChangePrice(`clientid=${record.clientids}`).then((res)=>{
                if(res && res.status ===200){
              
                  // if(res.result === true && record.ischangeprice === 1 && record.status===5){
                  //     changeTag = true;
                  // }
                  if(res.result === true && saleTag === false){
                    changeTag = true;
                }
                
                }else if(res &&res.status === 403){
                  message.error(res.message);
                }
                for(let i =0;i< dataLeft.length;i+=1){
                  dataLeft[i].key= `presaleLeft${i}`;
                  dataLeft[i].changeTag = changeTag;
                  productids.push(dataLeft[i].productid);
                  
                }
                for(let i =0;i<rightData.length;i+=1){
                  if(sysuuidArr.indexOf(rightData[i].uuid)===-1){
                    sysuuidArr.push(rightData[i].uuid);
                  }else{
                    rightData[i].uuid = "";
                  }
                }
                queryProductids(productids).then((resn)=>{
                  if(resn && resn.status ===200){
                    const productData = resn.result;
                    const map =this.state.trackmap;;
                    const productmap = new Map();
                    dataLeft.trackData =map.get(record.trackid);
  
                      for(let z=0;z<dataLeft.length;z+=1){
                        for(let j = 0;j<productData.length;j+=1){
                          if(productData[j].id === dataLeft[z].productid){
                            const product01Entity ={
                            picture :productData[j].picture,
                            seriesname :productData[j].productseries.seriesname,
                            kindname :productData[j].productkind.kindname,
                            productname:productData[j].productname,
                            colorname : productData[j].colorname,
                            productid:productData[j].id, 
                            }
                            productmap.set(productData[j].id,productData[j]);
                            
                            
                            dataLeft[z].product01Entity = product01Entity;
                          }
                          
                      }
                    }
                    queryactualdetails(pickupDetailId).then(aresponse =>{
                      if(aresponse && aresponse.status ===200){
                        const aresult = aresponse.result;
                        const cartnos= [];
                        const cartnoMap = new Map();
                        if(aresult !== undefined){
                          aresult.forEach(item=>{
                            if(cartnos.indexOf(item.cartno)===-1){
                              cartnos.push(item.cartno);
                             
                            }
                            cartnoMap.set(item.cartno,item.pickdetailid);
                          });
                        }
                        
                      if(cartnos.length === 0){
                        cartnos.push(null);
                      }
                        querycartnodetail(cartnos).then(cresponse=>{
                          if(cresponse && cresponse.status === 200){
                            const cresult = cresponse.result;
                            let preces =0;// 整件数
                           // let nums = 0;// 零散个数
                            let glossweights = 0;// 毛重
                            let weights =0;// 净重
                            const pickNumMap = new Map();
                            if(cresult.length === 0){
                              for(let a =0;a<rightData.length;a+=1){
                                rightData[a].key = `rightData_${a}`;
                                rightData[a].colorname = productmap.get(rightData[a].productid).colorname;
                                rightData[a].productname = productmap.get(rightData[a].productid).productname;
                                rightData[a].flag= false;
                              }
                            }
                            for(let c =0;c <cresult.length;c+=1){// 总体的净重，毛重
  
                                if(cresult[c].parentcartno !== undefined){
                                 // nums += cresult[c].num;
                                  glossweights  += cresult[c].glossweight===undefined?0:cresult[c].glossweight;
                                  weights  += cresult[c].weight;
                                  
                                }else{
                                  preces += 1;
                                  glossweights  += cresult[c].glossweight===undefined?0:cresult[c].glossweight;
                                  weights  += cresult[c].weight;
                                }
                                for(let a =0;a<rightData.length;a+=1){
                                  rightData[a].key = `rightData_${a}`;
                                  rightData[a].colorname = productmap.get(rightData[a].productid).colorname;
                                    rightData[a].productname = productmap.get(rightData[a].productid).productname;
                                    
                                  if(rightData[a].id === cartnoMap.get(cresult[c].cartno)){ 
                                    rightData[a].flag= true;
                                    
                                    rightData[a].glossweight =Number(Number(rightData[a].glossweight===undefined?0:rightData[a].glossweight) + Number(cresult[c].glossweight)).toFixed(2);
                                    rightData[a].weight =Number(Number(rightData[a].weight===undefined?0:rightData[a].weight) + Number(cresult[c].weight)).toFixed(2);
                                    if(cresult[c].parentcartno === undefined){
                                      rightData[a].piece =(rightData[a].piece===""?0:rightData[a].piece) + 1;
                                      rightData[a].num = (rightData[a].num===undefined?0:rightData[a].num)+0;
                                    }else{
                                      rightData[a].piece = (rightData[a].piece===""?0:rightData[a].piece)+0;
                                      rightData[a].num = (rightData[a].num===undefined?0:rightData[a].num) + Number(cresult[c].num);;
                                    }
                                    
                                   
                                      pickNumMap.set(rightData[a].productid,rightData[a].weight);
                                  }else if(rightData[a].flag === undefined){
                                    rightData[a].flag= false;
                                  }
                                }
                                
                                
                            }
                            let sum =0;
                            const detailList = [];
                            for(let z=0;z<dataLeft.length;z+=1){
                              // 多个拣货明细拼接
                            let pickdetail = '';
                            let actualWeight = 0;
                            for (let ld = 0; ld < rightData.length; ld += 1) {
                              if (dataLeft[z].productid === rightData[ld].productid ) {
                                rightData[ld].changetype = 0;
                                detailList.push(rightData[ld].goodentryids);
                              //  rightData[ld].colorname = dataLeft[z].product01Entity.colorname;
                              //  rightData[ld].productname = dataLeft[z].product01Entity.productname;
                                if(rightData[ld].status !== 3 &&rightData[ld].status !== 1){
                                  pickdetail += `${rightData[ld].batchno}:${rightData[ld].weight===undefined?0:rightData[ld].weight}  `;
                                  actualWeight += Number(
                                    rightData[ld].weight 
                                  );
                                }
                               
                               
                                // actualWeight += Number(
                                //   actWeightsData[`${leftDetails[ld].id}`][
                                //     `${leftDetails[ld].batchno}`
                                //   ]
                                // );
                               // sum += parseFloat(rightData[ld].num);
                              }
                              
                            }
                          
                              dataLeft[z].pickdetail = pickdetail;
                              dataLeft[z].picknum = pickNumMap.get(dataLeft[z].productid);
                              sum += parseFloat(dataLeft[z].num);
                              dataLeft[z].againnum =0;
                              dataLeft[z].updatenum =0;
                          }
                           
                          let goodentryidsTerms = `terms[0].value=-1&terms[0].column=status&terms[1].column=id&terms[1].termType=in`;
                          detailList.forEach(item=>{
                            goodentryidsTerms += `&terms[1].value=${item}`;
                          });
                          queryGoodsBasicNoPaging(goodentryidsTerms).then(rs=>{
                            if(rs && rs.status===200){
                              const errList = res.result;
                              if(errList && errList.length >0){
                                errList.forEach(item=>{
                                  rightData.forEach(dataitem=>{
                                    if(item.id === dataitem.goodentryids){
                                      const tmp ={status:2};
                                      Object.assign(dataitem,tmp);
                                    }
                                  })
                                });
                              }
                              
                              dataLeft.piece =preces;
                            dataLeft.num =Number(sum).toFixed(2);
                            dataLeft.glossweight =Number(glossweights).toFixed(2);
                            dataLeft.weight =Number(weights).toFixed(2);
                          
                              if(paness.length === 1){
                               
                                const activeKey ='2';
                                paness.push({ title: '预售单详情', content: (
                                  <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
                                    <div >
                                      {getFieldDecorator('tableTop', {
                                              initialValue:dataTop,
                                              },)(<TableTop />)}
                                    
                                      <div style={{width:"100%",overflowX: "auto"}}>
                                        
                                          
                                        {getFieldDecorator('tableLeft', {
                                           
                                            },)(<TableLeft dataSource={dataLeft} />)}
                                        <div style={{width:500,display:'inline-block'}}>
                                          {getFieldDecorator('tableright', {
                                              
                                              },)(<PickUpTable 
                                                dataSource={rightData} 
                                              />)}
                                        </div>  
                                        <div>
                                          <FooterToolbar style={{ width: this.state.width }}>
                                            <Button type="primary" onClick={ea=>this.validate(ea,1,changeTag)}>
                                               修改价格
                                            </Button>
                                            {/* <Button type="primary" onClick={ea=>this.validate(ea,2)}>
                                               修改拣货单
                                            </Button> */}
                                            <Button type="primary" onClick={ea=>this.validate(ea,4)}>
                                              生成销售单
                                            </Button>
                                            
                                            <Button type="primary" onClick={es=>this.validate(es,3)}>
                                               生成拣货单
                                            </Button>
                      
                                          </FooterToolbar>
                                        </div>
                                      </div>
                                    </div>
                                  </Form> 
                                ), key: activeKey });
                                
                                this.setState({ panes:paness, activeKey,yichangPickup:rightData });
                                }else{
                                 
                                  this.setState({ activeKey:'2' });
                          
                                }
                                setTimeout(hide,100);
                            }
                          })
                           
                            
                            
                           
                              }
                            });
                          }
                        });
                    
                    
  
                    
  
                  }
                })
              });
              
            }
            
            
             
            
          })
        
  
      
     
      
      
    }
    
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
          <Form  layout="inline">
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
                    <Button type="primary" onClick={this.handleSearch}>
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

       
        

        const panemap = this.state.panes;
        
        
        
       
        return(
          <PageHeaderLayout title="预售单">
            <Card bordered={false}>
              <div className={styles.tableList}>
                
               
                <div className={styles.tableListOperator} />
                <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
                <Tabs
                  hideAdd
                  onChange={this.onChange}
                  activeKey={this.state.activeKey}
                  type="editable-card"
                  onEdit={this.onEdit}
                >
                
                  {panemap.map(pane => <TabPanes tab={pane.title} key={pane.key} closable={pane.closable}>{pane.content}</TabPanes>)}
                        
                </Tabs>
                
                   
                  
               
              </div>
            </Card>
            
          </PageHeaderLayout>
        );
    }
    
  }