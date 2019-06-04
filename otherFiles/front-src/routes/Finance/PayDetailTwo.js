import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Upload,Icon,message } from 'antd';
import { routerRedux } from 'dva/router';
import { getUploadStaticUrl, getBase64} from '../../utils/utils';
import { getUserToken} from '../../utils/sessionStorage';
import styles from './PayDetail.less';

const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};



@Form.create()
class PayDetailTwo extends React.PureComponent {
  state = {
    loading: false,
    imageUrl:'',
    picurl:'',
  
  };

  handleChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    // 这里登录超时会怎么处理
    if(info.file.status === 401){
      this.props.dispatch({
        type: 'login/logout',
      });
      return ;
    }

    if (info.file.status === 'done') {
     //  this.state.photoid = info.file.response.result.id;
      

      getBase64(info.file.originFileObj, imageUrl => {
        this.setState({
          imageUrl,
          picurl:info.file.response.result,
          loading: false,
          
        });
      
      });
    }
  };
  // validCommentOrPicurl =(rule, value, callback)=>{
   
  //     if(value===undefined||value===''){
  //       if(this.field ==='picurl' ){
  //         callback('请上传流水');
  //       }else{
  //         callback('请上传摘要');
  //       }
  //     }else{
  //       callback();
  //     }
    
      
  // };
  render() {
    const { form, data, dispatch, submitting } = this.props;
    const { getFieldDecorator, validateFields } = form;

    data.amount=(data.amount===''? this.props.amount:data.amount);
    data.comment=(data.comment===''? this.props.comment:data.comment);
    data.clientid=(data.clientid===''? this.props.clientid:data.clientid);
    data.payaccountid = (data.payaccountid===''? this.props.payaccountid:data.payaccountid);
    data.accountno =  (data.accountno===''? this.props.accountno:data.accountno);
    data.receiptno=(data.receiptno===''? this.props.receiptno:data.receiptno);

    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传</div>
      </div>
      );
    const headers = {
        Authorization: `Bearer ${getUserToken()}`,
    };
    const onPrev = () => {
      // 把现在的数据保存一下
      form.validateFields((err, values) => {
        values.picurl = this.state.picurl === ''?data.picurl:this.state.picurl;
        values.accountno = data.accountno; 
        dispatch({
          type: 'financepaydetail/saveStepFormData',
          payload: {
            ...data,
            ...values,
          },
        });
        // 跳转上一页
        dispatch(routerRedux.push('/finance/paydetail'));
        
      });
      
     
     
     
    };

  
    const onValidateForm = e => {
      e.preventDefault();
     
    
     
      validateFields((err, values) => {
       
      
        if(values.picurl===''&&(values.comment===undefined||values.comment==='')){
          message.error("请输入摘要或者上传流水");
          return ;
        }
  
        
        if (!err) {
       
         
          
          values.picurl = this.state.picurl===''?data.picurl:this.state.picurl;
          values.paytype = data.paytype;
          values.presaleid = data.presaleid;
          values.preceiveid = data.preceiveid;
          values.contenttype = data.contenttype;
          values.accountid = data.accountid;
          dispatch({
            type: 'financepaydetail/submitStepForm',

            payload: {
              ...values,
            },
            callback:resp =>{
              message.success("付款成功");// 关闭窗口
              dispatch(routerRedux.push(`/order/receiptrecord`));
              
            },
          });
          // 关闭窗口
          
        }
      });
    };
    // console.log("data.picurl:"+data.picurl);
    const imageUrl = this.state.imageUrl ? this.state.imageUrl : data.picurl ;
    return (
      
      <Form layout="horizontal" className={styles.stepForm}>
        {data.accountno?
        (
          <Form.Item {...formItemLayout} className={styles.stepFormText} label="收款账户">
            {data.accountno}
          </Form.Item>)
        :''
        }
        <Form.Item {...formItemLayout} label="收款金额" required={false}>
          {getFieldDecorator('amount', {
            initialValue: data.amount>0?data.amount:data.money,
            rules: [
                { required: true, message: '请输入收款金额' },
                {
                  pattern: /^(\d+)((?:\.\d+)?)$/,
                  message: '请输入合法金额数字',
                },
              ],
          })(<Input  style={{ width: '80%' }} />)}
        </Form.Item>
        <Form.Item {...formItemLayout} label="摘要" required >
          {getFieldDecorator('comment', {
            initialValue: data.comment,  
            // rules: [
            //   { validator: this.validCommentOrPicurl },  
            // ],
          })(<Input  style={{ width: '80%' }} />)}
        </Form.Item>
        <Form.Item {...formItemLayout} label="付款人" required={false}>
          {getFieldDecorator('clientid', {
            initialValue: data.clientid,  
            rules: [
              { required:false, message: '请输入付款人' },  
            ],
          })(<Input  style={{ width: '80%' }} />)}
        </Form.Item>
        <Form.Item {...formItemLayout} label="付款账号" required={false}>
          {getFieldDecorator('payaccountid', {
            initialValue: data.payaccountid,  
            rules: [
              { required: false, message: '请输入付款账号' },  
            ],
          })(<Input  style={{ width: '80%' }} />)}
        </Form.Item>
        <Form.Item {...formItemLayout} label="交易号" required={false}>
          {getFieldDecorator('receiptno', {
            initialValue: data.receiptno,
            rules: [
              { required: false, message: '请输入交易号' },  
            ],  
          })(<Input  style={{ width: '80%' }} />)}
        </Form.Item>
        <Form.Item {...formItemLayout} label="上传交易号" style={{ display: 'inline-flex' }} required >
          {getFieldDecorator('picurl', {
                valuePropName: 'file',
                initialValue:  imageUrl,
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
                {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton}
              </Upload>
            )}
                 
        </Form.Item>
        <Form.Item
          style={{ marginBottom: 8 }}
          wrapperCol={{
            xs: { span: 24, offset: 0 },
            sm: {
              span: formItemLayout.wrapperCol.span,
              offset: formItemLayout.labelCol.span,
            },
          }}
          label=""
        >
          <Button type="primary" onClick={onValidateForm} loading={submitting}>
            提交
          </Button>
          <Button onClick={onPrev} style={{ marginLeft: 8 }}>
            上一步
          </Button>
          <Button type="primary" onClick={ e=>{dispatch(routerRedux.push(data.returnurl));}}>
              取消
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default connect(({ financepaydetail, loading }) => ({
  submitting: loading.effects['financepaydetail/submitStepForm'],
  data: financepaydetail.step,
}))(PayDetailTwo);
