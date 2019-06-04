import React, { PureComponent,Fragment } from 'react';
import { connect } from 'dva';
import {
  Form,
  Row,
  Col,
  message,
  Modal,
  Button,

} from 'antd';

import { recordstatusList, takewayList } from '../../utils/utils';
import Detail from './Detail';
import DeliveryPrinting from './DeliveryPrinting';
import PrintingView from '../Sale/PrintingView';


let dataResult = [];

const takewaysub = ["","运输单号:","配送人:"];

const PrintTable = Form.create()(props => {
    const { modalVisible, printData,handleModalVisible } = props;
    const okHandle = () => {};
    return (
      <Modal
        title="打印"
        visible={modalVisible}
        width={800}
        onOk={okHandle}
        maskClosable={false}
        footer={null}
        destroyOnClose
        onCancel={() => handleModalVisible()}
      >
        <DeliveryPrinting dataSource={printData} />
      </Modal>
    );
  });
  const PrintSaleTable = Form.create()(props => {
    const { modalVisible, printData,handleSaleModalVisible } = props;
    const okHandle = () => {};
    return (
      <Modal
        title="打印"
        visible={modalVisible}
        width={800}
        onOk={okHandle}
        footer={null}
        destroyOnClose
        maskClosable={false}
        onCancel={() => handleSaleModalVisible()}
      >
        <PrintingView dataSource={printData} />
      </Modal>
    );
  });
@connect(({ delivery, loading }) => ({
    delivery,
  loading: loading.models.delivery,
}))
@Form.create()
export default class DeliveryDetails extends PureComponent {
    constructor(props) {
        super(props);
        this.state={
            deliveryid:props.dataSource.id,
            clientname:props.dataSource.clientname,
            printingFlag:false,
        }
    }

  componentDidMount() {
    const terms = {id:this.state.deliveryid};
    this.props.dispatch({
        type:'delivery/fetchDetail',
        payload:terms,
    })
  }
  printingSale=(e,parms)=>{

    message.config({
      top: 100,
    });
    const hide = message.loading('正在读取，请稍候...', 0);
    this.props.dispatch({
      type:'sale/getPrintSaleDetails',
      payload:parms,
      callback:((response)=>{
        setTimeout(hide,100);
        this.setState({
        saleResult: response,
        printingSaleFlag: true,
        }); 
      }),
    })
  }
  handleModalVisible = () => {
    this.setState({
      printingFlag: false,
    });
  };
  handleSaleModalVisible = () => {
    this.setState({
      printingSaleFlag: false,
    });
  };
  printingDelivery= (e) =>{
    this.setState({
        printingFlag: true,
      });
  }

 

  render() {
    const {delivery,loading} = this.props;
    const {data} = delivery;
    const {saleResult} = this.state;
    let dataList = [];
    const parentMethods = {
        handleModalVisible: this.handleModalVisible,
      };
    const  parentSaleMethods= {
      handleSaleModalVisible: this.handleSaleModalVisible,
      };
    let takewaysubval = [];
    if (data && data.status === 200 && data.result) {
      data.list = data.result.details;
      dataResult = data.result;
      dataList = data.list;
      dataResult.clientname = this.state.clientname;
      const expressno = dataResult.expressno===undefined?"":dataResult.expressno;
      const deliveryman = dataResult.deliveryman===undefined?"":dataResult.deliveryman;
      const deliveryphone = dataResult.deliveryphone===undefined?"":dataResult.deliveryphone;
      const manphone = `${deliveryman} ${deliveryphone}`;
      takewaysubval = ["",expressno,manphone];
    }
    return (
      <Fragment>
        <div>
          <Row>
            <Col md={12} sm={24}>
              {`销售单号:${dataResult.saleid}`}
            </Col>
            <Col md={12} sm={24}>
              {`出库单号:${dataResult.id}`}
            </Col>
          </Row>
          <Row>
            <Col md={12} sm={24}>
              {`购物单位:${this.state.clientname}`}
            </Col>
            <Col md={12} sm={24}>
              {`出库状态:${ recordstatusList[dataResult.status]}`}
            </Col>
          </Row>
          <Row>
            <Col md={24} sm={24}>
              {`收货地址:${dataResult.sendplace}`}
            </Col>
          </Row>
          <Row>
            <Col md={12} sm={24}>
              {`取货方式:${dataResult.takewayname}`}
            </Col>
            <Col md={12} sm={24}>
              {`${takewaysub[dataResult.takestatus]}${takewaysubval[dataResult.takestatus]}`}
            </Col>
          </Row>
        </div>
        <div>
          <Detail dataSource={dataList} loading={loading} />
          <Button type="primary" onClick={e=>this.printingDelivery(e)}>打印出库单</Button>
          <Button style={{marginLeft:10}} type="primary" onClick={e=>this.printingSale(e,dataResult.saleid)}>打印销售单</Button>
        </div>
        <PrintTable
          modalVisible={this.state.printingFlag}
          printData={dataResult}
          {...parentMethods}
        />
        <PrintSaleTable
          modalVisible={this.state.printingSaleFlag}
          printData={saleResult}
          {...parentSaleMethods}
        />
      </Fragment>
    );
  }
}
