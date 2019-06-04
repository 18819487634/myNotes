import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Form, Card, Table, Button, Input, Tabs,} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FooterToolbar from 'components/FooterToolbar';

const FormItem = Form.Item; 
const TabPane = Tabs.TabPane;

import styles from './BigcargLibrary.less';


// 连接对应的modle里面的namespace模块
@connect(({ bigcarglibrary, loading}) => ({
    bigcarglibrary,
    loading: loading.models.bigcarglibrary,
}))

export default class BigcargLibrary extends PureComponent {
    state = {
        tableNumber:1,
    }
    
    componentWillMount(){
        // 正式请求数据
        let ps = {
            'colorname':'C014',
        };
        const {dispatch} = this.props;
        dispatch({
            type:'bigcarglibrary/fetch',
            payload:ps
        });
    }
    componentDidMount(){
        const { bigcarglibrary: { firstlist } } = this.props;
        console.log(this.props.bigcarglibrary.firstlist)
    }
    // tabs的回调函数
    callback(key) {
        console.log(key);
      };
    // 板毛调入tabs的显示
    callinClick(){
        this.setState({
            tableNumber:2,
        })
    }
  render() {
    const { bigcarglibrary: { firstlist } } = this.props;
    const dataSource = firstlist;
    const columns = [
        {
            title: '色号',
            width:'10%',
            dataIndex: 'colornumber',
            key: 'colornumber',
        },
        {
            title: '色称',
            width:'10%',
            dataIndex: 'colorname',
            key: 'colorname',
        },
        {
            title: '主类',
            width:'10%',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: '库存(kg)',
            width:'10%',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: '存放区域',
            width:'10%',
            dataIndex: 'area',
            key: 'area',
        },
        {
            title: '在途库存(kg)',
            width:'10%',
            dataIndex: 'roadarea',
            key: 'roadarea',
        },
        {
            title: '成分(系列)',
            dataIndex: 'component',
            key: 'component',
        },

    ];
    
    return (
    //   这个个组件 自带头
    <div>
    <PageHeaderLayout
    title="大货仓库"
    >
        <Card bordered={false}>
            <Table
            columns={columns}
            dataSource={dataSource}
            />
        </Card>
    </PageHeaderLayout>
</div>
    );
    }
  }