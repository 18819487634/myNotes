import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Row, Col, Select, Button, Table, Input, message } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from '../Inquiry/InquiryProfile.less'
import {  queryGoodsStock, queryGoodsBasic, queryDescBatchno, queryGoods } from '../../services/api';
import GoodsBathnoProfil from './GoodsBathnoProfil';


const FormItem = Form.Item;
const { Option } = Select;

const recordstatusArr = ['正常', '加急'];

const userMap = new Map();
@connect(({ goods, loading }) => ({
    goods,
  loading: loading.models.goods,
}))
@Form.create()
export default class GoodsStockProfile extends PureComponent {
  state = {
    panes: [{ key: '1' }],
    activeKey: '1',
    dataRight:[],
    defaultProductids:"",
    // pagesize: 12,
    // pageindex: 1,
    // userLists: [],
  };

  componentDidMount() {
      const terms="";    
      this.query(terms);
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  query = terms => {
    queryGoodsStock(terms).then(response => {
      if (response && response.status === 200) {
        const arr = response.result;
        for (let i = 0; i < arr.length; i += 1) {
          arr[i].key = `stock${i}`;
        }
        this.setState({
          data: arr,
          defaultProductids:"",
          dataRight:[],
        });
      }
    });
  };
  handlonKeyPress=(e)=>{
    if (e.key === 'Enter') {
        this.handleSearch();
      }
  }
  handleSearch = () => {
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((error, values) => {
    //   const terms ={
        
    //     seriesname
    //     remainnum
    //     locations
    
    //     productname
    
    //     colorname
    //     component
    //   }
    
        let count =0;
        let counts =0;
        for(const key in values){
           
            if(values[key] === ""){
               delete values[key];
               counts+=1;
            }
            else if(values[key] === undefined){
                count+=1;
            }     
                 
        }
        if(count === 4 ||  counts === 4){
            message.warning("需填写一个查询条件");
            return;
        }
       
      this.query(values);
    });
  };

  formatTerms = params => {
    const keys = [];
    const values = [];
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        keys.push(key);
        values.push(params[key]);
      }
    });
    let terms = `terms[0].value=0&terms[0].column=type`;
    if (keys.length > 0) {
      terms += `&`;
    }

    for (let i = 0; i < keys.length; i++) {
      if (keys.length === 1) {
        terms += `terms[1].value=${values[i]}&terms[1].column=${keys[i]}`;
      } else {
        terms += `terms[${i + 1}].value=${values[i]}&terms[${i + 1}].column=${keys[i]}`;
        if (keys.length !== i + 1) {
          terms += '&';
        }
      }
    }

    return terms;
  };
 

//   handleStandardTableChange = pagination => {
//     const { form, dispatch } = this.props;
//     form.validateFields((err, fieldsValue) => {
//       if (err) return;
//       this.setState({
//         pageindex: pagination.current,
//         pagesize: pagination.pageSize,
//       });
//       const terms = `terms[0].value=0&terms[0].column=type&pageSize=${
//         pagination.pageSize
//       }&pageIndex=${pagination.current - 1}&sorts[0].name=id&sorts[0].order=desc&terms[1].value=${getSupplyId}&terms[1].column=supplyid`;
//       dispatch({
//         type: 'offlinepurchase/fetch',
//         payload: terms,
//       });
//     });
//   };
openBatch=(id,colorname,productname)=>{
    let arr =[];
    
     
      const param =`terms[0].value=${id}&terms[0].column=productid&terms[1].value=${0}&terms[1].value=${-1}&terms[1].column=status&terms[1].termType=in&paging=false`;
      queryGoodsBasic(param).then((response)=>{
        if(response && response.status===200){
         arr =response.result.data
          // if(id==='1533697589676000005'){
            
          //   arr =Demodata;
          // }else{
          //   arr =Demodata1;
          // }
          const goodids = [];
          let goodterms = "terms[0].column=id&";
        
          for(let i =0;i< arr.length;i+=1){
            arr[i].key= `Goodsdetail${arr[i].id}${i}`;
            
            if(goodids.indexOf(arr[i].goodid)===-1){
              goodids.push(arr[i].goodid);
              goodterms += `terms[0].value=${arr[i].goodid}&`;
              
              
            }
           
          }
          goodterms += "terms[0].termType=in&paging=false";
         
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
                  const batchnos = [];
                  const arealist = [];
                  const datafomate = [];
                  const arrList  = [];
                    for(let i = 0;i<arr.length;i++){
                      arr[i].area = goodArea.get (arr[i].goodid);
                      arr[i].batchnoarea = `${arr[i].batchno}${arr[i].area}`;
                      
                        if(batchnos.indexOf(arr[i].batchnoarea) === -1 ){
                          batchnos.push((arr[i].batchnoarea));
                          datafomate.push(arr[i]);
                         
                        }else{
                          arrList.push(arr[i]);
                        }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
                        
                     }
                     const dataArr =[];
                     for(let z = 0;z<datafomate.length;z++){
                      if(dataArr.indexOf(datafomate[z].locations) === -1){
                        dataArr.push(datafomate[z].locations);
                      }
                      for(let j = 0;j<arrList.length;j++){
                        if(datafomate[z].batchno === arrList[j].batchno && datafomate[z].area === arrList[j].area){
                          const remainnums = parseFloat(arrList[j].remainnum===undefined?0:arrList[j].remainnum) + parseFloat(datafomate[z].remainnum===undefined?0:datafomate[z].remainnum);
                          
                          datafomate[z].remainnum = parseFloat(remainnums).toFixed(2);
                          if( datafomate[z].locations.indexOf(arrList[j].locations) === -1){
                            datafomate[z].locations += `,${arrList[j].locations}`;
                          }
                          
                          // const dataArr =  `${datafomate[z].locations}`.split(",") ;
                          
                          // if( dataArr.indexOf(arrList[j].locations.substring(0,arrList[j].locations.indexOf(",")-1))===-1){
                          //   datafomate[z].locations += arrList[j].locations;
                          // }
                         
                        }
                     }
                     
                     datafomate[z].colorname = colorname;
                     datafomate[z].productname = productname;
                     datafomate[z].deliverydate =goodDate.get(datafomate[z].goodid);
                     datafomate.colorname = colorname;
                     datafomate.productname = productname;
                   }
                    
                  
                  
                  
                  this.setState({  
                    dataRight:datafomate,
                    total:response.result.total,
                    productid:id,
                    defaultProductids:id,
                  }
                  ); 
                }
              });
            
          
               
        }
      }
    )
  }
  saveBatch=(e)=>{
    const defaultProductid = this.state.defaultProductids;
    if(defaultProductid==="" || defaultProductid !== e.productid){
      
      if(e.productid !== undefined){
        this.openBatch(e.productid,e.colorname,e.productname,e.num,e.usrid);
      }
    }
  }
  remove = targetKey => {
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
    this.setState({ panes, activeKey: activeKeys });
  };

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="色号">
              {getFieldDecorator('colorname')(<Input placeholder="请输入"  onKeyPress={e => this.handlonKeyPress(e)} />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="色称">
              {getFieldDecorator('productname')(<Input placeholder="请输入" onKeyPress={e => this.handlonKeyPress(e)} />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="系列">
              {getFieldDecorator('seriesname')(<Input placeholder="请输入" onKeyPress={e => this.handlonKeyPress(e)} />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="位置">
              {getFieldDecorator('location')(<Input placeholder="请输入" onKeyPress={e => this.handlonKeyPress(e)} />)}
            </FormItem>
          </Col>
          

          <Col md={24} sm={24}>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ float: 'right', marginBottom: 24 }}>
                <Button type="primary" onClick={this.handleSearch} >
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

  render() {
    const dataBatch = this.state.dataRight;
    const {data} = this.state;
    const columns = [
      
      {
        title: '色号',
        dataIndex: 'colorname',
        key: 'colorname',
        
      },
      {
        title: '色称',
        dataIndex: 'productname',
        key: 'productname',
      },
      {
        title: '系列',
        dataIndex: 'seriesname',
        key: 'seriesname',
      },
      // {
      //   title: '位置',
      //   dataIndex: 'locations',
      //   key: 'locations',

      // },
      {
        title: '库存量',
        dataIndex: 'remainnum',
        key: 'remainnum',
      },
    //   {
    //     title: '数量（Kg）',
    //     dataIndex: 'num',
    //     key: 'num',
    //   },
    //   {
    //     title: '货款',
    //     dataIndex: 'goodspay',
    //     key: 'goodspay',
    //     render: val => `￥ ${val}`,
    //   },
    ];

    return (
      <PageHeaderLayout title="大货库存">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
            
            <div className={styles.tableListOperator} />
            <div style={{width:'100%'}}>
              <div style={{width:'45%',display:"inline-block",float:'left'}}>
                <Table
                  rowKey={record => record.key}
             
                  onRow={(e) => ({
                    onClick: () => {
                        this.saveBatch(e);
                    },
                    })}
                  dataSource={data}
                  columns={columns}
                />
              </div>
              <div   style={{overflowY: "auto",width:'54%',height:500,display:"inline-block"}}> 
                
                <GoodsBathnoProfil
               
                  callbackParent={this.onChildChanged}
                  total={this.state.total}
                  productid={this.state.productid}
                  dataSource={dataBatch}
            
                
                
                />
              </div>
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
