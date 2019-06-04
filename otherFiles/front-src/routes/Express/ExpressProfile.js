import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { Card, Form, Button } from 'antd';

import FooterToolbar from 'components/FooterToolbar';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import TableForm from './TableForm';
import styles from './ExpressProfile.less';

let tableData = [];

// function handleDs(fieldsValue,pageIndex=0,pageSize=10) {

//   const supplyids = getSupplyId();

//    let ds =`terms[0].value=${supplyids}&terms[0].column=supplyid&pageIndex=${pageIndex}&pageSize=${pageSize}`;
//    if(fieldsValue.company&&fieldsValue.company.length>0){

//          ds += `&terms[1].value=%25${fieldsValue.company}%25&terms[1].termType=like&terms[1].column=companyinfo.company`;
//    }
//    if(fieldsValue.status&&fieldsValue.status.length>0){
//      if(fieldsValue.company.length >0){
//       ds +=`&terms[2].value=${fieldsValue.status}&terms[2].column=status`;
//      }else{
//       ds +=`&terms[1].value=${fieldsValue.status}&terms[1].column=status`;
//      }

//    }
//    return ds;

// }

@connect(({ express, loading }) => ({
  express,
  loading: loading.models.express,
}))
@Form.create()
export default class ExpressProfile extends PureComponent {
  state = {};

  componentDidMount() {
    const params = `terms[0].value=0&terms[0].column=type&pageIndex=1&pageSize=12`;
    // queryExpress(params).then(res=>{
    //   if(res && res.status === 200){
    //       tableData = res.result;
    //   }
    // })
    this.props.dispatch({
      type: 'express/fetch',
      payload: params,
    });
  }

  submitExpress = (data) => {
    const { validateFieldsAndScroll } = this.props.form;

    validateFieldsAndScroll((error, values) => {
      // console.log(values)
    });
  };

  render() {
    const { express: { data }, form } = this.props;
    const { getFieldDecorator } = form;

    if (data && data.status === 200) {
      data.list = data.result.data;
      tableData = data.list;
      data.pagination = {
        total: data.result.total,
        current: this.state.pageindex,
        pageSize: this.state.pagesize,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        showQuickJumper: true,
      };
    }
    return (
      <PageHeaderLayout title="快递设置">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Form onSubmit={this.submitExpress}>
                <Card title="快递设置" bordered={false}>
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    {getFieldDecorator('members', {
                      initialValue: tableData,
                    })(<TableForm saveData={this.submitExpress} />)}
                  </div>
                </Card>
                {/* <FooterToolbar style={{ width: this.state.width }}>
                  <Button type="primary" onClick={this.submitExpress}>
                    提交
                  </Button>
                </FooterToolbar> */}
              </Form>
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
