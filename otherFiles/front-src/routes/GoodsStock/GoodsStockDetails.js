import React, { PureComponent,Fragment } from 'react';
import { connect } from 'dva';
import {  Form,  message } from 'antd';


import styles from '../Inquiry/InquiryProfile.less'
import {  queryGoodsStock, queryGoodsBasic,  queryGoods } from '../../services/api';
import GoodsStockProduct from './GoodsStockProduct';
import GoodsStockInput from './GoodsStockInput';
import GoodsStockOut from './GoodsStockOut';
import { getMyDate } from '../../utils/utils';


let defaultProductid = "";

@connect(({ goods, loading }) => ({
    goods,
  loading: loading.models.goods,
}))
@Form.create()
export default class GoodsStockDetails extends PureComponent {
    constructor(props) {
        super(props);
    
        this.state = {
          data: props.dataSource,
          
        };
      }

  componentDidMount() {
    
  }
  componentWillReceiveProps(nextProps) {
      
    this.setState({
      data: nextProps.dataSource,
    });
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
    
     
      const param =`terms[0].value=${id}&terms[0].column=productid&terms[1].value=${0}&terms[1].value=${-1}&terms[1].column=status&terms[1].termType=in`;
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
          goodterms += "terms[0].termType=in";
         
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
                  
                    for(let i = 0;i<arr.length;i++){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                        arr[i].area = goodArea.get (arr[i].goodid);
                        arr[i].deliverydate =goodDate.get(arr[i].goodid);
                     }
                      
                    
                  
                  
                  
                  this.setState({
                    dataRight:arr,
                    total:response.result.total,
                    productid:id,
                  
                  }
                  ); 
                }
              });
            
          
               
        }
      }
    )

     
    
    

    
  }
  saveBatch=(e)=>{
    if(defaultProductid==="" || defaultProductid !== e.productid){
      defaultProductid = e.productid;
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



  render() {
    const {data} = this.state;
    let outColumn =[];
    const inputColumn =[];
    let title="";
    
    if(data.flag === false){// 大货库存
        const valList=[{
            title: "客户名/日期",
            dataIndex: 'clientid',
            key: 'clientid',
            render:(val,record)=>{
              return (<div><li>{val}</li><li>{getMyDate(record.makedate)}</li></div>)
            },
          },
          {
            title: '销售单号/拣货单号',
            dataIndex: 'list',
            key: 'list',
            render:(val,record)=>{
                return (<div><li>{record.saleid}</li><li>{record.pickid}</li></div>)
            },
            
          },
          {
            title: '毛重(Kg)',
            dataIndex: 'gw',
            key: 'gw',
          },
          {
            title: '净重(Kg)',
            dataIndex: 'nw',
            key: 'nw',
          },
          {
            title: '总件数',
            dataIndex: 'piecenum',
            key: 'piecenum',
          },
          {
            title: '总只数',
            dataIndex: 'elementnum',
            key: 'elementnum',
          },
          ];
          outColumn =valList;
          inputColumn.push("入库单号");
          title="入库明细";
    }
   
    return (
      <Fragment>
        <div className={styles.tableList}>
          <div>
            <GoodsStockProduct dataSource={data.dataDetails} />
          </div>
          <div style={{height:400}}>
            <div style={{width:'49%',display:'inline-block',overflowY: "auto",height:350,float:'left'}}>
              <GoodsStockInput dataSource={data.inputDetailList} title={title} columns={inputColumn} />
            </div>
            <div style={{width:'49%',display:'inline-block',overflowY: "auto",height:350}}>
              <GoodsStockOut dataSource={data.outDetailList} columns={outColumn} />
            </div>
          </div>
           
        </div>
      </Fragment> 
    );
  }
}
