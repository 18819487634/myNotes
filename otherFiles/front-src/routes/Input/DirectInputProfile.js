import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FooterToolbar from 'components/FooterToolbar';
import { Card, Form, Button,message,Modal } from 'antd';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './InputProfile.less';

import LocationForm from './LocationForm';
import DirectHead from './DirectHead';
import { addGoods, queryBatchnoStatus, queryGoodslocation, addGoodsDetails, addGoodsLocations, updateGoodsDetails } from '../../services/api';
import { getSupplyId } from '../../utils/sessionStorage';

const confirms = Modal.confirm;

@connect(({ goods, loading }) => ({
  goods,
  loading: loading.models.goods,
}))
@Form.create()
export default class DirectInputProfile extends PureComponent {
    state={
      flag:false,
      buttonFlag:false,
      bool:true,
      batchnoData :{
        ximadata:[],
        sumdata:[{
          key:'sumkey_1',
          totalgw:"",
          totalnw:"",
          piecenum:"",
          allpiecenum:"",
        }],
      },
      dataSource1: [
        {
          key:'key_1',
          colorname:"",
          productname:"",
          batchno:"",
          deliverydate:"",
          fineCode:2,
          comment:"",
          lossfactor:0.5,
          paperweight:0.1,
          wrapperweight:0.1,
          piecenum:24,
          area:'',
          locations:'',
        },
      ],    
    }
     setList=(map,locationDetails,flags)=>{
      let flag = flags;
      while(flag){
        addGoodsLocations(locationDetails[map]).then(loRes=>{
          if(loRes && loRes.status === 200){
           // const loResa = loRes.result;
           // locationCount.count +=1;
            map+=1;
            flag=true;
            if(map !== locationDetails.length){
              this.setList(map,locationDetails,flag);
            }else if(map === locationDetails.length){
              flag=false;
              message.success("录入成功!");
              this.props.dispatch(routerRedux.push(`/goods/goodsstock`));
            }
          }
        });

        flag=false;
    }    
  }
  doubleclick=(e)=>{
    console.log("this is double click",e);
  }
    infosubmit = (e,tag) => {

      const {validateFieldsAndScroll} =this.props.form;
      const {dispatch} =this.props;
     
      
      validateFieldsAndScroll((error, values) => {
      if(tag===1){
        const headData = values.tableHead;
        if(headData[0].locations === "" || headData[0].locations === undefined ){
          message.warning("请填写存放区域!");
          return;
        }else if(headData[0].productid === "" || headData[0].productid === undefined){
          message.warning("请输入正确的产品!");
          return;
        }
        this.setState({
          flag:false,
         })
        const dataSources = this.state.batchnoData;
        const batchnos= headData[0].batchno.toUpperCase();
        const titlename =`${headData[0].colorname}-${headData[0].productname}: ${batchnos}`;
        queryBatchnoStatus([{productid:headData[0].productid,batchno:batchnos}]).then(bres=>{
          if(bres && bres.status===200){
            const  bresult = bres.result;
            let finecode = headData[0].fineCode;
            const headSource = headData;
            let topic = "";
            if(bresult.length >0){
              
              if(bresult[0].batchnostatus === 0){  
                topic = "有二维码";
                message.warning(`此缸号已经有录入过，该状态为${topic},不能在web端创建`);
                return;
              }else if(bresult[0].batchnostatus === 1){
                topic = "有细码单";
              }else if(bresult[0].batchnostatus === 2){
                topic = "无细码单";
              }
             // message.warning(`此缸号已经有录入过，该状态为${topic}`);
              finecode = bresult[0].batchnostatus;
              headSource[0].codeFlag = true;
              
            }
            if(headData[0].piecenum ===0 ||headData[0].piecenum ==="" ){
              message.warning(`包装只数不能为空或0`);
              return;
            }else if(headData[0].pieceweight ===0 ||headData[0].pieceweight ===""){
              message.warning(`平均每件净重不能为空或0`);
              return;
            }
        dataSources.aw =+parseFloat((headData[0].pieceweight/headData[0].piecenum).toFixed(2));
        dataSources.titlename = titlename;
        dataSources.locations = headData[0].locations;
        dataSources.locationdata = headData[0].locationdata;
        dataSources.productid = headData[0].productid;
        dataSources.fineStatus = finecode;
        dataSources.num = headData[0].piecenum;
        dataSources.batchno =batchnos;
        headSource[0].fineCode = finecode;
        
        const directInputProfile = this;
        if(bresult.length !== 0){
          confirms({
            title: `此缸号已经有录入过，该状态为${topic},是否要再录入?`,
            content: ``,
            onOk() {
              // return new Promise((resolve, reject) => {
              //   setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
              // }).catch(() => console.log('Oops errors!'));
              
              directInputProfile.setState({
                flag:true,
                batchnoData:dataSources,
                dataSource1:headSource,
                buttonFlag:true,
              })
              
            },
            onCancel() {},
          });
        }else{
          directInputProfile.setState({
            flag:true,
            batchnoData:dataSources,
            dataSource1:headSource,
            buttonFlag:true,
          })
        }
        
        
        
          }else if(bres && bres.status === 400){
            message.error(bres.message);

          }
        });
        
      }else if(tag ===2){
        if(this.state.bool){
          this.setState({
            bool:false,
          })
        
        message.config({
          top: 100,
        });
        const hide = message.loading(`正在提交...`, 0);
       // 传入后台的参数
        const headData = values.tableHead;
       
          const batchnoForms = values.tableform;
          const batchnoForm =[];
          if(batchnoForms===undefined||batchnoForms.length===0){
            setTimeout(hide,100);
            message.warning("请填写细码详情");
            return;
          }
          const tagnoList = [];// 序号数组
          for(let i=0;i<batchnoForms.length;i+=1){
            if(i !== batchnoForms.length-1){
              tagnoList.push(batchnoForms[i].tagno);
              batchnoForm.push(batchnoForms[i]);
            }
          }
          const sumform = batchnoForms[batchnoForm.length-1];// 合计form
         // batchnoForm.splice(batchnoForm.length-1, 1);// 缸号细码详情form
         const startTime = moment().format('YYYYMMDDHHmmss');
         
         const dterms = `terms[0].value=${headData[0].productid}&terms[0].column=productid&terms[1].value=${headData[0].batchno}&terms[1].column=batchno`;
         queryGoodslocation(dterms).then(dgres=>{
           if(dgres && dgres.status===200){
            const dataResult = dgres.result.data;
            let tagnos = '';
            // dataResult.foreach(item=>{
            //   if(tagnoList.indexOf(item.tagno)!==-1){
            //     tagnos+=item.tagno;
               
            //   }

            // });
            for(let z=0;z<dataResult.length;z+=1){
              if(tagnoList.indexOf(dataResult[z].tagno)!==-1){
                tagnos+=`${dataResult[z].tagno},`;
               
              }
            }
            if(tagnos !== ""){
              setTimeout(hide,100);
              message.warning(`序号${tagnos}已经存在`);
              return;
            }
            const goodsParams = {
              area : headData[0].area,
              deliverydate :headData[0].deliverydate,
              deliveryid:`${headData[0].batchno}_${startTime}`,// 送货单
              purchaseid :`${headData[0].batchno}_${startTime}`,// 采购单
              type : 3,// 来源(待确认)
            }
    
            const details ={
              batchno:headData[0].batchno.toUpperCase(),
              material:headData[0].material,
              totalgw:0,
              totalnw:0,
              allpiecenum:0,
              remainnum:0,
              piecenum:headData[0].piecenum,
              locations:headData[0].locations,
             // allpiecenum:sumform.allpiecenum,
             // piecenum:sumform.piecenum,
              productid:headData[0].productid,
             // locationdetails:headData[0].locations,
    
              supplyid:getSupplyId(),
              batchnostatus:batchnoForm[0].batchnostatus,
              pieceroughweight:headData[0].pieceroughweight,
              pieceweight:headData[0].pieceweight,
              scatpiece:headData[0].scatpiece,
              lossfactor:headData[0].lossfactor,
              paperweight:headData[0].paperweight,
              wrapperweight:headData[0].wrapperweight,
    
            };
            
            addGoods(goodsParams).then(res=>{
              if(res && res.status===200){
                const goodis = res.result;
                details.goodid = goodis;
                
                addGoodsDetails(details).then(Gres=>{
                  if(Gres && Gres.status===200){
                  const detailids = Gres.result;
                    const locationDetails = [];
    
    
                  const locationList =[];
                  for(let i =0;i<batchnoForm.length;i+=1){
                    const vallist ={
                      // cartno:batchnoForm[i].cartno,
                      glossweight:batchnoForm[i].glossweight,
                      location:batchnoForm[i].location,
                      productid:headData[0].productid,
                      weight:batchnoForm[i].weight,
                      num:batchnoForm[i].num,
                      supplyid:getSupplyId(),
                      batchno:headData[0].batchno.toUpperCase(),
                      goodid:goodis,
                      detailid:detailids,
                      tagno:batchnoForm[i].tagno,
                      area:headData[0].area,
                      batchnostatus:batchnoForm[i].batchnostatus,
                    }
                    if(locationList.indexOf(batchnoForm[i].location)===-1){
                      locationList.push(batchnoForm[i].location);
                    }
                    locationDetails.push(vallist);
                  }
    
                  for(let z=0;z<locationDetails.length;z+=1){
                    if(locationDetails[z].glossweight===0
                    || locationDetails[z].glossweight===""
                    ||locationDetails[z].weight===0
                    ||locationDetails[z].weight===""
                    || locationDetails[z].num === 0
                    ||locationDetails[z].num===""){
                      message.warning(`${locationDetails[z].tagno}有空数据!`);
                      setTimeout(hide,100);
                      return;
                    }else if(locationDetails[z].glossweight<locationDetails[z].weight){
                      message.warning(`${locationDetails[z].tagno}净重不能比毛重大!`);
                      setTimeout(hide,100);
                      return;
                    }
                  }
                  setTimeout(hide,500);
              this.setList(0,locationDetails,true);
                  }
                });
                const InputProfile = this;
                setTimeout(()=>{
                  InputProfile.setState({
                    bool:true,
                  })
                },5000);
              
              }else if(res && (res.status === 400 || res.status === 500)){
                setTimeout(hide,100);
                message.success("提交失败！");
              }
            })
           }
         })
        }
      }
      
    })
  }

  
  render() {
    const { submitting, form } = this.props;
    const {  getFieldDecorator } = form;
    const {dataSource1,batchnoData} = this.state;
    
    return (
      <PageHeaderLayout title="直接入库">
        <Card bordered={false}>
          <div className={styles.tableList}>
            {/* <div className={styles.tableListForm} />
            <div className={styles.tableListOperator} /> */}
            <div style={{width:'100%',overflowX:'auto'}}>
              <Form  onSubmit={this.infosubmit}>
                {getFieldDecorator('tableHead', {
                  
                })(<DirectHead dataSource={dataSource1} />)}
             
                <Button className={this.state.buttonFlag?styles.tablenone:styles.tableshow} type="primary" onClick={e=>this.infosubmit(e,1)}>
                  下一步
                </Button>
              </Form>
            </div>
            <div className={this.state.flag?styles.tableshow:styles.tablenone}> 
              <Form  onSubmit={this.infosubmit}>
                {getFieldDecorator('tableform', {
                  
                })(<LocationForm dataSource={batchnoData} />)}
              </Form>
            </div>
            <FooterToolbar >
              <div >
                <Button type="primary" onDoubleClick={es=>{this.doubleclick(es)}} onClick={e=>this.infosubmit(e,2)} loading={submitting}>
                  保存
                </Button>
              </div>
            </FooterToolbar>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
