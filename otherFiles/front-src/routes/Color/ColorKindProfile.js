import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Badge,
  Modal,
  message,
  Checkbox,
  Table,
  InputNumber,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getSupplyId } from '../../utils/sessionStorage';

import styles from './ColorProfile.less';

const FormItem = Form.Item;
const { Option } = Select;
const children = [];
let overKind = '';

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['success', 'error'];
const status = ['有效', '无效'];
const supplyids = getSupplyId();
const KindForm = Form.create()(props => {
  const { modalVisible, CancelModalVisible, form, updateRows, options, handleKindAdd } = props;
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
  const datasouce = updateRows;

  let id2 = '';
  let codeno2 = '';
  let isvalid2 = 0;
  let kindname2 = '';
  let desc2 = '';
  let paperweight2 =0;
  let wrapperweight2 =0;
  let piecenum2 =0;
  if (Object.keys(datasouce).length !== 0) {
    id2 = datasouce.id;
    isvalid2 = datasouce.isvalid;
    codeno2 = datasouce.codeno;
    kindname2 = datasouce.kindname;
    desc2 = datasouce.desc;
    paperweight2 =datasouce.paperweight;
    wrapperweight2 = datasouce.wrapperweight;
    piecenum2 = datasouce.num;
  }

  let titlename = '';
  if (JSON.stringify(updateRows) === '{}') {
    titlename = '新增';
  } else {
    titlename = '修改';
  }

  const okHandle = () => {
    validateFieldsAndScroll((error, values) => {
      if (values.id === '') {
        delete values.id;
      }
      const params = values;
      params.supplyid = getSupplyId();
      handleKindAdd(params);
    });
  };
  const onChange = value => {
  
  };
  return (
    <Modal
      title={titlename}
      width="68%"
      visible={modalVisible}
      destroyOnClose
      onOk={okHandle}
      onCancel={() => CancelModalVisible()}
    >
      <Form>
        <Row gutter={{ md: 12, lg: 24, xl: 24 }}>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="id">
                {getFieldDecorator('id', { initialValue: id2 })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="编号">
                {getFieldDecorator('codeno', { initialValue: codeno2 })(
                  <Input placeholder="编号" />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="名称">
                {getFieldDecorator('kindname', { initialValue: kindname2 })(
                  <Input placeholder="名称" />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="纸筒(kg)">
                {getFieldDecorator('paperweight', { initialValue: paperweight2 })(
                  <InputNumber 
                    formatter={value => `${value}Kg`}
                    parser={value => value.replace('Kg', '')} 
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="包装袋(Kg)">
                {getFieldDecorator('wrapperweight', { initialValue: wrapperweight2 })(
                  <InputNumber 
                    formatter={value => `${value}Kg`}
                    parser={value => value.replace('Kg', '')} 
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="包装只数">
                {getFieldDecorator('num', { initialValue: piecenum2 })(
                  <InputNumber 
                    formatter={value => `${value}只`}
                    parser={value => value.replace('只', '')} 
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="描述">
                {getFieldDecorator('desc', { initialValue: desc2 })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="有效">
                {getFieldDecorator('isvalid', { initialValue: isvalid2 })(
                  <Select>
                    <Option value={0}>有效</Option>
                    <Option value={1}>无效</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
        </Row>
      </Form>
    </Modal>
  );
});

const SeriesForm = Form.create()(props => {
  const { modalVisible, CancelSeriesModalVisible, form, updateRows, handleSeriesadd } = props;
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
  const datasouce = updateRows;
  let id2 = '';
  let codeno2 = '';
  let isvalid2 = 0;
  let seriesname2 = '';
  let desc2 = '';
  let weightdown2 = 0;
  let weightup2 = 0;
  let boardweightdown2 =0;
  let boardweightup2 = 0;
  let lossfactor2 =0;
  if (Object.keys(datasouce).length !== 0) {
    id2 = datasouce.id;
    isvalid2 = datasouce.isvalid;
    codeno2 = datasouce.codeno;
    seriesname2 = datasouce.seriesname;
    desc2 = datasouce.desc;
    weightdown2 = datasouce.weightdown;
    weightup2 =datasouce.weightup;
    boardweightdown2 =datasouce.boardweightdown;
    boardweightup2 = datasouce.boardweightup;
    lossfactor2 = datasouce.lossfactor;
  }
  let titlename = '';
  if (JSON.stringify(updateRows) === '{}') {
    titlename = '新增';
  } else {
    titlename = '修改';
  }

  const okHandle = () => {
    validateFieldsAndScroll((error, values) => {
      if (values.id === '') {
        delete values.id;
      }
      const params = values;
      params.supplyid = getSupplyId();
      params.kindid = overKind;
      handleSeriesadd(params);
    });
  };

  return (
    <Modal
      title={titlename}
      width="68%"
      visible={modalVisible}
      onOk={okHandle}
      destroyOnClose
      onCancel={() => CancelSeriesModalVisible()}
    >
      <Form>
        <Row gutter={{ md: 12, lg: 24, xl: 24 }}>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="id">
                {getFieldDecorator('id', { initialValue: id2 })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="编号">
                {getFieldDecorator('codeno', { initialValue: codeno2 })(
                  <Input placeholder="编号" />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="名称">
                {getFieldDecorator('seriesname', { initialValue: seriesname2 })(
                  <Input placeholder="名称" />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="大货仓最低量">
                {getFieldDecorator('weightdown', { initialValue: weightdown2 })(
                  <InputNumber 
                    formatter={value => `${value}Kg`}
                    parser={value => value.replace('Kg', '')} 
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="大货仓最高量">
                {getFieldDecorator('weightup', { initialValue: weightup2 })(
                  <InputNumber 
                    formatter={value => `${value}Kg`}
                    parser={value => value.replace('Kg', '')} 
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="板毛仓最低量">
                {getFieldDecorator('boardweightdown', { initialValue: boardweightdown2 })(
                  <InputNumber 
                    formatter={value => `${value}Kg`}
                    parser={value => value.replace('Kg', '')} 
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="板毛仓最高量">
                {getFieldDecorator('boardweightup', { initialValue: boardweightup2 })(
                  <InputNumber 
                    formatter={value => `${value}Kg`}
                    parser={value => value.replace('Kg', '')} 
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="损耗率">
                {getFieldDecorator('lossfactor', { initialValue: lossfactor2 })(
                  <InputNumber 
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')} 
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="描述">
                {getFieldDecorator('desc', { initialValue: desc2 })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              <FormItem {...formItemLayout} label="有效">
                {getFieldDecorator('isvalid', { initialValue: isvalid2 })(
                  <Select>
                    <Option value={0}>有效</Option>
                    <Option value={1}>无效</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
        </Row>
      </Form>
    </Modal>
  );
});
@connect(({ color, loading }) => ({
  color,
  loading: loading.models.color,
}))
@Form.create()
export default class ErpCustomerProfile extends PureComponent {
  state = {
    KindeModalVisible: false,
    seriesModalVisible: false,
    seriesName: '系列',
    pageSeriesIndex:1,
    pageSeriesSize:10,
    pageIndex:1,
    pageSize:10,
    kindid:'',
    selectedRows: [],
    formValues: {},
    updateRows: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
   

    const params = `terms[0].value=${supplyids}&terms[0].column=supplyid&pageIndex=${0}&pageSize=${10}`;
    dispatch({
      type: 'color/fetchKind',
      payload: params,
    });
    this.props.color.seriesData = [];
  }
  onSelect = value => {
    if (value === '1') {
      document.getElementById('creditid').style.display = 'block';
    } else {
      document.getElementById('creditid').style.display = 'none';
    }
  };
  handleKindAdd = params => {
    const {dispatch} = this.props;
    const ds = `terms[0].value=${
      params.supplyid
    }&terms[0].column=supplyid&pageIndex=${0}&pageSize=${10}`;
    this.props.dispatch({
      type: 'color/addOrUpdateKind',
      payload: params,
      callback: response => {
        if (response && response.status === 200) {
          dispatch({
            type:'color/fetchKind',
            payload:ds,
          })
          this.setState({
            KindeModalVisible: false,
          });
          // queryColorKind(ds).then(res => {
          //   if (res && res.status === 200) {
              
          //   }
          // });
        }
      },
    });
  };
  handleSeriesadd = params => {
    const ds = `terms[0].value=${
      params.kindid
    }&terms[0].column=kindid&terms[1].column=supplyid&terms[1].value=${supplyids}&pageIndex=${0}&pageSize=${10}`;
    this.props.dispatch({
      type: 'color/addOrUpdateSeries',
      payload: params,
      callback: response => {
        if (response && response.status === 200) {
          message.success('操作成功!');
          this.props.dispatch({
            type:'color/fetchSeries',
            payload:ds,
          })
          this.setState({
            seriesModalVisible:false,
          })
        } else if (response.status === 500) {
          message.error('该数据已经存在，请重新操作！');
        }
      },
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch,form } = this.props;
    const { formValues } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = fieldsValue;
      params.supplyid = getSupplyId();
      const values = this.createTerms(params, pagination.current-1,pagination.pageSize);
      dispatch({
        type: 'color/fetchKind',
        payload: values,
      });
    this.setState({
      pageIndex:pagination.current,
      pageSize:pagination.pageSize,
     })
    })
    
  };

  handleSeriesStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch,form } = this.props;
    const { formValues } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = fieldsValue;
      params.supplyid = getSupplyId();
      params.kindid = this.state.kindid;
      const values = this.createTerms(params, pagination.current-1,pagination.pageSize);
      dispatch({
        type: 'color/fetchSeries',
        payload: values,
      });
    this.setState({
      pageSeriesIndex:pagination.current,
      pageSeriesSize:pagination.pageSize,
     })
    })
    
  };
  createTerms = (obj, pageIndex = 1, pageSize = 12) => {
    let i = 0;
    let params = `pageIndex=${pageIndex}&pageSize=${pageSize}`;
    Object.keys(obj).forEach(key => {
      params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=${key}`;
      i += 1;
    });

    return params;
  };

  showTable = (e, flag) => {
    const ds = `terms[0].value=${e.id}&terms[0].column=kindid&pageIndex=${0}&pageSize=${10}`;
    overKind = e.id;
    this.props.dispatch({
      type:'color/fetchSeries',
      payload:ds,
    });
    this.setState({
      kindid:e.id,
      seriesName:`${e.kindname}系列`,
    })
    // queryColorseries(ds).then(response => {
    //   if (response && response.status === 200) {
    //     this.setState({
    //       seriesResult: response.result,
    //     });
    //   }
    // });
  };
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  CancelModalVisible = flag => {
    this.setState({
      KindeModalVisible: !!flag,
    });
  };
  CancelSeriesModalVisible = flag => {
    this.setState({
      seriesModalVisible: !!flag,
    });
  };
  handleSModalVisible = (flag, dataStatus, row) => {
    // 系列
    if (dataStatus === 'new') {
      this.setState({
        seriesModalVisible: flag,

        updateRows: {},
      });
    } else {
      this.setState({
        seriesModalVisible: flag,

        updateRows: row,
      });
    }
  };

  handleModalVisible = (flag, dataStatus, row) => {
    if (dataStatus === 'new') {
      this.setState({
        KindeModalVisible: flag,

        updateRows: {},
      });
    } else {
      this.setState({
        KindeModalVisible: flag,

        updateRows: row,
      });
    }
  };

  render() {
    const { color: { data,seriesData } } = this.props;
    let dataList = [];
    let dataSeries = [];
    if (data && data.status === 200 && data.result.data) {
      data.list = data.result.data;
      data.pagination = {
        total: data.result.total,
        pageIndex:this.state.pageIndex,
        pageSize:this.state.pageSize,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: true,
      };
      dataList = data.list;
    }
    if (seriesData && seriesData.status === 200 && seriesData.result.data) {
      seriesData.list = seriesData.result.data;
      seriesData.pagination = {
        total: seriesData.result.total,
        pageIndex:this.state.pageSeriesIndex,
        pageSize:this.state.pageSeriesSize,
        showTotal: () => {
          return `共${seriesData.result.total}条`;
        },
        showQuickJumper: true,
      };
      dataSeries = seriesData.list;
    }
   
    const {
      selectedRows,
      KindeModalVisible,
      updateRows,
      options,
      seriesModalVisible,
      seriesName,
    } = this.state;

    const columns = [
      {
        title: '编号',
        width: '5%',
        dataIndex: 'codeno',
        key: 'codeno',
      },
      {
        title: '名称',
        dataIndex: 'kindname',
        key: 'kindname',
        width: '20%',
      },
      {
        title: '纸筒(kg)',
        dataIndex: 'paperweight',
        key: 'paperweight',
        width: '5%',
      },
      {
        title: '包装袋(kg)',
        dataIndex: 'wrapperweight',
        key: 'wrapperweight',
        width: '5%',
      },
      {
        title: '包装只数',
        dataIndex: 'num',
        key: 'num',
        width: '5%',
      },
      {
        title: '描述',
        dataIndex: 'desc',
        key: 'desc',
        width: '10%',
      },
      {
        title: '有效',
        dataIndex: 'isvalid',
        width: '10%',
        filters: [
          {
            text: status[0],
            value: 0,
          },
          {
            text: status[1],
            value: 1,
          },
        ],
        onFilter: (value, record) => record.status.toString() === value,
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]} />;
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '5%',
        render: (text, record) => {
          return <a onClick={() => this.handleModalVisible(true, 'update', record)}>修改</a>;
        },
      },
    ];

    const seriescolumns = [
      {
        title: '编号',
        width: '5%',
        dataIndex: 'codeno',
        key: 'codeno',
      },
      {
        title: '名称',
        dataIndex: 'seriesname',
        key: 'seriesname',
        width: '20%',
      },
      {
        title: '大货仓最低量',
        dataIndex: 'weightdown',
        key: 'weightdown',
        width: '10%',
        render:val=>`<${val===undefined?0:val}Kg`,
      },
      {
        title: '大货仓最高量',
        dataIndex: 'weightup',
        key: 'weightup',
        width: '10%',
        render:val=>`>${val===undefined?0:val}Kg`,
      },
      {
        title: '板毛仓最低量',
        dataIndex: 'boardweightdown',
        key: 'boardweightdown',
        width: '10%',
        render:val=>`<${val===undefined?0:val}Kg`,
      },
      {
        title: '板毛仓最高量',
        dataIndex: 'boardweightup',
        key: 'boardweightup',
        width: '10%',
        render:val=>`>${val===undefined?0:val}Kg`,
      },
      {
        title: '损耗率',
        dataIndex: 'lossfactor',
        key: 'lossfactor',
        width: '10%',
        render:val=>`${val===undefined?0:val}%`,
      },
      {
        title: '描述',
        dataIndex: 'desc',
        key: 'desc',
        width: '10%',
      },
      {
        title: '有效',
        dataIndex: 'isvalid',
        width: '10%',
        filters: [
          {
            text: status[0],
            value: 0,
          },
          {
            text: status[1],
            value: 1,
          },
        ],
        onFilter: (value, record) => record.status.toString() === value,
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]} />;
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '7%',
        render: (text, record) => {
          return <a onClick={() => this.handleSModalVisible(true, 'update', record)}>修改</a>;
        },
      },
    ];

    const parentMethods = {
      handleKindAdd: this.handleKindAdd,
      handleSeriesadd: this.handleSeriesadd,
      CancelModalVisible: this.CancelModalVisible,
      CancelSeriesModalVisible: this.CancelSeriesModalVisible,
      onSelect: this.onSelect,
    };

    return (
      <PageHeaderLayout title="产品类别">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <div style={{ width: 1800 }}>
                <div style={{ float: 'left', width: 800 }}>
                  <Button type="primary" onClick={() => this.handleModalVisible(true, 'new')}>
                    新建
                  </Button>
                  <Table
                    title={() => '类别'}
                    rowKey="id"
                    selectedRows={selectedRows}
                    pagination={data.pagination}
                    dataSource={dataList}
                    columns={columns}
                    onRow={e => ({
                      onClick: () => {
                        this.showTable(e, true);
                      },
                    })}
                    onSelectRow={this.handleSelectRows}
                    onChange={this.handleStandardTableChange}
                    bordered
                  />
                </div>
                <div style={{ width: 800,display:'inline-block' }}>
                  <Button onClick={() => this.handleSModalVisible(true, 'new')}>新建</Button>
                  <Table
                    title={() => seriesName}
                    rowKey="id"
                    selectedRows={selectedRows}
                    dataSource={dataSeries}
                    pagination={seriesData.pagination}
                    columns={seriescolumns}
                    onSelectRow={this.handleSelectRows}
                    onChange={this.handleSeriesStandardTableChange}
                    bordered
                  />
                </div>
                
              </div>
            </div>
          </div>
        </Card>
        {/* <CreateForm {...parentMethods} modalVisible={modalVisible} /> */}
        <KindForm
          {...parentMethods}
          modalVisible={KindeModalVisible}
          updateRows={updateRows}
          options={options}
        />

        <SeriesForm
          {...parentMethods}
          modalVisible={seriesModalVisible}
          updateRows={updateRows}
          options={options}
        />
      </PageHeaderLayout>
    );
  }
}
