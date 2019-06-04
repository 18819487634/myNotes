import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Badge } from 'antd';

import FooterToolbar from 'components/FooterToolbar';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getSupplyId } from '../../utils/sessionStorage';
import { companyDetail, queryCompanyUser } from '../../services/api';

import TableForm from './TableForm';
import styles from './InsuranceProfile.less';

const FormItem = Form.Item;
const { Option } = Select;

const tableData = [
  {
    key: 'a1',
    name: '中国平安',
    network: '东莞大朗保险一条街001',
    networkphone: '0769-12345678',
    liable: '马主管',
    liablephone: '13789564213',
    collector: '纪凌尘',
    collectorphone: '134348546982',
  },
  {
    key: 'b1',
    name: '太平洋保险',
    network: '东莞大朗保险一条街002',
    networkphone: '0769-123422278',
    liable: '蔡主管',
    liablephone: '1789345642214',
    collector: '佐佐木希',
    collectorphone: '156789456321',
  },
  {
    key: 'c3',
    name: '新华保险',
    network: '东莞大朗保险一条街003',
    networkphone: '0769-14563789',
    liable: '水主管',
    liablephone: '13275468216',
    collector: 'Ottovordemgentschenfelde',
    collectorphone: '18975964523',
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

@connect(({ supply, loading }) => ({
  supply,
  loading: loading.models.supply,
}))
@Form.create()
export default class LogisticsProfile extends PureComponent {
  state = {
    modalVisible: false,

    selectedRows: [],
    formValues: {},
    updateRows: {},
  };

  componentDidMount() {}

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <PageHeaderLayout title="保险设置">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Form>
                <Card title="保险设置" bordered={false}>
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    {getFieldDecorator('members', {
                      initialValue: tableData,
                    })(<TableForm />)}
                  </div>
                </Card>
                <FooterToolbar style={{ width: this.state.width }}>
                  <Button type="primary" onClick={this.submitExpress}>
                    提交
                  </Button>
                </FooterToolbar>
              </Form>
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
