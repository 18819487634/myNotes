import React from 'react';
import { connect } from 'dva';

import {
  Form,
  Card,

} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';



import style from './ColorInputProfile.less';

import ColorOperationProfile from './ColorOperationProfile';

// 将model 组件组装在一起 ，这个是请求后台数据的
@connect(({ loading }) => ({
  submitting: loading.effects['color/submitColorForm'],
}))
@Form.create()
export default class ColorInput extends React.Component {


  componentDidMount() {}





  render() {

    return (
      <PageHeaderLayout title="产品录入" content="毛行:不同的供货商可以录入自己的产品信息">
        <Card bordered={false}>
          <ColorOperationProfile dataSource={{}}  />
        </Card>
      </PageHeaderLayout>
    );
  }
}
