import React, { PureComponent, Fragment } from 'react';
import { Table, message, Modal, Form, Checkbox } from 'antd';
import UpdatePickup from '../Presale/UpdatePickup';
import { queryPickupForid, queryProductids, queryPresaleById, updatePresaledetail } from '../../services/api';
import { getMyDate } from '../../utils/utils';


let selectedRowss = [];
const checkDataList = [];
const recordstatuss= [3,4,6,7];

const GoodFrom = Form.create()(props => {
  const {
    modalVisible,
    form,
    handleModalVisible,
    dataBatch,
    handlclick,
   
  } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      
        handlclick(fieldsValue.tableTop, dataBatch);
      
    });
  };
  const { getFieldDecorator } = form;

  let titlename = '货物列表';
 
    titlename += '·修改';
    return (
      <Modal
        title={titlename}
        visible={modalVisible}
        onOk={okHandle}
        maskClosable={false}
        okText="确定修改"
        width={800}
        onCancel={() => handleModalVisible()}
      >
        <Form onSubmit={this.validate} layout="vertical" hideRequiredMark>
          <div>{getFieldDecorator('tableTop', {})(<UpdatePickup dataSource={dataBatch} />)}</div>
        </Form>
      </Modal>
    );
 
});
export default class PickUpTable extends PureComponent {
  constructor(props) {
    super(props);
 
    this.state = {
      data: props.dataSource,
      loading: false,
      tag: props.dataSource.tag,
    };
   
  }

  componentDidMount() {
 
    checkDataList.length=0;
    
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.dataSource,
    });
  }
  componentDidUpdate(nextProps, nextState) {
    this.state = {
      data: nextState.data,
      loading: false,
      selectedRows: selectedRowss,
    };
  }

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
  

  handleSelectRows = (selectedRowKeys, selectedRows) => {
    this.props.onChange(selectedRows);
  };
  handleRightChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    selectedRowss = this.state.selectedRows === undefined ? [] : this.state.selectedRows;

    const oncedata = [];

    const target = this.getRowByKey(key, newData);

    if (target) {
      target[fieldName] = e;

      this.setState({ data: newData });
    }

    if (selectedRowss.length !== 0) {
      newData.forEach(item => {
        selectedRowss.forEach(sItem => {
          if (item.key === sItem.key) {
            oncedata.push(item);
          }
        });
      });
      this.props.callbackParent(oncedata);
    }
  }
  updatePickup=(e,record)=>{
   
   
   if(recordstatuss.indexOf(record.recordstatus)>-1){
     message.warning("该拣货单已经完成，不能修改数量",3);
     return;
   }

   
   queryPickupForid(record.sysuuid).then(res=>{
     if(res && res.status===200){
      const pickupdetails = res.result.details;
     const pickupData= [];
     const productids = [];
     
     pickupdetails.forEach(item=>{
      //  if(item.status !== 1 && item.status !== 3){  // 异常状态排除
      if(item.status !== 2){// 取消状态
        pickupData.push(item);
          productids.push(item.productid);
      }
          
       // }
     });
     if(productids.length === 0){
      productids.push(null);
     }
     queryProductids(productids).then((resn)=>{
      if(resn && resn.status ===200){
        const productData = resn.result;

          for(let z=0;z<pickupData.length;z+=1){
            for(let j = 0;j<productData.length;j+=1){
              if(productData[j].id === pickupData[z].productid){
                pickupData[z].key = pickupData[z].id;
                pickupData[z].presaleid = record.presaleid;
                pickupData[z].detailnum = pickupData[z].picknum;
                pickupData[z].detailpiece = pickupData[z].piece; 
                pickupData[z].checkStatus = 0;
                pickupData[z].sysuuid = record.uuid;
                pickupData[z].changetype = "0";
                pickupData[z].colorname = productData[j].colorname;
                pickupData[z].productname = productData[j].productname;
              }
              
          }
        }
        this.setState({
          modalVisible: true,
          dataBatch:pickupData,
         });
      }else{
        message.warn(`${resn.result.message},请稍候操作`);;
      }
    })
    }
     
     
   })
   
   
  }
  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };
  handlclick = (fieldsValue,dataBatch) => {

    const detailData =[];
    if(fieldsValue===undefined){
      message.warning("请勾选需要修改的缸号!");
      return;
    }
    queryPresaleById(dataBatch[0].presaleid).then(res=>{
      const dataResult = res.result.details;
      
      
      
        for(let j=0;j<fieldsValue.length;j+=1){
          for(let i=0;i<dataResult.length;i+=1){
          if(dataResult[i].productid === fieldsValue[j].productid && fieldsValue[j].checkStatus === 1){
          
            const datalist ={
              attributetype:dataResult[i].attributetype,
              comment:dataResult[i].comment,
              completestatus:dataResult[i].completestatus,
              deliverydate:dataResult[i].deliverydate,
              changetype:fieldsValue[j].changetype,
              detailnum:fieldsValue[j].detailnum,
              id:dataResult[i].id,
              num:dataResult[i].num,
              piece:fieldsValue[j].detailpiece,
              pickdetailid:fieldsValue[j].id,
              presaleid:dataResult[i].presaleid,
              price:dataResult[i].price,
              
              productid:dataResult[i].productid,
              status:dataResult[i].status,
              usefor:dataResult[i].usefor,
            }
            
            // datalist.pickdetailid =fieldsValue[j].id;
            // datalist.detailnum =fieldsValue[j].detailnum;
            detailData.push(datalist);
          }
        }
      }
     
      
      if(detailData.length===0){
        message.warning("请勾选需要修改的缸号!");
        return;
      }
      const counts ={
        count:0,
      };
      for(let ld=0;ld<detailData.length;ld+=1){
        updatePresaledetail(detailData[ld]).then(upres=>{
              if(upres && upres.status===200){
                counts.count +=1;
               
               
                if(counts.count === detailData.length){
                  message.success("提交成功！");
                const datas = this.state.data;
                
                queryPickupForid(dataBatch[0].sysuuid).then(pres=>{
                  const dataResults = pres.result.details;
                  for(let i=0;i<datas.length;i+=1){
                    for(let j=0;j<dataResults.length;j+=1){
                      if(dataResults[i].id === datas[j].id ){
                        datas[i].picknum =dataResults[i].picknum;
                        
                      }
                    }
                  }
                  this.setState({
                    modalVisible: false,
                    data:datas,
                   
                  })
                })
                
                }
                
              }else if(upres && (upres.status===400 || upres.status===500)){
                message.error(upres.message);
          
              }
            });
      }
     
    })
    // if (fieldsValue) {
    //   for (let z = 0; z < fieldsValue.length; z += 1) {
        
        
    //   }
    //   const newdata = this.state.data;
    //   for (let i = 0; i < newdata.length; i += 1) {
    //     if (newdata[i].productid === fieldsValue[0].productid) {
          
    //         newdata[i].updatenum = num;
          
    //     }
    //   }

    //   this.setState(
    //     {
    //       data: newdata,
    //       modalVisible: false,
    //     },
    //     () => {
    //     }
    //   );
    // }
  };
  CheckboxChange = (e, record) => {
    const Data = this.state.data;
    const checkData = [];
    for(let i =0; i<Data.length;i+=1){
      if (Data[i].sysuuid === record.uuid) {
        checkData.push(Data[i]);
         
      }
    }

    for(let i =0; i<checkData.length;i+=1){
          if((checkData[i].status===1||checkData[i].status===3)&& checkData[i].ok ===0 &&i===0 && checkData.length !== 1){
            checkData[i+1].uuid =record.uuid;
          }else{
            checkDataList.push(checkData[i]);
          }   
      
    }
    
    this.props.onChange(checkDataList);
  };

  render() {
    const { selectedRows, data,modalVisible,dataBatch } = this.state;
    // const rowSelection = {
    //   selectedRows,

    //   onChange : this.handleSelectRows,
    // };
    const parentMethods = {
      
      handleModalVisible: this.handleModalVisible,
      handlclick: this.handlclick,
    };
    const BatchColumns = [
      {
        dataIndex: 'checkBox',
        key: 'checkBox',
        render: (val, record) => {
          if (record.uuid === '') {
            return <span />;
          } else {
            
            return <Checkbox onChange={e => this.CheckboxChange(e, record)} />;
          }
        },
      },
      {
        title: '拣货单号',
        dataIndex: 'uuid',
        key: 'uuid',
        width: '20%',
        render:(val,record)=>{
          if(recordstatuss.indexOf(record.recordstatus)===-1){
            return <span><a onClick={e=>this.updatePickup(e,record)}>{val}</a></span>
          }else{
            return <span>{val}</span>
          }
          
        },
      },
      {
        title: '色号/色称',
        dataIndex: 'incommedate',
        key: 'incommedate',
        width:'10%',
        render: (val, record) => {
           if(record.status===1){
            return (
              <div style={{backgroundColor:'#E83632' }}>
                <li>{record.colorname}</li>
                <li>{record.productname}</li>
              </div>
            );
          }else if(record.status===3){
            return (
              <div style={{backgroundColor:'#E83632' }}>
                <li style={{textDecoration:'line-through'}}>{record.colorname}</li>
                <li style={{textDecoration:'line-through'}}>{record.productname}</li>
              </div>
            );
          }
          else if (record.status === 0 && record.flag === false) {
            return (
              <div style={{ backgroundColor: '#CCCCCC' }}>
                <li>{record.colorname}</li>
                <li>{record.productname}</li>
              </div>
            );
          } else {
            return (
              <div>
                <li>{record.colorname}</li>
                <li>{record.productname}</li>
              </div>
            );
          }
          
        },
      },
      
      {
        title: '缸号',
        dataIndex: 'batchno',
        key: 'batchno',
        width:'10%',
        render:(val,record)=>{
          if(record.status===3){
            return (
              <div >
                <li style={{textDecoration:'line-through'}}>{val}</li>
               
              </div>
            );
          }else{
            
              return (
                <div >
                  <li>{val}</li>
                 
                </div>
              );
            
          }
        },
        
      },
      {
        title: '仓库',
        dataIndex: 'areas',
        key: 'areas',
        
      },
      {
        title: '拣货数量',
        dataIndex: 'picknum',
        key: 'picknum',
        width:'5%',
        render:(val,record)=>{
          if(record.status===2){
            return (
              <div >
                <li style={{textDecoration:'line-through'}}>{val}</li>
               
              </div>
            );
          }else{
            
              return (
                <div >
                  <li>{val}</li>
                 
                </div>
              );
            
          }
        },
      },
      {
        title: '毛重(Kg)',
        dataIndex: 'glossweight',
        key: 'glossweight',
        width:'5%',

      },
      {
        title: '净重(Kg)',
        dataIndex: 'weight',
        key: 'weight',
        width:'5%',
      },
      {
        title: '整件数',
        dataIndex: 'piece',
        key: 'piece',
        width:'3%',
      },
      {
        title: '零散个数',
        dataIndex: 'num',
        key: 'num',
        width:'3%',
      },
      {
        title: '审核时间',
        dataIndex: 'updatedate',
        key: 'updatedate',
        width:'30%',
        render:val=>getMyDate(val),
      },
      
      
    ];
    if (this.state.tag === 2) {
      BatchColumns.splice(0, 1);
    }

    return (
      <Fragment>
        <Table
          loading={this.state.loading}
          columns={BatchColumns}
          dataSource={data}
          pagination={false}
          rowKey={record => record.key}
          // rowSelection={rowSelection}
        />
        <GoodFrom
          {...parentMethods}
          modalVisible={modalVisible}
          dataBatch={dataBatch} 
        />
      </Fragment>
    );
  }
}
