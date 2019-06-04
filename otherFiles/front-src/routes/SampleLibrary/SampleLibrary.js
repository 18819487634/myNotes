import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Form, Card, Table, Button, Input, Tabs,} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FooterToolbar from 'components/FooterToolbar';
import styles from './SampleLibrary.less';


const FormItem = Form.Item; 
const TabPane = Tabs.TabPane;
// 连接对应的modle里面的namespace模块
@connect(({ samplelibrary, loading}) => ({
    samplelibrary,
    loading: loading.models.samplelibrary,
}))

export default class SampleLibrary extends PureComponent {
    state = {
        tableNumber:1,
    }
    
    componentWillMount(){
        // 正式请求数据
        const {dispatch} = this.props;
        dispatch({
            type:'samplelibrary/fetch',
        });
    }
    componentDidMount(){
        //  const { samplelibrary: { firstlist } } = this.props;
        console.log(this.props.samplelibrary.firstlist)
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
    const { samplelibrary: { firstlist } } = this.props;
    const dataSource = firstlist;
    const columns = [
        {
            title: '图片',
            width:'20%',
            dataIndex: 'picture',
            key: 'picture',
            render:(text,record,index)=>{
                return <img src={text} alt="" width="100"/>
            },
        },
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
            title: '品名',
            width:'10%',
            dataIndex: 'productname',
            key: 'productname',
        },
        {
            title: '成分(系列)',
            dataIndex: 'component',
            key: 'component',
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
    ];
    const columns1 = [
        {
            title: '图片',
            width:'20%',
            dataIndex: 'picture',
            key: 'picture',
            render:(text,record,index)=>{
                return <img src={text} alt="" width="100"/>
            },
        },
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
            title: '库存(kg)',
            width:'10%',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: '板毛仓最低量',
            width:'10%',
            dataIndex: 'stockmin',
            key: 'stockmin',
        },
        {
            title: '板毛仓最高量',
            width:'10%',
            dataIndex: 'stockmax',
            key: 'stockmax',
        },
        {
            title: '大货库存(kg)',
            width:'10%',
            dataIndex: 'bigstock',
            key: 'bigstock',
        },
        {
            title: '调拨大货',
            width:'10%',
            dataIndex: 'transfer',
            key: 'transfer',
            render:(text,record,index)=>{
                return <Input defaultValue={text}/>
            }
        }
    ];
    return (
    //   这个个组件 自带头
    <div>
    <PageHeaderLayout
    title="板毛仓库"
    >
        <Card bordered={false}>
            <Button type="primary" style={{marginRight:'10PX'}} onClick={this.callinClick.bind(this)}>板毛调入</Button>
            <Button type="primary" >板毛调出</Button>
            <Tabs onChange={this.callback.bind(this)} type="editable-card" style={{marginTop:'10px'}}>
                <TabPane tab="首页" key="1" closable={false}>
                    <Table
                    columns={columns}
                    dataSource={dataSource}
                    />
                </TabPane>
                <TabPane tab="板毛调入" key="2">       
                    <Table
                    columns={columns1}
                    dataSource={dataSource}
                    pagination={{position:'none'}}
                    />

                    <FooterToolbar>
                        <Button type="primary">
                            申请调拨
                        </Button>
                    </FooterToolbar>
                </TabPane>
                <TabPane tab="板毛调出" key="3">       
                    <Table
                    columns={columns1}
                    dataSource={dataSource}
                    />
                    <FooterToolbar>
                        <Button type="primary">
                            申请调拨
                        </Button>
                    </FooterToolbar>
                </TabPane>
            </Tabs>
           
        </Card>
    </PageHeaderLayout>
</div>
    );
    }
  }