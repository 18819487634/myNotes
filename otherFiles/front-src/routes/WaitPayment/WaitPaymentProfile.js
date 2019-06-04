import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  
  Card,
  Form,
  Button,
  Table,
  Tabs,
  message,
  Modal,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './WaitPaymentProfile.less';
import {  querypaydetail,queryPresale, queryPresaleById, queryProductids, getTrackStatusForId, queryListClients, queryPickuptmpdetail, addPickUp, updatePickuptmpdetail, queryGoods, queryGoodsBasic, queryErpClient, querysupplydictionry, queryDeliveryWay } from '../../services/api';
import { getMyDate, trackiList,toDecimal} from '../../utils/utils';
import { getSupplyId } from '../../utils/sessionStorage';
import SplitsPickUpTable from '../Inquiry/SplitsPickUpTable';
import SplitTableTop from '../Inquiry/SplitTableTop';






const TabPanes = Tabs.TabPane;
const takewayArr = ["自提","快递","物流","送货上门"];
const areaMap = new Map();
const recordstatusArr = ["正常","加急"];
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
                        
                      },)(<SplitTableTop dataSource={pickupTmp.dataTop} /> )}
          </div>
          <div >
            {getFieldDecorator('splitspickuptable', {
                    
                      },)(<SplitsPickUpTable dataSource={pickupTmp.pickupData} />)}
          </div>
          
        </Form>  
        
        
      </Modal>);
  });        
  @connect(({ presale, loading }) => ({
    presale,
    loading: loading.models.presale,
  }))
  @Form.create()
  export default class WaitPaymentProfile extends PureComponent {
    state ={
      
      panes:[{key:"1"}],
      activeKey:'1',
      pickupVisible:false,
      paymentVisible:false,
      pickupTmp:{
        dataTop:[{"key":"d1"}],
        pickupData:[{"key":"p1"}],
      },
      pageindex:1,
      pagesize:10,
    }
    
    componentDidMount() {
      const params = "terms[0].value=3&terms[0].column=type";
      querysupplydictionry(params).then(res=>{
        if(res && res.status === 200){
          const datas = res.result.data;
          datas.forEach(item=>{
            areaMap.set(item.value,item.key);
          });
          const terms =`terms[0].termType=lt&terms[0].value=5&terms[0].column=paytype&pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
          this.query(terms); 
        }
      });
       
    }

    
    
    
    onChange = (activeKey) => {
      
      this.setState({ activeKey });
    }
    onEdit = (targetKey, action) => {
      this[action](targetKey);
      
    }
    clickpay =(rec)=>{
      const params = `terms[0].value=${rec.id}&terms[0].column=presaleid`;
      querypaydetail(params).then(res=>{
        if(res && res.status === 200){
          const datas = res.result.data;
          const  remainmoney = toDecimal(rec.goodpay)+toDecimal(rec.shippay)+toDecimal(rec.securepay);
          let total = 0;
          datas.forEach(item => {
             total += toDecimal(item.amount);
          });
          const tmpmoney = remainmoney - total; 
          if(tmpmoney<=0){
            message.error("已经付款");
            return;

          }
          this.props.dispatch(
            routerRedux.push({
            pathname:'/finance/paydetail',
            state:{
              returnurl:this.props.location.pathname,
              address:rec.address.concat(' ').concat(rec.shipreceiver).concat(' ').concat(rec.shipphone),
              presaleid:rec.id,
              clientname:rec.clientid,
              clientid:rec.clientids,
              money: toDecimal(tmpmoney),
              contenttype:3,// 尾款
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
     
      };
    query =(terms)=>{
       
        queryPresale(terms).then((response)=>{
            if(response && response.status===200){
              const arr = response.result.data;
              const trackids = [];
              const userList =[];
              for(let i =0;i< arr.length;i+=1){
              
                trackids.push(arr[i].trackid);
                if(`${arr[i].clientid}`.indexOf(":")===-1 &&userList.indexOf(arr[i].clientid)===-1){
                  userList.push(arr[i].clientid);
                }
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
                }
                if(userList.length===0){
                  userList.push(null);
                }
                
                queryListClients(userList).then(lres=>{ 
                  if(lres && lres.status === 200){
                    const userData = lres.result;
                    const paymentData = [];
                    if(userData !== undefined){
                      for (let i = 0; i < arr.length; i += 1) {
                      //  if(arr[i].status === 5 || arr[i].status === 6){
                          if(`${arr[i].clientid}`.indexOf(":")===-1){
                            arr[i].clientids =  arr[i].clientid;
                            arr[i].clientid = userData[arr[i].clientid];
                          }
                          paymentData.push(arr[i]);
                        // }
                        
                       
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
                        
                       // render:(val,record)=>{return <a onClick={e=>this.hadl(e,val,record)}>{val}</a>},
                      }, {
                        title: '客户',
                        dataIndex: 'clientid',
                        key: 'clientid',
                      }, 
                      // {
                      //   title: '最早货期',
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
                      // }, 
                      {
                        title: '紧急状态',
                        dataIndex: 'ismerge',
                        key: 'ismerge',
                        render:val=>recordstatusArr[val],
                      },{
                        title: '拣货费/定金',
                        dataIndex: 'pickwaste',
                        key: 'pickwaste',
                        render:val=>val===undefined?`￥ 0`:`￥ ${val}`,
                      },{
                        title: '拆单',
                        dataIndex: 'split',
                        key: 'split',
                        render:(val,record,index)=>{
                            return(
                              <Button onClick={e=>{this.splitorder(e,true,record)}}>拆单</Button>
                            )   
                        },
                      } ,{
                          title: '收款',
                          dataIndex: 'payment',
                          key: 'payment',
                          render:(val,rec,index)=>{
                                  return(
                                    <Button onClick={e=>{this.clickpay(rec)}}>收款</Button>
                                  )
                              
                          },
                        },{
                        title: '跟踪状态',
                        dataIndex: 'status',
                        key: 'status',
                        
                        render(val) {
                          return <span >{trackiList[val]}</span>;
                        },
                      }];
                      
                      this.setState({
                        pagination,
                        paymentData,
                        trackmap,
                        
                      },()=>{
                        const panes1 = {
                          title:'待收款列表',
                          content:(
                            <Table 
                              pagination={this.state.pagination}
                              
                              dataSource={this.state.paymentData}
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
                  }
                });
                
                
              }
            })
            
             // const arr =dataTop;
            
    
    
    
         
          }
          })
    }
    handleModalVisible = flag => {
      this.setState({
        modalVisible: !!flag,
      });
    };
    splitorder =(e,flag,record)=>{
      message.config({
        top: 100,
      });
    
      const hide = message.loading(`正在读取...`, 0);
      const params = `terms[0].value=${record.id}&terms[0].column=presaleid`;
      queryPickuptmpdetail(params).then(res=>{
        if(res && res.status ===200){
          const tmpDatas = res.result.data;
          const tmpData =[];
          
          if(tmpDatas.length===0){
            setTimeout(hide,100);
            message.warning("此单不需要拆单");

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
          if(tmpData.length===0){
            setTimeout(hide,100);
            message.warning("此单已经拆单完成");
            this.setState({ pickupVisible:false})
            return;
          }
          
          let terms = "";
          
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
                        tmpData[i].key=`tmp${i}`;
                        tmpData[i].status=0;
                        tmpData[i].output=tmpData[i].picknum;
                        
                        tmpData[i].outpiece = tmpData[i].piece;
                        tmpData[i].product01Entity =product01Entity;
                        tmpData[i].remainnum=tmpData[i].picknum;
                        // tmpData[i].goodentryids = goodsMap.get(tmpData[i].batchno).id;// 批次id
                        tmpData[i].pieceweight = goodsMap.get(tmpData[i].goodentryid).pieceweight;// 每包净重
                        tmpData[i].locations = goodsMap.get(tmpData[i].goodentryid).locations;// 位置信息
                        tmpData[i].area = goodArea.get(goodsMap.get(tmpData[i].goodentryid).goodid);// 区域位置
                        tmpData[i].areas = areaMap.get(`${tmpData[i].area}`);
                      }
                    }
                  }
                  
    
                  queryPresaleById(record.id).then(inquiryRes =>{
                    if(inquiryRes && inquiryRes.status === 200){
                      const presaleData = inquiryRes.result;
                      const paramss = `paging=false&terms[0].value=${presaleData.clientid}&terms[0].column=id`;
                      queryErpClient(paramss).then(userRes=>{
                        if(userRes && userRes.status === 200){
                          const userList = userRes.result.data;
                          presaleData.clientids = userList[0].name;
                          presaleData.credit = userList[0].credit;
                          const wayTerm = `paging=false`;
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
    // paymentClick=(e,flag,record) =>{
    //   const params = record;  
    //   if(params.userid !== undefined){
    //     params.clientid = params.userid;
    //   }
    //     this.setState({
    //         modalVisible: !!flag,
    //         params,
    //       });
    // }
    handleStandardTableChange = pagination => {
      const { form } = this.props;
      form.validateFields((err) => {
        if (err) return;
        this.setState({
          pageindex : pagination.current,
          pagesize : pagination.pageSize,
        })
        const terms = `terms[0].termType=lt&terms[0].value=5&terms[0].column=paytype&pageSize=${pagination.pageSize}&pageIndex=${pagination.current-1}&sorts[0].name=id&sorts[0].order=desc`
        this.query(terms);
        
      });
    }
    handlonsubmit=(values)=>{
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
              
              this.splitorder("1",true,topData[0]);
              
              
            }
          })
        }

      })
     
      
    }
  

      handleAdd = (fields,parmas) => {
      //   this.setState({
      //     paymentVisible:true,
      //   })
      //  return;
        this.props.dispatch({
          type: 'paydetail/add',
          payload: {

            presaleid:parmas.id,
            clientid:parmas.clientid,
            // clientsupplyid:record,
            supplyid:getSupplyId(),
            amount:fields.price,
            paytype:0,
            comment:fields.remake,
            contenttype:fields.contenttype,
          
            
          },
          callback:(response)=>{
            if(response && response.status===200){
                message.success("付款成功！");
                this.setState({
                  modalVisible: false,
                 
                });
                const terms =`terms[0].termType=lt&terms[0].value=5&terms[0].column=paytype&pageIndex=0&pageSize=10&sorts[0].name=id&sorts[0].order=desc`;
                this.query(terms); 
            }
          },
        });
    
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

    
    CancelPickupModalVisible=()=>{
      this.setState({
        pickupVisible:false,
      })
      }

      PaymentModalVisible= flag => {
        this.setState({
          paymentVisible: !!flag,
        });
      };
      
    render(){
       
        
        const panemap = this.state.panes;
        
        const {pickupVisible,pickupTmp} =this.state;
        
        
      
        const pickupParentMethods = {
            CancelPickupModalVisible: this.CancelPickupModalVisible,
            handlonsubmit:this.handlonsubmit,
        };
       
        return(
          <PageHeaderLayout title="待收款">
            <Card bordered={false}>
              <div className={styles.tableList}>
                
               
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
                
                   
              
                <PickupForm {...pickupParentMethods} modalVisible={pickupVisible} pickupTmp={pickupTmp} />
              </div>
            </Card>
            
          </PageHeaderLayout>
        );
    }
    
  }