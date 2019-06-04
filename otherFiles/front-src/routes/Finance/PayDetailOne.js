import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Select, Divider,message } from 'antd';
import { routerRedux } from 'dva/router';
import styles from './PayDetail.less';
import {queryAccountnumber } from '../../services/api';

const { Option } = Select;

const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};
@Form.create()
class PayDetailOne extends React.PureComponent {
 
  
  constructor (props) {
    super(props);
    this.state = {
    
      accountno:'',
    };
  
    
  
  }
  componentWillMount () {
    

  }
  componentDidMount() { // 在render之后调用
    
  }

  getAccountId = (type)=>{
    if(type===0||type===4){
    
      const obj ={
        label:'金额',
        fieldname:'amount',
        fieldvalue: this.props.money!==undefined?this.props.money:this.props.data.money,
        fieldtext:<Input   />,
        buttontext:'下一步',
      };
      this.setState({
        addcomponent: obj,
      });
      this.props.dispatch({
        type: 'financepaydetail/saveStepFormData',
        payload:{addcomponent:obj},
      })
     
      

    }else{
      const params = `terms[0].value=${type}&terms[0].column=type`;
      queryAccountnumber(params).then(response => {
        if (response && response.status === 200) {
          const list = response.result.data;
          const tmp = [] ;
        
          for (let i = 0; i < list.length; i++) {
           
              tmp.push(
                <Option key={list[i].accountno} value={list[i].id}>
                  {list[i].accountno}
                </Option>
              );

          }
          const a = <Select  onChange={(e,o) => this.changePayAccount(e,o)}>{tmp}</Select>;
          const obj = {
            label:'收款账户',
            fieldname:'accountid',
            fieldvalue:'',
            fieldtext: a,
            buttontext:'下一步',
          };
          this.setState({
            addcomponent: obj,
          });
          this.props.dispatch({
            type: 'financepaydetail/saveStepFormData',
            payload:{addcomponent: obj},
          });
          
          
          
        }

       }  
      );
  }
  // 解决 上一步时候会为空
  
}

changePayAccount=(e,option)=>{
 

  this.setState({
      accountno:option.key,
    });

}
  changePaytype =(e)=>{
    this.getAccountId(e);
    
    
    
  }
  render() {
    const { form, dispatch, data } = this.props;
    data.address=(data.address===''? this.props.address:data.address);
    data.preceiveid=(data.preceiveid===''? this.props.preceiveid:data.preceiveid);
    data.presaleid=(data.presaleid===''? this.props.presaleid:data.presaleid);
    data.address = (data.address===''? this.props.address:data.address);
    data.money=(data.money===''? this.props.money:data.money);
    if(data.addcomponent===undefined||data.addcomponent===''){
      data.addcomponent = {
        label:'金额',
        fieldname:'amount',
        fieldvalue:data.money,
        fieldtext: <Input />,
        buttontext:'下一步',
      }
    }
   
    const { getFieldDecorator, validateFields } = form;
    const onValidateForm = () => {
      validateFields((err, values) => {
        
        if (!err) {
        
          // 保存数据到state去先,这样data就有addcomponent了
          if(this.state.addcomponent){
            dispatch({
              type: 'financepaydetail/saveStepFormData',
              payload: {...values,addcomponent:{
                label:this.state.addcomponent.label,
                fieldname:this.state.addcomponent.fieldname,
                fieldvalue:values[this.state.addcomponent.fieldname],
                fieldtext: this.state.addcomponent.fieldtext,
                buttontext:this.state.addcomponent.buttontext,
              },accountno:this.state.accountno},
  
            });
          }else{
            dispatch({
              type: 'financepaydetail/saveStepFormData',
              payload: values,
  
            });

          }
          // 跳转到下一个页面
          if(values.paytype===0){
           
            if(values.amount===undefined||!/^(\d+)((?:\.\d+)?)$/.test(values.amount)||values.amount===0){
              message.error("请输入金额");
              return ;

            }
            dispatch(routerRedux.push('/finance/paydetail/paydetailtwo'));
            // dispatch({
            //   type: 'financepaydetail/submitStepForm',
            //   payload: {
            //     ...data,
            //     ...values,
            //   },
            //   callback:resp =>{
                
            //     message.success("付款成功");// 关闭窗口
            //     // data.closeWindow();
            //     dispatch(routerRedux.push(data.returnurl));
                
            //   },
            // });

          }else if(values.accountid === ''){
              message.error("请选择账号");
            
          }else{
            dispatch(routerRedux.push('/finance/paydetail/paydetailtwo'));
          }
          
        }
      });
    };
    return (
      <Fragment>
        <Form layout="horizontal" className={styles.stepForm} hideRequiredMark>
          <Form.Item {...formItemLayout} className={styles.stepFormText} label="订单编号">
            {data.presaleid?data.presaleid:data.preceiveid}
          </Form.Item>
          <Form.Item {...formItemLayout} className={styles.stepFormText} label="客户名称">
            {data.clientname}
          </Form.Item>
          
          <Form.Item {...formItemLayout} className={styles.stepFormText} label="收货地址">
            {data.address}
          </Form.Item>
          <Form.Item {...formItemLayout} className={styles.stepFormText} label="收款金额">
            {data.money}
          </Form.Item>
          <Divider style={{ margin: '40px 0 24px' }} />
          <Form.Item {...formItemLayout} label="付款内容">
            { getFieldDecorator('contenttype',{
                      rules: [
                        {
                          required: true,
                          message: '请选择',
                        },
                      ],
                      initialValue: data.contenttype,
                  })(
                    <Select placeholder=""   >
                      <Option value={1}>拣货费</Option>
                      <Option value={2}>预付款</Option>
                      <Option value={3}>尾款</Option> 
                      <Option value={4}>折让费</Option>
                     
                    </Select>)
            }
          </Form.Item>
          <Form.Item {...formItemLayout} label="收款方式">
            { getFieldDecorator('paytype',{
                      rules: [
                        {
                          required: false,
                          message: '请选择收款方式',
                        },
                      ],
                      initialValue: data.paytype,
                  })(
                    <Select placeholder="" onChange={e => this.changePaytype(e)}   >
                      <Option value={0}>现金</Option>
                      <Option value={1}>支付宝</Option>
                      <Option value={2}>微信</Option> 
                      <Option value={3}>银行</Option>
                      <Option value={4}>折让费</Option>
                    </Select>)
            }
          </Form.Item>
          <Form.Item {...formItemLayout} label={data.addcomponent.label}>
            { getFieldDecorator(data.addcomponent.fieldname,{
                        initialValue:data.addcomponent.fieldvalue,
                    })(
                      data.addcomponent.fieldtext
                      )
              }
          </Form.Item>
         
          <Form.Item
            wrapperCol={{
              xs: { span: 24, offset: 0 },
              sm: {
                span: formItemLayout.wrapperCol.span,
                offset: formItemLayout.labelCol.span,
              },
            }}
            label=""
          >
          
            <Button type="primary" onClick={onValidateForm}>
              {data.addcomponent?data.addcomponent.buttontext:this.state.addcomponent.buttontext
                    }
            </Button>
            <Button type="primary" onClick={ e=>{dispatch(routerRedux.push(data.returnurl));}}>
              取消
            </Button>
          </Form.Item>
        </Form>
        
      </Fragment>
    );
  }
}
export default connect(({ financepaydetail }) => ({
  data: financepaydetail.step,
}))(PayDetailOne);
