import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { queryproductSalesList } from '../../services/api';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { Select, Input, DatePicker, Button, Table, message, Icon, Dropdown, Menu, Badge } from 'antd';
import moment from 'moment';

const Option = Select.Option;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';

@connect(({ statements, loading }) => ({
    statements,
    loading: loading.models.statements
}))
export default class ProductSalesList extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            dataSearch: [
                {
                    key: '0',
                    area: '0',
                    brandname: '',
                    sellDate: [
                        new Date().getTime() - 24 * 60 * 60 * 1000 * 2,
                        new Date().getTime()
                    ],
                    colorname: '',
                    productname: '',
                    saleids: '全部',
                    search: '0'
                }
            ],
            searchTime: true,
            colProductList: [
                {
                    title: '货品名称',
                    align: 'center',
                    dataIndex: 'sbrandname',
                    key: 'sbrandname'
                },
                {
                    title: '销售总重量(Kg)',
                    align: 'center',
                    dataIndex: 'totalWeight',
                    key: 'totalWeight'
                },
            ],
        }
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'statements/querywarehouse',
            payload: { key: '全部', value: '0' }
        });
        dispatch({
            type: 'statements/queryproductSales',
            payload: { begindate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 30).getTime() }
        });
        dispatch({
            type: 'statements/querysaleidslist',
        });
    }

    handleChangeData = (newVal, dataList, sign) => {
        let value = null;
        if (sign === 'sellDate') {
            value = [];
            let oneMonth = 24 * 60 * 60 * 1000 * 31;
            let firstTime = new Date(newVal[0]._d).getTime();
            let lastTime = new Date(newVal[1]._d).getTime();
            if (lastTime - firstTime > oneMonth) {
                this.setState({
                    searchTime: false
                })
                return;
            } else {
                this.setState({
                    searchTime: true
                });
                for (let i = 0, len = newVal.length; i < len; i++) {
                    value.push(new Date(newVal[i]._d).getTime())
                }
            }
        } else {
            value = typeof newVal === 'string' ? newVal : newVal.target.value;
        }
        dataList[sign] = value;
        this.setState({ dataSearch: [dataList] })
    }

    searchDatas = () => {
        const searchData = this.state.dataSearch;
        const { dispatch } = this.props;
        if (searchData[0].sellDate[0] !== undefined) {
            let data = searchData[0];
            delete data.key;
            delete data.search;
            let obj = {};
            for (let key in data) {
                if (data[key] !== '') {
                    if (key === 'sellDate') {
                        obj["begindate"] = data[key][0];
                        obj["enddate"] = data[key][1];
                    } else if (key === 'area' && data[key] === '0') {
                        delete data[key];
                    } else if (key === 'saleids' && data[key] === '全部') {
                        delete data[key];
                    } else {
                        obj[key] = data[key];
                    }
                }
            }
            if (this.state.searchTime) {
                console.log(obj)
                dispatch({
                    type: 'statements/queryproductSales',
                    payload: obj,
                });
                message.success('搜索完成');
            } else {
                message.error('选择时间范围是一个月，请重新选择时间');
                return;
            }
        } else {
            message.error("请选择日期");
            return;
        }
    }

    printfTablelist = (list, colList) => {
        const dataSource = [];
        for (let i = 0, len = list.length; i < len; i++) {
            const child = list[i].children;
            let obj = {
                key: `${i}`,
                sbrandname: `${list[i].title}`,
            };
            let sum = 0;
            for (let i = 0, len3 = colList.length; i < len3; i++) {
                obj[`area${colList[i].value}`] = 0;
                for (let j = 0, len2 = child.length; j < len2; j++) {
                    if (child[j].area + '' === colList[i].value) {
                        obj[`area${colList[i].value}`] += child[j].actweight;
                    }
                    sum += child[j].actweight;
                }
                obj[`area${colList[i].value}`] = obj[`area${colList[i].value}`].toFixed(2);
            }
            obj.child = child;
            obj.totalWeight = sum.toFixed(2);
            dataSource.push(obj);
        }
        return dataSource;
    }

    expandedRowRender = (record) => {
        const { child } = record;
        const { productList } = this.props.statements;
        const { arealist } = productList;
        const datas = [];
        const colList = [{
            title: '颜色',
            align: 'center',
            dataIndex: 'color',
            key: 'color',
        }, {
            title: '销售总重量(Kg)',
            align: 'center',
            dataIndex: 'totalWeight',
            key: 'totalWeight',
        }];

        for (let i = 0, len1 = arealist.length; i < len1; i++) {
            colList.push({
                title: `${arealist[i].key}(Kg)`,
                align: 'center',
                dataIndex: `area${arealist[i].value}`,
                key: `area${arealist[i].value}`,
            })
        }

        for (let i = 0, len = child.length; i < len; i++) {
            let obj = {};
            let sum = 0;
            obj.key = `${child[i].colorname + i}`;
            obj.color = `${child[i].colorname}-${child[i].productname}`;
            for (let j = 0, len2 = arealist.length; j < len2; j++) {
                if (child[i].area + '' === arealist[j].value) {
                    obj[`area${arealist[j].value}`] = (child[i].actweight).toFixed(2);
                    sum += child[i].actweight;
                }
            }
            obj.totalWeight = sum.toFixed(2);
            datas.push(obj)
        }

        return <Table
            columns={colList}
            dataSource={datas}
            pagination={false}
        />
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
        const dataProduct = this.state.dataSearch;
        const { cangkus, productList, saleids } = this.props.statements;
        const { arealist, classify } = productList;
        let tablelist = this.state.colProductList;
        const dataSource = this.printfTablelist(classify, arealist);

        if (classify.length <= 0) {
            tablelist.splice(2);
        }

        for (let i = 0, len1 = arealist.length; i < len1; i++) {
            for (let j = 0, len2 = cangkus.length; j < len2; j++) {
                if (arealist[i] === cangkus[j].value * 1) {
                    arealist.splice(i, 1, cangkus[j]);
                    tablelist.push({
                        title: `${cangkus[j].key}(Kg)`,
                        align: 'center',
                        dataIndex: `area${cangkus[j].value}`,
                        key: `area${cangkus[j].value}`,
                    })
                }
            }
        }
        // Table 列去重
        let obj = {};
        tablelist = tablelist.reduce(function (item, next) {
            obj[next.key] ? '' : obj[next.key] = true && item.push(next);
            return item
        }, []);

        const colProduct = [
            {
                title: '仓库',
                align: 'center',
                dataIndex: 'area',
                key: 'area',
                width: '2%',
                render: (val, record, index) => {
                    return (
                        <Select
                            defaultValue="0"
                            onChange={(e) => { this.handleChangeData(e, record, 'area') }}
                            style={{ width: 120 }}
                        >
                            {cangkus.map((item, idx) => {
                                return (
                                    <Option key={item.value + idx} value={item.value}>{item.key}</Option>
                                )
                            })}
                        </Select>
                    )
                }
            },
            {
                title: '货品名称',
                align: 'center',
                dataIndex: 'brandname',
                key: 'brandname',
                width: '5%',
                render: (val, record, index) => {
                    return (
                        <Input onChange={e => { this.handleChangeData(e, record, 'brandname') }} />
                    )
                }
            },
            {
                title: '销售日期',
                align: 'center',
                dataIndex: 'sellDate',
                key: 'sellDate',
                width: '9%',
                render: (val, record, index) => {
                    return (
                        <RangePicker
                            defaultValue={
                                [
                                    moment(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 2), dateFormat),
                                    moment(new Date(), dateFormat)
                                ]
                            }
                            onChange={e => { this.handleChangeData(e, record, 'sellDate') }}
                        />
                    )
                }
            },
            {
                title: '色号',
                align: 'center',
                dataIndex: 'colorname',
                key: 'colorname',
                width: '5%',
                render: (val, record, index) => {
                    return (
                        <Input onChange={e => { this.handleChangeData(e, record, 'colorname') }} />
                    )
                }
            },
            {
                title: '色称',
                align: 'center',
                dataIndex: 'productname',
                key: 'productname',
                width: '5%',
                render: (val, record, index) => {
                    return (
                        <Input onChange={e => { this.handleChangeData(e, record, 'productname') }} />
                    )
                }
            },
            {
                title: '业务员',
                align: 'center',
                dataIndex: 'saleids',
                key: 'saleids',
                width: '2%',
                render: (val, record, index) => {
                    return (
                        <Select
                            defaultValue="全部"
                            onChange={e => { this.handleChangeData(e, record, 'saleids') }}
                            style={{ width: 120 }}
                        >
                            {saleids.map((item, idx) => {
                                return (<Option key={item + idx} value={item}>{item}</Option>)
                            })}
                        </Select>
                    )
                }
            },
            {
                title: '搜索',
                align: 'center',
                dataIndex: 'search',
                key: 'search',
                width: '2%',
                render: (val, record, index) => {
                    return (
                        <Button type='primary' icon='search' onClick={this.searchDatas} />
                    )
                }
            },
        ]
        return (
            <Fragment>
                <PageHeaderLayout title='产品销售汇总表'>
                    <Table
                        columns={colProduct}
                        dataSource={dataProduct}
                        pagination={false}
                        bordered
                        style={{ margin: '15px 0' }}
                    />
                    <Table columns={tablelist} dataSource={dataSource} pagination={false} expandedRowRender={this.expandedRowRender} />
                </PageHeaderLayout>
            </Fragment>
        )
    }
}