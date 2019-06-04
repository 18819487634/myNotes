import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { Form,Tabs } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './AccountNumber.less';
import AccountNumber from './AccountNumber'

const TabPane = Tabs.TabPane;



export default class AccountNumberTab extends PureComponent {


  state = {
    activeKey: "3",
  }
  onChange = (activeKey) => {
   
    this.setState({activeKey });
   
  }
  // 把里面显示出来又要根据查询的条件传回tabpane去,再优化下
  render() {
    return (
      <PageHeaderLayout title="账户设置">
        <Tabs defaultActiveKey="3" onChange={this.onChange}>
          <TabPane tab="银行卡" key="3"   > {this.state.activeKey === "3"?<AccountNumber type={3} />:<div></div>}</TabPane>
          <TabPane tab="支付宝" key="1"    > {this.state.activeKey === "1"?<AccountNumber type={1} />:<div></div>}</TabPane>
          <TabPane tab="微信" key="2"   > {this.state.activeKey ==="2"?<AccountNumber type={2} />:<div></div>}</TabPane>
        </Tabs>
      </PageHeaderLayout>
    );
  }
}
