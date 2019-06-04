import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, List } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getSupplyId } from '../../utils/sessionStorage';


function handleDs(fieldsValue, pageIndex = 0, pageSize = 10) {
  // const supplyids = getSupplyId();

  let ds = `pageIndex=${pageIndex}&pageSize=${pageSize}`;
  
  if (fieldsValue.colorname && fieldsValue.colorname.length > 0) {
    ds += `&terms[1].value=${fieldsValue.status}&terms[1].column=status`;
  }
  return ds;
}
@connect(({ color, loading }) => ({
  color,
  loading: loading.models.color,
}))
@Form.create()
export default class MyColorList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const params = {};
    params.supplyids = [getSupplyId()]; // 所有查询都要传递supplyid ，这里只传递自己的supplyid先。
    params.supplierKind = 1;
    params.pageSize = 9;
    params.pageIndex = 0;
    // params.lab = "";
    //  params.lab_e =  "";
    dispatch({
      type: 'color/fetchColor',
      payload: params,
    });
  }
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = handleDs(fieldsValue, 0, 10);
      // const values = {
      //   ...fieldsValue,
      // };
      // values.supplyids = [getSupplyId()];
      // values.supplierKind = 1;
     
      dispatch({
        type: 'color/fetchMyColor',
        payload: values,
      });
    });
  };
  handleStandardTableChange = pagination => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        pageIndex: pagination - 1,
        pageSize: 9,
        supplyids: [getSupplyId()],

        ...fieldsValue,
      };
      values.supplierKind = 1;
      dispatch({
        type: 'color/fetchColor',
        payload: values,
      });
    });
  };


  render() {
    const { color: { data }, loading } = this.props;

    let templist = [];

    if (data.status === 200 && data.result.list) {
      data.list = data.result.list;
      templist = data.list;
      data.pagination = {
        total: data.result.total,
        current: data.result.current + 1,
        pageSize: data.result.pageSize,
        showTotal: () => {
          return `共${data.result.total}条`;
        },
        onChange: this.handleStandardTableChange,
        showQuickJumper: true,
      };
    }

    return (
      <PageHeaderLayout title="色卡查询">
        <Card bordered={false}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            pagination={data.pagination}
            dataSource={templist}
            renderItem={item =>
              item ? (
                <List.Item key={item.id}>
                  <Card
                    title={`${item.largetype} ${item.series}  类似潘通的色号ddff:${
                      item.colorproduct.pantong_color
                    }`}
                  >
                    <div style={{ width: 85, display: 'inline-block' }}>
                      <li>色称:{item.productname}</li>
                      <li>色号:{item.colorname}</li>
                      <li>建议色差:{item.recommande}</li>
                    </div>
                    <div
                      style={{
                        backgroundColor: `rgb(${item.colorproduct.rgb})`,
                        width: 115,
                        height: 45,
                        display: 'inline-block',
                      }}
                    />
                  </Card>
                </List.Item>
              ) : (
                <List.Item />
              )
            }
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}
