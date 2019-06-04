import React, { PureComponent, Fragment } from 'react';
import { Table,Modal, Tooltip, Form, Button} from 'antd';
import moment from 'moment';
import styles from '../Inquiry/TableRight.less'
import {  querysupplydictionry, queryStockDetails, queryProductids, queryListClients, querycartno, queryGoods, queryGoodsBasicNoPaging } from '../../services/api';
import GoodsStockDetails from './GoodsStockDetails';
import GoodsStockCartno from './GoodsStockCartno';
import GoodsStockCartnoPaging from './GoodsStockCartnoPaging';

const confirms = Modal.confirm;
let selectedRowss=[];
const areaMap = new Map();
const selectRowMap = new Map();
const CreateForm = Form.create()(props => {
    const { modalVisible, handleModalVisible,params } = props;
    
   
    return (
      <Modal
        title="库存(进、出)明细"
        visible={modalVisible}
        width='90%'
        onOk={() => handleModalVisible()}
        onCancel={() => handleModalVisible()}
      >
        <GoodsStockDetails dataSource={params} />
      </Modal>
    );
  });

  const CartnoForm = Form.create()(props => {
    const { modalVisible, handleCartnoModalVisible,params,title,pagination,cartnoTerms,goodMap } = props;
    
    if( params !== undefined && (params[0].batchnostatus === 1 || params[0].batchnostatus === 0)){
      return (
        <Modal
          title="缸号明细"
          visible={modalVisible}
          width={1000}
          onOk={() => handleCartnoModalVisible()}
          onCancel={() => handleCartnoModalVisible()}
        >
          <GoodsStockCartno dataSource={params} title={title} />
        </Modal>
      );
    }else{
      return (
        <Modal
          title="缸号明细"
          visible={modalVisible}
          width={1000}
          onOk={() => handleCartnoModalVisible()}
          onCancel={() => handleCartnoModalVisible()}
        >
          <GoodsStockCartnoPaging dataSource={params} title={title} pagination={pagination} cartnoTerms={cartnoTerms} areaMap={areaMap} goodMap={goodMap} />
        </Modal>
      );
    }
    
  });  
export default class GoodsBathnoProfil extends PureComponent {
  
  constructor(props) {
    super(props);

    this.state = {
      data: props.dataSource,
      colorname:"",
      productname:"",
      loading: false,

    };
  }
 
  componentDidMount(){
    const params = "terms[0].value=3&terms[0].column=type";
    querysupplydictionry(params).then(res=>{
      if(res && res.status === 200){
        const datas = res.result.data;
        datas.forEach(item=>{
          areaMap.set(item.value,item.key);
         
        });
      }
    });
 
  }
  
  
  componentWillReceiveProps(nextProps) {
      
      this.setState({
        data: nextProps.dataSource,
        colorname:nextProps.dataSource.colorname,
        productname:nextProps.dataSource.productname,

      });
    
    
  }
  componentDidUpdate(nextProps, nextState) {

    if(selectRowMap.get(nextState.data.colorname)){
     selectedRowss = selectRowMap.get(nextState.data.colorname);
    
    }else{
      selectedRowss =[];
    };

    this.state = {
      data: nextState.data,
      loading: false,
      selectedRows:selectedRowss,
      colorname: nextState.data.colorname,
      productname:nextState.data.productname,

      total:nextState.total,
      productid:nextState.productid,
    };
   
   
  }
  

 
  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
  shwoDetails=(e,record)=>{

    queryStockDetails(record).then(res=>{
        if(res && res.status === 200){
           const results = res.result;
           const goodSaleFormss = results.goodSaleForms;// 销售列表
           const inputData = results.inform; // 总入库
           const outData = results.outform; // 总出库
           const goodData = results.goodEntryForms; // 入库明细
           const productids = [results.productid];
           queryProductids(productids).then(pres=>{// 产品赋值
            if(pres && pres.status === 200){
              const productList  = pres.result[0];
              const clientlist = [];
              goodSaleFormss.forEach(item=>{
                  if(clientlist.indexOf(item.clientid)===-1){
                    clientlist.push(item.clientid);
                  }
              });
              if(clientlist.length===0){
                clientlist.push(null);
              }
              queryListClients(clientlist).then(cres=>{// 客户
                if(cres && cres.status === 200){
                    const userData = cres.result;
                    if(Object.keys(userData).length !== 0){
                        for (let i = 0; i < goodSaleFormss.length; i += 1) {
                      
                            if(`${goodSaleFormss[i].clientid}`.indexOf(":")===-1){
                              goodSaleFormss[i].clientids = goodSaleFormss[i].clientid;
                              goodSaleFormss[i].clientid = userData[goodSaleFormss[i].clientid];
                              
                            }
                           
                          }
                         
                    }
                    
                    const dataproduct = [];
                    for(let z=0;z<3;z+=1){
                        const vali ={
                            colorname:productList.colorname,
                            productname:productList.productname,
                            batchno:results.batchno,
                            yarn:productList.yarn,
                            brandname:productList.brandname,
                            picture :productList.picture,
                            seriesname :productList.productseries.seriesname,
                            kindname :productList.productkind.kindname,
                            
                        }
                        dataproduct.push(vali);
                        
                    }

                    let inelementnum = 0;
                    let intotalGw =  0;
                    let intotalNw = 0;

                    let outelementnum = 0;
                    let outtotalGw = 0;
                    let outtotalNw =  0;
                    if(inputData !== undefined){
                    inelementnum = inputData.elementnum===undefined?0:inputData.elementnum;
                    intotalGw =  inputData.totalGw===undefined?0:inputData.totalGw;
                    intotalNw =  inputData.totalNw===undefined?0:inputData.totalNw;
                    }
                    if(outData !== undefined){
                    outelementnum =  outData.elementnum===undefined?0:outData.elementnum;
                    outtotalGw =  outData.totalGw===undefined?0:outData.totalGw;
                    outtotalNw =  outData.totalNw===undefined?0:outData.totalNw;
                    }
                    
                   
                    dataproduct[0].totalname ='毛重(Kg):';
                    dataproduct[1].totalname ='净重(Kg):';
                    dataproduct[2].totalname ='总只数:';

                    dataproduct[2].input = inelementnum;
                    dataproduct[0].input = intotalGw;
                    dataproduct[1].input =  intotalNw;

                    dataproduct[2].output = outelementnum;
                    dataproduct[0].output =  outtotalGw;
                    dataproduct[1].output =  outtotalNw;

                    dataproduct[2].remainnum = parseFloat(inelementnum-outelementnum).toFixed(2);
                    dataproduct[0].remainnum =  parseFloat(intotalGw-outtotalGw).toFixed(2);
                    dataproduct[1].remainnum =  parseFloat(intotalNw-outtotalNw).toFixed(2);

                    const params ={
                        dataDetails:dataproduct,
                        inputDetailList:goodData,
                        outDetailList:goodSaleFormss,
                        flag:false,
                    };
                    this.setState({
                        params,
                        modalVisible:true,
                    })
                    
                }
            });
            }
           })
        }
    });
        
    }
    compare=(property)=>{
      return (a,b)=>{
        
          const value1 = parseFloat(a[property]);
          const value2 = parseFloat(b[property]);
          
          return value1 - value2;
      }
  }
    cartnoDetails=(e,record)=>{
        
        const terms = `paging=false&terms[0].value=${record.batchno}&terms[0].column=batchno&terms[1].value=${record.productid}&terms[1].column=productid`;
        queryGoodsBasicNoPaging(terms).then(gbres=>{
            if(gbres && gbres.status===200){
                const goodBasicList = gbres.result;
                const goodMap = new Map();
                let cartnoTerms ="paging=false&sorts[0].name=cartno&sorts[0].order=asc&";
                let goodterms = "paging=false&terms[0].column=id&";
                for(let i=0;i<goodBasicList.length;i+=1){
                    cartnoTerms += `terms[0].value=${goodBasicList[i].id}&`;
                    goodterms += `terms[0].value=${goodBasicList[i].goodid}&`;
                }
                
                
                goodterms += "terms[0].termType=in";
                queryGoods(goodterms).then(goodsres=>{
                    if(goodsres && goodsres.status === 200){// 存放仓库
                      const goodsData = goodsres.result.data;
                      
                      goodsData.forEach(item=>{
                        goodMap.set(item.id,item.area);
                       
                      });
                      if(record.batchnostatus === 2){ 
                        cartnoTerms+=`pageSize=10&pageIndex=0&terms[0].column=detailid&terms[0].termType=in`;
                      }else{
                        cartnoTerms +=`terms[0].column=detailid&terms[0].termType=in&terms[1].termType=isNull&terms[1].column=parentcartno&terms[1].value=null`;
                      }
                      
                    const cartnoChildren =[];// 子包
                    const cartnoList = [];// 父包
                    querycartno(cartnoTerms).then(res=>{
                    if(res && res.status===200){
                        const cartnoData = res.result.data;
                        if(cartnoData.length === 0){
                          confirms({
                            title: `没有细码详情，请联系主管`,
                            content: ``,
                            onOk() {
                              // return new Promise((resolve, reject) => {
                              //   setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
                              // }).catch(() => console.log('Oops errors!'));
                              
                            },
                            onCancel() {},
                          });
                          return;
                        }
                        if(record.batchnostatus === 2){
                          for(let i=0;i<cartnoData.length;i+=1){
                            cartnoData[i].key = `${cartnoData[i].id}`;
                            const areavalue =`${goodMap.get(cartnoData[i].goodid)}`;
                            cartnoData[i].area =goodMap.get(cartnoData[i].goodid);
                            cartnoData[i].areas =areaMap.get(areavalue);
                            
                            cartnoChildren.push(cartnoData[i]);
                            
                        }
                        const pagination = {
                          total: res.result.total,
                          current:  1,
                          pageSize: 10,
                          showTotal: () => { 
                            return `共${res.result.total}条`;
                          },
                        }
                        const  cartnoLists = cartnoChildren.sort(this.compare('areas'));
                        
                        const titlename = `${record.colorname}-${record.productname}: ${record.batchno}`;
                        this.setState({
                            cartnoParams:cartnoLists,
                            titlename,
                            pagination,
                            cartnoTerms,
                            goodMap,
                            areaMaps:areaMap,
                            cartnoModalVisible:true,
                        })
                      }else{
                          for(let i=0;i<cartnoData.length;i+=1){
                            cartnoData[i].key = `${cartnoData[i].id}`;
                            const areavalue =`${goodMap.get(cartnoData[i].goodid)}`;
                            cartnoData[i].area =goodMap.get(cartnoData[i].goodid);
                            cartnoData[i].areas =areaMap.get(areavalue);
                            if(cartnoData[i].newnw !== cartnoData[i].weight){
                              cartnoData[i].children =[];
                            }
                            cartnoList.push(cartnoData[i]);

                            
                        }
                        const  cartnoLists = cartnoList.sort(this.compare('areas'));
                        
                        const titlename = `${record.colorname}-${record.productname}: ${record.batchno}`;
                        this.setState({
                            cartnoParams:cartnoLists,
                            titlename,
                            cartnoModalVisible:true,
                        })
                      }

                        

                      
                        
                   
                    }
                })
                    }
                });
                
            }
        })
    }

    handleModalVisible = flag => {
        this.setState({
          modalVisible: !!flag,
        });
      };
  
    handleCartnoModalVisible = flag => {
        this.setState({
        cartnoModalVisible: !!flag,
        });
      };
     
  render() {

   
    
    const { data,params,modalVisible ,cartnoModalVisible,cartnoParams,titlename,pagination,cartnoTerms,goodMap,areaMaps} = this.state;
    

    const parentMethods = {
        
        handleModalVisible: this.handleModalVisible,
      };

    const cartnoParentMethods = {
        
        handleCartnoModalVisible: this.handleCartnoModalVisible,
    };

   const BatchColumns = [
    
      {
        title: '缸号',
        dataIndex:'batchno',
        key: 'batchno',
        width: '20%',
        render:(val,record)=>{
          return <span className={record.status===-1?styles.redfont:styles.blackfont} onClick={e=>{this.shwoDetails(e,record)}} style={{cursor:'pointer'}}>{val}</span>;
        },
      },
      {
        title: '仓库',
        dataIndex: 'area',
        key: 'area',
        render:val=>areaMap.get(`${val}`),
        width:'20%',
      }, {
        title: '库存',
        dataIndex: 'remainnum',
        key: 'remainnum',
        width:'10%',
        render:(val,record)=>{
          return(
            <Tooltip title={moment(record.deliverydate).format('YYYY-MM-DD')}>
              <span>{val}</span>
            </Tooltip>
          ) 
        },
      }, {
        title: '存放区域',
        dataIndex: 'locations',
        key: 'locations',
        width:'10%',
        
    },
    {
        title: '明细',
        dataIndex: 'details',
        key: 'details',
        width:'10%',
        render:(val,record )=>{
            return <div><Button onClick={e=>{this.cartnoDetails(e,record)}}>明细</Button></div>
        },
    },
      
      
    ];
    
const colorname =this.state.colorname === undefined?"无":this.state.colorname;
const productname =this.state.productname === undefined?"无":this.state.productname;

    return (
      <Fragment>
        
        <Table
          title={()=>{return <span className={styles.titleStyle}>{colorname}-{productname}</span>}}
          loading={this.state.loading}
          columns={BatchColumns}
          dataSource={data}
          bordered
          
          pagination={false}
          onChange={(e,record)=>this.handleStandardTableChange(e,record)}
          rowKey={record => record.id}
          
          
        />
        <CreateForm {...parentMethods} modalVisible={modalVisible} params={params} />
        <CartnoForm 
          {...cartnoParentMethods} 
          modalVisible={cartnoModalVisible} 
          params={cartnoParams} 
          title={titlename} 
          pagination={pagination} 
          cartnoTerms={cartnoTerms} 
          goodMap={goodMap} 
          areaMap={areaMaps} 
        />
      </Fragment>
    );
  }
}
