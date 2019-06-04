import React, { PureComponent } from 'react';

import { Card, Form, Button } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './InputProfile.less';
import TableForm from './TableForm';
import TableHead from './TableHead';

const dataSource = [
  {
    key: '1',
    id: '20180726000122044',
    colorname: 'AC145',
    productname: '金桔黄',
  },
  {
    key: '2',
    id: '20180726000122044',
    colorname: 'AC148',
    productname: '姜黄',
  },
];
const dataSource1 = [
  {
    key: '3',
    id: '20180726000122044',
    goid: 'B14-2166',
  },
];

@Form.create()
export default class InputProfile extends PureComponent {
  render() {
    const { submitting, form } = this.props;
    const { validateFieldsAndScroll, getFieldDecorator } = form;

    const validate = () => {
      validateFieldsAndScroll((error, values) => {
        
      });
    };
    return (
      <PageHeaderLayout title="直接入库">
        <Card bordered={false}> 
          <div className={styles.tableList}>
            <div className={styles.tableListForm} />
            <div className={styles.tableListOperator} />
            <Form>
              {getFieldDecorator('tablehead', {
                
              })(<TableHead  dataSource={dataSource1} />)}
              {getFieldDecorator('tableform', {
                initialValue: dataSource,
              })(<TableForm />)}
            </Form>

            <div className={styles.saveBtn}>
              <Button type="primary" onClick={validate} loading={submitting}>
                保存
              </Button>
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
