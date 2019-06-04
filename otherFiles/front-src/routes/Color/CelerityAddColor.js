import React, { Fragment } from 'react';
import { Form, Input, InputNumber, Select, Button, Radio, message } from 'antd';
import { connect } from 'dva';

import { queryColorKind, queryColorseries, queryColorProduct } from '../../services/api';
import { getSupplyId, getLargeType, getSeries } from '../../utils/sessionStorage';

const { Option } = Select;
let initLargeType = '';
let initSeries = '';

@connect(({ loading }) => ({
    submitting: loading.effects['color/offlineColorFrom'],
}))
@Form.create()
export default class CelerityAddColor extends React.Component {
    state = {
        largetypeOption: [],
        seriesOption: []
    };

    componentDidMount() {
        const params = `terms[0].value=${getSupplyId()}&terms[0].column=supplyid`;
        queryColorKind(params).then(res => {
            if (res && res.status === 200) {
                const largetypeList = res.result.data;
                let largetypeOption = [];
                for (let i = 0, len = largetypeList.length; i < len; i++) {
                    largetypeOption.push(
                        <Option key={'L' + i} value={largetypeList[i].id}>
                            {largetypeList[i].kindname}
                        </Option>
                    )
                }
                this.setState({
                    largetypeOption
                })

                initLargeType = getLargeType();
                initSeries = getSeries();
                const paramss = `terms[0].value=${initLargeType}&terms[0].column=kindid`;
                queryColorseries(paramss).then(response => {
                    if (response && response.status === 200) {
                        const list = response.result.data;
                        let seriesOption = [];
                        for (let i = 0; i < list.length; i++) {
                            seriesOption.push(
                                <Option key={'S' + i} value={list[i].id}>
                                    {list[i].seriesname}
                                </Option>
                            );
                        }
                        this.setState({
                            seriesOption
                        })
                    }
                })
            }
        })
    }

    chagaeKind = e => {
        const params = `terms[0].value=${e}&terms[0].column=kindid`;
        queryColorseries(params).then(response => {
            if (response && response.status === 200) {
                const list = response.result.data;
                let seriesOption = [];
                for (let i = 0; i < list.length; i++) {
                    seriesOption.push(
                        <Option key={'S' + i} value={list[i].id}>
                            {list[i].seriesname}
                        </Option>
                    );
                }
                this.setState({
                    seriesOption
                })
            }
        });
    };

    handleReset = () => {
        this.props.form.resetFields();
        this.props.onCancel();
    }

    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if (err === null) {
                this.props.form.resetFields();
                this.props.onCancel(values);
                this.props.dispatch({
                    type: 'color/offlineColorFrom',
                    payload: values,
                });
            } else {
                message.error('请填写完整');
            }
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };

        return (
            <Fragment>
                <Form {...formItemLayout} onSubmit={this.handleSubmit} id='celerityColor'>
                    <Form.Item label='主类'>
                        {getFieldDecorator('largetype', {
                            rules: [{
                                required: true,
                                message: '请选择主类'
                            }],
                            initialValue: initLargeType,
                        })(
                            <Select
                                onChange={e => this.chagaeKind(e)}
                            >
                                {this.state.largetypeOption}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label='品名'>
                        {getFieldDecorator('brandname', {
                            rules: [{
                                required: true,
                                message: '品名'
                            }]
                        })(
                            <Input />
                        )}
                    </Form.Item>
                    <Form.Item label='色号'>
                        {getFieldDecorator('colorname', {
                            rules: [{
                                required: true,
                                message: '请输入色号',
                            }]
                        })(
                            <Input placeholder='请输入色号' />
                        )}
                    </Form.Item>
                    <Form.Item label='色称'>
                        {getFieldDecorator('productname', {
                            rules: [{
                                required: true,
                                message: '请输入色称'
                            }]
                        })(
                            <Input placeholder='请输入色称' />
                        )}
                    </Form.Item>
                    <Form.Item label='纱别'>
                        {getFieldDecorator('yarn', {
                            rules: [{
                                required: true,
                                message: "请输入纱别"
                            }]
                        })(
                            <Input placeholder="请输入纱别" />
                        )}
                    </Form.Item>
                    <Form.Item label='成分(系列)'>
                        {getFieldDecorator('series', {
                            rules: [{
                                required: true,
                                message: '请填写成分'
                            }],
                            initialValue: initSeries
                        })(
                            <Select>
                                {this.state.seriesOption}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label='单价￥'>
                        {getFieldDecorator('price', {
                            rules: [{
                                required: true,
                                message: '请填写单价'
                            }]
                        })(
                            <InputNumber min={0.0} style={{ width: '100%' }} />
                        )}
                    </Form.Item>
                    <Form.Item label='成纱形态'>
                        {getFieldDecorator('yarnform', {
                            rules: [{
                                required: false,
                            }],
                            initialValue: 0,
                        })(
                            <Select>
                                <Option value={0}>筒纱</Option>
                                <Option value={1}>绞纱</Option>
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label='产品展示'>
                        {getFieldDecorator('accesstype', {
                            rules: [{
                                required: false
                            }],
                            initialValue: 3,
                        })(
                            <Select>
                                <Option value={0}>本店开放</Option>
                                <Option value={1}>同行开放</Option>
                                <Option value={2}>握手用户</Option>
                                <Option value={3}>完全开放</Option>
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label='产品属性'>
                        {getFieldDecorator('productattribute', {
                            rules: [{
                                required: false
                            }],
                            initialValue: 1,
                        })(
                            <Select>
                                <Option value={1}>色纱</Option>
                                <Option value={3}>代销-色纱</Option>
                                <Option value={2}>胚纱</Option>
                                <Option value={4}>代销-胚纱</Option>
                            </Select>
                        )}
                    </Form.Item>
                </Form>
                <div style={{ textAlign: 'center' }}>
                    <Button onClick={this.handleReset} style={{ marginRight: 10 }}>取消</Button>
                    <Button type="primary" onClick={this.handleSubmit}>完成</Button>
                </div>
            </Fragment>
        )
    }
}