import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Table, message, InputNumber, Checkbox, Select,Form,Modal, Button } from 'antd';
import { routerRedux } from 'dva/router';
import { queryGoodsBasic, queryGoods, queryGoodslocation, addPickDetail } from '../../services/api';
import { changTypeEnum } from '../../utils/utils';
import TableRight from './TableRight';

let beforeProductid = '';
let selectedRowss = [];
const {Option} = Select;
const areaMap = new Map();
const operateProducts = new Map();
const completestatusList = ["","√"];
const GoodFrom = Form.create()(props => {
  const {
    modalVisible,
    form,
    handleModalVisible,
    handleClick,
    dataBatch,
  } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleClick(fieldsValue);
    });
  };
  const { getFieldDecorator } = form;

  let titlename = '货物列表';
  titlename += '·再分配';
  return (
    <Modal
      title={titlename}
      visible={modalVisible}
      onOk={okHandle}
      maskClosable={false}
      onCancel={() => handleModalVisible()}
    >
      <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
        <div>{getFieldDecorator('details', {})(<TableRight dataSource={dataBatch} />)}</div>
      </Form>
    </Modal>
  );
});
@connect(({ pickup, loading }) => ({
  pickup,
  loading: loading.models.pickup,
}))
export default class UpdatePickup extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: props.dataSource,
      loading: false,
      productid: props.productid,
      changeType:props.dataSource[0].changetype===undefined?0:props.dataSource[0].changetype,
      modalVisible:false,
    };
  }

  componentDidMount() {
    selectedRowss = [];
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.value === undefined){
      this.setState({
        data: nextProps.dataSource,
        
        productid: nextProps.productid,
      });
    }
    
  }
  // componentDidUpdate(nextProps, nextState) {

  //   this.state = {
  //     data: nextState.data,
  //     loading: false,
  //     selectedRows:selectedRowss,
  //     colorname: nextState.data.colorname,
  //     total:nextState.total,
  //     productid:nextState.productid,
  //   };

  // }

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }

  handleSelectRows = (selectedRowKeys, selectedRows) => {
    const selectData = selectedRows;

    // if(selectData.length !== 0){
    //   beforeProductid=selectData[0].productid;
    //   selectData.colorname =this.state.colorname;
    //   selectData.tag = true;
    //   this.props.callbackParent(selectData);
    // }else{
    //   selectData.id = beforeProductid;
    //   selectData.colorname = this.state.colorname;
    //   selectData.tag = false;
    //   this.props.callbackParent(selectData);
    // }

    // this.setState({
    //   selectedRows,

    // });
    this.props.onChange(selectData);
    this.setState({
      selectedRows,
    });
  };
  handleStandardTableChange = pagination => {
    this.setState({
      pageindex: pagination.current,
      pagesize: pagination.pageSize,
    });
    const terms = `terms[0].value=${this.state.productid}&terms[0].column=productid&pageSize=${
      pagination.pageSize
    }&pageIndex=${pagination.current - 1}&sorts[0].name=id&sorts[0].order=desc`;
    queryGoodsBasic(terms).then(res => {
      if (res && res.status === 200) {
        this.setState({
          pageindex: pagination.current,
          pagesize: pagination.pageSize,
          total: res.result.total,
          data: res.result.data,
        });
      }
    });
  };
  CheckboxChange = (e, fieldName, record) => {


    const newData = this.state.data.map(item => ({ ...item }));
    

    const target = this.getRowByKey(record.key, newData);

    if (target) {
      target[fieldName] = e.target.checked?1:0;;

      this.setState({ data: newData },()=>{
        this.props.onChange(newData);
      });
    }

    
    
  
  };
  handleClick=(fieldsValues)=>{
   
    const fieldsValue =fieldsValues.details; 
    if(fieldsValue.length === 0){
       message.warn("请勾选需要的缸号");
       return;
    }
    const counts ={
      count : 0,
    };
    for(let z=0;z<fieldsValue.length;z+=1){
      if(fieldsValue[z].output === 0 || fieldsValue[z].output === "" ){
        message.warn(`${fieldsValue[z].batchno}填写数量`);
        return;
        }
      
    }
    for(let i=0;i<fieldsValue.length;i+=1){
      fieldsValue[i].picknum = fieldsValue[i].output;
      addPickDetail(fieldsValue[i]).then(res=>{
        if(res && res.status === 200){
          counts.count+=1;
          if(counts.count === fieldsValue.length){
            message.success("提交成功");
            this.props.dispatch(routerRedux.push(`/order/pickup`));
          }
        
        }
      })
    }
    
  }
  handleRightChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    

    const target = this.getRowByKey(key, newData);
    if(target.checkStatus === 0){
      message.warning("请先勾选");
      return;
    }
    if (target) {
      target[fieldName] = e;

      this.setState({ data: newData },()=>{
        this.props.onChange(newData);
      });
    }

   
  }
  changeType=(e)=>{
    const newData = this.state.data;
    for(let i=0;i<newData.length;i+=1){
      newData[i].changetype = e;
    }
    this.setState({ data: newData,changeType:e },()=>{
      this.props.onChange(newData);
    });
  }
  handlePieceChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    

    const target = this.getRowByKey(key, newData);
    if(target.checkStatus === 0){
      message.warning("请先勾选");
      return;
    }
    const numfieldName = 'detailnum';
    const averageNum = (target.picknum/target.piece); 
    if (target) {
      target[fieldName] = e;
      target[numfieldName] = parseFloat((e*averageNum).toFixed(2));
      this.setState({ data: newData },()=>{
        this.props.onChange(newData);
      });
    }

   
  }
  openBatch = (e, id, colorname, productname,uuid) => {
    let arr = [];

    const param = `terms[0].value=${id}&terms[0].column=productid&terms[1].value=${0}&terms[1].value=${-1}&terms[1].column=status&terms[1].termType=in`;
    queryGoodsBasic(param).then(response => {
      if (response && response.status === 200) {
        arr = response.result.data;
        // if(id==='1533697589676000005'){

        //   arr =Demodata;
        // }else{
        //   arr =Demodata1;
        // }
        const goodids = [];
        let goodterms = 'terms[0].column=id&';

        for (let i = 0; i < arr.length; i += 1) {
          arr[i].key = `Goodsdetail${i}`;
          arr[i].output=0;
          arr[i].piece=0;
          arr[i].completestatus=0;
          if (goodids.indexOf(arr[i].goodid) === -1) {
            goodids.push(arr[i].goodid);
            goodterms += `terms[0].value=${arr[i].goodid}&`;
          }
        }
        goodterms += 'terms[0].termType=in';
        queryGoods(goodterms).then(goodsres => {
          if (goodsres && goodsres.status === 200) {
            const goodsData = goodsres.result.data;
            const goodArea = new Map();
            const goodDate = new Map();
            goodsData.forEach(item => {
              goodArea.set(item.id, item.area);
              goodDate.set(item.id, item.deliverydate);
            });
            arr.colorname = colorname;
            arr.productname = productname;
            const locationTerms = `terms[0].value=${id}&terms[0].column=productid&paging=false&terms[1].column=recordstatus&terms[1].value=0`;
            queryGoodslocation(locationTerms).then(lores=>{
              if(lores && lores.status===200){
               
                const piecemap = new Map();// 计算整件数
                const scatpiecemap = new Map();// 计算包数
                const cartnoData = lores.result.data;
                if (operateProducts.get(id)) {
                  const data = arr;
    
                  const selectdata = operateProducts.get(id);
                  for(let z=0;z<data.length;z+=1){
                    const cartnoChildren =[];// 子包
                    const cartnoList = [];// 父包
                    for(let s=0;s<cartnoData.length;s+=1){
                      
                      if(data[z].id === cartnoData[s].detailid){
                        arr[z].goodentryids = cartnoData[s].detailid;
                        if(cartnoData[s].newnw === cartnoData[s].weight){
                          cartnoList.push(cartnoData[s].id);
                        }else{
                          cartnoChildren.push(cartnoData[s].id);
                        }
                        
                       }
                    }
                    piecemap.set(data[z].id,cartnoList.length);
                    scatpiecemap.set(data[z].id,cartnoChildren.length);
                    
                    
                  }
                  for (let i = 0; i < data.length; i+=1) {
                    for (let j = 0; j < selectdata.length; j+=1) {
                      if (data[i].batchno === selectdata[j].batchno) {
                        data[i].output = selectdata[j].output;
                        data[i].piece = selectdata[j].piece;
                        data[i].completestatus = selectdata[j].completestatus;
                        data[i].piecenums =piecemap.get(data[i].id);
                        data[i].splitnums = scatpiecemap.get(data[i].id);
                        data[i].maxpiece = Math.ceil(selectdata[j].remainnum/(selectdata[j].totalnw /selectdata[j].allpiecenum));
                      }
                    }
                    data[i].sysuuid = uuid;
                    data[i].area = goodArea.get(data[i].goodid);
                    data[i].deliverydate = goodDate.get(data[i].goodid);
                  }
    
                  this.setState({
                    dataRight: data,
                    modalVisible: true,
                    productid: id,
                  });
                } else {
                  for(let z=0;z<arr.length;z+=1){
                    const cartnoChildren =[];// 子包
                    const cartnoList = [];// 父包
                    for(let s=0;s<cartnoData.length;s+=1){
                     
                      console.log("goodentryids", arr[z].goodentryids);
                      if(arr[z].id === cartnoData[s].detailid){
                        arr[z].goodentryids = cartnoData[s].detailid;
                        if(cartnoData[s].parentcartno ===undefined && cartnoData[s].newnw === cartnoData[s].weight){// 没有拆过算整件
                          cartnoList.push(cartnoData[s].id);
                        }else{
                          cartnoChildren.push(cartnoData[s].id);
                        }
                        
                       }
                    }
                    piecemap.set(arr[z].id,cartnoList.length);
                    scatpiecemap.set(arr[z].id,cartnoChildren.length);
                    
                    
                  }
               
                  for(let i = 0;i<arr.length;i+=1){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                      arr[i].area = goodArea.get (arr[i].goodid);
                      arr[i].piecenums =piecemap.get(arr[i].id);
                      arr[i].sysuuid = uuid;
                      
                      arr[i].splitnums = scatpiecemap.get(arr[i].id);
                      arr[i].deliverydate =goodDate.get(arr[i].goodid);
                      arr[i].maxpiece = Math.ceil(arr[i].remainnum/( arr[i].totalnw / arr[i].allpiecenum));
                   }
                  this.setState({
                    dataRight: arr,
                    modalVisible: true,
                    productid: id,
                  });
                }
              }
            });
            
          }
        });
      }
    });
  };
  
  handleadd=(e,productid,colorname,productname,uuid)=>{
    this.openBatch(e,productid,colorname,productname,uuid);
    
  }
  handleModalVisible=(flag)=>{
    this.setState({
      modalVisible:!!flag,
    })
  }
  render() {
    const {  data,modalVisible,dataRight } = this.state;
    console.log("data",data);
    const parentMethods = {
      handleSelectRows: this.handleSelectRows,
      handleModalVisible: this.handleModalVisible,
      handleClick: this.handleClick,
    };
    const BatchColumns = [
      {
        dataIndex: 'checkStatus',
        key: 'checkStatus',
        width:'3%',
        render: (val, record) => {
          if(record.status === 1){
            return <Checkbox disabled /> 
          }else{
               
            return <Checkbox checked={record.checkStatus===1} onChange={e => this.CheckboxChange(e, 'checkStatus',record)} />;
          }
         
          
        },
      },
      {
        title: '色号',
        dataIndex: 'colorname',
        key: 'colorname',
        width: '10%',
        render: (val, record) => {
          if (record.status === 1) {
            return (
              <div
                style={{ backgroundColor: '#E83632' ,cursor:"pointer" }}
                onClick={e => this.handleadd(e, `${record.productid}`, `${record.colorname}`, `${record.productname}`, `${record.sysuuid}`)}
              >
                <li>
              
                  {val}
                </li>
              </div>
            );
          } else {
            return (
              <div>
                <li>
                  {val}
                  {/* <a onClick={e=>this.openBatch(e,`${val.productid}`)}>{val.colorname}</a> */}
                </li>
              </div>
            );
          }
        
      },
      },
      {
        title: '色称',
        dataIndex: 'productname',
        key: 'productname',
        width: '10%',
      },
      {
        title: '缸号',
        dataIndex: 'batchno',
        key: 'batchno',
        width: '15%',
      },
      {
        title: '是否整件',
        dataIndex: 'completestatus',
        key: 'completestatus',
        width: '15%',
        render:val=>completestatusList[val],
      },
      {
        title: '出库数量',
        dataIndex: 'picknum',
        key: 'picknum',
        width: '10%',
      },
      {
        title: '修改数量',
        dataIndex: 'detailnum',
        key: 'detailnum',
        width: '15%',
        render: (text, record) => {
          if(record.completestatus===0 || record.status === 1){
            return (
              <InputNumber
                min={0.0}
                value={record.detailnum
                }
                defaultValue={record.picknum}
                onChange={e => this.handleRightChange(e, 'detailnum', record.key)}
              />
            );
          }else{
            return (
              <InputNumber
                min={0.0}
                value={record.detailnum
                }
                defaultValue={record.picknum}
                disabled
              />
            );
          }
          
        },
      },
      {
        title: '整件数',
        dataIndex: 'detailpiece',
        key: 'detailpiece',
        width: '15%',
        render: (text, record) => {
          if(record.completestatus === 0 || record.status === 1){
            return (
              <InputNumber
                min={0}
                defaultValue={record.piece}
                disabled
              />
            );
          }else{
            return ( 
              <InputNumber
                min={0}
                value={record.detailpiece}
                defaultValue={record.piece}
                onChange={e => this.handlePieceChange(e, 'detailpiece', record.key)}
              />
            );
          }
          
        },
      },
    ];

    return (
      <Fragment>
        <div>
          <span>需求更改来源:</span><Select style={{width:100}} value={this.state.changeType} onChange={e=>this.changeType(e)}>{changTypeEnum.map(changeTypeData=><Option key={changeTypeData.value}>{changeTypeData.key}</Option>)}</Select>
          <Table
          // title={() => `产品色号:${this.state.colorname}`}
            loading={this.state.loading}
            columns={BatchColumns}
            dataSource={data}
            bordered
            pagination={false}
            onChange={(e, record) => this.handleStandardTableChange(e, record)}
            rowKey={record => record.key}
            // rowSelection={rowSelection}
          />
        </div>
        <GoodFrom
          {...parentMethods}
          modalVisible={modalVisible}
          dataBatch={dataRight}
          />
      </Fragment>
    );
  }
}
