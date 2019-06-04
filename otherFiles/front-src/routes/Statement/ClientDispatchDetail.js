import React, { PureComponent, Fragment } from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { connect } from 'dva';

import { DatePicker, Input, Select, Button, Form, Row, Col, Icon, Table, message, Tooltip } from 'antd';
import moment from 'moment';

const Option = Select.Option;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
const Item = Form.Item;

@connect(({ statements, loading }) => ({
    statements,
    loading: loading.models.statements
}))
@Form.create()
export default class ClientDispatchDetail extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            expand: false,
            tableList: [
                { key: 'sellDay', value: '销售日期' },
                { key: 'saleid', value: '销售单号' },
                { key: 'clientname', value: '客户名称' },
                { key: 'brandname', value: '货品名称' },
                { key: 'color', value: '颜色' },
                { key: 'location', value: '区域' },
                { key: 'batchno', value: '缸号' },
                { key: 'area', value: '仓库' },
                { key: 'usrid', value: '业务员' },
                { key: 'pickuser', value: '拣货员' },
                { key: 'comment', value: '备注' },
            ],
            searchTime: true,
        }
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'statements/queryclientDispatch',
            payload: { begindate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 30).getTime() }
        });
        dispatch({
            type: 'statements/querywarehouse',
            payload: { key: '全部', value: '0' }
        });
    }

    getFields = (list) => {
        const count = this.state.expand ? 11 : 6;
        const { getFieldDecorator } = this.props.form;
        const children = [];
        let defValue = null;
        let rulesVal = null;

        for (let i = 0, len = list.length; i < len; i++) {
            if (this.state.tableList[i].key === 'area') {
                defValue = '0';
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
                            case 'area':
                                if (values[i] !== '0') {
                                    obj['area'] = values[i] * 1;
                                } else {
                                    delete obj['area'];
                                }
                                break;
                            case 'color':
                                if (values[i].split('#').length === 2) {
                                    let arr = values[i].split('#');
                                    obj['colorname'] = arr[0];
                                    obj['productname'] = arr[1];
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
                        type: 'statements/queryclientDispatch',
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
        const { cangkus } = this.props.statements;
        const searchItem = [
            <RangePicker onChange={this.handleData} />,
            <Input />,
            <Input />,
            <Input />,
            <Input placeholder='色号#色称' />,
            <Input />,
            <Input />,
            <Select>
                {cangkus.map((item, idx) => {
                    return (<Option key={item.value + idx} value={item.value}>{item.key}</Option>)
                })}
            </Select>,
            <Input />,
            <Input />,
            <Input />,
        ];

        const colSource = [
            {
                title: '销售日期',
                align: 'center',
                dataIndex: 'makedate',
                key: 'makedate',
            },
            {
                title: '销售单号',
                align: 'center',
                dataIndex: 'saleid',
                key: 'saleid',
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
                title: '货品名称',
                align: 'center',
                dataIndex: 'brandname',
                key: 'brandname',
                render: (val, record, index) => {
                    return <p style={{ textAlign: 'left', margin: 0 }}>{val}</p>
                }
            },
            {
                title: '颜色',
                align: 'center',
                dataIndex: 'color',
                key: 'color',
                render: (val, record, index) => {
                    return <p style={{ textAlign: 'left', margin: 0 }}>{val}</p>
                }
            },
            {
                title: '区域',
                align: 'center',
                dataIndex: 'location',
                key: 'location',
            },
            {
                title: '缸号',
                align: 'center',
                dataIndex: 'batchno',
                key: 'batchno',
            },
            {
                title: '单位',
                align: 'center',
                dataIndex: 'unit',
                key: 'unit',
            },
            {
                title: '数量',
                align: 'center',
                dataIndex: 'outnum',
                key: 'outnum',
            },
            {
                title: '单价',
                align: 'center',
                dataIndex: 'price',
                key: 'price',
                render: (val, record, index) => {
                    return <p style={{ textAlign: 'right', margin: 0 }}>{val}</p>
                }
            },
            {
                title: '金额',
                align: 'center',
                dataIndex: 'money',
                key: 'money',
                render: (val, record, index) => {
                    return <p style={{ textAlign: 'right', margin: 0 }}>{val}</p>
                }
            },
            {
                title: '件数',
                align: 'center',
                dataIndex: 'totalpiecenum',
                key: 'totalpiecenum',
                render: (val, record, index) => {
                    return <p style={{ textAlign: 'right', margin: 0 }}>{val}</p>
                }
            },
            {
                title: '只数',
                align: 'center',
                dataIndex: 'totalnum',
                key: 'totalnum',
                render: (val, record, index) => {
                    return <p style={{ textAlign: 'right', margin: 0 }}>{val}</p>
                }
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
                title: '备注',
                align: 'center',
                dataIndex: 'comment',
                key: 'comment',
                render: (val, record, index) => {
                    return (
                        <Tooltip placement="left" title={val} trigger="hover">
                            <p style={{
                                textAlign: 'left',
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                width: '35px',
                                cursor: 'pointer'
                            }}>{val}</p>
                        </Tooltip>
                    )
                }
            },
            {
                title: '出库',
                align: 'center',
                dataIndex: 'departStatus',
                key: 'departStatus',
                filters: [{
                    text: '出完',
                    value: '0'
                }, {
                    text: '部分',
                    value: '1'
                }, {
                    text: '未出',
                    value: '2'
                }],
                onFilter: (value, record) => {
                    return record.departStatus === value;
                },
                render: (val, record, index) => {
                    switch (val) {
                        case '0':
                            return '出完';
                            break;
                        case '1':
                            return '部分';
                            break;
                        case '2':
                            return '未出';
                            break;
                        default:
                            return '未出';
                            break;
                    }
                }
            },
        ]
        const { clientList } = this.props.statements;
        return (
            <Fragment>
                <PageHeaderLayout title='客户出货明细表'>
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
                    <Table
                        dataSource={clientList}
                        columns={colSource}
                        pagination={false}
                    />
                </PageHeaderLayout>
            </Fragment>
        )
    }
}