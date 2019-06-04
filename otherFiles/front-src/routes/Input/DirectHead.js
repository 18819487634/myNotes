import React, { PureComponent, Fragment } from 'react';
import { Table, InputNumber, Input, DatePicker, message, Checkbox,Select, Modal } from 'antd';
import moment from 'moment';
import styles from './InputProfile.less';

import {  queryColorProduct, querysupplydictionry, queryuserlocation, queryGoodsBasicNoPaging, queryProductids } from '../../services/api';
import { getSupplyId, getCurrentUser } from '../../utils/sessionStorage';

let arrData = [];
let defaultProductid = '';
const own = 'ownnum';
const chase = 'transnum';
const spot = 'spotnum';
const {Option} =Select;
const confirms = Modal.confirm;
const areaMap = new Map();
const provinceData= [];
// const productData = new Map();

export default class DirectHead extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
        locationdata:[],
      dataRight: [],
      
      codeFlag:false,// 判断是否在自己修改状态
    data:props.dataSource,
    fineCode:props.dataSource[0].fineCode,
      loading: false,
    };
  }
  componentDidMount() {
    const paramss = "terms[0].value=3&terms[0].column=type";
    querysupplydictionry(paramss).then(res=>{
      if(res && res.status === 200){
        const datas = res.result.data;
        
        datas.forEach(item=>{
          areaMap.set(item.value,item.key);
          
        });
        const currentname = JSON.parse(getCurrentUser()).username;
    const params = `terms[0].value=${currentname}&terms[0].column=username`;
    queryuserlocation(params).then(ress=>{
      if(ress && ress.status === 200){
        const uldata = ress.result.data; 
        const areaData = [];
        if(uldata.length !== 0){
          const locationdata = [];
          const locations =[];
          const areaValue =[];
        const  lddata =`${uldata[0].locations}`.split(",");
        for(let i=0;i<uldata.length;i+=1){

          areaData.push(<Option key={uldata[i].id} value={uldata[i].area}>{areaMap.get(`${uldata[i].area}`)}</Option>);
          areaValue.push(uldata[i].area);
        }

        lddata.forEach(item=>{
            
            locations.push(<Option key={`${item}`}>{`${item}`}</Option>);
         
            locationdata.push(item);
          });
        this.setState({
            areaData,
            defaultArea:areaValue[0],
            locationdata:locationdata[0],
            locations,
          })
          const dataReuslt = this.state.data;
          dataReuslt[0].area = areaValue[0];
          dataReuslt[0].locations = locationdata[0];
          dataReuslt[0].locationdata = locations;
          this.props.onChange(dataReuslt);
        }else{
          message.warn("您不是仓管员，无法入库");
        }
        
      }
    });
   
        
      }
    });
  }

  componentWillReceiveProps(nextProps) {
  
    if (nextProps.value === undefined) {
    //   const concatSoures = this.state.concatSoure;
    //   concatSoures[0].comment = nextProps.dataSource.goodspay;
    //   concatSoures[1].comment = nextProps.dataSource.shippay;

    //   concatSoures[2].comment = nextProps.dataSource.securepay;
    //   concatSoures[6].comment = nextProps.dataSource.sum;
    //   concatSoures[5].comment = nextProps.dataSource.num;
      this.setState({
        data: nextProps.dataSource,
      });
    }
    // if(this.state.fineCode !==undefined  && this.state.fineCode !== nextProps.dataSource[0].fineCode ){
    //   this.setState({
    //     data: nextProps.dataSource,
    //     fineCode:nextProps.dataSource[0].fineCode,
    //     // codeFlag:false,
    //   });
    // }
  }

 

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
  checkBoxOnchage = e => {
    const Data = this.state.data;
    Data.tag = e.target.checked;
    this.setState({

      data: Data,
      tag: e.target.checked,
    });
    const result = this.state.data.concat(this.state.concatSoure);

    this.props.onChange(result);
  };
  handleKeyPress(e, key, record) {
    if (e.key === 'Enter') {
      this.searchProduct(record);
    }
  }
  searchProduct = record => {
    const colorname= record.colorname.toUpperCase();
    const params = `terms[0].value=${
        colorname
    }&terms[0].column=colorname&terms[1].value=${getSupplyId()}&terms[1].column=supplyid`;
    queryColorProduct(params).then(res => {
      if (res && res.status === 200) {
        const Data = res.result.data;
        const listData = this.state.data;
        listData[0].colorname =colorname;
     //   const concatData = this.state.concatSoure;
        if (Data.length === 0) {
          message.error('没有找到该产品！');
          for (let i = 0; i < listData.length; i += 1) {
            if (listData[i].colorname === record.colorname) {
              listData[i].productname = '';
              listData[i].productid = '';
              listData[i].price = '';
            }
          }
        } else {
       

          for (let i = 0; i < listData.length; i += 1) {
            if (listData[i].colorname === Data[0].colorname) {
              listData[i].productname = Data[0].productname;
              listData[i].material = Data[0].yarn;
              listData[i].productid = Data[0].id;
              listData[i].price = Data[0].price;
            }
           
          }

        //   concatData[0].comment = goodspay;
        //   concatData[6].comment = goodspay + concatData[1].comment + concatData[2].comment;
        }
        this.setState({
          data: listData,
        //  concatSoure: concatData,
        });
        const result = this.state.data;

        this.props.onChange(result);
      }
    });
  };
  generalSum() {
    const newData1 = this.state.data.map(item => ({ ...item }));
    newData1.tag = this.state.tag;
    let huokuan = 0;
    let sumnum = 0;
    for (let i = 0; i < newData1.length; i += 1) {
      newData1[i].money = parseFloat(newData1[i].num * newData1[i].price).toFixed(2);
      huokuan += Number(newData1[i].money);
      sumnum += Number(newData1[i].num);
    }

    const concatData = this.state.concatSoure.map(item => ({ ...item }));
    const goodspay = Number(concatData[1].comment);
    const securepay = Number(concatData[2].comment);
    const taxpay = Number(concatData[3].comment);
    const remake = 'comment';
    const sum = huokuan + goodspay + securepay + taxpay;
    // 货款
    const targetPrcie = this.getRowByKey('concat1', concatData);

    // 已选产品
    const targetNum = this.getRowByKey('concat6', concatData);
    // 合计
    const targetSum = this.getRowByKey('concat7', concatData);
    targetPrcie[remake] = this.changeTwoDecimalf(huokuan);
    targetNum[remake] = this.changeTwoDecimalf(sumnum);

    targetSum[remake] = this.changeTwoDecimalf(sum);
    this.setState({
      concatSoure: concatData,
      data: newData1,
    });
    const result = this.state.data.concat(this.state.concatSoure);

    this.props.onChange(result);
  }

  handleFieldChange(e, fieldName, key) {
    const newData = this.state.concatSoure.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e===""?0:e;
      this.setState({ concatSoure: newData }, () => {
        this.generalSum();
      });
    }
  }
  handleInputnumerChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      this.setState({ data: newData }, () => {
        this.props.onChange(this.state.data);
      });
    }
  }

  handlSelecAreaChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
   
   
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      const params = `paging=false&terms[0].value=2&terms[0].column=type&terms[1].value=${e}&terms[1].column=value&terms[2].value=${getSupplyId()}&terms[2].column=supplyid&terms[3].value=1&terms[3].column=isact`;
      querysupplydictionry(params).then(res=>{
        if(res && res.status === 200){
          const datas = res.result.data;
          const locations = [];
          const locationdata =[];
          datas.forEach(item=>{
            
            locations.push(<Option key={`${item.key}`}>{`${item.key}`}</Option>);
         
            locationdata.push(item.key);
          });
          const location = "locations";
          const locationdfield = "locationdata";
          target[locationdfield] = locationdata;
          target[location] = locationdata[0]===undefined?"":locationdata[0];
                this.setState({ data: newData,locations,locationdata:locationdata[0],defaultArea:e },()=>{
                    this.props.onChange(newData);
                });
          }
      })
       
    }

  }

  handlSelectChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
   
   
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      
          
        this.setState({ data: newData,locationdata:e },()=>{
            this.props.onChange(newData);


        })
        }

  }
  handlechange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    newData.tag = this.state.tag;
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData },()=>{
        
      this.props.onChange(newData);
      });


    }
  }
  checkBatchno=(e,record)=>{
    if(record.productid === undefined || record.batchno === ""){
      return;
    }
    const terms = `terms[0].value=${record.batchno}&terms[0].column=batchno`;
    queryGoodsBasicNoPaging(terms).then(res=>{
        if(res && res.status === 200){
          const goodsdetails  = res.result;
          if(goodsdetails.length>0){
            let repeatBatchno = '';
            const repeatProductid = [];
            goodsdetails.forEach(item=>{
              if(record.productid !== item.productid && repeatProductid.indexOf(item.productid)===-1){
                repeatProductid.push(item.productid);
              }
            });
            if(repeatProductid.length>0){
              queryProductids(repeatProductid).then(pres =>{
                if(pres && pres.status === 200){
                  const productDatas = pres.result;
                  productDatas.forEach(item=>{
                    if(repeatProductid.indexOf(item.id)>-1 && repeatBatchno.indexOf(item.colorname)===-1){
                      repeatBatchno+= `${item.colorname}`;
                    }
                  })
                  confirms({
                    title: `此缸号以下产品已经有录入过，请确定`,
                    content: repeatBatchno,
                    onOk() {
                      
                    },
                    onCancel() {},
                  });
                }
              });
            }
           
          }
        }
    });
  }

  handleDatachange(e, b, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    newData.tag = this.state.tag;
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = b;
      this.setState({ data: newData });
      const result = this.state.data;

      this.props.onChange(result);
    }
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

    const result = this.state.data;

    this.props.onChange(result);
  }

  handleConcatChange(e, fieldName, key) {
    let sumown = 0;
    let sumchase = 0;
    let sumspot = 0;

    let sum = 0;
    const newData = this.state.concatSoure.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      this.setState({ concatSoure: newData });
    }
    newData.forEach(item => {
      // 计算小计

      if (item.key === 'concat5' || item.key === 'concat6' || item.key === 'concat7') {
        sumown += Number(item.ownnum === undefined ? 0 : item.ownnum);
        sumchase += Number(item.transnum === undefined ? 0 : item.transnum);
        sumspot += Number(item.spotnum === undefined ? 0 : item.spotnum);

        sum = sumown + sumchase + sumspot;
      }
    });

    // 获取到小计
    const targetNum = this.getRowByKey('concat8', newData);
    // 获取到总计
    const targetSum = this.getRowByKey('concat9', newData);
    targetNum[own] = this.changeTwoDecimalf(sumown);
    targetNum[chase] = this.changeTwoDecimalf(sumchase);
    targetNum[spot] = this.changeTwoDecimalf(sumspot);

    targetSum[own] = this.changeTwoDecimalf(sum);

    this.setState({ concatSoure: newData });
    const result = this.state.data;

    this.props.onChange(result);
  }

  sumTotal = (num = 0) => {
    let snum = 0;
    snum += Number(num);
    return snum;
  };

  changeTwoDecimalf = x => {
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
  };

 


  handleRightChange(e, fieldName, key) {
    const newData = this.state.dataRight.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
    }
    this.setState({
      dataRight: newData,
    });
  }
   changStatus=(e,fieldName,key)=>{
    const newData = this.state.data.map(item => ({ ...item }));
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.checked?1:2;     
      this.setState({ data: newData,fineCode: e.target.checked?1:2,codeFlag:true },()=>{
        
      this.props.onChange(newData);
      });
      
    }
  }

  InputNumberBlur() {
    const result = this.state.data;

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
    const startTime = moment().format('YYYY-MM-DD');
    const {locationdata} = this.state;
    const dataSource = this.state.data;
    const renderContent = (value, row, index) => {
      const obj = {
        children: value,
        props: {},
      };
      // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
      if (
        index === dataSource.length ||
        index - 1 === dataSource.length ||
        index - 2 === dataSource.length ||
        index - 3 === dataSource.length ||
        index - 4 === dataSource.length ||
        index - 5 === dataSource.length ||
        index - 6 === dataSource.length ||
        index - 7 === dataSource.length ||
        index - 8 === dataSource.length
      ) {
        obj.props.colSpan = 0;
      }
      return obj;
    };

    
    arrData = dataSource;
    const columns = [
      {
        title: '产品信息',

        dataIndex: 'colorname',
        key: 'colorname',
        width: '5%',
        colSpan: 2,
        render: (val, record) => {
          
            return (
              <Input
                defaultValue={val}
                placeholder="色号"
                onChange={e => this.handlechange(e, 'colorname', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key, record)}
              />
            );
          
        },
      },
      {
        colSpan: 0,
        width: '5%',
        dataIndex: 'productname',
        key: 'productname',
        render: renderContent,
      },
      {
        width: '10%',
        title: '缸号',

        dataIndex: 'batchno',
        key: 'batchno',
       
        render: (val, record) => {
          
            return (
              <Input
                defaultValue={val}
                placeholder="缸号"
                onBlur={e=>this.checkBatchno(e,record)}
                onChange={e => this.handlechange(e, 'batchno', record.key)}
              />
            );
          
        },
      },
      {
        title: '货期 ',
        dataIndex: 'deliverydate',
        key: 'deliverydate',
        width: '10%',
        render: (val, record) => {
         
            return (
              <DatePicker
                defaultValue={moment(startTime,'YYYY-MM-DD')} 
                onChange={(e, b) => this.handleDatachange(e, b, 'deliverydate', record.key)}
                styel={{ width: 100 }}
              />
            );
          
        },
      },
      {
        title: '备注 ',
        dataIndex: 'comment',
        key: 'comment',
        width: '10%',
        render: (val, record) => {
         
            return (
              <Input
                placeholder="备注"
                onChange={e => this.handlechange(e, 'comment', record.key)}
              />
            );
          
        },
      },
    ];

    const columns2 = [
      {
        title: '细码',
        dataIndex: 'fineCode',
        key: 'fineCode',
        width: '3%',
        render: (val, record) => {
         
        return (
          <Checkbox  checked={record.fineCode===1}  onChange={e=>this.changStatus(e, 'fineCode', record.key)} />
        );
          
        },
      },
        {
          title: '损耗系数',
  
          dataIndex: 'lossfactor',
          key: 'lossfactor',
          width: 70,
          render: (val, record) => {
            
              return (
                <InputNumber
                  defaultValue={val}
                  min={0.0}
                  style={{width:70}}
                  formatter={value => `${value}Kg`}
                  parser={value => value.replace('Kg', '')}
                  onChange={e => this.handleInputnumerChange(e, 'lossfactor', record.key)}
                />
              );
            
          },
        },
        {
          title: '纸桶(Kg)',
          width: 70,
          dataIndex: 'paperweight',
          key: 'paperweight',
          render: (val, record) => {
            
            return (
              <InputNumber
                defaultValue={val}
                min={0.0}
                style={{width:70}}
                formatter={value => `${value}/只`}
                parser={value => value.replace('/只', '')}
                onChange={e => this.handleInputnumerChange(e, 'paperweight', record.key)}
               
              />
            );
          
        },
        },
        {
            title: '包装袋(Kg)',
            width: 70,
            dataIndex: 'wrapperweight',
            key: 'wrapperweight',
            render: (val, record) => {
              
              return (
                <InputNumber
                  defaultValue={val}
                  min={0.0}
                  style={{width:70}}
                  formatter={value => `${value}/条`}
                  parser={value => value.replace('/条', '')}
                  onChange={e => this.handleInputnumerChange(e, 'wrapperweight', record.key)}
                 
                />
              );
            
          },
        },
        {  
            title: '包装只数',
            width: 70,
            dataIndex: 'piecenum',
            key: 'piecenum',
            render: (val, record) => {
              
              return (
                <InputNumber
                  defaultValue={val}
                  min={0.0}
                  style={{width:70}}
                  formatter={value => `${value}只`}
                  parser={value => value.replace('只', '')}
                  onChange={e => this.handleInputnumerChange(e, 'piecenum', record.key)}
                 
                />
              );
            
          },
        },
        {
          title: '平均每件净重(Kg)',
          dataIndex: 'pieceweight',
          key: 'pieceweight',
          width: 70,
          render: (val, record) => {
           
              return (
                <InputNumber
                  defaultValue={val}
                  style={{width:70}}
                  min={0.0}
                  onChange={e => this.handleInputnumerChange(e, 'pieceweight', record.key)}
                   
                />
                );
            
          },
        },
  
        {
          title: '平均每件毛重(Kg)',
          dataIndex: 'pieceroughweight',
          key: 'pieceroughweight',
          width: 70,
          render: (val, record) => {
           
            return (
              <InputNumber
                defaultValue={val}
                style={{width:70}}
                min={0.0}
                onChange={e => this.handleInputnumerChange(e, 'pieceroughweight', record.key)}
                 
              />
              );
              
            
          },
        },
        
        {
            title: '零散个数',
            dataIndex: 'scatpiece',
            key: 'scatpiece',
            width: 70,
            render: (val, record) => {
             
                return (
                  <InputNumber
                    defaultValue={val}
                    style={{width:70}}
                    min={0.0}
                    onChange={e => this.handleInputnumerChange(e, 'scatpiece', record.key)}
                     
                  />
                  );
              
            },
          },
          {
            title: '仓库',
            dataIndex: 'area',
            key: 'area',
            width: '15%',
            render: (val, record) => {

                return (
                  <Select
                    value={this.state.defaultArea}
                    style={{ width: 120 }} 
                    onChange={e=>this.handlSelecAreaChange(e,'area',record.key)}
                  >
                    {this.state.areaData}
                  </Select>
                  );
              
            },
          },
          {
            title: '存放区域',
            dataIndex: 'locations',
            key: 'locations',
            width: '15%',
            render: (val, record) => {
             
                return (
                  <Select
                    showSearch
                    value={locationdata}
                    style={{ width: 120 }}
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    onChange={e=>this.handlSelectChange(e,'locations',record.key)}
                  >
                    {this.state.locations}
                  </Select>
                  );
              
            },
          },
          
      ];

    return (
      <Fragment>

        <div className={styles.tableList} style={{width:1200}} >
          <div style={{width:900}}>
            <Table
              loading={this.state.loading}
              columns={columns}
              dataSource={arrData}
              pagination={false}
            />
          </div>
          <div style={{minWidth:1200}}>
            <Table
              loading={this.state.loading}
              columns={columns2}
             // style={{width:'70%',overflowX:'auto'}}
              dataSource={arrData}
              pagination={false}
            />
          </div>
        </div>
        
      </Fragment>
    );
  }
}
 
 