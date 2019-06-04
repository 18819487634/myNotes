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
  Menu,
  Modal,
  message,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getSupplyId, getCurrentUser } from '../../utils/sessionStorage';
import { companyDetail, queryCompanyUser, queryProvince, addErpClient, queryErpClient } from '../../services/api';

import ContactTable from '../Customer/ContactTable';
import styles from './SupplyProfile.less';
import Forms from '../Customer/Forms';
import { creditList } from '../../utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const children = [];
const newtable = [
  {
    key: 'new1',
    id: 1,
    linkman: '',
  },
  {
    key: 'new2',
    id: 2,
  },
  {
    key: 'new3',
    id: 3,
  },
];


function handleDs(fieldsValue, pageIndex = 0, pageSize = 10) {
  const supplyids = getSupplyId();

  let ds = `terms[0].value=${supplyids}&terms[0].column=supplyid&pageIndex=${pageIndex}&pageSize=${pageSize}`;
  if (fieldsValue.company && fieldsValue.company.length > 0) {
    ds += `&terms[1].value=%25${
      fieldsValue.company
    }%25&terms[1].termType=like&terms[1].column=companyinfo.company`;
  }
  if (fieldsValue.status && fieldsValue.status.length > 0) {
    if (fieldsValue.company.length > 0) {
      ds += `&terms[2].value=${fieldsValue.status}&terms[2].column=status`;
    } else {
      ds += `&terms[1].value=${fieldsValue.status}&terms[1].column=status`;
    }
  }
  return ds;
}

const CreatForm =  Form.create()(props => {
  const { modalVisible,CancelModalVisible,form,updateRows,handleAdd} = props;
  const {validateFieldsAndScroll} = form;

  
  let titlename="";
  if(JSON.stringify(updateRows)==="{}"){
    const current = JSON.parse( getCurrentUser());
    titlename='新增供应商';
    updateRows.taxrate  = 0.06;
    updateRows.credit =1;
    updateRows.payment =0;
    updateRows.pickuppay =30;
    updateRows.earnest = 30;
    updateRows.type = 0;
   
    updateRows.saleids = [current.username];
    updateRows.contacts =  [];
     updateRows.contacts.erpid = "";// 新建的没有erpid
}else{
    titlename="修改供应商";
    const saleidarr = `${updateRows.saleids}`.split(",");
    updateRows.saleids =saleidarr;
    const supplykindarr = `${updateRows.supplykind}`.split(",");
    updateRows.supplykind =supplykindarr;
    updateRows.adress =[updateRows.ccodeP,updateRows.ccodeC,updateRows.ccodeA];
    updateRows.acceptadress =[updateRows.codeP,updateRows.codeC,updateRows.codeA];
    updateRows.adressdetails =updateRows.address;
    updateRows.acceptadressdetails =updateRows.shippingaddress;
    updateRows.erpid = updateRows.id;
    const concatList = updateRows.contacts;
    if(concatList!==undefined){
      for(let i=0;i<concatList.length;i++){
        concatList[i].key = `concatList${i}`;
        concatList[i].clientid = updateRows.id;
      }
      updateRows.contacts =  concatList;
    }
    updateRows.contacts.erpid = updateRows.id;
     
} 


const okHandle =() =>{
 validateFieldsAndScroll((error) => {
   
  if(error){
    return;
  }
    const params = this.formRef.getItemsValue();
    const errorParms = this.formRef.getItemsError();
    if(errorParms !== null){
      message.warning("请填完必填项!");
      return;
    }
    if(params.id === ""){
      delete params.id;
    }
    if(titlename==='修改供应商'){
      params.id =updateRows.id;
    }
      const adressArr = params.adress;
    params.saleids = `${params.saleids}`;
    params.directorid = `${params.directorid}`;
    params.taxrate = parseFloat(params.taxrate)/100;
    params.supplykind = `${params.supplykind}`;
    const acceptadressArr = params.acceptadress;
    if(acceptadressArr===undefined || adressArr===undefined){
      message.error("地址需必填!");
      return;
    }
    params.ccodeP = `${adressArr[0]}`;
    params.ccodeC = `${adressArr[1]}`;
    params.ccodeA = `${adressArr[2]}`;
    params.address = `${params.adressdetails}`;

    params.codeP = `${acceptadressArr[0]}`;
    params.codeC = `${acceptadressArr[1]}`;
    params.codeA = `${acceptadressArr[2]}`;
    params.shippingaddress = `${params.acceptadressdetails}`;
    params.shippingaddress =`${params.acceptadressdetails}`;
    const contactData = params.table;
    params.issupply =1;
    params.supplyid = getSupplyId();
    const cData =[];
    for(let i=0;i<contactData.length;i++){
      if(contactData[i].contact !== undefined){
        if(contactData[i].id === ""){
          delete  contactData[i].id;
        }
        cData.push(contactData[i]);
      }
      
    }
    params.contacts = cData;
    handleAdd(params);
    form.resetFields();
    
});
}
  
  return (
    <Modal
      title={titlename}
      width="68%"
      visible={modalVisible}
      onOk={okHandle}
      maskClosable={false}
      onCancel={() => CancelModalVisible()}
    >
      <Forms eventsOption={updateRows} wrappedComponentRef={forms => (this.formRef = forms)} />
    </Modal>
  );
});
const ConcatTables = Form.create()(props => {
  const { concatModalVisible, CancelConcatModalVisible, contactData } = props;

  return (
    <Modal
      title="供应商联系人"
      visible={concatModalVisible}
      width={600}
      mask
      maskClosable={false}
      onOk={() => CancelConcatModalVisible()}
      onCancel={() => CancelConcatModalVisible()}
    >
      <ContactTable dataSource={contactData} />
    </Modal>
  );
});
@connect(({ erpclient, loading }) => ({
  erpclient,
  loading: loading.models.erpclient,
}))
@Form.create()
export default class ErpSupplyProfile extends PureComponent {
  state = {
    modalVisible: false,
    concatModalVisible: false,
    selectedRows: [],
    formValues: {},
    updateRows: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const supplyids = getSupplyId();
    let companys = '';
    const param = `terms[0].value=${supplyids}&terms[0].column=supplyid&terms[1].value=1&terms[1].column=issupply&pageIndex=0&pageSize=10`;
    dispatch({
      type: 'erpclient/fetch',
      payload: param,
    });
    queryProvince().then(ress => {
      if (ress && ress.status === 200) {
        const proviceDatas = ress.result.data;
        for (let i = 0; i < proviceDatas.length; i++) {
          proviceDatas[i].key = `${proviceDatas[i].codeP}`;
          proviceDatas[i].value = `${proviceDatas[i].name}`;
          proviceDatas[i].label = `${proviceDatas[i].name}`;
          const childrendatas = proviceDatas[i].children;
          for (let j = 0; j < childrendatas.length; j++) {
            childrendatas[j].value = `${childrendatas[j].name}`;
            childrendatas[j].key = `${childrendatas[j].codeC}`;
            childrendatas[j].label = `${childrendatas[j].name}`;
            const childrenAear = childrendatas[j].areas;
            for (let z = 0; z < childrenAear.length; z++) {
              childrenAear[z].value = `${childrenAear[z].name}`;
              childrenAear[z].key = `${childrenAear[z].codeA}`;
              childrenAear[z].label = `${childrenAear[z].name}`;
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

    companyDetail({ id: supplyids }).then(response => {
      if (response && response.status === 200) {
        companys = response.result.company;
        const params = `terms[0].column=username&pageIndex=0&pageSize=10&terms[0].termType=like&terms[0].value=${companys}%25`;

        queryCompanyUser(params).then(res => {
          if (res.status === 200) {
            const list = res.result.data;
            for (let i = 0; i < list.length; i++) {
              children.push(
                <Option key={i} value={list[i].username}>
                  {list[i].username}
                </Option>
              );
            }
          }
        });
      }
    });
  }
  
  searchErpClient = param => {
    const { dispatch } = this.props;

    dispatch({
      type: 'erpclient/fetch',
      payload: param,
    });
  }
  handleAdd=(params)=>{
    message.config({
      top: 100,
    });
    const hide = message.loading(`正在提交...`, 0);
    
   
    addErpClient(params);
    message.success("提交成功!");
    const paramss = `terms[0].value=${getSupplyId()}&terms[0].column=supplyid&terms[1].value=1&terms[1].column=issupply&pageIndex=0&pageSize=10`;
    this.searchErpClient(paramss);
    setTimeout(hide,100);
    this.setState({
      modalVisible: false,
      pageSize:10,
      pageIndex:1,
    });
  };

  handleStandardTableChange = (pagination) => {
    const { dispatch,form } = this.props;
    const { formValues } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = fieldsValue;
      if(params.loginuser === undefined){
        delete params.loginuser
      }
      if(params.company === undefined){
        delete params.company
      }
      
      const values = this.createTerms(params, pagination.current-1,pagination.pageSize);
    dispatch({
      type: 'supply/fetch',
      payload: values,
    });
    this.setState({
      pageIndex:pagination.current,
      pageSize:pagination.pageSize,
     })
    })
  };
  createTerms = (obj, pageIndex = 1, pageSize = 12) => {
    let i = 0;
    let params = `pageIndex=${pageIndex}&pageSize=${pageSize}&terms[1].value=1&terms[1].column=issupply`;
    Object.keys(obj).forEach(key => {
      params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=${key}`;
      i += 1;
    });

    return params;
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'supply/fetch',
      payload: {},
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'supply/remove',
          payload: {
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.setState({
        formValues: fieldsValue,
      });

      const values = handleDs(fieldsValue, 0, 10);

      dispatch({
        type: 'supply/fetch',
        payload: values,
      });
    });
  };
  CancelModalVisible = flag => {
    const paramss = `terms[0].value=${getSupplyId()}&terms[0].column=supplyid&terms[1].value=1&terms[1].column=issupply&pageIndex=0&pageSize=10`;
    this.searchErpClient(paramss);
    this.setState({
      modalVisible: !!flag,
      pageIndex:1,
      pageSize:10,
    });
  };
  CancelConcatModalVisible = flag => {
    this.setState({
      concatModalVisible: !!flag,
    });
  };
  detailClick = (e, b, record) => {
    const params = `terms[0].value=${record.id}&terms[0].column=id`;
    queryErpClient(params).then(res => {
      if (res && res.status === 200) {
        const contactData = res.result.data[0].contacts;
        this.setState({
          concatModalVisible: true,
          contactData,
        });
      }
    });
  };
  handleModalVisible = (flag, dataStatus, row) => {
    if (dataStatus === 'new') {
      this.setState({
        modalVisible: !!flag,
        destroy:false, 
        updateRows: {},
      });
    } else {
      this.setState({
        modalVisible: !!flag,
        destroy:false, 
        updateRows: row,
      });
    }
  };

  isEditing = record => {
    return record.key === this.state.editingKey;
  };
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="供应商公司">
              {getFieldDecorator('company')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="供应商联系人">
              {getFieldDecorator('loginuser')(<Input placeholder="请输入" />)}
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
            </span>
          </Col>
        </Row>
      </Form>
    );
  }
  

  renderForm() {
    return this.renderSimpleForm();
  }

  render() {
    const { erpclient: { data }, loading } = this.props;

    if (data && data.status) {
      if (data.status === 200 && data.result.data) {
        // 数据结构和后台不一样，是不是不应该放在这里做呢？

        data.list = data.result.data;
        data.pagination = {
          total: data.result.total,
          current: this.state.pageIndex,
          pageSize: this.state.pageSize,
          showTotal: () => {
            return `共${data.result.total}条`;
          },
          showQuickJumper: true,
        };
      } else {
        data.list = [];
        data.pagination = {};
      }
    }

    const { selectedRows, modalVisible, updateRows, options, concatModalVisible,contactData } = this.state;

    const columns = [
      {
        title: '供应商',
        dataIndex: 'name',
      },
      // {
      //   title: '供应商联系人',
      //   dataIndex: 'loginuser',
      // },

      {
        title: '等级',
        dataIndex: 'credit',
        render: val => creditList[val],
      },
      {
        title: '联系人',
        dataIndex: 'concat',
        render: (val, record, index) => {
          return (
            <Button
              onClick={e => {
                this.detailClick(e, true, record);
              }}
            >
              详情
            </Button>
          );
        },
      },
      {
        title: '业务员',
        dataIndex: 'saleids',
      },
      {
        title: '业务主管',
        dataIndex: 'directorid',
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => {
          return <a onClick={() => this.handleModalVisible(true, 'update', record)}>修改</a>;
        },
      },
    ];

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">取消申请</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      CancelModalVisible: this.CancelModalVisible,
     
    };
    const concattMethods = {
      CancelConcatModalVisible: this.CancelConcatModalVisible,
    };
    return (
      <PageHeaderLayout title="非平台供应商">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button
                icon="plus"
                type="primary"
                onClick={() => this.handleModalVisible(true, 'new')}
              >
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button>批量操作</Button>
                  <Dropdown overlay={menu}>
                    <Button>
                      更多操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>
            <StandardTable
              rowKey="id"
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>

        <CreatForm
          {...parentMethods}
          modalVisible={modalVisible}
          updateRows={updateRows}
          datafor={newtable}
          options={options}
        />
        <ConcatTables {...concattMethods} concatModalVisible={concatModalVisible} contactData={contactData}  />
      </PageHeaderLayout>
    );
  }
}
