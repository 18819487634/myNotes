import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { Form, Input, Select, Button, Card, Icon, Upload,Cascader } from 'antd';
import { getUserToken, getCurrentUser } from '../../utils/sessionStorage';
import { getBase64, getUploadUrl,getUploadStaticUrl} from '../../utils/utils';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { queryProvince } from '../../services/api';

const FormItem = Form.Item;
const { Option } = Select;

function beforeUpload() {
  return true;
}

@connect(({ loading }) => ({
  submitting: loading.effects['company/submitCompanyForm'],
}))
@Form.create()
export default class CompanyForms extends PureComponent {
  state = {
    loading: false,
    photourl: '',
    imageUrl: '',
    logourl: '',
    imageUrlP:'',
    pca:'',
  };
  componentWillMount(){
    queryProvince().then(ress=>{
      if(ress && ress.status===200){
        
        const proviceDatas= ress.result.data;
        for(let i=0;i<proviceDatas.length;i++){
          proviceDatas[i].key=`${proviceDatas[i].codeP}`;
          proviceDatas[i].value=`${proviceDatas[i].codeP}`;
          proviceDatas[i].label=`${proviceDatas[i].name}`;
          const childrendatas = proviceDatas[i].children;
          for(let j=0;j<childrendatas.length;j++){
            childrendatas[j].value=`${childrendatas[j].codeC}`;
            childrendatas[j].key=`${childrendatas[j].codeC}`;
            childrendatas[j].label=`${childrendatas[j].name}`;
            const childrenAear = childrendatas[j].areas;
            for(let z=0;z<childrenAear.length;z++){
              childrenAear[z].value=`${childrenAear[z].codeA}`;
              childrenAear[z].key=`${childrenAear[z].codeA}`;
              childrenAear[z].label=`${childrenAear[z].name}`;
            }
            proviceDatas[i].children[j].children = childrenAear;
          }
          proviceDatas[i].children = childrendatas;
        }
        this.setState({
          options: proviceDatas,
        });
      }
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.address = this.state.pca + values.acceptadressdetails;
        values.photo = this.state.photourl===''?values.picurl:this.state.photourl;
        values.logo = this.state.logourl===''?values.logourl:this.state.logourl;
        values.loginuser = JSON.parse(getCurrentUser()).username;
        this.props.dispatch({
          type: 'company/submitCompanyForm',
          payload: values,
        });
      }
    });
  };
  handleChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }

    if (info.file.status === 'done') {

      getBase64(info.file.originFileObj, imageUrl => {
        this.setState({
          imageUrl,
          photourl:info.file.response.result,
          loading: false,
        });
      });
    }
  };
  changePro=(e,op)=>{
    
    let provice = "";
    for(let i=0;i<op.length;i+=1){
      provice+= op[i].label;
    }
    this.setState({
      pca:provice,
    })
  }

  handleChangeP = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading2: true });
      return;
    }

    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, imageUrl2 => { 
        this.setState({
          imageUrlP: imageUrl2,
          logourl:info.file.response.result,
          loading2: false,
        });
      });
    }
  };
  render() {
    const { submitting } = this.props;
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 7 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span:10, offset:7 },
        sm: { span: 10, offset: 7 },
      },
    };



    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    const uploadButton2 = (
      <div>
        <Icon type={this.state.loading2 ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传</div>
      </div>
    );

    const imageUrl2 = this.state.imageUrl;
    const imageUrl = this.state.imageUrlP;
    const headers = {
      Authorization: `Bearer ${getUserToken()}`,
    };
    return (
      <PageHeaderLayout
        title="企业信息"
        content="注册用户可以完善未被注册的企业信息，一旦确认企业信息真实有效而且未被注册，那么注册用户将成为该企业管理员"
      >
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="公司全称">
              {getFieldDecorator('fullname', {
                rules: [
                  {
                    required: true,
                    message: '请输入公司全称',
                  },
                ],
              })(<Input placeholder="公司全称" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="简称">
              {getFieldDecorator('company', {
                rules: [
                  {
                    required: true,
                    message: '请输入简称',
                  },
                ],
              })(<Input placeholder="企简称业名称" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="标签名">
              {getFieldDecorator('signname', {
                rules: [
                  {
                    required: true,
                    message: '请输入打印标签的公司名',
                  },
                ],
              })(<Input placeholder="标签名" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="企业税号">
              {getFieldDecorator('taxnumber', {
                rules: [
                  {
                    required: true,
                    message: '请输入企业税号',
                  },
                ],
              })(<Input placeholder="企业税号" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="地址">
              {getFieldDecorator('acceptadress', {
                rules: [
                   {
                     required: true,
                    message: '请输入地址',
                  },
                ],
              })(
                
                <Cascader style={{ width: '30%',display:"inline-block" }} options={this.state.options} onChange={(e,op)=>this.changePro(e,op)}  placeholder="省/市/区" />,  
                )}
              {getFieldDecorator('acceptadressdetails',{ rules: [
                    {
                      required: true,
                      message: '',
                    },
                  ]})(
                
                    <Input maxLength="200" style={{ width: '60%',display:"inline-block" }} />
                )}
            </FormItem>
            <FormItem {...formItemLayout} label="电话">
              {getFieldDecorator('telphone', {
                rules: [
                  {
                    required: true,
                    message: '请输入企业电话',
                  },
                ],
              })(<Input placeholder="电话" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="传真">
              {getFieldDecorator('fax', {
                rules: [
                  {
                    required: true,
                    message: '请输入企业传真',
                  },
                ],
              })(<Input placeholder="传真" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="营业执照">
              {getFieldDecorator('photo', {
                // rules: [
                //   {
                //     required: true,
                //     message: '请输入营业执照',
                //   },
                // ],
              })(
                <Upload
                  name="file"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  headers={headers}
                  action={getUploadStaticUrl()} // 这个就是我要填的上传的地址
                  beforeUpload={beforeUpload}
                  onChange={this.handleChange}
                >
                  {imageUrl2 ? <img src={imageUrl2} alt="avatar" /> : uploadButton}
                </Upload>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="logo" >
              {getFieldDecorator('logo', {
                      valuePropName: 'file',
                      initialValue:  imageUrl,
                      getValueFromEvent: this.normFile,
                      // rules: [
                      //   {
                      //     required: true,
                      //     message: '请上传logo',
                      //   },
                      // ],
                  })(
                    <Upload
                      className="avatar-uploader"
                      showUploadList={false}
                      name="file"
                      listType="picture-card"
                      headers={headers}
                      action={getUploadStaticUrl()} 
                      onChange={this.handleChangeP}
                    >
                      {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton2}
                    </Upload>
                  )}
                 
            </FormItem>


            <FormItem {...formItemLayout} label="所属行业" help="行业">
              {getFieldDecorator('supplykind')(
                <Select>
                  <Option value="1">毛行</Option>
                  <Option value="3">纺纱厂</Option>
                  <Option value="2">染厂</Option>
                </Select>
              )}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交
              </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderLayout>
    );
  }
}
