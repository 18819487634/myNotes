import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Row, Col, Select, Button, Table, Input,Modal,message } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './PickUpProfile.less';

import { queryPickup, queryListClients, getTrackStatusForId, saveOrupdatePickup,querysupplydictionry } from '../../services/api';
import { getMyDate, recordstatusList, trackiList } from '../../utils/utils';
import { getSupplyId } from '../../utils/sessionStorage';

const areaMap = new Map();
const FormItem = Form.Item;
const { Option } = Select;
// let dataTop = [
//     {
//         id:'208007200143425',
//         makedate:'2017-07-06',
//         usrid:'人生无限有限公司',
//         deliverydate:'2018-04-02',
//         takeway:0,
//         payway:0,
//         credit:'优质客户',
//         status:0,

//     },

// ];
// let dataLeft = [

//     {comment:"紧急",
//     id:"2fd574271c852553acbaaf37ad6ce43f",
//     inquiryid:"cb9f8a44e38db5ca208eac28759dfa3",
//     num:15.62,
//     price:141.123,
//     key:'13123321',
//     product01Entity:
//     {colorname:"CA001",
//     colorproduct:{a:60.14,b:57.19,begindate:"2018-01-01 10:45:19",enddate:"2019-01-01 10:45:19",hex:"#e84c22",id:802,l:55.35,lrv:"23",
//     productid:"1533697589676000005",rgb:"232,76,34",status:1,supplyid:"cb564b09127e4e1d8cd1fcd7a35b03a9"},
//     id:782,kind:"膨体棉晴·2/16支·60%棉·40%晴",largetype:"膨体棉晴",location:"1-01-01",picture:"http://47.95.202.38/upload/20180808/6743237244707997.png",
//     price:36.0,productid:"1533697589676000005",productname:"火龙桔",recommande:10.0,series:"膨体棉晴",supplyid:"cb564b09127e4e1d8cd1fcd7a35b03a9"},
//     productid:"1533697589676000005",usefor:"自用"},
//     {comment:"紧急",
//     key:'121211sss',
//     id:"50b365fdbc612e3909afccb3a18bdf28",inquiryid:"cb9f8a44e38db5ca208eac28759dfa3",num:20.62,price:141.123,
//     product01Entity:{colorname:"CA002",
//     colorproduct:{a:55.46,b:58.9,begindate:"2018-01-01 11:06:50",enddate:"2019-01-01 11:06:50",hex:"#f6632b",id:803,l:61.27,lrv:"30",productid:"1533697729089000000",rgb:"246,99,43",status:1,supplyid:"cb564b09127e4e1d8cd1fcd7a35b03a9"},
//     id:783,kind:"膨体棉晴·2/16支·60%棉·40%晴",largetype:"膨体棉晴",location:"1-01-02",picture:"http://47.95.202.38/upload/20180808/6743368622129332.png",
//     price:36.0,productid:"1533697729089000000",productname:"桔红",recommande:10.0,series:"膨体棉晴",supplyid:"cb564b09127e4e1d8cd1fcd7a35b03a9"},
//     productid:"1533697729089000000",usefor:"自用"},
// ];

// const TabPanes = Tabs.TabPane;

// const takewayArr = ["自提","快递","物流","送货上门"];


const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleUpdate, handleModalVisible,params } = props;
  
  const okHandle = () => {
    
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleUpdate(fieldsValue,params);
    });
  };
  return (
    <Modal
      title="修改拣货状态"
      visible={modalVisible}
      onOk={okHandle}
      maskClosable={false}
      onCancel={() => handleModalVisible()}
    >
      
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="拣货单编号">
        {form.getFieldDecorator('id',  {initialValue: params.id})(<Input disabled />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="拣货单状态">
        {form.getFieldDecorator('status', {
          rules: [{ required: true, message: '请选择' }],  initialValue: params.status,
        },)(
          <Select placeholder="请选择" style={{ width: '100%' }} >
            <Option value={0}>正常</Option>
            <Option value={1}>紧急</Option>
            <Option value={2}>现场</Option>
            
          </Select>)}
      </FormItem>
     
    </Modal>
  );
});
@connect(({ pickup, loading }) => ({
  pickup,
  loading: loading.models.pickup,
}))
@Form.create()
export default class PickUpProfile extends PureComponent {
  state = {
    panes: [{ key: '1' }],
    activeKey: '1',
    pickupParam:{recordstatus:0},
    modalVisible:false,
  };

  componentDidMount() {
    const terms = `paging=false&sorts[0].name=presaleid&sorts[0].order=desc&terms[0].value=0&terms[0].value=1&terms[0].value=2&terms[0].value=5&terms[0].termType=in&terms[0].column=recordstatus`;
    const params = "terms[0].value=3&terms[0].column=type";
    querysupplydictionry(params).then(res=>{
      if(res && res.status === 200){
        const datas = res.result.data;
        datas.forEach(item=>{
          areaMap.set(item.value,item.key);
        });
      }
    });
    this.query(terms);
  }

  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  query = terms => {
    queryPickup(terms).then(response => {
      if (response && response.status === 200) {
        const arr = response.result.data;
        const userList =[];
        const pickArrData =[];
        const trackids =[];
        for (let i = 0; i < arr.length; i += 1) {
          arr[i].key = `pickup${i}`;
          if(`${arr[i].clientid}`.indexOf(":")===-1 &&userList.indexOf(arr[i].clientid)===-1){
            userList.push(arr[i].clientid);

          }
          trackids.push(arr[i].trackid);
        }
        if(userList.length===0){
          userList.push(null);
        }
        if(trackids.length===0){
          trackids.push(null);
        }
       
            queryListClients(userList).then(cres=>{
              if(cres && cres.status === 200){
                const userData = cres.result;
                for (let i = 0; i < arr.length; i += 1) {
                  
                  if(`${arr[i].clientid}`.indexOf(":")===-1){
                    arr[i].clientids = arr[i].clientid;
                    arr[i].clientid = userData[arr[i].clientid];
                    
                  }
                  if(arr[i].recordstatus !== 3 && arr[i].recordstatus !== 6 && arr[i].recordstatus !== 4){
                    const detailList = arr[i].details;
                    let picknum = 0;
                    detailList.forEach(item=>{
                      picknum += item.picknum;
                    })
                    arr[i].num =picknum.toFixed(2);
                    pickArrData.push(arr[i]);
                  }
                }
                
                this.setState({
                  loadData: pickArrData,
                });
              }
            });
          
        
        
      }
    });
  };
  
  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };
  handleUpdate =(fieldsValue,params)=>{
    message.config({
      top: 100,
    });
    const  hide = message.loading('正在提交...', 0);
    const pickup =params;
    pickup.status = fieldsValue.status;
  
    
    saveOrupdatePickup(pickup).then(res=>{
      if(res && res.status === 200){
        const results = res.result;
   
        message.success("提交成功");
        setTimeout(hide, 100);
        this.setState({
          modalVisible:false,
        })
      }else if(res && res.status === 400){
      
        
        setTimeout(hide, 100);
        message.error(res.message);
        this.setState({
          modalVisible:false,
        })
      }
    });
  }
  handleSearch = () => {
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((error, values) => {
      const terms = this.formatTerms(values);
      this.query(terms);
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
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="编号">
              {getFieldDecorator('id')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="客户">
              {getFieldDecorator('userid')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>

          <Col md={6} sm={24}>
            <FormItem label=" 状态">
              {getFieldDecorator('ismerge')(
                <Select placeholder="">
                  <Option value={0}>正常</Option>
                  <Option value={1}>加急</Option>
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
          <Col md={6} sm={24}>
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
          </Col>
          <Col md={6} sm={24}>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ float: 'right', marginBottom: 24 }}>
                <Button type="primary" htmlType="submit">
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
  const  updateQueues =(e,record)=>{
      this.setState({
        pickupParam:record,
        modalVisible:true,
      })
    }
    const columns = [
      {
        title: '拣货单编号',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '预售单编号',
        dataIndex: 'presaleid',
        key: 'presaleid',
      },
      {
        title: '仓库',
        dataIndex: 'area',
        key: 'area',
        render:val=>areaMap.get(`${val}`),
        width:'8%',
      },
      {
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
        title: '拣货人',
        dataIndex: 'makeid',
        key: 'makeid',
      },
      {
        title: '时间 ',
        dataIndex: 'createdate',
        key: 'createdate',
        render: val => getMyDate(val),
      },
      {
        title: '备注',
        dataIndex: 'comment',
        key: 'comment',
      },
      {
        title: '数量（Kg）',
        dataIndex: 'num',
        key: 'num',
        width:'3%',
      },
      {
        title: '拣货单开始时间',
        dataIndex: 'begindate',
        key: 'begindate',
        render: val => getMyDate(val),
      },
      // {
      //   title: '拣货时间(分钟)',
      //   dataIndex: 'pickuptime',
      //   key: 'pickuptime',

      // },
      
      {
        title: '收款状态',
        dataIndex: 'recordstatus',
        key: 'recordstatus',
        render: val => {
          if(val === 0){
            return <span>未收款</span>
          }else{
            return <span>已收款</span>
          }
        },
      },
      {
        title: '拣货状态',
        dataIndex: 'status',
        key: 'status',
        
        render(val,record) {
          if(record.makeid === undefined){
            return <div><Button onClick={e=>{updateQueues(e,record)}}>{recordstatusList[val]}</Button></div>;
          }else {
            return <div>{recordstatusList[val]}</div>;
          }
         
        },
      },
     
    ];
    const parentMethods = {
      handleUpdate:this.handleUpdate,
      handleModalVisible: this.handleModalVisible,
    };
    const {modalVisible,pickupParam} =this.state;
    const panemap = this.state.panes;
    panemap[0].content = (
      <div>
        <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
        <Table pagination={false} dataSource={this.state.arr} columns={this.state.columns} />
      </div>
    );

    return (
      <PageHeaderLayout title="拣货单队列">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator} />
            <Table
              pagination={false}
              rowKey={record => record.key}
              dataSource={this.state.loadData}
              columns={columns}
            />
          </div>
          <CreateForm {...parentMethods} modalVisible={modalVisible} params={pickupParam} />
        </Card>
      </PageHeaderLayout>
    );
  }
}
