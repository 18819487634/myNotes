import React,{Fragment} from 'react';
import { connect } from 'dva';
import moment from 'moment';

import {
  Form,
  Input,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  message,
  Upload,
  InputNumber,
  modal,
  Icon,
  Checkbox,
  Select,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import NanxinWebSocket from '../../utils/nanxinsocket';
import { toDecimal, getLrv, getUploadStaticUrl, getBase64 } from '../../utils/utils';
import { ButtonLab, RGBCheckBox } from '../../utils/LAButils';

import {
  getCaliColor,
  setCaliColor,
  getSupplyId,
  setKind,
  setLocation,
  setLargeType,
  setSeries,
  getLocation,
  getLargeType,
  getSeries,
  getUserToken,
} from '../../utils/sessionStorage';
import style from './ColorInputProfile.less';
import { queryColorKind, queryColorseries } from '../../services/api';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;
let nanxinws = null;
let radioValue = 0;
let initFlag = true;

let initLargeType = '';
let initSeries = '';
const labE = [];

// 将model 组件组装在一起 ，这个是请求后台数据的
@connect(({ loading }) => ({
  submitting: loading.effects['color/submitColorForm'],
}))
@Form.create()
export default class ColorOperationProfile extends React.Component {

constructor(props){
    super(props);
    this.state = {
        bgcolors: ['#f5f6f9', '#f5f6f9', '#f5f6f9'],
        readLab: 1,
        largetypeVal: '',
        failCheck: false,
        data:props.dataSource,
        imageUrl:props.dataSource.picture===undefined?'':props.dataSource.picture,
        imageUrlP:props.dataSource.goodpic===undefined?'':props.dataSource.goodpic,
        focusVal: 0,
        checkVal: '校正成功',
        avgLab: {
          avgL: 0,
          avgA: 0,
          avgB: 0,
        },
        tally: 0,
      };
}
 

  componentDidMount() {
    nanxinws = new NanxinWebSocket('ws://localhost:8088/socket');
    nanxinws.open();
    const params = `terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
    const kindData =[];
    const SeriesData = [];
    queryColorKind(params).then(res => {
      if (res && res.status === 200) {
        const list = res.result.data;
        for (let i = 0; i < list.length; i++) {
          kindData.push(
            <Option key={list[i].id} value={list[i].id}>
              {list[i].kindname}
            </Option>
          );
        }
        initLargeType = getLargeType();
        initSeries = getSeries();
        initSeries = this.judgeSeries(initSeries);
        if(this.state.data.largetype !== undefined){
            initLargeType = this.state.data.largetype;
        }
        const paramss = `terms[0].value=${initLargeType}&terms[0].column=kindid`;
        queryColorseries(paramss).then(response => {
          if (response && response.status === 200) {
            const lists = response.result.data;

            for (let j = 0; j < lists.length; j++) {
              SeriesData.push(
                <Option key={`b${j}`} value={lists[j].id}>
                  {lists[j].seriesname}
                </Option>
              );
            }
            this.setState({
              failCheck: false,
              kindData,
              SeriesData,
            });
          }
        });
      }
    });
  }

  componentWillUnmount() {
    nanxinws.close();
  }
  onChangerRedioGroup = e => {
    radioValue = e.target.value;
  };

  getvalue = a => {
    this.setState({
      focusVal: a,
    });
  };
  CalculationE = (AvgLab, Lab) => {
    return Math.sqrt(
      (AvgLab.avgL - Lab.l) * (AvgLab.avgL - Lab.l) +
      (AvgLab.avgA - Lab.a) * (AvgLab.avgA - Lab.a) +
      (AvgLab.avgB - Lab.b) * (AvgLab.avgB - Lab.b)
    ).toFixed(4);
  };
  GetAvgLab = value1 => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      const arr = values[`lab${value1}`].split(',');
      const L = parseFloat(arr[0]);
      const A = parseFloat(arr[1]);
      const B = parseFloat(arr[2]);
      const AvgLab = this.state.avgLab;

      const Lab = {
        l: L,
        a: A,
        b: B,
      };
      const E = this.CalculationE(AvgLab, Lab);
      labE[value1 - 1] = E;
      const outl = AvgLab.avgL.toFixed(2);
      const outa = AvgLab.avgA.toFixed(2);
      const outb = AvgLab.avgB.toFixed(2);

      if (this.state.tally === 1) {
        this.checkboxfuc(1);
      } else {
        let min = Math.min.apply(null, labE);
        min += '';
        if (min.length === 5) {
          min += '0';
        }
        const index = labE.indexOf(`${min}`) + 1;
        document.getElementById(
          'toplist'
        ).innerText = `经过计算，最为类似平均值${outl},${outa},${outb}的是第${index}选项`;
        radioValue = index;
        this.checkboxfuc(radioValue);
      }
    });
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        // if (radioValue === 0) {
        //   message.error('请选择一个lab值!');
        //   return;
        // }

        const labz = `lab${radioValue}`;
        const laba = values[`${labz}`];

        // if (laba === undefined) {
        //   message.error('您选择的lab值为空，请重新选择一个!');
        //   return;
        // }


        setKind(values.kind);
        setLargeType(values.largetype);
        setSeries(values.series);
        setLocation(values.location);

        const beginrange = values.dateRange[0];
        const endrange = values.dateRange[1];
        values.begindate = beginrange;
        values.enddate = endrange;
        let labs = "";
        if (laba !== undefined) {
          labs = laba.split(',');
        }

        let tag = true;
        for (const key in values) {
          if (key.indexOf('lab') !== -1 && values[key] === undefined) {
            tag = false;
          }
        }

        //  values.picture = values.picture.file.response.result;
        // values.goodpic = values.goodpic.file.response.result;
        if (values.picture.file !== undefined) {
          values.picture = values.picture.file.response.result;
        }
        if (values.goodpic.file !== undefined) {
          values.goodpic = values.goodpic.file.response.result;
        }
        if(this.state.data.id!==undefined){
          values.pageindex = this.state.data.pageindex;
          values.pagesize = this.state.data.pagesize;
        }
        if (!tag && this.state.data.l === undefined) {
          
          modal.confirm({
            title: '您还有lab值未确认，是否现在提交？',
            onOk: () => {
              values.supplyid = getSupplyId();
              values.supplierKind = '01';
              values.status = 1; // 初始状态为0
              if (labs !== "") {
                [values.l, values.a, values.b] = labs;
              }
              if (!this.props.visible) {
                this.props.dispatch({
                  type: 'color/saverOrUpdateColorForm',
                  payload: values,
                });
                if(values.id !== undefined){
                    this.props.callbackParent(true);
                }
                
              } else {
                this.props.dispatch({
                  type: 'color/offlineColorFrom',
                  payload: values,
                });
                this.props.onClose(values.colorname);
                this.handleReset();
              }
            },
            onCancel: () => {
              message.error('取消提交');
            },
          });
        } else {
          values.supplyid = getSupplyId();
          values.supplierKind = '01';
          values.status = 1; // 初始状态为0
          if (labs !== "") {
            [values.l, values.a, values.b] = labs;
          }
          if (!this.props.visible) {
            this.props.dispatch({
              type: 'color/saverOrUpdateColorForm',
              payload: values,
            });
            if(values.id !== undefined){
                this.props.callbackParent(true);
            }
          } else {
            this.props.dispatch({
              type: 'color/offlineColorFrom',
              payload: values,
            });
            this.props.onClose(values.colorname);
            this.handleReset();
          }
        }
      
      }
    });
  };

  handleReset = () => {
    this.setState({
      imageUrl: undefined,
      imageUrlP: undefined
    });
    this.props.form.resetFields();
  }

  handleCaliColorInput = () => {
    const hide = message.loading('正在校正中...', 0);
    nanxinws
      .send('{"command":"getCubeData","parameters":{"type":"cali","cubeid":"134141"}}')
      .then(e => {
        setTimeout(hide, 100);
        const mydata = JSON.parse(e.data);

        // 校正判断:l等于96，a等于0.6，b等于-1.3
        if (
          parseInt(mydata.value.l, 10) === 96 &&
          `${mydata.value.a}`.substring(0, `${mydata.value.a}`.indexOf('.') + 2) === '0.6' &&
          `${mydata.value.b}`.substring(0, `${mydata.value.b}`.indexOf('.') + 2) === '-1.3'
        ) {
          initFlag = true;
          this.setState({
            checkVal: '校正成功',

            failCheck: false,
          });
        } else {
          initFlag = false;
          this.setState({
            checkVal: '校正失败',

            failCheck: true,
          });
        }
        const vcaliLab = `${toDecimal(mydata.value.l)},${toDecimal(mydata.value.a)},${toDecimal(
          mydata.value.b
        )}`;
        setCaliColor(vcaliLab);
        this.props.form.setFieldsValue({
          // 设置组件值

          caliLab: vcaliLab,
        });
      })
      .catch(() => { });
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

  handleChangeP = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }

    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, imageUrl2 => {
        this.setState({
          imageUrlP: imageUrl2,
          loading: false,
        });
      });
    }
  };

  handleColorInput = () => {
    let value1 = this.state.readLab;
    const hide = message.loading('正在读取中...', 0);
    if (this.state.focusVal !== 0) {
      value1 = this.state.focusVal;
    }
    if (value1 === 4) {
      value1 = 1;
      this.state.readLab = 1;
    }
    if (this.state.focusVal === 0) {
      value1 = this.state.readLab;
    }

    nanxinws
      .send('{"command":"getCubeData","parameters":{"type":"conn","cubeid":"134141"}}')
      .then(e => {
        setTimeout(hide, 100);

        const mydata = JSON.parse(e.data);
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

        const lan = `lab${value1}`;
        this.state.bgcolors[value1 - 1] = vbgcolor;
        let count = this.state.tally;
        let AvgLab = this.state.avgLab;
        count += 1;
        if (count === 1) {
          AvgLab = {
            avgL: AvgLab.avgL + mydata.value.l,
            avgA: AvgLab.avgA + mydata.value.a,
            avgB: AvgLab.avgB + mydata.value.b,
          };
        } else {
          AvgLab = {
            avgL: (AvgLab.avgL + mydata.value.l) / 2,
            avgA: (AvgLab.avgA + mydata.value.a) / 2,
            avgB: (AvgLab.avgB + mydata.value.b) / 2,
          };
        }
        this.props.form.setFieldsValue({
          // 设置组件值
          [lan]: `${toDecimal(mydata.value.l)},${toDecimal(mydata.value.a)},${toDecimal(
            mydata.value.b
          )}`,

          rgb: `${theForm.RGB_R},${theForm.RGB_G},${theForm.RGB_B}`,
          hex: `${theForm.hex}`,
          lrv: getLrv(mydata.value),
        });
        this.setState({
          readLab: value1,
          avgLab: AvgLab,
          tally: count,
        });
        this.GetAvgLab(value1);
        theForm = null;
        value1 += 1;
        this.setState({
          readLab: value1,
        });
      })
      .catch(() => {
        setTimeout(hide, 100);
        message.error('读取异常');
      });
  };
  changeSeries = e => {
    const { value } = e.target;

    this.setState({
      largetypeVal: value,
    });
  };

  chagaeKind = e => {
    const params = `terms[0].value=${e}&terms[0].column=kindid`;
    queryColorseries(params).then(response => {
      if (response && response.status === 200) {
          const SeriesData  =[];
        const list = response.result.data;

        for (let i = 0; i < list.length; i++) {
          SeriesData.push(
            <Option key={'c'+i} value={list[i].id}>
              {list[i].seriesname}
            </Option>
          );
        }
        this.setState({
          failCheck: false,
          SeriesData,
        });
      }
    });
  };
  checkboxfuc = val => {
    if (val === 1) {
      this.setState({
        lab1check: true,
        lab2check: false,
        lab3check: false,
      });
    } else if (val === 2) {
      this.setState({
        lab1check: false,
        lab2check: true,
        lab3check: false,
      });
    } else if (val === 3) {
      this.setState({
        lab1check: false,
        lab2check: false,
        lab3check: true,
      });
    }
  };
  judge = t => {
    if (t === false) {
      return false;
    } else if (this.state.failCheck === true) {
      return false;
    } else {
      return true;
    }
  };
  judgeSeries = f => {
    if (f === '') {
      const series = this.state.largetypeVal;
      return series;
    }
    return f;
  };

  render() {
    const { submitting, item } = this.props;
    const { getFieldDecorator } = this.props.form;
    const {data} = this.state;
    const nowV = moment();
    const year = nowV.year();
    nowV.year(year);
    nowV.month(0);
    nowV.date(1);

    const beginDt = nowV;
    const nextV = moment();

    nextV.year(year + 2);
    nextV.month(11);
    nextV.date(31);

    const endDt = nextV;
  
    let lab = "";
    let initLocation = "";
    let initDateRange = "";
    if(Object.getOwnPropertyNames(data).length !== 0){
       // 如果为空则为新建
       if(data.l === undefined){
        lab += `原lab:空`;
       }else{
        lab += `原lab:${data.l},${data.a},${data.b}`;     
       }
       initLargeType = data.largetype;
       initSeries  =data.series;
       initLocation = data.location;
       if(data.beginDate === undefined){
        initDateRange = [beginDt, endDt];
       }else{
        initDateRange=[data.beginDate,data.enddate];
       }
      
       
    }else{
        initLocation  = getLocation();
        initDateRange = [beginDt, endDt];
    }

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 12 },
      },
    };

    const initResult = getCaliColor();
    const initCailLab = initResult.cali_lab;
    initFlag = initResult.flag;
    initFlag = this.judge(initFlag);

  

  
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 10, offset: 7 },
        sm: { span: 10, offset: 7 },
      },
    };
    const headers = {
      Authorization: `Bearer ${getUserToken()}`,
    };
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    const imageUrl2 = this.state.imageUrl ? this.state.imageUrl : item ? item.picture : '';

    const uploadButtonP = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    const imageUrl2P = this.state.imageUrlP ? this.state.imageUrlP : item ? item.picture : '';

    return (
      <Fragment>
        <Card bordered={false}>
          <Form
            onSubmit={this.handleSubmit}
            hideRequiredMark
            id="colorForm"
            style={{ marginTop: 8, float: 'left' }}
          >
            <Row gutter={{ md: 12, lg: 24, xl: 24 }}>
              <Row>
                <Col md={12} sm={24}>
                  <Button
                    type="primary"
                    className={style.whiteBtn}
                    style={{ minHeight: 32 }}
                    onClick={this.handleColorInput}
                  >
                    通过南信盒子取色
                  </Button>
                </Col>
                <Col md={12} sm={24}>
                  <FormItem {...formItemLayout} label="校正颜色">
                    {getFieldDecorator('caliLab', {
                      // rules: [
                      //   {
                      //     required: true,
                      //     message: '请校正',
                      //   },
                      // ],
                      initialValue: initCailLab,
                    })(<Input placeholder="请读取lab值" style={{ width: 125, display: 'none' }} />)}
                    <Button
                      style={{ minHeight: 32, display: 'inline-block' }}
                      onClick={this.handleCaliColorInput}
                    >
                      校正
                    </Button>

                    <div id="sucDiv" className={initFlag ? style.sucCheck : style.none}>
                      <Icon type="check" style={{ fontSize: 20, color: '#ffffff' }} />
                      {this.state.checkVal}
                    </div>
                    <div className={this.state.failCheck ? style.failcheck : style.none}>
                      <Icon type="close" style={{ fontSize: 20, color: '#ffffff' }} />
                      {this.state.checkVal}
                    </div>
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Card type="inner" title="取色结果">
                  <Col md={24} sm={36} style={{ marginLeft: '5%', width: '98%', height: '50%' }}>
                    <div style={{ width: 400 }}>
                      <span id="toplist" name="toplist" >{lab}</span>
                    </div>

                    <Col md={8}>
                      <FormItem {...formItemLayout} label="lab1">
                        {getFieldDecorator('lab1', {
                          // rules: [
                          //   {
                          //     required: true,
                          //     message: '请读取lab值',
                          //   },
                          // ],
                        })(
                          <Input
                            id="lab1"
                            disabled
                            placeholder="请读取lab值"
                            onFocus={this.getvalue.bind(this, 1)}
                            style={{ width: 150 }}
                          />
                        )}
                        <div
                          style={{
                            backgroundColor: this.state.bgcolors[0],
                            width: 30,
                            height: 20,
                            display: 'inline-block',
                          }}
                        />
                        <Checkbox
                          checked={this.state.lab1check}
                          onChange={this.checkboxfuc.bind(this, 1)}
                        >
                          选定
                        </Checkbox>
                      </FormItem>
                    </Col>
                    <Col md={8}>
                      <FormItem {...formItemLayout} label="lab2">
                        {getFieldDecorator('lab2')(
                          <Input
                            id="lab2"
                            disabled
                            placeholder="请读取lab值"
                            onFocus={this.getvalue.bind(this, 2)}
                            style={{ width: 150 }}
                          />
                        )}
                        <div
                          style={{
                            backgroundColor: this.state.bgcolors[1],
                            width: 30,
                            height: 20,
                            display: 'inline-block',
                          }}
                        />
                        <Checkbox
                          checked={this.state.lab2check}
                          onChange={this.checkboxfuc.bind(this, 2)}
                        >
                          选定
                        </Checkbox>
                      </FormItem>
                    </Col>
                    <Col md={8}>
                      <FormItem {...formItemLayout} label="lab3">
                        {getFieldDecorator('lab3')(
                          <Input
                            id="lab3"
                            disabled
                            placeholder="请读取lab值"
                            onFocus={this.getvalue.bind(this, 3)}
                            style={{ width: 150 }}
                          />
                        )}
                        <div
                          style={{
                            backgroundColor: this.state.bgcolors[2],
                            width: 30,
                            height: 20,
                            display: 'inline-block',
                          }}
                        />
                        <Checkbox
                          checked={this.state.lab3check}
                          onChange={this.checkboxfuc.bind(this, 3)}
                        >
                          选定
                        </Checkbox>
                      </FormItem>
                    </Col>

                    <FormItem style={{ width: 200, display: 'inline-block' }}>
                      {/* <Button className={(this.state.hover?style.btnhover:style.btnleave)}  style={{ minHeight: 32}}   onClick={this.handleColorInput} disabled={this.state.labbutton}>读取LAB值</Button> */}
                    </FormItem>
                  </Col>
                </Card>
              </Row>
              <Row>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="大类">
                    {getFieldDecorator('largetype', {
                      rules: [
                        {
                          required: true,
                          message: '请输入大类',
                        },
                      ],
                      initialValue: initLargeType,
                    })(
                      <Select onChange={e => this.chagaeKind(e)} >
                        {this.state.kindData}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="成分(系列)">
                    {getFieldDecorator('series', {
                      initialValue: initSeries,
                    })(<Select>{this.state.SeriesData}</Select>)}
                  </FormItem>
                </Col>

                <Col md={8} sm={12}>
                  <FormItem {...formItemLayout} label="色号">
                    {getFieldDecorator('colorname', {
                      rules: [
                        {
                          required: true,
                          message: '请输入色号',
                        },
                      ],
                      initialValue: data.colorname,
                    })(<Input placeholder="请输入色号" />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="颜色名称">
                    {getFieldDecorator('productname', {
                      rules: [
                        {
                          required: true,
                          message: '请输入色名',
                        },
                      ],
                      initialValue: data.productname,
                    })(<Input placeholder="请输入色名" />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="位置信息">
                    {getFieldDecorator('location', {
                      rules: [
                        {
                          required: true,
                          message: '请输入位置信息',
                        },
                      ],
                      initialValue: initLocation,
                    })(<Input placeholder="如2-01-12，表示第二页第一列12行" />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="纱别">
                    {getFieldDecorator('yarn', {
                     initialValue: data.yarn,
                    })(<Input placeholder="请输入纱别" />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="品名:">
                    {getFieldDecorator('brandname', {
                      rules: [{ required: true, message: '品名' }],
                      initialValue: data.brandname,
                    })(<Input style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="品牌:">
                    {getFieldDecorator('brand', {
                      rules: [{ required: true, message: '品牌' }],
                      initialValue: data.brand,
                    })(<Input style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="备注:">
                    {getFieldDecorator('remark',{initialValue: data.remark})(<Input style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
              </Row>
              {/* <Row>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="梳棉工艺:">
                    {getFieldDecorator('sulphurcottonprocess' ,{

                      initialValue: 1,
                    })(
                      <Select>
                        <Option value={0}>管梳</Option>
                        <Option value={1}>精梳</Option>
                        <Option value={2}>半精梳</Option>
                        
                      </Select>)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="纺纱工艺:">
                    {getFieldDecorator('spinningprocess' ,{

                      initialValue: 1,
                    })(
                      <Select>
                        <Option value={0}>环锭纺</Option>
                        <Option value={1}>精梳</Option>
                        <Option value={2}>半精梳</Option>
                        
                      </Select>)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="成分及含量:">
                    {getFieldDecorator('component')(
                      <Input style={{ width: '100%' }} />
                    )}
                  </FormItem>
                </Col>
              </Row> */}
              <Row>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="产品展示">
                    {getFieldDecorator('accesstype', { initialValue: data.accesstype===undefined?0:parseInt(data.accesstype,10) })(
                      <Select>
                        <Option value={0}>本店开放</Option>
                        <Option value={1}>同行开放</Option>
                        <Option value={2}>握手用户</Option>
                        <Option value={3}>完全开放</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="成纱形态">
                    {getFieldDecorator('yarnform', {
                      initialValue: data.yarnform===undefined?0:parseInt(data.yarnform,10),
                    })(
                      <Select>
                        <Option value={0}>筒纱</Option>
                        <Option value={1}>绞纱</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="产品属性">
                    {getFieldDecorator('productattribute', {
                       initialValue: data.productattribute===undefined?1:parseInt(data.productattribute,10),
                    })(
                      <Select>
                        <Option value={1}>色纱</Option>
                        <Option value={3}>代销-色纱</Option>
                        <Option value={2}>胚纱</Option>
                        <Option value={4}>代销-胚纱</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="类似潘通的色号">
                    {getFieldDecorator('pantongColor', {
                      rules: [
                        {
                          required: false,
                          message: '请输入类似潘通的色号号',
                        },
                      ],
                      initialValue: data.pantongColor,
                    })(<Input placeholder="类似潘通的色号" />)}
                  </FormItem>
                </Col>

                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="建议色差">
                    {getFieldDecorator('recommande', { initialValue: data.recommande===undefined?10:parseFloat(data.recommande) })(
                      <InputNumber min={0.0} step={0.9} style={{ width: '100%' }} />
                    )}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <div>
                    <FormItem {...formItemLayout} label="色卡有效期：">
                      {getFieldDecorator('dateRange', {
                        rules: [{ required: true, message: '请选择生效日期' }],
                        initialValue: initDateRange,
                      })(
                        <RangePicker
                          placeholder={['开始日期', '结束日期']}
                          style={{ width: '100%' }}
                        />
                      )}
                    </FormItem>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="单价:">
                    {getFieldDecorator('price', {
                      rules: [{ required: true, message: '请填写单价' }],
                      initialValue: data.price===undefined?36:parseFloat(data.price),
                    })(<InputNumber min={0.0} style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="主要用途:">
                    {getFieldDecorator('usefor', {
                      rules: [{ required: true, message: '主要用途' }],
                      initialValue: data.usefor===undefined? '服装':data.usefor,
                    })(<Input style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="定重:">
                    {getFieldDecorator('basisweight', {initialValue: data.basisweight})(<InputNumber min={0.0} style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                <Col md={8} sm={24}>
                  <FormItem {...formItemLayout} label="定重状态:">
                    {getFieldDecorator('basisweightstatus', {
                      initialValue: data.basisweightstatus===undefined? 0:parseInt(data.basisweightstatus,10),
                    })(
                      <Select>
                        <Option value={0}>否</Option>
                        <Option value={1}>是</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col md={8} sm={24} style={{ marginLeft: '6%' }}>
                  <FormItem label="色卡小图片" style={{ display: 'inline-flex' }}>
                    {getFieldDecorator('picture', {
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
                        {imageUrl2 ? <img src={imageUrl2} alt="avatar" style={{width:150,height:50}}  /> : uploadButton}
                      </Upload>
                    )}
                  </FormItem>
                </Col>
                <Col md={8} sm={24} style={{ marginLeft: '6%' }}>
                  <FormItem label="产品小图片" style={{ display: 'inline-flex' }}>
                    {getFieldDecorator('goodpic', {
                      valuePropName: 'file',
                      initialValue: imageUrl2P,
                      getValueFromEvent: this.normFile,
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
                        {imageUrl2P ? <img src={imageUrl2P} alt="avatar" style={{width:150,height:150}} /> : uploadButtonP}
                      </Upload>
                    )}
                  </FormItem>
                </Col>
                <Col md={8} />
              </Row>
              <Col md={8} sm={24}>
                <FormItem {...formItemLayout} label="RGB" style={{ display: 'none' }}>
                  {getFieldDecorator('rgb', {
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: '请输入RGB',
                    //   },
                    // ],
                  })(<Input placeholder="rgb" />)}
                </FormItem>
              </Col>

              <Col md={8} sm={24}>
                <FormItem {...formItemLayout} label="lrv" style={{ display: 'none' }}>
                  {getFieldDecorator('lrv', {
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: '请输入lrv',
                    //   },
                    // ],
                  })(<Input placeholder="lrv" />)}
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem {...formItemLayout} label="hex" style={{ display: 'none' }}>
                  {getFieldDecorator('hex', {
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: '请输入hex',
                    //   },
                    // ],
                  })(<Input placeholder="hex" />)}
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem {...formItemLayout} label="id" style={{ display: 'none' }}>
                  {getFieldDecorator('id', {
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: '请输入hex',
                    //   },
                    // ],
                    initialValue:data.id,
                  })(<Input placeholder="id" />)}
                </FormItem>
              </Col>
              <Col md={24} sm={24}>
                <FormItem {...submitFormLayout} style={{ marginTop: 32, marginLeft: '30%' }}>
                  <Button style={{ display: this.props.visible ? 'inline-block' : 'none', marginRight: 10 }} onClick={() => {this.handleReset();this.props.onClose()}}>取消</Button>
                  <Button type="primary" htmlType="submit" loading={submitting} >
                    提交
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Card>
      </Fragment>
    );
  }
}
