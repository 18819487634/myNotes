import React, { PureComponent, Fragment } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import {
  Card,
  Form,
  Button,
  message,
  DatePicker,
  Input,
  Modal,
  Icon,
  Upload,
  List,
  Checkbox,
  Alert,
} from 'antd';

import { getSupplyId, getUserToken } from '../../utils/sessionStorage';

import { getBase64, getUploadStaticUrl } from '../../utils/utils';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Colorbook.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class ColorBookCreateForm extends React.Component {
  state = {
    imageUrl: '',
    loading: false,
  };

  normFile = e => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.file;
  };
  normListFile = e => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
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
    const { modalVisible, form, handleAdd, handleModalVisible, item } = this.props;

    const okHandle = () => {
      form.validateFields((err, fields) => {
        if (err) return;
        this.setState({
          imageUrl: '',
          loading: false,
        });
        handleAdd(fields);

        form.resetFields();
      });
    };
    const nowV = moment();
    nowV.year();
    nowV.month(0);
    nowV.date(1);
    const beginDt = nowV;
    const nextV = moment();
    const year = nowV.year();
    nextV.year(year + 1);
    nextV.month(0);
    nextV.date(1);
    const endDt = nextV;
    const initDateRange = [beginDt, endDt];
    const headers = {
      Authorization: `Bearer ${getUserToken()}`,
    };
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    const imageUrl2 = this.state.imageUrl ? this.state.imageUrl : item ? item.cover : '';

    return (
      <Modal
        title="色卡实物图录入"
        visible={modalVisible}
        onOk={okHandle}
        onCancel={() => handleModalVisible()}
      >
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="主材料">
          {form.getFieldDecorator('kind', {
            initialValue: item ? item.kind : '',
            rules: [{ required: true, message: '请输入主材料' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem label="色卡有效期：">
          {form.getFieldDecorator('validdate', {
            initialValue: initDateRange,
            rules: [{ required: true, message: '请选择有效日期' }],
          })(<RangePicker placeholder={['开始日期', '结束日期']} style={{ width: '100%' }} />)}
        </FormItem>
        <FormItem label="封面">
          {form.getFieldDecorator('cover', {
            rules: [{ required: true, message: '请上传封面' }],
            valuePropName: 'file',
            initialValue: imageUrl2,
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
              {imageUrl2 ? <img src={imageUrl2} alt="avatar" /> : uploadButton}
            </Upload>
          )}
        </FormItem>
        {item ? (
          ''
        ) : (
          <FormItem label="详情图">
            {form.getFieldDecorator('detailsphoto', {
              rules: [{ required: true, message: '请上传至少一张详情图' }],
              valuePropName: 'fileList',
              getValueFromEvent: this.normListFile,
            })(
              <Upload
                name="file"
                listType="picture-card"
                headers={headers}
                action={getUploadStaticUrl()}
              >
                <Button>
                  <Icon type="upload" />上传
                </Button>
              </Upload>
            )}
          </FormItem>
        )}
      </Modal>
    );
  }
}

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CreateForm = Form.create()(ColorBookCreateForm);

@connect(({ colorbook, loading }) => ({
  colorbook,
  loading: loading.models.colorbook,
}))
@Form.create()
export default class ColorBookList extends PureComponent {
  state = {
    modalVisible: false,
    selectedCards: [],
    formValues: {},
    detaillist: null,
    viewdetail: 'none',
    viewlist: 'block',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const params = {};
    params.supplyid = getSupplyId();
    dispatch({
      type: 'colorbook/fetch',
      payload: params,
    });
  }

  onSelectDetail = id => {
   
  };
  swithViewDetail = detail => {
    this.setState({
      detaillist: detail,
      viewdetail: 'block',
      viewlist: 'none',
    });
  };
  swithViewlist = () => {
    this.setState({
      viewdetail: 'none',
      viewlist: 'block',
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'colorbook/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'colorbook/fetch',
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
          type: 'colorbook/remove',
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

  handleModalVisible = (flag, item) => {
    this.setState({
      modalVisible: !!flag,
      detaillist: item,
    });
  };

  handleAdd = fields => {
    const datearr = Array.from(fields.validdate);
    const tempdate = `${moment(datearr[0]).format('YYYY')},${moment(datearr[1]).format('YYYY')}`;

    const arr = Array.from(fields.detailsphoto);
    let tempurl = '';
    arr.forEach(v => {
      if (tempurl !== '') {
        tempurl = `${tempurl};${v.response.result}`;
      } else {
        tempurl = `${v.response.result}`;
      }
    });

    this.props.dispatch({
      type: 'colorbook/add',
      payload: {
        supplyid: getSupplyId(),
        kind: fields.kind,
        validdate: tempdate,
        cover: fields.cover.response.result,
        detailsphoto: tempurl,
      },
    });

    message.success('提交成功');
    this.setState({
      modalVisible: false,
    });
  };

  render() {
    const { modalVisible, selectedCards, detaillist, viewlist, viewdetail } = this.state;
    let detailurls = [];
    if (detaillist != null && Object.keys(detaillist).length !== 0) {
      if (detaillist.detailsphoto.indexOf(';') !== -1) {
        detailurls = detaillist.detailsphoto.split(';');
      } else {
        detailurls = [detaillist.detailsphoto];
      }
    }

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      item: detaillist,
    };

    const { colorbook, loading } = this.props;

    const { data } = colorbook;
    let templist = [];

    if (data && data.result) {
      templist = data.result;
    }
    const headers = {
      Authorization: `Bearer ${getUserToken()}`,
    };
    const spance = '\u0020'; // 空格
    return (
      <PageHeaderLayout title="色卡实物册">
        <div style={{ display: `${viewlist}` }}>
          <Alert
            message={
              <Fragment>
                已选择 <a style={{ fontWeight: 600 }}>{selectedCards.length}</a> 项&nbsp;&nbsp;
                <a onClick={() => this.handleModalVisible(true)} style={{ marginLeft: 24 }}>
                  新建
                </a>
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                  全选
                </a>
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                  删除
                </a>
              </Fragment>
            }
            type="info"
            showIcon
          />
        </div>
        <div className={styles.cardList} style={{ display: `${viewlist}` }}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 5, lg: 3, md: 2, sm: 1, xs: 1 }}
            dataSource={[...templist]}
            renderItem={item =>
              Object.keys(item).length !== 0 ? (
                <List.Item key={item.id}>
                  <Card>
                    <div>
                      <div style={{ float: 'left', fontSize: 12, margin: '5px' }}>
                        <span>{item.kind}</span>
                        <span>{spance}</span>
                        <span>
                          {moment(item.validdate.split(',')[0]).format('YYYY')}~{moment(
                            item.validdate.split(',')[1]
                          ).format('YYYY')}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '80%' }}>
                        <img alt={item.id} src={item.cover} />
                      </div>
                      <div style={{ float: 'left', fontSize: 11, margin: '10px' }}>
                        <span>
                          <Checkbox />
                          {spance}
                          <Button size="small">选择</Button>
                        </span>
                        <span>
                          {spance}
                          {spance}
                        </span>
                        <span>
                          <Button
                            onClick={this.handleModalVisible.bind(this, true, item)}
                            size="small"
                          >
                            修改
                          </Button>
                        </span>
                        <span>
                          {spance}
                          {spance}
                        </span>
                        <span>
                          <Button onClick={this.swithViewDetail.bind(this, item)} size="small">
                            详情
                          </Button>
                        </span>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              ) : (
                <List.Item />
              )
            }
          />
        </div>
        <div style={{ display: `${viewdetail}` }}>
          <div style={{ width: '100%', fontSize: 11, margin: '10px' }}>
            <span>
              <Button size="small" onClick={this.swithViewlist.bind(this)}>
                返回
              </Button>
            </span>

            <span>
              <Upload
                className="avatar-uploader"
                headers={headers}
                action={getUploadStaticUrl()}
                onChange={this.handleChange}
              >
                <Button>
                  <Icon type="upload" />上传
                </Button>
              </Upload>
            </span>
          </div>
          <div style={{ width: '100%', float: 'left', fontSize: 16, margin: '5px' }}>
            <span>{detaillist ? detaillist.kind : ''}</span>
            <span>{spance}</span>
            <span>
              {moment(detaillist ? detaillist.validdate.split(',')[0] : '').format('YYYY')}~{moment(
                detaillist ? detaillist.validdate.split(',')[1] : ''
              ).format('YYYY')}
            </span>
          </div>
          <div className={styles.cardList}>
            <List
              rowKey="id"
              loading={loading}
              grid={{ gutter: 10, lg: 10, md: 5, sm: 5, xs: 5 }}
              dataSource={[...detailurls]}
              renderItem={item =>
                item ? (
                  <List.Item>
                    <div style={{ float: 'left' }}>
                      <div style={{ width: '100%', height: '80%' }}>
                        <img alt={spance} src={item} />
                      </div>
                      <div>
                        <Button size="small">删除</Button>
                      </div>
                    </div>
                  </List.Item>
                ) : (
                  <List.Item />
                )
              }
            />
          </div>
        </div>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
      </PageHeaderLayout>
    );
  }
}
