import React, { PureComponent } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Card, Form, message, Button, Select, Icon } from 'antd';
import FooterToolbar from 'components/FooterToolbar';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import {
  queryCompanyUser,
  companyDetail,
  queryErpClient,
  queryProductids,
  tempsaveInquiry,
  queryProductreLation,
  addofflinepurchase,
} from '../../services/api';

import { getSupplyId } from '../../utils/sessionStorage';

import styles from './OfflinePurchaseProfile.less';
import TableFastLeft from './TableFastLeft';
import { termsIn, ArrayRepeat } from '../../utils/utils';

const { Option } = Select;
let testvalue = '';

@connect(({ inquiry, loading }) => ({
  inquiry,
  loading: loading.models.inquiry,
}))
@Form.create()
export default class OfflinePurchaseProfile extends PureComponent {
  state = {
    modalVisible: false,
    showStatus: false,
    dataLeft: [],

    customers: [],
    heard: [{
      key: 'concatheard',
      entryway: '0',
      deliveryway: '0',
      deliveryno: '',
      arrangestatus: '0'
    }]
  };

  componentDidMount() {
    const supplyids = [getSupplyId()];
    const param = `paging=false&terms[0].value=${supplyids}&terms[0].column=supplyid&terms[1].value=1&terms[1].column=issupply`;
    let companys = '';
    queryErpClient(param).then(response => {
      if (response && response.status === 200) {
        const custarr = [];
        const list = response.result.data;

        for (let i = 0; i < list.length; i++) {
          custarr.push(<Option key={i} value={list[i].id}>{`${list[i].name}`}</Option>);
        }
        companyDetail({ id: getSupplyId() }).then(responses => {
          if (responses && responses.status === 200) {
            companys = responses.result.company;
            const params = `terms[0].column=username&pageIndex=0&pageSize=10&terms[0].termType=like&terms[0].value=${companys}%25`;

            queryCompanyUser(params).then(res => {
              if (res.status === 200) {
                const lists = res.result.data;
                for (let s = 0; s < lists.length; s++) {
                  if (lists[s].username !== undefined) {
                    // childarr.push(<Option key={s} value={lists[s].username}>{list[s].username}</Option>);
                  }
                }
                this.setState({
                  // children:childarr,
                  customers: custarr,
                });
              }
            });
          }
        });
      }
    });
  }

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  tempsave = (error, values) => {
    const summaryData = [];
    const detailData = [];
    let parmasData = {};

    const dataleft = values.tableLeft;

    dataleft.splice(dataleft.length - 1, 1);

    for (let e = 0; e < dataleft.length; e++) {
      if (dataleft[e].key.indexOf('concat') === -1) {
        detailData.push(dataleft[e]);
      } else {
        summaryData.push(dataleft[e]);
      }
    }
    parmasData = values.tableTop;
    parmasData.id = values.usrid;
    parmasData.inquiryDetail01Entities = detailData;

    tempsaveInquiry(parmasData).then(res => {
      if (res && res.status === 200) {
        message.success('保存成功！');
      }
    });
  };
  validate = (e) => {
    if (e.target.id === 'colorForm') {
      return;
    }
    if (e.target.id === 'celerityColor') {
      return;
    }
    const { validateFieldsAndScroll } = this.props.form;
    message.config({
      top: 100,
    });
    const hide = message.loading(`正在提交...`, 0);
    validateFieldsAndScroll((error, values) => {
      const paramsData = {};

      const detailData = [];
      const summaryData = [];
      const valuesData = values.tableLeft;
      

      for (let i = 0; i < valuesData.length; i += 1) {
        if (`${valuesData[i].key}`.indexOf('concat') === -1) {
          detailData.push(valuesData[i]);
        } else {
          summaryData.push(valuesData[i]);
        }
      }
      console.log("valuesData",valuesData,detailData);
      if (valuesData.tag === false) {
        paramsData.isbill = 1;
      } else {
        paramsData.isbill = 0;
      }
      for (let d = 0; d < detailData.length; d += 1) {
        if (detailData[d].productid === '') {
          message.error(`${detailData[d].colorname}没有这个产品!`);
          setTimeout(hide, 100);
          return;
        } else {
          paramsData.details = detailData;
        }
      }
      
      summaryData.forEach(item => {
        if (item.key === 'concatheard') {
          // 入库，送货，单号，状态
          paramsData.entryway = item.entryway;
          paramsData.deliveryway = item.deliveryway;
          paramsData.deliveryno = item.deliveryno;
          paramsData.arrangestatus = item.arrangestatus;
        }else 
        if (item.key === 'concat1') {
          // 货款
          paramsData.goodspay = item.comment;
        } else if (item.key === 'concat2') {
          // 运费
          paramsData.shippay = item.comment;
        } else if (item.key === 'concat3') {
          // 保险
          paramsData.securepay = item.comment;
        } else if (item.key === 'concat4') {
          // 税金
          paramsData.taxpay = item.comment;
        } else if (item.key === 'concat5') {
          // 备注
          paramsData.remark = item.comment;
        }
      });
      paramsData.payway = 1;
      paramsData.takeway = 1;
      paramsData.clientsupplyid = this.state.userid;
      for (let i=0, len=paramsData.details.length; i<len; i++) {
        delete paramsData.details[i].firstTime
      }
      addofflinepurchase(paramsData).then(res => {
        if (res && res.status === 200) {
          message.success('提交成功！');

          this.props.dispatch(routerRedux.push(`/order/offlinepurchaseList`));
          setTimeout(hide, 100);
        } else {
          message.error('提交失败！');
          setTimeout(hide, 100);
        }
      });
    });
  };
 
  search = () => {
    const userids = this.state.userid;
    let colorname = testvalue.toUpperCase();
    if (userids === undefined) {
      message.error('请选择供应商');
      return;
    }

    if (colorname === '' || colorname === undefined) {
      message.error('请输入所查询产品');
      return;
    }
    if(colorname.indexOf(" ") ===-1 ){
      message.error("请按照格式正确输入产品和数量,例：色称 数量",5);
      return;
    }
    const numMap = new Map();
    colorname = colorname.replace(/[\r\n]/g, ' ');
    const valueArrs = `${colorname}`.split(' ');
    const valueArr = valueArrs.filter( (s)=> {
      return s && s.trim(); // 注：IE9(不包含IE9)以下的版本没有trim()方法
  });
    const colornameArr = [];
    if (valueArr[valueArr.length - 1] === '') {
      valueArr.splice(valueArr.length - 1, 1);
    }
    for (let i = 0; i < valueArr.length; i += 1) {
      if (i % 2 === 0) {
        numMap.set(valueArr[i], valueArr[i + 1]);
        colornameArr.push(valueArr[i]);
      }
    }
    const errorName = ArrayRepeat(colornameArr);
      if(errorName !== "" ){
        message.warning(`色称：${errorName}有重复输入，请确认`,5);
        return;
      }

    if (valueArr.length > 1) {
      message.config({
        top: 100,
      });
      const hide = message.loading(`正在查询...`, 0);
      let parmas = termsIn(colornameArr, 'colorno');
      parmas += `&terms[1].column=clientsupplyid&terms[1].value=${userids}`;
      queryProductreLation(parmas).then(response => {
        const dataLeft = [];
        let goodspay = 0;
        setTimeout(hide, 100);

        if (response && response.status === 200) {
          const productids = [];
          const datas = response.result.data;
          let bool = true;
          for (let a = 0; a < colornameArr.length; a += 1) {
            for (let j = 0; j < datas.length; j += 1) {
              if (datas[j].colorno === colornameArr[a]) {
                productids.push(datas[j].productid);
                const variable = {
                  key: `offine_${j}`,
                  productid: datas[j].productid,
                  num: parseFloat(numMap.get(datas[j].colorno)),
                  offlinecolorname: datas[j].colorname,
                  offlinecolorno: datas[j].colorno,
                  clientproductid: datas[j].clientproductid,
                  deliverydate: '',
                  comment: '',
                };
                dataLeft.push(variable);
                bool = false;
              }
            }
            if (bool) {
              const variable = {
                key: colornameArr[a],
                num: numMap.get(colornameArr[a]),
                offlinecolorno: colornameArr[a],
                productid: '',
                firstTime : true
              };
              dataLeft.push(variable);
            }

            bool = true;
          }
          if (productids.length === 0) {
            productids.push(null);
          }
          queryProductids(productids).then(res => {
            if (res && res.status === 200) {
              const productData = res.result;
              let nums = 0;

              for (let z = 0; z < dataLeft.length; z += 1) {
                for (let p = 0; p < productData.length; p += 1) {
                  if (dataLeft[z].productid === productData[p].id) {
                    dataLeft[z].colorname = productData[p].colorname;
                    dataLeft[z].productname = productData[p].productname;
                    dataLeft[z].price = productData[p].price;
                    dataLeft[z].money = productData[p].price * dataLeft[z].num;

                    goodspay += dataLeft[z].money;
                  }
                }
                nums += Number(dataLeft[z].num);
              }
              dataLeft.goodspay = goodspay;
              dataLeft.tag = false;
              dataLeft.num = nums;
              dataLeft.shippay = 30;
              dataLeft.securepay = 40;
              dataLeft.sum = goodspay + dataLeft.shippay*1 + dataLeft.securepay*1;
              this.setState({ userid: userids, showStatus: true, dataLeft });
              
            }
          });
          //     if(datas.length===0){
          //       message.error("没有找到该产品，请手动录入！");
          //       console.log("colornameaarr",colornameArr);
          //       colornameArr.forEach(item=>{
          //         const variable={
          //           key:item,
          //           num:numMap.get(item),
          //           offlinecolorno:item,

          //         }
          //         dataLeft.push(variable);
          //       })
          //       dataLeft.tag=false;
          //       dataLeft.shippay =30;
          //       dataLeft.securepay =40;
          //       dataLeft.goodspay =0;
          //       dataLeft.sum = 30+40;
          //       this.setState({userid:userids,showStatus:true,dataLeft});

          //     }else{

          //     for(let j=0;j<datas.length;j+=1){
          //       productids.push(datas[j].productid);
          //       const variable = {
          //         key:`offine_${j}`,
          //         productid:datas[j].clientproductid,
          //         num:numMap.get(datas[j].colorno),

          //         offlinecolorname:datas[j].colorname,
          //         offlinecolorno:datas[j].colorno,

          //         deliverydate:'',
          //         comment:'',

          //       }

          //       dataLeft.push(variable);
          //      }
          //      queryProductids(productids).then(res=>{
          //        if(res && res.status===200){
          //          const productData = res.result;
          //          let nums = 0;
          //          productData.forEach(element => {
          //           for(let z=0;z<dataLeft.length;z+=1){
          //             dataLeft[z].colorname = element.colorname;
          //             dataLeft[z].productname = element.productname;
          //             dataLeft[z].price=element.price;
          //             dataLeft[z].money=element.price * dataLeft[z].num;
          //             nums+= Number(dataLeft[z].num);
          //             goodspay+= dataLeft[z].price;
          //           }
          //          });
          //          dataLeft.goodspay= goodspay;
          //          dataLeft.tag=false;
          //          dataLeft.num =nums;
          //          dataLeft.shippay =30;
          //          dataLeft.securepay =40;
          //          dataLeft.sum = goodspay+30+40;
          //          this.setState({userid:userids,showStatus:true,dataLeft});
          //           console.log("dataLeft",dataLeft);
          //        }
          //      })

          // }
        } else {
          this.setState({ showStatus: false });
        }
      });
    }
  };

  handlSelectChange = e => {
    this.setState({
      userid: e,
    });
  };

  handlTextChange = e => {
    testvalue = e.target.value;
  };

  CancelModalVisible = () => {
    this.setState({
      modalVisible: false,
    });
  };

  add = (e, flag) => {
    this.setState({
      modalVisible: flag,
    });
  };
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { modalVisible } = this.state;
    const parentMethods = {
      CancelModalVisible: this.CancelModalVisible,
      addxima: this.addxima,
    };
    return (
      <PageHeaderLayout title="线下调货">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div>
              <div className={styles.searchtable}>
                <div className={styles.searchToptable}>
                  <span style={{ display: 'inline-block', marginLeft: 8 }}>供应商:</span>
                  <Select
                    placeholder="请选择"
                    style={{ width: '80%', display: 'inline-block', marginLeft: 8 }}
                    showSearch
                    filterOption={(input, option) => {option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}}
                    onChange={e => this.handlSelectChange(e)}
                  >
                    {this.state.customers}
                  </Select>
                  <Icon
                    type="plus-square"
                    style={{ fontSize: 27, color: 'green' }}
                    onClick={e => this.add(e, true)}
                  />
                </div>
                <div className={styles.searchTab}>
                  <span>产品信息</span>
                </div>

                <div>
                  <div className={styles.searchTooltip}>
                    <div style={{ marginLeft: 30 }}>
                      <li>请在右侧输入</li>
                      <li>
                        <span className={styles.fontcolor}>色号 数量</span>(每行一个产品)
                      </li>
                      <li className={styles.fontcolor}>AC145 800</li>
                      <li className={styles.fontcolor}>AC148 500</li>
                      <li className={styles.fontcolor}>AC456 1200</li>
                    </div>
                  </div>
                  <textarea
                    className={styles.searchText}
                    onChange={e => this.handlTextChange(e)}
                    spellCheck="false"
                  />
                </div>
                <Button style={{ marginLeft: 250 }} onClick={this.search}>
                  查询
                </Button>
              </div>
            </div>
            <div className={this.state.showStatus ? styles.tableshow : styles.tablenone}>
              <Form onSubmit={this.validate} layout="vertical" hideRequiredMark id='offlineForm'>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  {getFieldDecorator('tableLeft', {})(
                    <TableFastLeft dataSource={this.state.dataLeft} heard={this.state.heard} />
                  )}
                  <div>
                    <FooterToolbar style={{ width: this.state.width }}>
                      <Button type="primary" onClick={e => this.validate(e, 1)} >
                        提交
                      </Button>
                    </FooterToolbar>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </Card>
        {/* <CreatForm {...parentMethods} modalVisible={modalVisible} titlename={this.state.titlename} datafor={newtable} childrens={this.state.children} /> */}
      </PageHeaderLayout>
    );
  }
}
