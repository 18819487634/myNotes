import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { DatePicker, Input, Select, Button, Form, Row, Col, Icon, Table, message } from 'antd';
import moment from 'moment';
import { takeWayEnum, payWayEnum, everyLastPayEnum } from '../../utils/utils';

const Option = Select.Option;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
const Item = Form.Item;

@connect(({ statements, loading }) => ({
    statements,
    loading: loading.models.statements
}))
@Form.create()
export default class BusinessStatistics extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            tableList: [
                { key: 'sellDay', value: '销售日期' },
                { key: 'saleid', value: '销售单号' },
                { key: 'clientname', value: '客户名称' },
                { key: 'usrid', value: '业务员' },
                { key: 'pickuser', value: '拣货员' },
                { key: 'comment', value: '备注' },
                { key: 'payment', value: '结算方式' },
                { key: 'payway', value: '收款方式' },
                { key: 'area', value: '仓库' },
                // { key: 'cargoStatus', value: '出库状态' },
                { key: 'takeway', value: '取货方式' }
            ],
            expand: false,
            paywayList: [{ key: '全部', value: 'all' }, ...payWayEnum],
            takewayList: [{ key: '全部', value: 'all' }, ...takeWayEnum],
            searchTime: true,
        }
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'statements/querybusinessList',
            payload: { begindate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 30).getTime() }
        });
        dispatch({
            type: 'statements/querywarehouse',
            payload: { key: '全部', value: 'all' }
        });
    }

    getFields = (list) => {
        const count = this.state.expand ? 10 : 6;
        const { getFieldDecorator } = this.props.form;
        const children = [];
        let defValue = null;
        let rulesVal = null;

        for (let i = 0, len = list.length; i < len; i++) {
            if (this.state.tableList[i].key === 'payment' || this.state.tableList[i].key === 'area' || this.state.tableList[i].key === 'cargoStatus' || this.state.tableList[i].key === 'takeway') {
                defValue = 'all';
                rulesVal = null;
            } else if (this.state.tableList[i].key === 'payway') {
                defValue = 'all';
                rulesVal = null;
            } else if (this.state.tableList[i].key === 'sellDay') {
                defValue = [moment(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 2), dateFormat), moment(new Date(), dateFormat)];
                rulesVal = [{
                    required: true,
                    message: '请选择日期'
                }];
            } else {
                defValue = '';
                rulesVal = null;
            }
            children.push(
                <Col span={4} key={i} style={{ display: i < count ? 'block' : 'none' }}>
                    <Item label={this.state.tableList[i].value} style={{ marginBottom: 0 }}>
                        {getFieldDecorator(this.state.tableList[i].key, {
                            rules: rulesVal,
                            initialValue: defValue
                        })(list[i])}
                    </Item>
                </Col>
            );
        }

        return children;
    }

    toggle = () => {
        const { expand } = this.state;
        this.setState({ expand: !expand });
    }

    handleSearch = (e) => {
        e.preventDefault();
        const { dispatch } = this.props;
        this.props.form.validateFields((err, values) => {
            if (values.sellDay[0] === undefined) {
                message.error('请选择日期');
                return;
            } else {
                let obj = {};
                for (let i in values) {
                    if (values[i] !== '') {
                        switch (i) {
                            case 'sellDay':
                                obj['begindate'] = new Date(values[i][0]._d).getTime();
                                obj['enddate'] = new Date(values[i][1]._d).getTime();
                                break;
                            case 'payment':
                                if (values[i] !== 'all') {
                                    obj[i] = values[i] * 1;
                                } else {
                                    delete obj[i]
                                }
                                break;
                            case 'payway':
                                if (values[i] !== 'all') {
                                    obj[i] = values[i] * 1;
                                } else {
                                    delete obj[i]
                                }
                                break;
                            case 'area':
                                if (values[i] !== 'all') {
                                    obj[i] = values[i] * 1;
                                } else {
                                    delete obj[i]
                                }
                                break;
                            case 'takeway':
                                if (values[i] !== 'all') {
                                    obj[i] = values[i] * 1;
                                } else {
                                    delete obj[i]
                                }
                                break;
                            default:
                                if (values[i] !== '') {
                                    obj[i] = values[i];
                                }
                        }
                    }
                }
                if (this.state.searchTime) {
                    dispatch({
                        type: 'statements/querybusinessList',
                        payload: obj
                    });
                    message.success('搜索完成');
                } else {
                    message.error('选择时间范围是一个月，请重新选择时间');
                    return;
                }
            }
        });
    }

    handleReset = () => {
        this.props.form.resetFields();
    }

    handleData = (time) => {
        // 24 * 60 * 60 * 1000 * 30
        let oneMonth = 24 * 60 * 60 * 1000 * 31;
        let firstTime = new Date(time[0]._d).getTime();
        let lastTime = new Date(time[1]._d).getTime();
        if (lastTime - firstTime > oneMonth) {
            this.setState({
                searchTime: false
            })
        } else {
            this.setState({
                searchTime: true
            })
        }
    }

    render() {
        const { statements } = this.props;
        const { businessList, cangkus } = statements;

        const searchItem = [
            <RangePicker onChange={this.handleData} />,
            <Input />,
            <Input />,
            <Input placeholder={'公司:人名'} />,
            <Input placeholder={'公司:人名'} />,
            <Input />,
            <Select>
                <Option value='all'>全部</Option>
                <Option value='0'>全款</Option>
                <Option value='1'>月结</Option>
                <Option value='2'>预收</Option>
            </Select>,
            <Select>
                {this.state.paywayList.map((item, idx) => {
                    return (<Option key={item.key + idx} value={item.value}>{item.key}</Option>)
                })}
            </Select>,
            <Select>
                {cangkus.map((item, idx) => {
                    return (<Option key={item.key + idx} value={item.value}>{item.key}</Option>)
                })}
            </Select>,
            // <Select>
            //     <Option value='0'>全部</Option>
            //     <Option value='1'>未出</Option>
            //     <Option value='2'>部分</Option>
            //     <Option value='3'>全出</Option>
            // </Select>,
            <Select>
                {this.state.takewayList.map((item, idx) => {
                    return (<Option key={item.key + idx} value={item.value}>{item.key}</Option>)
                })}
            </Select>
        ]

        const colSource = [
            {
                title: '销售日期',
                align: 'center',
                dataIndex: 'makedate',
                key: 'makedate'
            },
            {
                title: '销售单号',
                align: 'center',
                dataIndex: 'saleid',
                key: 'saleid'
            },
            {
                title: '结算方式',
                align: 'center',
                dataIndex: 'clearingForm',
                key: 'clearingForm',
                render: (val, record, index) => {
                    return everyLastPayEnum.map(item => {
                        if (val === item.value) {
                            return <p style={{ textAlign: 'left', margin: 0 }}>{item.key}</p>;
                        }
                    })
                }
            },
            {
                title: '客户名称',
                align: 'center',
                dataIndex: 'clientname',
                key: 'clientname',
                render: (val, record, index) => {
                    return <p style={{ textAlign: 'left', margin: 0 }}>{val}</p>
                }
            },
            {
                title: '收款方式',
                align: 'center',
                dataIndex: 'payway',
                key: 'payway',
                render: (val, record, index) => {
                    return payWayEnum.map(item => {
                        if (val === item.value) {
                            return <p style={{ textAlign: 'left', margin: 0 }}>{item.key}</p>
                        }
                    })
                }
            },
            {
                title: '应收金额',
                align: 'center',
                dataIndex: 'receivable',
                key: 'receivable'
            },
            {
                title: '已收金额',
                align: 'center',
                dataIndex: 'received',
                key: 'received'
            },
            {
                title: '仓库',
                align: 'center',
                dataIndex: 'area',
                key: 'area',
                render: (val, record, index) => {
                    return cangkus.map((item, idx) => {
                        if (item.value === val + '') {
                            return <p style={{ textAlign: 'left', margin: 0 }}>{item.key}</p>;
                        }
                    })
                }
            },
            {
                title: '备注',
                align: 'center',
                dataIndex: 'remark',
                key: 'remark',
                render: (val, record, index) => {
                    return <p style={{ textAlign: 'left', margin: 0 }}>{val}</p>
                }
            },
            // {
            //     title: '出库状态',
            //     align: 'center',
            //     dataIndex: 'cargoStatus',
            //     key: 'cargoStatus'
            // },
            {
                title: '业务员',
                align: 'center',
                dataIndex: 'usrid',
                key: 'usrid',
                render: (val, record, index) => {
                    return <p style={{ textAlign: 'left', margin: 0 }}>{val}</p>
                }
            },
            {
                title: '拣货员',
                align: 'center',
                dataIndex: 'pickuser',
                key: 'pickuser',
                render: (val, record, index) => {
                    return <p style={{ textAlign: 'left', margin: 0 }}>{val}</p>
                }
            },
            {
                title: '取货方式',
                align: 'center',
                dataIndex: 'claimGoods',
                key: 'claimGoods',
                render: (val, record, index) => {
                    return takeWayEnum.map(item => {
                        if (val === item.value) {
                            return <p style={{ textAlign: 'left', margin: 0 }}>{item.key}</p>;
                        }
                    })
                }
            },
            {
                title: '开票',
                align: 'center',
                dataIndex: 'invoice',
                key: 'invoice',
                render: (val, record, index) => {
                    if (val === '1') {
                        return (<Icon type="check" />)
                    }
                }
            },
        ];
        return (
            <Fragment>
                <PageHeaderLayout title='业务统计表'>
                    <Form
                        onSubmit={this.handleSearch}
                        style={{ marginBottom: 15 }}
                    >
                        <Row gutter={24}>{this.getFields(searchItem)}</Row>
                        <Row>
                            <Col span={24} style={{ textAlign: 'left', marginTop: 18 }}>
                                <Button type='primary' htmlType='submit'>搜索</Button>
                                <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>清空</Button>
                                <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                    更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                                </a>
                            </Col>
                        </Row>
                    </Form>
                    <Table dataSource={businessList} columns={colSource} pagination={false} />
                </PageHeaderLayout>
            </Fragment>
        )
    }
}