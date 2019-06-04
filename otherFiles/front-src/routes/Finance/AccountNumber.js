import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { Form, Modal, Row, Col,  message, Input, Button, Table ,Select,Icon,Upload} from 'antd';
import { getUploadStaticUrl,getBase64} from '../../utils/utils';
import { getUserToken} from '../../utils/sessionStorage';


// import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './AccountNumber.less';
import {banks,accounttypes} from '../../utils/constants';

const FormItem = Form.Item;

const { Option } = Select;
// let i=0;
// const banks = 
//     [{key:'工商银行',value:0},{key:'建设银行',value:1},{key:'农业银行',value:2},
//     {key:'中国银行',value:3},{key:'交通银行',value:4},{key:'招商银行',value:5},
//     {key:'兴业银行',value:6},{key:'光大银行',value:7},{key:'其它',value:15}];




function handleDs(obj, pageIndex = 0, pageSize = 10,type = 3) {
    let i = 0;
    // console.log("handleDs,type:"+this.props.type);
    let params = `pageIndex=${pageIndex}&pageSize=${pageSize}`;
    Object.keys(obj).forEach(key => {
      if((key==='banktype'||key === 'accounttype')&&obj[key] !== undefined){
        params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=${key}`;
        i+=1;
      }else if(obj[key] !== undefined){
        params += `&terms[${i}].value=%25${obj[key]}%25&terms[${i}].column=${key}`;
        i+=1;

      }
      
    });
    // 加上类型
    params += `&terms[${i}].value=${type}&terms[${i}].column=type`;
  return params;
}
class AccountNumberCreateForm extends React.Component {

  state = {
    imageUrl: '',
    loading: false,
  };
  handleChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }

    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, imageUrl2 => {
        this.setState({
          imageUrl: imageUrl2,
          loading: false,
        });
      });
    }
  };
  render() {
  

  const { modalVisible, form, handleAdd, handleModalVisible ,type} = this.props;
  
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      fieldsValue.picurl=this.state.imageUrl;
      handleAdd(fieldsValue);
    });
  };
  const uploadButton = (
    <div>
      <Icon type={this.state.loading ? 'loading' : 'plus'} />
      <div className="ant-upload-text">上传</div>
    </div>
    );
  const headers = {
      Authorization: `Bearer ${getUserToken()}`,
  };
  return (

    
    <Modal
      title="添加"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      {type===3?(
        <FormItem  labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}  label="银行">
          {form.getFieldDecorator('banktype',{
            rules:[{required:true,message:'请选择银行'}],
          })(
            <Select style={{width:'65%'}}>
              {banks.map(item => (<Option key={item.value} value={item.value}>{item.key}</Option>))}
            </Select>
                )}
        </FormItem>
        ):''}
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label={type===3?"银行账号":(type===2?"微信账号":"支付宝账号")}>
        {form.getFieldDecorator('accountno', {
          rules: [{ required: true, message: '请输入账号' }],
        })(<Input placeholder="请输入账号" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label={type===3?"收款人":"姓名"}>
        {form.getFieldDecorator('charge', {
          rules: [{ required: true, message: '请输入' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="手续费">
        {form.getFieldDecorator('changerate', {
          rules: [{ required: true, message: '请输入' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      {type===3?(
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="开户行">
          {form.getFieldDecorator('depositbank', {
            rules: [{ required: true, message: '请输入开户行' }],
          })(<Input placeholder="请输入开户行" />)}
        </FormItem>
      ):''}
      {type===3?(
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="行号">
          {form.getFieldDecorator('bankno', {
            rules: [{ required: false, message: '请输入行号' }],
          })(<Input placeholder="请输入行号" />)}
        </FormItem>
      ):''}
      
      <FormItem  labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}  label="账户类型">
        {form.getFieldDecorator('accounttype',)(
          <Select style={{width:'65%'}}>
            {accounttypes.map(item => (<Option key={item.value} value={item.value}>{item.key}</Option>))}
          </Select>
              )}
      </FormItem>

      <Form.Item  label="账号图片" style={{ display: 'inline-flex' }}  >
        {form.getFieldDecorator('picurl', {
              valuePropName: 'file',
              initialValue:  this.state.imageUrl,
              getValueFromEvent: this.normFile,
            
          })(
            <Upload
              className="avatar-uploader"
              showUploadList={false}
              name="file"
              listType="picture-card"
              headers={headers}
              action={getUploadStaticUrl()}
              onChange={this.handleChange}
            >
              { this.state.imageUrl ?   <img src={this.state.imageUrl} alt="avatar" /> : uploadButton}
            </Upload>
          )}
              
      </Form.Item>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
        {form.getFieldDecorator('remark')(<Input placeholder="请输入备注" />)}
      </FormItem>
    </Modal>
  )
}
}
const CreateForm = Form.create()(AccountNumberCreateForm);

// 都放在前面，所以后面的参数可以不用了。这里是用装饰器。
@connect(({ accountnumber, loading }) => ({
  accountnumber,
  loading: loading.models.accountnumber,
}))
@Form.create()
export default class AccountNumber extends PureComponent {
  state = {
    modalVisible: false,
   
    
    pageindex: 1,
    pagesize: 10,
  };

  componentDidMount() {
    
    this.loadData();
  }

  loadData = () => {
    this.handleSearch();
  };

  handleAdd = fields => {
    this.props
      .dispatch({
        type: 'accountnumber/add',
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
  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };
  handleSearch = e => {
    if(e) {e.preventDefault();}
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const ds = handleDs(fieldsValue, 0, 10,this.props.type);
      this.props.dispatch({
        type: 'accountnumber/submit',
        payload: ds,
      });
    });
  };
  
  handleStandardTableChange = pagination => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const ds = handleDs(fieldsValue, pagination.current,pagination.pageSize,this.props.type);
      this.props.dispatch({
        type: 'accountnumber/submit',
        payload: ds,
      });
      this.setState({
        pageindex: pagination.current,
        pagesize: pagination.pageSize,
      });
    });
  };
  
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {this.props.type===3?(
            <Col md={8} sm={24}>
              <FormItem label="银行">
                {getFieldDecorator('banktype',)(
                  <Select style={{width:'65%'}} >
                    {banks.map((item) => (<Option   key={item.value} value={item.value}>{item.key}</Option>))}
                  </Select>
                )}
              </FormItem>
            </Col>
          ):''}
          <Col md={8} sm={24}>
            <FormItem label={this.props.type===3?"银行收款账号":(this.props.type===2?"微信账号":"支付宝账号")}>
              {getFieldDecorator('accountno')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={this.props.type===3?"收款人":"姓名"}>
              {getFieldDecorator('charge')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {this.props.type===3?(
            <Col md={8} sm={24}>
              <FormItem label="开户行">
                {getFieldDecorator('depositbank')(<Input placeholder="请输入" />)}
              </FormItem>
            </Col>
            ):''}
          {this.props.type===3?(
            <Col md={8} sm={24}>
              <FormItem label="行号">
                {getFieldDecorator('bankno')(<Input placeholder="请输入" />)}
              </FormItem>
            </Col>
          ):''}
          <Col md={8} sm={24}>
            <FormItem label="账户类型">
              {getFieldDecorator('accounttype')(
                <Select style={{width:'65%'}} >
                  {accounttypes.map((item) => (<Option  key={item.value} value={item.value}>{item.key}</Option>))}
                </Select>
               )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }
  renderAccouttype = val => {
    if (val === 0) {
      return '个人';
    } else if( val ===1 ) {
      return '对公';
    }else{
      return '第三方对公';
    }
  };
  renderBanktype = val => {
    const t  =banks.filter((item)=>{
      return item.value ===val 
    });
    if(t&&t[0]){
      return t[0].key;
    }else{
      return '';
    }
    
  };
  render() {
  
    const { accountnumber, loading} = this.props;
    const { data } =  accountnumber;
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
    
    const { selectedRowKeys, modalVisible } = this.state;
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    let columntmp = [];
    let accountnotitle = '银行账号';
    let chargetitle = '收款人';
    if(this.props.type === 3){
      accountnotitle = '银行收款账号';
      chargetitle = '收款人';
      columntmp.push({
        title: '银行',
        dataIndex: 'banktype',
        render: val => this.renderBanktype(val),
      });
      columntmp.push({
        title: '开户行',
        dataIndex: 'depositbank',
      });
      columntmp.push({
        title: '行号',
        dataIndex: 'bankno',
        
      });
    }else if(this.props.type === 2){
      accountnotitle = '微信账号';
      chargetitle = '姓名';
    }else if(this.props.type === 1){
      accountnotitle = '支付宝账号';
      chargetitle = '姓名';
    }
    

    columntmp.push({
      title: accountnotitle,
      dataIndex: 'accountno',
    });
    columntmp.push({
      title: chargetitle,
      dataIndex: 'charge',
      
    });
    columntmp.push({
      title: '手续费',
      dataIndex: 'changerate',
      
    });
    columntmp.push( {
      title: '账户类型',
      dataIndex: 'accounttype',
      render: val => this.renderAccouttype(val),
    });


    
    

   

    return (
      <div className={styles.tableList}>
        <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
        <div className={styles.tableListOperator}>
          <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
            添加
          </Button>
        </div>
        <div style={{ margin: '5px' }}>
          <div style={{ width: '100%', float: 'left' }}>
            <CreateForm {...parentMethods} modalVisible={modalVisible} type={this.props.type} />
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
