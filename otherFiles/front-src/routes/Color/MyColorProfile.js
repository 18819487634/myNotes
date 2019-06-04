import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, List, Form, Row, Col, Input } from 'antd';
import Ellipsis from 'components/Ellipsis';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { ButtonLab, RGBCheckBox } from '../../utils/LAButils';

import styles from './MyColorProfile.less';
import { getSupplyId } from '../../utils/sessionStorage';

const FormItem = Form.Item;

/**
 *
 *
 * @export
 * @class MyColorList
 * @extends {PureComponent}
 */
@connect(({ mycolor, loading }) => ({
  mycolor,
  loading: loading.models.mycolor,
}))
@Form.create()
export default class MyColorList extends PureComponent {
  componentDidMount() {}
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
      };
      values.supplyids = [getSupplyId()];
      values.supplierKind = 1;
      dispatch({
        type: 'mycolor/fetchMyColor',
        payload: values,
      });
    });
  };
  handleFormReset = () => {};
  handleLab2Rgb = item => {
    const mydata = item.colorproduct;
    const theForm = {
      XYZ_X: '',
      XYZ_Y: '',
      XYZ_Z: '',
      Lab_L: `${mydata.l}`,
      Lab_a: `${mydata.a}`,
      Lab_b: `${mydata.b}`,
      RGB_R: '',
      RGB_G: '',
      RGB_B: '',
      DomWavelength: '',
      K: '',
      hex: '',
      RefWhite: {
        selectedIndex: 3,
      },
      Adaptation: {
        selectedIndex: 0,
      },
      Gamma: {
        selectedIndex: 3,
      },
      RGBModel: {
        selectedIndex: 14,
      },
    };
    ButtonLab(theForm);
    RGBCheckBox(theForm);
    return {
      backgroundColor: `rgb(${theForm.RGB_R},${theForm.RGB_G},${theForm.RGB_B})`,
    };
  };

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="材料">
              {getFieldDecorator('kind', {
                rules: [
                  {
                    required: true,
                    message: '请输入材料',
                  },
                ],
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="页码">
              {getFieldDecorator('location')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    let templist = [];
    const { mycolor, loading } = this.props;

    if (mycolor != null) {
      const { data } = mycolor;
      if (data.status === 200 && data.result.list) {
        data.list = data.result.list;
      }

      const { list } = data;

      templist = list;
      if (list !== null && list.length !== 0) {
        templist.sort((a, b) => {
          if (
            a.location != null &&
            a.location.indexOf('-') !== -1 &&
            b.location != null &&
            b.location.indexOf('-') !== -1
          ) {
            const als = a.location.split('-');
            const bls = b.location.split('-');
            if (parseInt(als[0], 10) !== parseInt(bls[0], 10)) {
              return parseInt(als[0], 10) - parseInt(bls[0], 10);
            } else if (parseInt(als[1], 10) !== parseInt(bls[1], 10)) {
              return parseInt(als[1], 10) - parseInt(bls[1], 10);
            } else {
              return parseInt(als[2], 10) - parseInt(bls[2], 10);
            }
          } else {
            return -1;
          }
        });
      }
    }

    return (
      <PageHeaderLayout>
        <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
        <div className={styles.cardList}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            dataSource={[...templist]}
            renderItem={item =>
              item ? (
                <List.Item key={item.id}>
                  <Card.Meta
                    style={this.handleLab2Rgb(item)}
                    title={<a href="#">{item.productname}</a>}
                    description={
                      <Ellipsis className={this.handleLab2Rgb(item)} lines={3}>
                        {item.colorname} {item.colorproduct.pantong_color}
                      </Ellipsis>
                    }
                  />
                </List.Item>
              ) : (
                <List.Item />
              )
            }
          />
        </div>
      </PageHeaderLayout>
    );
  }
}
