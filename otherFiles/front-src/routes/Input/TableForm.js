import React, { PureComponent, Fragment } from 'react';
import { Table, InputNumber, Input, Form, Button, Modal } from 'antd';

import TableXiMa from './TableXiMa';

import TableXiMaLine from './TableXiMaLine';

const CreatForm = Form.create()(props => {
  const { modalVisible, CancelModalVisible, titlename, datafor, form } = props;
  const { getFieldDecorator, validateFieldsAndScroll } = form;
  let index = 0;

  const submitArr = [];
  const okHandle = () => {
    validateFieldsAndScroll((error, values) => {
     
      const arr = values.table.map(item => ({ ...item }));
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id !== '' && arr[i].id1 !== '') {
          submitArr[index] = {
            id: arr[i].id,
            gross: arr[i].gross,
            suttle: arr[i].suttle,
            onlynum: arr[i].onlynum,
          };
          index += 1;
          submitArr[index] = {
            id: arr[i].id1,
            gross: arr[i].gross1,
            suttle: arr[i].suttle1,
            onlynum: arr[i].onlynum1,
          };
          index += 1;
        } else if (arr[i].id !== '') {
          submitArr[index] = {
            id: arr[i].id,
            gross: arr[i].gross,
            suttle: arr[i].suttle,
            onlynum: arr[i].onlynum,
          };
          index += 1;
        } else if (arr[i].id1 !== '') {
          submitArr[index] = {
            id: arr[i].id1,
            gross: arr[i].gross1,
            suttle: arr[i].suttle1,
            onlynum: arr[i].onlynum1,
          };
          index += 1;
        } else {
          break;
        }
      }
      
    }); 
  };
  return (
    <Modal
      title={titlename}
      width="90%"
      visible={modalVisible}
      onOk={okHandle}
      maskClosable={false}
      onCancel={() => CancelModalVisible()}
    >
      <Form>
        <div style={{ width: '100%', height: 500, overflow: 'auto' }}>
          <div style={{ width: '100%' }}>
            {/* <div style={{  width:'50%',display:"inline-block"}}>
              {getFieldDecorator('tableLeft', {
                 initialValue:leftTab,
               },)(<TableXiMa />)}  
            
            </div>
            <div style={{width:'50%',display:"inline-block"}}>
              {getFieldDecorator('tableRight', {
                 initialValue:rightTab,
              },)(<TableXiMa />)}  
            </div>  */}
            {getFieldDecorator('table', {
              initialValue: datafor,
            })(<TableXiMaLine />)}
          </div>
        </div>
      </Form>
    </Modal>
  );
});

export default class TableForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.value,
      loading: false,
      modalVisible: false,
      titlename: '',
    };
  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        data: nextProps.value,
      });
    }
  }

  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
  index = 0;
  cacheOriginData = {};
  toggleEditable = (e, key) => {
    e.preventDefault();
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      // 进入t) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: newData });
    }
  };
  showxima = (e, flag, record) => {
    this.setState({
      modalVisible: flag,
      titlename: `${record.productname}-${record.colorname}`,
    });
  };

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }
  handleFieldChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData });
    }
    this.props.onChange(newData);
  }
  handleFieldNumChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));

    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e;
      this.setState({ data: newData });
    }
    // this.props.onChange({newData:{...newData}});
    this.props.onChange(newData);
  }

  CancelModalVisible = () => {
    this.setState({
      modalVisible: false,
    });
  };

  render() {
    const datafor = [];
    for (let i = 0; i < 10; i++) {
      datafor.push({
        key: `for${i}`,
        id: '',
        gross: '',
        suttle: '',
        onlynum: '',
        acer: '',
      });
    }

    const parentMethods = {
      CancelModalVisible: this.CancelModalVisible,
      addxima: this.addxima,
    };
    const columns = [
      {
        title: '色号',
        dataIndex: 'colorname',
        key: 'colorname',
        width: '5%',
      },
      {
        title: '色称',
        dataIndex: 'productname',
        width: '10%',
        key: 'productname',
      },
      {
        title: '缸号',
        dataIndex: 'batchno',
        key: 'batchno',
        width: '10%',
        render: (text, record) => {
          return (
            <Input value={text} onChange={e => this.handleFieldChange(e, 'batchno', record.key)} />
          );
        },
      },
      {
        title: '入库数量(KG)',
        dataIndex: 'num',
        key: 'num',
        width: '5%',
        render: (text, record) => {
          return (
            <InputNumber
              value={text}
              min={0}
              onChange={e => this.handleFieldNumChange(e, 'num', record.key)}
            />
          );
        },
      },
      {
        title: '整件个数',
        dataIndex: 'piece',
        key: 'piece',
        width: '5%',
        render: (text, record) => {
          return (
            <InputNumber
              value={text}
              min={0}
              onChange={e => this.handleFieldNumChange(e, 'piece', record.key)}
            />
          );
        },
      },
      {
        title: '每件/个',
        dataIndex: 'piececount',
        key: 'piececount',
        width: '5%',
        render: (text, record) => {
          return (
            <InputNumber
              value={text}
              min={0}
              onChange={e => this.handleFieldNumChange(e, 'piececount', record.key)}
            />
          );
        },
      },
      {
        title: '平均每件重(KG)',
        dataIndex: 'weight',
        key: 'weight',
        width: '5%',
        render: (text, record) => {
          return (
            <InputNumber
              value={text}
              min={0}
              onChange={e => this.handleFieldNumChange(e, 'weight', record.key)}
            />
          );
        },
      },
      {
        title: '零散个数',
        dataIndex: 'scattered',
        key: 'scattered',
        width: '5%',
        render: (text, record) => {
          return (
            <InputNumber
              value={text}
              min={0}
              onChange={e => this.handleFieldNumChange(e, 'scattered', record.key)}
            />
          );
        },
      },
      {
        title: '存放区域',
        dataIndex: 'acer',
        key: 'acer',
        width: '10%',
        render: (text, record) => {
          return (
            <Input value={text} onChange={e => this.handleFieldChange(e, 'acer', record.key)} />
          );
        },
      },
      {
        title: '细码',
        dataIndex: 'xima',
        key: 'xima',
        width: '10%',
        render: (text, record) => {
          return <Button onClick={e => this.showxima(e, true, record)}>细码</Button>;
        },
      },
    ];
    const { modalVisible } = this.state;

    return (
      <Fragment>
        <Table
          loading={this.state.loading}
          columns={columns}
          dataSource={this.state.data}
          pagination={false}
          scroll={{ x: '130%', y: 0 }}
        />
        <CreatForm
          {...parentMethods}
          modalVisible={modalVisible}
          titlename={this.state.titlename}
          datafor={datafor}
        />
      </Fragment>
    );
  }
}
