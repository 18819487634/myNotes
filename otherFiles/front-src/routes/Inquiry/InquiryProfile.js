import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  
  Card,
  Form,
  message,
  Button,
  Table,
  Tabs,

} from 'antd';
import FooterToolbar from 'components/FooterToolbar';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './InquiryProfile.less';
import TableTop from './TableTop';
import TableLeft from './TableLeft';

import { queryInquire, queryInquireBasic, queryProductids, queryUserids, inquiryToSale, querySupply, queryListClients, queryPresale } from '../../services/api';
import { getMyDate, paywayList, recordstatusList } from '../../utils/utils';
import { getCurrentUser } from '../../utils/sessionStorage';





const TabPanes = Tabs.TabPane;
let inquiryList = {};
const takewayArr = ["自提","快递","物流","送货上门"];

let dataTop = [];
let dataLeft = [];




     
  @connect(({ inquiry, loading }) => ({
    inquiry,
    loading: loading.models.inquiry,
  }))
  @Form.create()
  export default class InquiryProfile extends PureComponent {
    state ={
      loading:false,
      data:[], 
      panes:[{key:"1"}],
      activeKey:'1',
      pageindex:1,
      pagesize:12,
      
    }
    
    componentDidMount() {
      
     
    const terms =`pageSize=12&pageIndex=0&sorts[0].name=id&sorts[0].order=desc`;
     this.query(terms);
      
  
      
    }
    
    
    onChange = (activeKey) => {
      
      this.setState({ activeKey });
    }
    onEdit = (targetKey, action) => {
      this[action](targetKey);
      
    }
     getType=(obj) =>{
      const type = Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1].toLowerCase();
      if(type === 'string' && typeof obj === 'object') return 'object'; // Let "new String('')" return 'object'
      if (obj === null) return 'null'; // PhantomJS has type "DOMWindow" for null
      if (obj === undefined) return 'undefined'; // PhantomJS has type "DOMWindow" for undefined
      return type;
    }
    query=(terms)=>{
      queryInquire(terms).then((response)=>{
        if(response && response.status===200){
          const arr = response.result.data;
          const userids = [];
          for(let i =0;i< arr.length;i+=1){
            arr[i].key= `inquiryAll${i}`;
            if(`${arr[i].usrid}`.indexOf(":")===-1 && userids.indexOf(arr[i].usrid)===-1){
              userids.push(arr[i].usrid);
            }
            
          }
       //  arr.reverse((a,b)=>a.makedate < b.makedate);
       if(userids.length===0){
        userids.push(null);
      }
       queryListClients(userids).then(lres=>{ 
        if(lres && lres.status === 200){
          const userData = lres.result;
          if(userData !== undefined){
            for (let i = 0; i < arr.length; i += 1) {
            
              if(`${arr[i].usrid}`.indexOf(":")===-1){
                arr[i].usrid = userData[arr[i].usrid];
              }
             
            }
          }
          const columns=[{
            title: '询价单编号',
            dataIndex: 'id',
            key: 'id',
            render:(val,recode)=>{
              if(recode.recordstatus === 1){
                return <span>{val}</span>
              }else{
            return(<a onClick={e=>this.hadl(e,val,recode)}>{val}</a>) 
           }
          },
          }, {
            title: '客户',
            dataIndex: 'usrid',
            key: 'usrid',
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
          }, {
            title: '取货方式',
            dataIndex: 'takeway',
            key: 'takeway',
            
            render(val) {
              return <span >{takewayArr[val]}</span>;
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
          //   render:val=> val ===undefined?`￥ 0`:`￥ ${val}`,
          // }, 
          {
            title: '状态',
            dataIndex: 'recordstatus',
            key: 'recordstatus',
            
            render(val) {
              return <span >{recordstatusList[val]}</span>;
            },
          }];
          inquiryList = arr;
          const pagination ={
            total: response.result.total,
            current:  this.state.pageindex,
            pageSize: this.state.pagesize,
            showTotal: () => {
              return `共${response.result.total}条`;
            },
            showQuickJumper: true,
          }
            this.setState({
              pagination,
              arr,
            },()=>{
              const panes1 = {
                title:'询价单列表',
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
      })
       



     
      }
      })
    }

    handleStandardTableChange = pagination => {
      const { form, dispatch } = this.props;
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        this.setState({
          pageindex : pagination.current,
          pagesize : pagination.pageSize,
        })
        const terms = `pageSize=${pagination.pageSize}&pageIndex=${pagination.current-1}&&sorts[0].name=id&sorts[0].order=desc`
        this.query(terms);
        // const values = {
        //   pageIndex: pagination.current - 1,
        //   pageSize: pagination.pageSize,
        //   supplyids: [getSupplyId()],
  
        //   ...fieldsValue,
        // };
        // values.supplierKind = 1;\
  
        
        // const values =this.createTerms(fieldsValue,pagination.current,pagination.pageSize);
       
        // dispatch({
        //   type: 'color/fetchColor',
        //   payload: values,
          
        // });
      });
    }
    
    validate = () => {
      const {validateFieldsAndScroll} =this.props.form;
      message.config({
        top: 100,
      });
      const  hide = message.loading('正在提交，请稍候...', 0);
      validateFieldsAndScroll((error, values) => {
      
      
       const pickupdata = [];
       const summaryData = [];
       const detailData = [];
       const Inquiry2Presale ={
        inquiry:{},
        pickup:{
          details:[],
        },
       };
       const productidset = new Set();
       const dataleft = values.tableLeft;
       const pretarmap = values.tableLeft[values.tableLeft.length-1];
       dataleft.splice(dataleft.length-1, 1);
      
       for(let e =0;e<dataleft.length;e++){
          if(dataleft[e].key.indexOf("concat")===-1){
            detailData.push(dataleft[e]); 
            
          }else{
            summaryData.push(dataleft[e]);
          }
          
       }
       
       if(this.getType(pretarmap)!=="map"){
        setTimeout(hide,100);
          message.error("请选择库存，满足相应的数量");
          return;
       }

       if(pretarmap.size!==0){     
                
        for (const item of pretarmap.keys()) {
          
          const pickarr = pretarmap.get(item).map(items => ({ ...items }));
          for(let pi =0;pi<pickarr.length;pi+=1){
            if(pickarr[pi].output > pickarr[pi].remainnum){
              setTimeout(hide,100);
              message.error(`${pickarr[pi].batchno}的库存不足，请重新选择`);
              
              return;
            }
            const demo={
              picknum:pickarr[pi].output,
              goodentryids:pickarr[pi].id,
              batchno:pickarr[pi].batchno,
              productid:pickarr[pi].productid,
              
              
            }
            pickupdata.push(demo);
            productidset.add(pickarr[pi].productid);
          }
          
          
        }
        
       }
       let parmas = "";
       let errView = "";
       if(productidset.size >0){
        productidset.forEach(i=>{
          if(productidset.szie===0){
            parmas += `terms[0].value=${i}`;
          }else{
            parmas += `&terms[0].value=${i}`;
          }
        });
        this.props.dispatch({
          type:'inquiry/fetchGoodsDetail',
          payload:`terms[0].column=productid&terms[0].termType=in${parmas}`,
          callback: (response) => {
            if(response && response.status === 200){
              const result = response.result.data;
              result.forEach(rItem=>{
                pickupdata.forEach(pItem=>{
                    if(rItem.productid === pItem.productid&&rItem.id === pItem.goodentryids && rItem.remainnum < pItem.picknum  ){
                      errView +=`${pItem.batchno} `;
                    }
                    
                    
                })
                
              });
              
              if(errView!==""){
                setTimeout(hide,100);
                message.error(`您所选的缸号${errView}库存不够，请重新选择`,5); 
                return;
              }

              this.submitHadl(values,summaryData,Inquiry2Presale,detailData,pickupdata,hide);




            }
          },
        });
      
      
      
      }else{
        this.submitHadl(values,summaryData,Inquiry2Presale,detailData,pickupdata,hide);
      };
       
     
       
      });
    };


    submitHadl=(values,summaryData,Inquiry2Presale,detailData,pickupdata,hide)=>{
      const Inquiry2Presales = Inquiry2Presale;
      const inquiry = {
        id:values.tableTop[0].id,
        paystatus:values.tableTop[0].paystatus,
        contenttype:values.tableTop[0].contenttype,
        address:values.tableTop[0].address,
        comment:values.tableTop[0].comment,
      };
                  
                     summaryData.forEach(item=>{
                        if(item.key==="concat5"){// 货款
                          inquiry.goodpayOwn = item.ownnum;
                          inquiry.goodpayAgent = item.transnum;
                          inquiry.goodpayYarn = item.rawyarnnum;
                          inquiry.goodpaySpot = item.spotnum;
                        }else 
                        if(item.key === "concat6"){// 运费
                          inquiry.shippayOwn = item.ownnum;
                          inquiry.shippayAgent = item.transnum;
                          inquiry.shippayYarn = item.rawyarnnum;
                          inquiry.shippaySpot = item.spotnum;

                        }else 
                        if(item.key === "concat7"){// 保险
                          inquiry.securepayOwn = item.ownnum;
                          inquiry.securepayAgent = item.transnum;
                          inquiry.securepayYarn = item.rawyarnnum;
                          inquiry.securepaySpot = item.spotnum;

                        }else 
                        if(item.key === "concat4"){// 结款方式
                          inquiry.paywayOwn = item.ownnum;
                          inquiry.paywayAgent = item.transnum;
                          inquiry.paywayYarn = item.rawyarnnum;
                          inquiry.paywaySpot = item.spotnum;

                        }
                        else 
                        if(item.key === "concat3"){// 定金/拣货费
                          inquiry.pickpayOwn = parseFloat(item.ownnum);
                          inquiry.pickpayAgent =parseFloat(item.transnum);
                          inquiry.pickpayYarn =parseFloat(item.rawyarnnum);
                          inquiry.pickpaySpot = parseFloat(item.spotnum);

                        }
                        else if(item.key === "concat2"){// 付款比例
                          inquiry.paypercentOwn = item.ownnum;
                          inquiry.paypercentAgent = item.transnum;
                          inquiry.paypercentYarn = item.rawyarnnum;
                          inquiry.paypercentSpot = item.spotnum;

                        }
                        
                      });
                      const forMatDetail = [];
                      let demo ={};
                      detailData.forEach(dItem=>{
                        demo={
                        
                        productid:dItem.productid,
                        num:dItem.num,
                        price:dItem.price,
                        usefor:dItem.usefor,
                        deliverydate:dItem.deliverydate,
                        comment:dItem.comment,
                        spotnum:dItem.spotnum===undefined?0:dItem.spotnum,
                        
                        }
                        if(dItem.product01Entity.productattribute ===1){ // 色纱
                          if(dItem.chasebatchno === undefined){
                            demo.ownnum = dItem.ownnum;
                            
                          }else{
                            
                              demo.chasenum=dItem.ownnum===undefined?0:dItem.ownnum;
                             
                              demo.batchno=dItem.chasebatchno === undefined?"":dItem.chasebatchno;
                        
                        }
                      }else if(dItem.product01Entity.productattribute === 2){ // 胚纱
                        if(dItem.transnum === undefined && dItem.rawbatchno === undefined){// 胚纱平台，没有批次
                          demo.ownnum = dItem.ownnum;
                          
                          
                        }else if(dItem.transnum === undefined && dItem.rawbatchno !== undefined){// 胚纱平台，有批次
                          demo.chasenum=dItem.rawyarnnum===undefined?0:dItem.rawyarnnum;
                             
                          demo.batchno=dItem.rawbatchno === undefined?"":dItem.rawbatchno;
                          
                        }else if(dItem.transnum !== undefined && dItem.tbatchon === undefined){// 胚纱代销，没有批次
                          demo.ownnum = dItem.transnum;
                        }else if(dItem.transnum !==undefined && dItem.tbatchon !== undefined){// 胚纱代销，有批次
                          demo.chasenum=dItem.transnum===undefined?0:dItem.transnum;
                             
                          demo.batchno=dItem.tbatchon === undefined?"":dItem.tbatchon;
                        }
                      }else if(dItem.product01Entity.productattribute !== 2 && dItem.product01Entity.productattribute !== 1){ // 其他代销
                        if(dItem.tbatchon === undefined){
                          demo.ownnum = dItem.transnum;
                          
                          
                        }else {
                          demo.chasenum=dItem.transnum===undefined?0:dItem.transnum;
                             
                          demo.batchno=dItem.tbatchon === undefined?"":dItem.tbatchon;
                          
                        }
                      }
                        
                        forMatDetail.push(demo);
                    })
                      inquiry.inquiryDetail01Entities = forMatDetail;

                  
                  
                  Inquiry2Presales.inquiry =inquiry;
                  Inquiry2Presales.pickup.details =pickupdata;
              
                  this.props.dispatch({
                    type: 'inquiry/submitInuqiry',
                    payload: Inquiry2Presales,
                    callback:(response)=>{
                      if(response && response.status===200){
                        setTimeout(hide,100);
                        
                        message.success("提交成功!");
                        const paness = this.state.panes;
                        paness.splice(1,1);
                        
                        this.setState({
                          activeKey:'1',
                          panes:paness,
                          pageindex:1,
                          pagesize:12,
                        },()=>{
                          const params = `pageSize=12&pageIndex=0`;
                          this.query(params);
                        })

                      }else{
                        setTimeout(hide,100);
                        message.error("提交失败!");
                      }
                    },
     })
    }
    hadl=(e,val,record)=>{
      message.config({
        top: 100,
      });
      
      const paness = this.state.panes;
      const {getFieldDecorator} = this.props.form;
      if(paness.length >1){
        message.error("请完成已选择的询价单!");
        return;
      }
      const  hide = message.loading('正在读取，请稍候...', 0);
      const params = `${val}`;
      let flag = false;
      queryInquireBasic(params).then((response)=>{
        if(response && response.status ===200){ 
          dataTop=[];
          
          dataTop.push(response.result);
          for(let i =0;i< dataTop.length;i+=1){
            dataTop[i].key= `inquiryTop${i}`;
          }
         
         
          if(record.salesid === undefined ){
            const idp = `id=${val}`;
            inquiryToSale(idp).then((res)=>{
              if(res && res.status === 200){
                message.success("您成为该单的业务员");
                flag = true;
                dataLeft = response.result.inquiryDetail01Entities;
          dataLeft.shippayOwn = dataTop[0].shippayOwn;
          dataLeft.shippayChase = dataTop[0].shippayChase;
          dataLeft.shippaySpot = dataTop[0].shippaySpot;

          dataLeft.securepayOwn = dataTop[0].securepayOwn;
          dataLeft.securepayChase = dataTop[0].securepayChase;
          dataLeft.securepaySpot = dataTop[0].securepaySpot;

          dataLeft.paywayOwn = dataTop[0].paywayOwn;
          dataLeft.paywayChase = dataTop[0].paywayChase;
          dataLeft.paywaySpot = dataTop[0].paywaySpot;

          const productids = [];
          for(let i =0;i< dataLeft.length;i+=1){
            dataLeft[i].key= `inquiryLeft${i}`;
            productids.push(dataLeft[i].productid);
          }
          queryProductids(productids).then(resn=>{
            setTimeout(hide, 100);
            if(resn && resn.status === 200){
              const pData = resn.result;
              for(let z =0;z<pData.length;z+=1){
                for(let l =0;l< dataLeft.length;l+=1){
                  if(pData[z].id === dataLeft[l].productid){
                    // dataLeft[l].product01Entity ={
                    //   picture:pData[z].picture,
                    //   productkind:{
                    //     kindname:"",
                        
                    //   },
                    //   picture:pData[z].picture,
                    //   picture:pData[z].picture,
                    // }
                    dataLeft[l].product01Entity =pData[z];
                  }
                }
              }

              
              this.setState({dataLeft},()=>{
                if(paness.length === 1){
                  const activeKey ='2';
                  paness.push({ title: '询价单详情', content: (
                    <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
                      <div >
                        {getFieldDecorator('tableTop', {
                                initialValue:dataTop,
                                },)(<TableTop />)}
                      
                        <div style={{width:"100%",overflowX: "auto"}}>
                          
                            
                          {getFieldDecorator('tableLeft', {
                              
                              },)(<TableLeft dataSource={this.state.dataLeft} />)}
                          <div >
                           
                            <FooterToolbar style={{ width: this.state.width }}>
                              
                              <Button type="primary" onClick={this.validate}>
                                提交
                              </Button>
                            </FooterToolbar>
                          </div>
                        </div>
                        
                        
                      </div>
                    </Form> 
                  ), key: activeKey });
                  
                  this.setState({ panes:paness, activeKey });
                  }else{
                   
                    this.setState({ activeKey:'2' });
            
                  }
              })
              
            }
          })
            
              }else if(res &&res.status ===400 ){
                const current = JSON.parse( getCurrentUser());
                if(`${res.message}`.indexOf(current.username)>-1){
                  dataLeft = response.result.inquiryDetail01Entities;
                  this.showInquiryDetail(dataLeft,hide,paness,getFieldDecorator);
                }else{
                  setTimeout(hide, 100);
                message.error(res.message);
                }
                

              }
            })
          }else{  

            dataLeft = response.result.inquiryDetail01Entities;
            this.showInquiryDetail(dataLeft,hide,paness,getFieldDecorator,record);
          
         
          
            
           }
        // })
        
         
        
     // }
    }
    })
     
      
      
    }

    showInquiryDetail=(data,hide,paness,getFieldDecorator,record)=>{
          dataLeft =data;
          dataLeft.shippayOwn = dataTop[0].shippayOwn;
          dataLeft.shippayChase = dataTop[0].shippayChase;
          dataLeft.shippaySpot = dataTop[0].shippaySpot;

          dataLeft.securepayOwn = dataTop[0].securepayOwn;
          dataLeft.securepayChase = dataTop[0].securepayChase;
          dataLeft.securepaySpot = dataTop[0].securepaySpot;

          dataLeft.paywayOwn = dataTop[0].paywayOwn;
          dataLeft.paywayChase = dataTop[0].paywayChase;
          dataLeft.paywaySpot = dataTop[0].paywaySpot;

          const productids = [];
          for(let i =0;i< dataLeft.length;i+=1){
            dataLeft[i].key= `inquiryLeft${i}`;
            productids.push(dataLeft[i].productid);
          }
          queryProductids(productids).then(resn=>{
            setTimeout(hide, 100);
            if(resn && resn.status === 200){
              const pData = resn.result;
              for(let z =0;z<pData.length;z+=1){
                for(let l =0;l< dataLeft.length;l+=1){
                  if(pData[z].id === dataLeft[l].productid){
                    // dataLeft[l].product01Entity ={
                    //   picture:pData[z].picture,
                    //   productkind:{
                    //     kindname:"",
                        
                    //   },
                    //   picture:pData[z].picture,
                    //   picture:pData[z].picture,
                    // }
                    dataLeft[l].product01Entity =pData[z];
                  }
                }
              }// 快速询价的不能再次询价
              const terms = `terms[0].value=${record.id}&terms[0].column=inquiryid`;
              queryPresale(terms).then(pres=>{
                if(pres && pres.status===200){
                  const presaledata = pres.result.data;
                  if(presaledata.length ===0){// 快速询价暂存（还有在商贸下单的询价单）

                  }else{// 快速询价
                    
                      const activeKey ='2';
                      paness.push({ title: '询价单详情', content: (
                        <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
                          <div >
                            {getFieldDecorator('tableTop', {
                                    initialValue:dataTop,
                                    },)(<TableTop />)}
                          
                            <div style={{width:"100%",overflowX: "auto"}}>
                              
                                
                              {getFieldDecorator('tableLeft', {
                                  
                                  },)(<TableLeft dataSource={dataLeft} />)}
                              <div >
                               
                                <FooterToolbar style={{ width: this.state.width }}>
                                  
                                  <Button type="primary" onClick={this.validate}>
                                    提交
                                  </Button>
                                </FooterToolbar>
                              </div>
                            </div>
                            
                          </div>
                        </Form> 
                      ), key: activeKey });
                      
                      this.setState({ panes:paness, activeKey });
                      
                  }
                }
              })
              
             
  
              
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
  
    render(){

        const {submitting,form,loading,inquiry} = this.props;
     
        return(
          <PageHeaderLayout title="询价单">
            <Card bordered={false}>
              <div className={styles.tableList}>
                <div className={styles.tableListForm} />
                <div className={styles.tableListOperator} />
                
                <Tabs
                  hideAdd
                  onChange={this.onChange}
                  activeKey={this.state.activeKey}
                  type="editable-card"
                  onEdit={this.onEdit}
                >
                  {this.state.panes.map(pane => <TabPanes tab={pane.title} key={pane.key} closable={pane.closable}>{pane.content}</TabPanes>)}
                        
                </Tabs>
                
                   
                  
                
              </div>
            </Card>
            
          </PageHeaderLayout>
        );
    }
    
  }