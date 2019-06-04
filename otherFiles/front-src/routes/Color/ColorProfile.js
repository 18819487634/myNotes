import React, { PureComponent } from 'react';
import { connect } from 'dva';

import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Divider,
  Popconfirm,
  // Dropdown,
  Modal,
  InputNumber,
  message,
  Table,
  List,
  Checkbox,
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import NanxinWebSocket from '../../utils/nanxinsocket';
import { toDecimal } from '../../utils/utils';
import { getSupplyId } from '../../utils/sessionStorage';
import { ButtonLab, RGBCheckBox } from '../../utils/LAButils';
import styles from './ColorProfile.less';
import ColorInput from './ColorInputProfile';
import ColorOperationProfile from './ColorOperationProfile';

let nanxinws = null;
let viewTag = true;
const FormItem = Form.Item;
const { Option } = Select;
const kindarr = ['胚纱', '色纱'];

// const getValue = obj =>
//   Object.keys(obj)
//     .map(key => obj[key])
//     .join(',');

// 将model 组件组装在一起 ，这个是请求后台数据的
const UpdateForm = Form.create()(props => {
  const {
    modalVisible,
    form,
    formsource,
    
    handleModalVisible,
    onChildChanged,
    handleClick,
  } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleClick(fieldsValue);
    });
  };

  const titlename = '修改产品';
  return (
    <Modal
      title={titlename}
      visible={modalVisible}
      onOk={okHandle}
      width={1000}
      destroyOnClose
      footer={null}
      maskClosable={false}
      onCancel={() => handleModalVisible()}
    >
   
      <div><ColorOperationProfile dataSource={formsource}  callbackParent={onChildChanged} /></div>
    </Modal>
  );
});
@connect(({ color, loading }) => ({
  color,
  loading: loading.models.color,
}))
@Form.create()
export default class ColorList extends PureComponent {
  state = {
    expandForm: false,
    selectedRows: [],
    bgcolor: '#123412',
    // switchVal:"切换色卡视图",
    pageindex: 1,
    pagesize: 12,
    showTag: true,
    LABEList: [],
  };

  componentDidMount() {
    // Linjiefeng
    nanxinws = new NanxinWebSocket('ws://localhost:8088/socket');
    nanxinws.open().catch(() => {});

    const { dispatch } = this.props;
    const params = `pageIndex=${0}&pageSize=${12}`;
    // params.supplyids = [getSupplyId()]; // 所有查询都要传递supplyid ，这里只传递自己的supplyid先。
    // params.supplierKind = 1;
    // params.pageIndex = 0;
    // params.pageSize = 12;

    // params.lab = "";
    //  params.lab_e =  "";
    dispatch({
      type: 'color/fetchColor',
      payload: params,
    });

    //
  }
  componentWillUnmount() {
    nanxinws.close();
  }
  handleStandardTableChange2 = pagination => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        pageIndex: pagination - 1,
        pageSize: 12,
        supplyids: [getSupplyId()],

        ...fieldsValue,
      };
      values.supplierKind = 1;
      dispatch({
        type: 'color/fetchColor',
        payload: values,
      });
    });
  };
  handleColorInput = () => {
    const hide = message.loading('正在读取中...', 0);
    nanxinws
      .send('{"command":"getCubeData","parameters":{"type":"conn","cubeid":"134141"}}')
      .then(e => {
        const mydata = JSON.parse(e.data);
        setTimeout(hide, 100);
        let theForm = {
          XYZ_X: '',
          XYZ_Y: '',
          XYZ_Z: '',
          Lab_L: `${mydata.value.l}`,
          Lab_a: `${mydata.value.a}`,
          Lab_b: `${mydata.value.b}`,
          RGB_R: '',
          RGB_G: '',
          RGB_B: '',
          DomWavelength: '',
          K: '',
          hex: '',
          RefWhite: {
            selectedIndex: 3,
          },
          Adaptation: {
            selectedIndex: 0,
          },
          Gamma: {
            selectedIndex: 3,
          },
          RGBModel: {
            selectedIndex: 14,
          },
        };
        ButtonLab(theForm);
        RGBCheckBox(theForm);
        const vbgcolor = `rgb(${theForm.RGB_R},${theForm.RGB_G},${theForm.RGB_B})`;

        this.setState({ bgcolor: vbgcolor }); // 改变组件颜色

        this.props.form.setFieldsValue({
          // 设置组件值
          lab: `${toDecimal(mydata.value.l)},${toDecimal(mydata.value.a)} ,${toDecimal(
            mydata.value.b
          )}`,
        });
        theForm = null;
      })
      .catch(() => {
        message.error('cube盒子连接出错');
      });
  };
  redaw = () => {
    const antbody = document.body.clientWidth;

    if (antbody < 1000) {
      //  overflow ='auto';
    }
  };

  handleStandardTableChange = pagination => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.setState({
        pageindex: pagination.current,
        pagesize: pagination.pageSize,
      });

      // const values = {
      //   pageIndex: pagination.current - 1,
      //   pageSize: pagination.pageSize,
      //   supplyids: [getSupplyId()],

      //   ...fieldsValue,
      // };
      // values.supplierKind = 1;\

      const values = this.createTerms(fieldsValue, pagination.current-1, pagination.pageSize);

      dispatch({
        type: 'color/fetchColor',
        payload: values,
      });
    });
  };

  createTerms = (obj, pageIndex = 1, pageSize = 12) => {
    let i = 0;
    let params = `pageIndex=${pageIndex}&pageSize=${pageSize}`;
    let lab = '';

    Object.keys(obj).forEach(key => {
   

      if (obj[key] !== undefined) {
        if (key === 'lab') {
          lab = obj[key];
         
        }else{
          if(obj[key]!==""){
          if(key === 'colorname') {
            params += `&terms[${i}].termType=like&terms[${i}].value=%25${obj[key]}%25&terms[${i}].column=${key}`;
          }else if(key === 'kind'){
            params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=${key}`;
          }else{
            params += `&terms[${i}].value=%25${obj[key]}%25&terms[${i}].column=${key}`;
          }
          // params += `&terms[${i}].value=%25${obj[key]}%25&terms[${i}].column=${key}`;
          i+=1;
          }
          return params;
        }
      }
    });
    if (lab !== '') {
      const arr = `${lab}`.split(',');
      const labArr = ['L', 'A', 'B'];
      // const sql = `power(((${arr[0]}-n_product_all.l)*(${arr[0]}-n_product_all.L)+(${arr[1]}-n_product_all.a)*(${arr[1]}-n_product_all.a)+(${arr[2]}-n_product_all.b)*(${arr[2]}-n_product_all.b)),2) &lt; ${labe}`
      for (let j = 0; j < arr.length; j += 1) {
        params += `&terms[${i}].value=${arr[j]}&terms[${i}].column=${labArr[j]}`;
        i += 1;
      }
      // params += `&terms[${i}].sql=${sql}`;
    }
    return params;
  };
  onChildChanged=(flag)=>{
    console.log("111");
    this.setState({
      modalVisible:!flag,
    })
  }
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();

    const params = {};
    params.supplyids = [getSupplyId()];
    params.supplierKind = 1;
    params.pageIndex = 0;
    params.pageSize = 12;
    dispatch({
      type: 'color/fetchColor',
      payload: params, // 这里不要任何东西都不传，否则会造成后台压力
    });
  };

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  };

  handleMenuClick = (record) => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'color/deleteColor',
      payload: record,
      callback: () => {
        form.validateFields((err, fieldsValue) => {
    
          const values = this.createTerms(fieldsValue, this.state.pageindex-1, this.state.pagesize);
    
          dispatch({
            type: 'color/fetchColor',
            payload: values,
          });
        });
      },
    });
  };
  switchView = () => {
    if (viewTag === true) {
      viewTag = false;
      this.setState({
        showTag: false,
      });
    } else if (viewTag === false) {
      viewTag = true;

      this.setState({
        // switchVal:"切换色卡视图",
        showTag: true,
      });
    }
  };

  handleSelectRows = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
    });
  };
  changechroma = e => {
    const LABEList = [];
    let value1 = 0;
    let value2 = 0;
    let value3 = 0;
    if (e === 0) {
      value1 = 1000;
      value2 = 10000;
      value3 = 100000;
    } else if (e === 1) {
      value1 = 20;
      value2 = 200;
      value3 = 5000;
    } else if (e === 2) {
      value1 = 300;
      value2 = 5000;
      value3 = 10000;
    }
    LABEList.push(
      <Option key="labe1" value={value1}>
        精准
      </Option>
    );
    LABEList.push(
      <Option key="labe2" value={value2}>
        相近
      </Option>
    );
    LABEList.push(
      <Option key="labe3" value={value3}>
        相仿
      </Option>
    );
    this.setState({
      LABEList,
    });
  };
  checkCustom = e => {
    this.setState({
      chekcTag: e.target.checked,
    });
  };
  toggleEditable=(e,record)=>{
    const tmp = record;
    tmp.pageindex = this.state.pageindex-1;
    tmp.pagesize = this.state.pagesize;
    this.setState({
      modalVisible:true,
      updateData:tmp,
    })
  }
  handleModalVisible=(flag)=>{
    this.setState({
      modalVisible:!!flag,
    })
  }
  handleClick=()=>{
    console.log("1222");
  }

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = fieldsValue;
      if (this.state.chekcTag === true) {
        params.LABE = params.customLABE;
      }
      const values = this.createTerms(params);

      // const values = {
      //   ...fieldsValue,
      // };
      // values.pageIndex = 0;
      // values.pageSize = 12;
      // values.supplyids = [getSupplyId()];
      // values.supplierKind = 1;
      dispatch({
        type: 'color/fetchColor',
        payload: values,
      });
    });
  };

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {/* <Col md={8} sm={24}>
            <FormItem label="材料成份">
              {getFieldDecorator('kind')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col> */}
          <Col md={8} sm={24}>
            <FormItem label="颜色名称">
              {getFieldDecorator('productname')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="色号">
              {getFieldDecorator('colorname')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    const divstyle = {
      backgroundColor: this.state.bgcolor,
    };
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="颜色名称">
              {getFieldDecorator('productname')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="色号">
              {getFieldDecorator('colorname')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>

          <Col md={8} sm={24}>
            <FormItem label=" 类似潘通的色号">
              {getFieldDecorator('pantong_color')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {/* <Col md={8} sm={24}>
            <FormItem label="录入日期">
              {getFieldDecorator('updatedAt')(
                <DatePicker style={{ width: '100%' }} placeholder="请输入录入日期" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="是否上线">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">上线中</Option>
                  <Option value="1">下架</Option>
                </Select>
              )}
            </FormItem>
          </Col> */}
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          {/* <Col md={8} sm={24}>
            <FormItem label="色差要求(△e<)">
              {getFieldDecorator('lab_e')(
                <InputNumber min={0.1} max={100} step={0.1} style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col> */}

          {/* <Col md={8} sm={24}>
            <FormItem label="供应商名称">
              {getFieldDecorator('supplyname')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          
          <Col md={8} sm={24}>
            <FormItem label="供货商类别" style={{ display: "none" }}>
              {getFieldDecorator('supplierKind')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">毛行</Option>
                  <Option value="1">毛织</Option>
                  <Option value="2">染厂</Option>
                </Select>
              )}
            </FormItem>
          </Col> */}
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="材料成份">
              {getFieldDecorator('kind', {
                initialValue: 1,
                rules: [{ required: false, message: '请选择材料成份' }],
              })(
                <Select placeholder="">
                  <Option value={0}>胚纱</Option>
                  <Option value={1}>色纱</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={10} sm={24}>
            <FormItem label="色差要求">
              <Select
                placeholder="请选择"
                onChange={e => this.changechroma(e)}
                style={{ width: 100 }}
              >
                <Option value={1}>深色</Option>
                <Option value={2}>浅色</Option>
                <Option value={3}>均色</Option>
              </Select>
              {getFieldDecorator('LABE')(
                <Select placeholder="请选择" style={{ width: 100 }}>
                  {this.state.LABEList}
                </Select>
              )}
            </FormItem>
          </Col>

          <Col md={4} sm={24}>
            <FormItem label="">
              <Checkbox onChange={e => this.checkCustom(e)}>自定义</Checkbox>
              {getFieldDecorator('customLABE')(
                <InputNumber
                  style={{ float: 'right' }}
                  min={0}
                  max={1000000}
                  step={1}
                  className={this.state.chekcTag ? styles.block : styles.none}
                />
              )}
            </FormItem>
          </Col>
          {/* <Col md={4} sm={24}>
            <FormItem label=""  >
              {getFieldDecorator('kind01value', {
                initialValue: '',
                rules: [{ required: false, message: '' }],
              })(
                <InputNumber min={1} max={100} step={1} />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem   >
              {getFieldDecorator('kind01weight', {
                initialValue: '',
                rules: [{ required: false, message: '' }],
              })(
                <Input placeholder="例如% 、 s/2 " />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label=""  >
              {getFieldDecorator('kind01', {
                initialValue: '',
                rules: [{ required: false, message: '' }],
              })(
                <Input placeholder="例如晴棉" />
              )}
            </FormItem>
          </Col> */}
        </Row>

        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="lab值">
              <div style={divstyle}>
                {getFieldDecorator('lab')(<Input placeholder="请读取lab值" />)}
                <FormItem>
                  <Button style={{ minHeight: 32 }} onClick={this.handleColorInput}>
                    读取LAB
                  </Button>
                </FormItem>
              </div>
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </span>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    this.redaw();
    const { color: { data }, loading } = this.props;
    const {modalVisible,updateData} = this.state;
    const parentMethods = {
      onChildChanged:this.onChildChanged,
      handleModalVisible: this.handleModalVisible,
      handleClick: this.handleClick,
    };
    let isE = false;
    let dataList = [];

    if (data && data.status === 200 && data.result.data) {
      data.list = data.result.data;

      data.pagination = {
        total: data.result.total,
        current: this.state.pageindex,
        pageSize: this.state.pagesize,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: true,
      };
      data.paginationCard = {
        total: data.result.total,
        current: this.state.pageindex,
        pageSize: this.state.pagesize,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        onChange: this.handleStandardTableChange2,
        showQuickJumper: true,
      };
      dataList = data.list;
    }
    // for(let z =0;z<dataList.length;z+=1){
    //   dataList[z].colorproduct.pantongColor =dataList[z].colorproduct.pantongColor===undefined?"":dataList[z].colorproduct.pantongColor;
    // }

    if (data.length > 0) {
      const colkeys = Object.keys(data.list[0]);
      if (colkeys.indexOf('labE') === -1) {
        isE = false;
      } else {
        isE = true;
      }
    }

    const { selectedRows } = this.state;
    const rowSelection = {
      selectedRows,

      onChange: this.handleSelectRows,
    };

    const columns = [
      {
        title: '操作',
        width: '4%',
        render: (val,record) =>{ 
          return (
            <span>
              <a onClick={e=>this.toggleEditable(e,record)}>修改</a>
              {/* <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.handleMenuClick(record)}>
                <a>删除</a>
              </Popconfirm> */}
            </span>
          );
        },
      },
      {
        title: '色卡图',
        width: '5%',
        dataIndex: 'picture',
        render: val => <img alt={val} src={val} width={100} height={35} />,
      },
      {
        title: '实物图',
        width: '5%',
        dataIndex: 'goodpic',
        render: val => <img alt={val} src={val} width={100} height={100} />,
      },
      {
        title: '产品属性',
        width: '5%',
        dataIndex: 'kind',
        
        render(val) {
          return <span>{kindarr[val]}</span>;
        },
      },

      {
        title: '所属系列',
        width: '5%',
        dataIndex: 'productseries.seriesname',
      },
      {
        title: '品名',

        dataIndex: 'brandname',
        width: '5%',
      },
      {
        title: '色号',
        width: '5%',
        dataIndex: 'colorname',
      },
      // {
      //   title: '供货商',
      //   dataIndex: 'supply',
      //   visible:"false",
      // },
      {
        title: '色称',

        dataIndex: 'productname',
        width: '5%',
      },
      {
        title: '位置信息',

        dataIndex: 'location',
        width: '5%',
      },

      {
        title: 'LAB值',
        children: [
          {
            title: 'l',
            dataIndex: 'l',
            width: '5%',
          },
          {
            title: 'a',
            dataIndex: 'a',
            width: '5%',
          },
          {
            title: 'b',
            dataIndex: 'b',
            width: '5%',
          },
        ],
      },

      {
        title: '类似潘通色号',
        width: '7%',
        dataIndex: 'pantongColor',
      },
      {
        title: '建议色差',
        width: '5%',
        dataIndex: 'recommande',
      },
      {
        title: '参考色',
        width: '5%',
        dataIndex: 'rgb',
        render: val => (
          <div style={{ height: 20, marginleft: 10, backgroundColor: `rgb(${val})` }} />
        ),
      },
    ];

    if (isE) {
      columns.push({
        title: '△e',
        dataIndex: 'labE',
        width: 100,
        render: val => {
          if (val < 50) {
            return '精准';
          } else if (val < 100) {
            return '一般';
          } else {
            return '模糊';
          }
        },
      });
    }

    // const menu = (
    //   <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
    //     <Menu.Item key="remove">删除</Menu.Item>
    //     <Menu.Item key="approval">批量审批</Menu.Item>
    //   </Menu>
    // );

    return (
      <PageHeaderLayout title="色卡查询">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <span>
                {/* <Button className={styles.switchBtn} type="primary" onClick={this.switchView}>{this.state.switchVal}</Button> */}
                {/* <Button className={styles.switchBtn} type="primary" onClick={this.handleMenuClick}>
                  删除
                </Button> */}
                {/* <Dropdown overlay={menu}>
                  <Button>
                    更多操作 <Icon type="down" />
                  </Button>
                </Dropdown> */}
              </span>
            </div>
          </div>
        </Card>
        <div id="gridTable" className={this.state.showTag ? styles.block : styles.none}>
          <Table
            rowKey="id"
            selectedRows={selectedRows}
            loading={loading}
            dataSource={dataList}
            columns={columns}
            pagination={data.pagination}
            rowSelection={rowSelection}
            onChange={this.handleStandardTableChange}
            bordered
            // size="middle"
            title={() => '查询结果'}
            scroll={{ x: '180%', y: 0 }}
          />
        </div>
        <Card
          bordered={false}
          id="listCard"
          style={{ display: 'none', marginTop: 18 }}
          className={this.state.showTag ? styles.none : styles.block}
        >
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            pagination={data.paginationCard}
            dataSource={dataList}
            renderItem={item =>
              Object.keys(item).length !== 0 ? (
                //  类似潘通的色号:${item.colorproduct.pantongColor}
                <List.Item key={item.id}>
                  <Card title={`${item.largetype} ${item.series} `}>
                    <div style={{ width: 85, display: 'inline-block', fontSize: 12 }}>
                      <li>色称:{item.productname}</li>
                      <li>色号:{item.colorname}</li>
                      <li>建议色差:{item.recommande}</li>
                    </div>
                    <img
                      alt={item.picture}
                      src={item.picture}
                      style={{ width: 115, height: 45, marginTop: '-17%' }}
                    />
                    {/* <div  style={{ backgroundColor: `rgb(${item.colorproduct.rgb})`, width: 115, height: 45, display: "inline-block" }} /> */}

                    <hr style={{ border: '1px dashed  #000', height: 1 }} />
                    <div style={{ fontSize: 11 }}>
                      材料成份:<span style={{ fontSize: 11, color: 'skyblue' }}>{item.kind}</span>
                    </div>
                  </Card>
                </List.Item>
              ) : (
                <List.Item />
              )
            }
          />
          <UpdateForm {...parentMethods} modalVisible={modalVisible} formsource={updateData}  />
        </Card>
      </PageHeaderLayout>
    );
  }
}
