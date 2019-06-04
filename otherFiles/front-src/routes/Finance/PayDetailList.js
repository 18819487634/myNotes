import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { Form,  Row, Col,   Input,  Table ,Select,Button,Modal,message} from 'antd';



// import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './AccountNumber.less';
import { getMyDate } from '../../utils/utils';

const FormItem = Form.Item;

const { Option } = Select;


function handleDs(obj, pageIndex = 0, pageSize = 10,type = 3) {
    let i = 0;
    // 如果填了单号，其它条件都是可以不管的。
    let params = `sorts[0].name=id&sorts[0].order=desc&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    Object.keys(obj).forEach(key => {
      if((key==='presaleid')&&obj[key] !== undefined){
        params += `&terms[${i}].type=or&terms[${i}].value=${obj[key]}&terms[${i}].column=presaleid`;
        i+=1;
        params += `&terms[${i}].type=or&terms[${i}].value=${obj[key]}&terms[${i}].column=preceiveid`;
        i+=1;
      }else if(key==='validstatus'&&obj[key] !== undefined){
        params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=validstatus`;
        i+=1;
      }else if(obj[key] !== undefined){
        params += `&terms[${i}].value=%25${obj[key]}%25&terms[${i}].column=${key}`;
        i+=1;
      }
    });
    // 加上类型 nin
  params += `&terms[${i}].termType=in&terms[${i}].value=1&terms[${i}].value=2&terms[${i}].value=3&terms[${i}].column=paytype`;
 
  i+=1;
  params += `&terms[${i}].value=0&terms[${i}].column=cancelstatus`;

  return params;
}
const confirms = Modal.confirm;

const CreateForm = Form.create()(props => {
  const {data, modalVisible, form, handleAuditing, handleModalVisible } = props;
  
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      const payload={
        ...fieldsValue,
        id:data.id,
        validstatus:-1,
      }
     
     
      handleAuditing(payload);
    });
  };
  return (
    <Modal
      title="审核失败"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={8} sm={24} style={{width:'70%'}}  >
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="流水单号">
            {data.id}
          </FormItem>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="订单编号">
            {data.presaleid===''?data.prereceiveid:data.presaleid}
          </FormItem>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="收款金额">
            {data.amount}
          </FormItem>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="摘要">
            {data.comment}
          </FormItem>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="收款账号">
            {data.accountidShow}
          </FormItem>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="付款人">
            {data.clientid}
          </FormItem>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="付款账号">
            {data.payaccountid}
          </FormItem>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="流水号">
            {data.receiptno}
          </FormItem>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="失败原因">
            {form.getFieldDecorator('invalidreason', {
              rules: [{ required: true, message: '请输入' }],
              initialValue: data.invalidreason,  
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col md={8} sm={24} style={{width:'20%',height:'100%'}}>
          <div style={{width:'100%',height:'100%'}} > <img alt="" style={{width:'100%',height:'100%'}} src={data.picurl} /></div>
        </Col>
      </Row>
    </Modal>
  );
});
// 都放在前面，所以后面的参数可以不用了。这里是用装饰器。
@connect(({ financepaydetail, loading }) => ({
  financepaydetail,
  loading: loading.models.paydetail,
}))
@Form.create()
export default class PayDetailList extends PureComponent {
  state = {
    pageindex: 1,
    pagesize: 10,
    modalVisible:false,
    shenpirecord:{},
  };

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    this.handleSearch();
  };
  handleSearch = e => {
    if(e) {e.preventDefault();}
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const ds = handleDs(fieldsValue, 0, 10,this.props.type);
      this.props.dispatch({
        type: 'financepaydetail/submit',
        payload: ds,
      });
    });
  };
  showpicurl =(picurl)=>{
    confirms({
      title: `图片`,
      content: <img alt="" src={picurl}  style={{width: '100%'}} />,
      onOk() {
      },
    });

  };
  changestatus = (status,rec)=>{
    const df  = this;
    if(status===1){
      confirms({
        title: `审核通过这条记录${rec.id}?`,
        content: ``,
        onOk() {
  
          const params = {validstatus:1,id:rec.id};
  
          df.props.dispatch({
            type:'financepaydetail/changestatus',
            payload:params,
            callback:() =>{
              df.loadData();
              
            },
          });
         
          
          
        },
        onCancel() {},
      });

    }else if(status===-1){


      this.setState({
        modalVisible: true,
        shenpirecord:rec,
      });

    }
    
    
  };
  handleStandardTableChange = pagination => {
    // 这里翻页返回时候this 为空的，为什么呢
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const ds = handleDs(fieldsValue, pagination.current-1,pagination.pageSize,this.props.type);
      this.props.dispatch({
        type: 'financepaydetail/submit',
        payload: ds,
      });
      this.setState({
        pageindex: pagination.current,
        pagesize: pagination.pageSize,
      });
    });
  };
  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };
  handleAuditing = fields => {
    this.props
      .dispatch({
        type: 'financepaydetail/changestatus',
        payload: {...fields,type:this.props.type},
        callback:resp =>{
          message.success(resp.ok);
          this.setState({
            modalVisible: false,
          });
          this.loadData();
        },
      })
  };
  
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          
          <Col md={8} sm={12}>
            <FormItem label="单号">
              {getFieldDecorator('presaleid')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={12}>
            <FormItem label="审核状态">
              {getFieldDecorator('validstatus')(
                <Select style={{width:'100%'}} >
                  <Option key="1" value="1">通过</Option>
                  <Option key="-1" value="-1">不通过</Option>
                  <Option key="0" value="0">未审核</Option>
                </Select>
               )}
            </FormItem>
          </Col>
         
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </span>
          </Col>
     
        </Row>
      </Form>
    );
  }
  
  
  render() {
  
    const { financepaydetail, loading} = this.props;
    const { data } =  financepaydetail;
    const {modalVisible,shenpirecord } = this.state;

    let dataList = [];


    if (data&&data.status === 200 && data.result.data) {
      data.list = data.result.data;
   
      data.pagination = {
        total: data.result.total,
        current: this.state.pageindex,
        pageSize: this.state.pagesize,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: false,
      };
      dataList = data.list;
    }
    
  
    
    const columntmp = [{
      title: '流水单号',
      dataIndex: 'id',
      render:(text, record)=>
        {
          return (
            <div>
              <li>{record.id}</li>
              <li>{getMyDate(record.createdate)}</li>
            </div>
          );
        },
    },{
      title: '收款',
      dataIndex: 'accountid',
      render: (text,record) => {
        return record.accountidShow  ;
      },
    },{
      title: '付款',
      dataIndex: 'payaccountid',
      render: val => {
        return val ;
      },
    },{
      title: '金额',
      dataIndex: 'amount',
      render: val => {
        return val ;
      },
    },{
      title: '单据',
      dataIndex: 'receiptno',
      render: (text, record) => {
        return (
          <a  onClick={ () =>this.showpicurl(record.picurl) }>图</a>
        ) ;
      },
    },{
      title: '审核',
      dataIndex: 'validstatus',
      render: (text, record)  => {
        let t = "已通过";
        const val = record.validstatus;
        if(val===0){
          t = (
            <div>
              <Button   onClick={ () =>this.changestatus(1,record) }>通过</Button>
              <Button  onClick={ () =>this.changestatus(-1,record) }>失败</Button>
            </div>
           )
        }else if(val===-1){
          t = (
            <div>
              <span style={{color: '#FF0000'}}>失败</span>
            </div>
           )

        }
        return t;
      
      },
    },{
      title: '单号/客户', // 这个是根据单号去加载客户信息
      dataIndex: 'preceiveid',
      render: (text,record) => {
        let d = record.presaleid;
        if(record.preceiveid!==undefined&&record.preceiveid!==''){
          d=record.preceiveid;
        }
        return (
          <div>
            <li>{d}</li>
            <li>{record.clientname}</li>
          </div>
        );
      },
    },{
      title: '状态',// 根据单号知道这个单号的状态
      dataIndex: 'presaleid',
      render: (text,record) => {
        // let d = record.presaleid;
        // if(record.preceiveid!==undefined&&record.preceiveid!==''){
        //   d=record.preceiveid;
        // }
        return record.idstatus;
      },
    }];
    
    

    const parentMethods = {
      handleAuditing: this.handleAuditing,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <div className={styles.tableList}>
        <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
        
        <div style={{ margin: '5px' }}>
          <div style={{ width: '100%', float: 'left' }}>
            <CreateForm {...parentMethods} modalVisible={modalVisible} data={shenpirecord} />
            <Table
              rowKey="id"
              loading={loading}
              dataSource={dataList}
              columns={columntmp}
              onRow={(record) => {
                return {
                  onClick: () => {console.log(record)},       // 如果有回调函数，就调用
                
                  
                }
              }}
              bordered
              pagination={data.pagination}
              onChange={this.handleStandardTableChange} 
            />
          </div>
        </div>
      </div>
           
       
    );
  }
}
