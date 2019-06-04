import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Select, Row, Col, Cascader,InputNumber,Button   } from 'antd';


import { queryProvince, companyDetail, queryCompanyUser } from '../../services/api';
import { getSupplyId } from '../../utils/sessionStorage';
import TableForm from './TableForm';

const FormItem = Form.Item;
const { Option } = Select;


// const getValue = obj =>
//   Object.keys(obj)
//     .map(key => obj[key])
//     .join(',');

// 将model 组件组装在一起 ，这个是请求后台数据的
// @connect(({ color, loading }) => ({
//   color,
//   loading: loading.models.color,
// }))
@Form.create()
export default class Forms extends PureComponent {
    constructor(props) {
        super(props);
        
        this.state = {
          data: props.eventsOption,
          acceptadressdetails:'',
          acceptadress:'',
          
          
        };
      }

  componentDidMount() {
    
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

    companyDetail({ id: getSupplyId() }).then(response => {
      if (response && response.status === 200) {
        const companys = response.result.company;
        const params = `terms[0].column=username&terms[0].termType=like&terms[0].value=${companys}%25`;

        queryCompanyUser(params).then(res => {
          if (res.status === 200) {
            const list = res.result.data;
            const children = [];
            for (let i = 0; i < list.length; i++) {
              children.push(
                <Option key={i} value={list[i].username}>
                  {list[i].username}
                </Option>
              );
            }
            this.setState({
              children,
            });
          }
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.eventsOption,
    });
  }

  componentDidUpdate(nextProps) {
    
    this.state = {
      data: nextProps.eventsOption,
    };
  }

  getItemsValue = () => {
    // 3、自定义方法，用来传递数据（需要在父组件中调用获取数据）
    // this.props.form.validateFieldsAndScroll((err, valuess) => {
    //   if(!err){
       
    //   }
    // });
    
    const values = this.props.form.getFieldsValue(); // 4、getFieldsValue：获取一组输入控件的值，如不传入参数，则获取全部组件的值

    return values;
  };
  getItemsError = () => {
    // 3、自定义方法，用来传递数据（需要在父组件中调用获取数据）
    // this.props.form.validateFieldsAndScroll((err, valuess) => {
    //   if(!err){
       
    //   }
    // });

   
      let errorvalues ="";
      this.props.form.validateFieldsAndScroll(error=>{;
      errorvalues = error;
    }); // 4、getFieldsValue：获取一组输入控件的值，如不传入参数，则获取全部组件的值;
    return errorvalues;
  };

  copyadress=()=>{
    const values = this.props.form.getFieldsValue(); 
    const adressArr = values.adress;
    this.setState({
      acceptadress:adressArr,
      acceptadressdetails: values.adressdetails,
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const dataSource = this.state.data;
    const {acceptadress,acceptadressdetails} = this.state;
    let devAdress =  [];
    let devadressDetail = "";
    if(acceptadress!=="" ){
      devAdress = acceptadress;
      devadressDetail = acceptadressdetails;
    }else{
      devAdress = dataSource.acceptadress;
      devadressDetail = dataSource.acceptadressdetails;
    }
    const formItemLayout = { 
      labelCol: {
        xs: { span: 2 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
        md: { span: 12 },
      },
    };
    const adressLayout = {
      labelCol: {
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 12 },
        md: { span: 18 },
      },
    };

    

    return (
      <Fragment>
        <Form>
          <div style={{ width: '100%', height: 500, overflow: 'auto' }}>
            <Row gutter={{ md: 12, lg: 24, xl: 24 }}>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="客户编号">
                    {getFieldDecorator('userid', { initialValue: dataSource.userid })(
                      <Input refs="series_input" onChange={this.changeSeries} disabled />
                    )}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="客户类型">
                    {getFieldDecorator('type', { initialValue: dataSource.type })(
                      <Select placeholder="请选择" style={{ width: '100%' }}>
                        <Option value={0}>企业</Option>
                        <Option value={1}>个人</Option>
                        
                      </Select>)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={12}>
                  <FormItem {...formItemLayout} label="公司全称/姓名">
                    {getFieldDecorator('name', {
                      rules: [
                        {
                          required: true,
                          message: '公司全称/姓名',
                        },
                      ],
                      initialValue: dataSource.name,
                    })(<Input placeholder="公司全称/姓名" maxLength="45" />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="简称">
                    {getFieldDecorator('shortname', { initialValue: dataSource.shortname })(
                      <Input maxLength="45" />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="行业">
                    {getFieldDecorator('supplykind',{ rules: [
                        {
                          required: true,
                          message: '行业',
                        },
                    ],initialValue:dataSource.supplykind})(
                      <Select placeholder="请选择" style={{ width: '100%' }} mode="multiple">
                        <Option value="0">毛行</Option>
                        <Option value="1">毛织</Option>
                        <Option value="2">贸易</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="关联客户">
                    {getFieldDecorator('linkCusttomer',)(<Button >关联客户</Button>)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={24} sm={24}>
                  <FormItem {...adressLayout} label="公司/居住地址">
                    {getFieldDecorator('adress', {
                      rules: [
                        {
                          required: true,
                          message: '公司居住地',
                        },
                    ],
                    initialValue:dataSource.adress,
                    })(
                      
                      <Cascader style={{ width: '30%',display:"inline-block" }} options={this.state.options} placeholder="省/市/区" />    
                      )}
                    {getFieldDecorator('adressdetails',{initialValue:dataSource.adressdetails})(
                      
                      <Input maxLength="200" style={{ width: '60%',display:"inline-block" }} />
                      )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={24} sm={24}>
                  <FormItem {...adressLayout} label="默认收货地址">
                    {getFieldDecorator('acceptadress', {
                    //   rules: [
                    //     {
                    //       required: true,
                    //       message: '',
                    //     },
                    // ],
                    initialValue:devAdress,
                    })(
                      
                      <Cascader style={{ width: '30%',display:"inline-block" }} options={this.state.options}  placeholder="省/市/区" />,  
                      )}
                    {getFieldDecorator('acceptadressdetails',{initialValue:devadressDetail})(
                      
                      <Input maxLength="200" style={{ width: '60%',display:"inline-block" }} />
                      )}
                    <Button onClick={e=>this.copyadress(e)}>同上</Button>
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="收货人">
                    {getFieldDecorator('shipreceiver', {rules: [
                        {
                          required: true,
                          message: '收货人',
                        },
                      ], initialValue: dataSource.shipreceiver })(
                        <Input maxLength="20" />
                    )}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="收货电话">
                    {getFieldDecorator('shipphone', { rules: [
                        {
                          required: true,
                          message: '收货电话',
                        },
                      ],initialValue: dataSource.shipphone })(
                        <Input maxLength="30"  />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <div id="salesids">
                    <FormItem {...formItemLayout} label="业务员">
                      {getFieldDecorator('saleids', { rules: [
                        {
                          required: true,
                          message: '请填写业务员',
                        },
                      ],initialValue: dataSource.saleids })(
                        <Select mode="multiple" placeholder="请选择" style={{ width: '70%' }}>
                          {this.state.children}
                        </Select>
                      )}
                    </FormItem>
                  </div>
                </Col>
                <Col md={12}>
                  <div id="directorid">
                    <FormItem {...formItemLayout} label="业务主管">
                      {getFieldDecorator('directorid', { rules: [
                        {
                          required: true,
                          message: '请填写业务主管',
                        },
                    ], initialValue: dataSource.directorid })(
                      <Select mode="multiple" placeholder="请选择" style={{ width: '70%' }}>
                        {this.state.children}
                      </Select>
                      )}
                    </FormItem>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="英文名">
                    {getFieldDecorator('enname', { initialValue: dataSource.enname })(<Input maxLength="50" />)}
                  </FormItem>
                </Col>

                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="注册地户籍">
                    {getFieldDecorator('registlocation', {
                      initialValue: dataSource.registlocation,
                    })(<Input maxLength="50" />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="统一社会信用代码">
                    {getFieldDecorator('taxnumber', {
                      
                      initialValue: dataSource.taxnumber,
                    })(<Input placeholder="统一社会信用代码" maxLength="50" />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="平台客户握手ID">
                    {getFieldDecorator('handshakeid', { initialValue: dataSource.handshakeid })(
                      <Input disabled />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="注册日期/出生日期">
                    {getFieldDecorator('registtime', { initialValue: dataSource.registtime })(
                      <Input maxLength="45" />
                    )}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="营业期限/身份证有效期">
                    {getFieldDecorator('validtime', { initialValue: dataSource.validtime })(
                      <Input maxLength="45" />
                    )}
                  </FormItem>
                </Col>
              </Row>

              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="传真">
                    {getFieldDecorator('faxnumber', { initialValue: dataSource.faxnumber })(
                      <Input  maxLength="30" />
                    )}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="电话">
                    {getFieldDecorator('telphone', { initialValue: dataSource.telphone })(
                      <Input maxLength="30"  />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="QQ">
                    {getFieldDecorator('qq', { initialValue: dataSource.qq })(<Input maxLength="30" />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="邮箱">
                    {getFieldDecorator('email', { initialValue: dataSource.email })(<Input maxLength="50"  />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="微信">
                    {getFieldDecorator('weixin', { initialValue: dataSource.weixin })(<Input maxLength="30" />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="微信公众号">
                    {getFieldDecorator('weixinpublic', { initialValue: dataSource.weixinpublic })(
                      <Input maxLength="45" />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="网址">
                    {getFieldDecorator('netaddress', { initialValue: dataSource.netaddress })(
                      <Input maxLength="50" />
                    )}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="发票">
                    {getFieldDecorator('taxrate',{initialValue:parseFloat((dataSource.taxrate*100).toPrecision(12)) })(
                      <InputNumber 
                        formatter={value => `${value}%`}
                        parser={value => value.replace('%', '')} 
                      />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="拣货费">
                    {getFieldDecorator('pickuppay', { initialValue: dataSource.pickuppay })(
                      <InputNumber 
                        formatter={value => `${value}/T`}
                        parser={value => value.replace('/T', '')} 
                      />
                    )}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="定金">
                    {getFieldDecorator('earnest', { initialValue: dataSource.earnest })(
                      <InputNumber 
                        formatter={value => `${value}%`}
                        parser={value => value.replace('%', '')} 
                      />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="主营业务">
                    {getFieldDecorator('majorbusiness', { initialValue: dataSource.majorbusiness })(
                      <Input maxLength="200" />
                    )}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="营业范围">
                    {getFieldDecorator('linebusiness', { initialValue: dataSource.linebusiness })(
                      <Input maxLength="200" />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="客户评级">
                    {getFieldDecorator('credit', { initialValue: dataSource.credit })(
                      <Select placeholder="请选择" style={{ width: '100%' }}>
                        <Option value={0}>优</Option>
                        <Option value={1}>良</Option>
                        <Option value={2}>中</Option>
                        <Option value={3}>差</Option>
                      </Select>)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="结款方式">
                    {getFieldDecorator('payment', { initialValue: dataSource.payment })(
                      <Select placeholder="请选择" style={{ width: '100%' }}>
                        <Option value={0}>全款</Option>
                        <Option value={1}>月结</Option>
                      </Select>)}
                  </FormItem>
                </Col>
              </Row>
              
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="开户行">
                    {getFieldDecorator('bank', { initialValue: dataSource.bank })(<Input maxLength="45" />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="账号">
                    {getFieldDecorator('bankno', { initialValue: dataSource.bankno })(<Input maxLength="45" />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="法人/紧急联系人">
                    {getFieldDecorator('emergecy', { initialValue: dataSource.emergecy })(<Input maxLength="20" />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="法人/紧急电话">
                    {getFieldDecorator('emergecyphone', { initialValue: dataSource.emergecyphone })(
                      <Input maxLength="30" />
                    )}
                  </FormItem>
                </Col>
              </Row>
              
            </Row>
            <div style={{ width: '70%' }}>
              {getFieldDecorator('table', {})(<TableForm dataSource={dataSource.contacts} />)}
            </div>
          </div>
        </Form>
      </Fragment>
    );
  }
}
