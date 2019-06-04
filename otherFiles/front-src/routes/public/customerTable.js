import React, { PureComponent, Fragment } from 'react';
import { Row, Col, Form, Input, Select, Modal, Cascader } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;
export default class customerTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      props,
    };
  }
  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        props: nextProps,
      });
    }
  }
  render() {
    const {
      modalVisible,
      CancelModalVisible,
      datafor,
      form,
      updateRows,
      options,
      handleAdd,
    } = this.state.props;
    const { getFieldDecorator, validateFieldsAndScroll } = form;

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

    let titlename = '';
    if (JSON.stringify(updateRows) === '{}') {
      titlename = '新增客户';
    } else {
      titlename = '修改客户';
    }

    const submitArr = [];
    const okHandle = () => {
      validateFieldsAndScroll((error, values) => {
        if (error) {
          return;
        }
        const params = values;
        if (params.id === '') {
          delete params.id;
        }
        const adressArr = `${values.adress}`.split(',');
        const acceptadressArr = `${values.acceptadress}`.split(',');
        params.adress = `${adressArr[0]}${adressArr[1]}${adressArr[2]}${values.adressdetails}`;
        params.shippingaddress = `${acceptadressArr[0]}${acceptadressArr[1]}${acceptadressArr[2]}${
          values.acceptadressdetails
        }`;
        const contactData = params.contacts;
        params.issupply = 0;
        params.supplyid = getSupplyId();
        const cData = [];
        for (let i = 0; i < contactData.length; i++) {
          if (contactData[i].contact !== undefined) {
            cData.push(contactData[i]);
          }
        }
        params.contacts = cData;
        handleAdd(params);

      });
    };
    const onChange = value => {

    };
    return (
      <Modal
        title={titlename}
        width="68%"
        visible={modalVisible}
        onOk={okHandle}
        maskClosable={false}
        onCancel={() => CancelModalVisible()}
      >
        <Form>
          <div style={{ width: '100%', height: 500, overflow: 'auto' }}>
            <Row gutter={{ md: 12, lg: 24, xl: 24 }}>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="客户编号">
                    {getFieldDecorator('userid')(
                      <Input refs="series_input" onChange={this.changeSeries} disabled />
                    )}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="客户类型">
                    {getFieldDecorator('type')(
                      <Select placeholder="请选择" style={{ width: '100%' }}>
                        <Option value="0">企业</Option>
                        <Option value="1">个人</Option>
                      </Select>
                    )}
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
                    })(<Input placeholder="公司全称/姓名" />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="统一社会信用代码">
                    {getFieldDecorator('taxnumber', {
                      rules: [
                        {
                          required: true,
                          message: '统一社会信用代码',
                        },
                      ],
                    })(<Input placeholder="统一社会信用代码" />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="英文名">
                    {getFieldDecorator('enname')(<Input />)}
                  </FormItem>
                </Col>

                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="注册地户籍">
                    {getFieldDecorator('registlocation')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="简称">
                    {getFieldDecorator('shortname')(<Input />)}
                  </FormItem>
                </Col>

                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="平台客户握手ID">
                    {getFieldDecorator('handshakeid')(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="注册日期/出生日期">
                    {getFieldDecorator('registtime')(<Input />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="营业期限/身份证有效期">
                    {getFieldDecorator('validtime')(<Input />)}
                  </FormItem>
                </Col>
              </Row>

              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="行业">
                    {getFieldDecorator('supplykind')(
                      <Select placeholder="请选择" style={{ width: '100%' }}>
                        <Option value="0">毛行</Option>
                        <Option value="1">毛织</Option>
                        <Option value="2">贸易</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="电话">
                    {getFieldDecorator('telphone')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="传真">
                    {getFieldDecorator('faxnumber')(<Input />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="邮箱">
                    {getFieldDecorator('email')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="网址">
                    {getFieldDecorator('netaddress')(<Input />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="QQ">
                    {getFieldDecorator('qq')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="微信">
                    {getFieldDecorator('weixin')(<Input />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="微信公众号">
                    {getFieldDecorator('weixinpublic')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="主营业务">
                    {getFieldDecorator('majorbusiness')(<Input />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="营业范围">
                    {getFieldDecorator('linebusiness')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="客户评级">
                    {getFieldDecorator('credit')(
                      <Select placeholder="请选择" style={{ width: '100%' }}>
                        <Option value="0">优</Option>
                        <Option value="1">良</Option>
                        <Option value="2">中</Option>
                        <Option value="3">差</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="结款方式">
                    {getFieldDecorator('payment')(
                      <Select placeholder="请选择" style={{ width: '100%' }}>
                        <Option value="0">全款</Option>
                        <Option value="1">月结</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="拣货费">
                    {getFieldDecorator('pickuppay')(<Input />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="定金">
                    {getFieldDecorator('earnest')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="开户行">
                    {getFieldDecorator('bank')(<Input />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="账号">
                    {getFieldDecorator('bankno')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="法人/紧急联系人">
                    {getFieldDecorator('linkman')(<Input />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="法人/紧急电话">
                    {getFieldDecorator('linkmanphone')(<Input />)}
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
                    })(
                      <Cascader
                        style={{ width: '30%', display: 'inline-block' }}
                        options={options}
                        onChange={onChange}
                        placeholder="省/市/区"
                      />
                    )}
                    {getFieldDecorator('adressdetails')(
                      <Input style={{ width: '60%', display: 'inline-block' }} />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={24} sm={24}>
                  <FormItem {...adressLayout} label="默认收货地址">
                    {getFieldDecorator('acceptadress', {
                      rules: [
                        {
                          required: true,
                          message: '默认收货地址',
                        },
                      ],
                    })(
                      <Cascader
                        style={{ width: '30%', display: 'inline-block' }}
                        options={options}
                        onChange={onChange}
                        placeholder="省/市/区"
                      />
                    )}
                    {getFieldDecorator('acceptadressdetails')(
                      <Input style={{ width: '60%', display: 'inline-block' }} />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="收货人">
                    {getFieldDecorator('shipreceiver')(<Input />)}
                  </FormItem>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="收货电话">
                    {getFieldDecorator('shipphone')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <div id="salesids">
                    <FormItem {...formItemLayout} label="业务员">
                      {form.getFieldDecorator('saleids')(
                        <Select mode="multiple" placeholder="请选择" style={{ width: '70%' }}>
                          {children}
                        </Select>
                      )}
                    </FormItem>
                  </div>
                </Col>
                <Col md={12}>
                  <div id="directorid">
                    <FormItem {...formItemLayout} label="业务主管">
                      {form.getFieldDecorator('directorid')(
                        <Select placeholder="请选择" style={{ width: '70%' }}>
                          {children}
                        </Select>
                      )}
                    </FormItem>
                  </div>
                </Col>
              </Row>
            </Row>
            <div style={{ width: '100%' }}>
              {getFieldDecorator('contacts', {})(<NewTable dataSource={datafor} />)}
            </div>
          </div>
        </Form>
      </Modal>
    );
  }
}
