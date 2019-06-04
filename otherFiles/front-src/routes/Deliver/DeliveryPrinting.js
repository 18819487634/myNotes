import React, { PureComponent,Fragment } from 'react';
import moment from 'moment';

import { Card, Button, Form, Row,Col, message ,Modal} from 'antd';
import { recordstatusList, takewayList, getMyDateNoHMS } from '../../utils/utils';
import styles from './DeliverProfile.less';
import Detail from './Detail';
import { getUserCompany } from '../../utils/sessionStorage';
// import { scale } from 'gl-matrix/src/gl-matrix/quat';
// import { fixedZeroTo4Bit } from '../../utils/utils';
// import styles from './Funds.less';
// import { isEmptyObject } from '../../utils/reg';
// import { Yuan } from '../../utils/math';
// import watermark from '../../assets/icon/revocation.png';
const confirms = Modal.confirm;
const takewaysub = ["","运输单号:","配送人:"];
const QRCode = require('qrcode.react');

@Form.create()
export default class DeliveryPrinting extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: props.dataSource,
    };
  }
  componentWillReceiveProps(n){
      if(n.value===undefined){
          this.setState({
              data:n.dataSource,
          })
      }
  }

  getCode =(value) =>{
    QRCode.toDataURL(value)
    .then(url => {
        this.setState({
            qrcodeImg:url
        })
    })
    .catch(err => {
        console.error(err)
    })
  }
  // 打印
  print = () => {
 //   window.open("page.html","","width=200,height=200");
    window.document.body.innerHTML = window.document.getElementById('billDetails').innerHTML;
    // const wind = window.open("", "newwin",
    // "toolbar=no,scrollbars=yes,menubar=no");
    window.print();
    window.location.reload();
    // const el = document.getElementById('billDetails');
    // const iframe = document.createElement('IFRAME');
    // let doc = null;
    // iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:500px;top:500px;');
    // document.body.appendChild(iframe);
    // doc = iframe.contentWindow.document;
    // // 引入打印的专有CSS样式，根据实际修改
    // // doc.write('<LINK rel="stylesheet" type="text/css" href="css/print.css">');
    // doc.write(el.innerHTML);
    // doc.close();
    // // 获取iframe的焦点，从iframe开始打印
    // iframe.contentWindow.focus();
    // iframe.contentWindow.print();
    // if (navigator.userAgent.indexOf("MSIE") > 0)
    // {
    //     document.body.removeChild(iframe);
    //
  };

  printforsale=()=>{
    const userAgent = navigator.userAgent.toLowerCase(); // 取得浏览器的userAgent字符串
		if (userAgent.indexOf("trident") > -1) {
			message.warn("请使用google或者360浏览器打印");
			return false;
		} else if (userAgent.indexOf('msie') > -1) {

      confirms({
        title: `请使用Google或者360浏览器打印`,
        content: ``,
        onOk() {
          // return new Promise((resolve, reject) => {
          //   setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
          // }).catch(() => console.log('Oops errors!'));
          return false;
        },
        onCancel() {return false;},
      });
      return false;
		} else {// 其它浏览器使用lodop
			const oldstr = document.body.innerHTML;
			const headstr = "<html><head><title></title><link  type=`text/css` `href=`styles.css`></head><body>";
			const footstr = "</body></html>";
			// 执行隐藏打印区域不需要打印的内容
		//	document.getElementById("otherpho").style.display="none";
			const printData = document.getElementById("billDetails").innerHTML; // 获得 div 里的所有 html 数据
			const wind = window.open("", "newwin",
          "toolbar=no,scrollbars=yes,menubar=no");
      // wind.document.write(stlyes);
      // wind.document.write(printData);
      
			wind.document.body.innerHTML = printData ;
			wind.print();
			// 打印结束后，放开隐藏内容
		//	document.getElementById("otherpho").style.display="block";
		//	wind.close();
		//	window.document.body.innerHTML = oldstr;
		}
  }
  render() {
  
    const {data} = this.state;
    const receiptsCode = data.id;
    const dpman = data.dispatchman===undefined?"":data.dispatchman.substring(data.dispatchman .indexOf(":")+1);
    const company = JSON.parse(getUserCompany());
    const expressno = data.expressno===undefined?"":data.expressno;
    const deliveryman = data.deliveryman===undefined?"":data.deliveryman;
    const deliveryphone = data.deliveryphone===undefined?"":data.deliveryphone;
    const manphone = `${deliveryman} ${deliveryphone}`;
    const takewaysubval = ["",expressno,manphone];
    return (
      <Fragment>
        <div>
          <Button onClick={this.print.bind(this)} style={{ marginRight: '5px' }}>
            打印
          </Button>
          <Button type="primary" onClick={this.back} style={{ marginRight: '5px' }}>
            返回
          </Button>
        </div>
        <div id={'billDetails'} style={{ border: 'solid' }} className="Gdetails">
          <Card bordered={false} title="">
            <div style={{ position: 'relative' }}>
              <img src={`${company.logo}`} style={{width:70,height:50}} alt="" className="CompanyLogo" />

              <div style={{ display: 'flex' }}>
                <h2 style={{ width:600, flex: 1, textAlign: 'center', marginBottom: '0' }}>
                  {`${company.fullname}出库单`}
                </h2>
                <div>
                  <img src={`http://qr.topscan.com/api.php?text=${receiptsCode !== undefined ? receiptsCode : ''}`} style={{position:'absolute',right:10,width:70,height:70}} ></img>
                  <span style={{ textAlign: 'left',color: '#FF6666',fontWeight: '600',fontSize:12,position:'absolute',right:-10,top:70 }}>{`NO:${receiptsCode !== undefined ? receiptsCode : ''}`}</span>
                </div>
                {/* <span
                  style={{
                    position: 'absolute', 
                    right: '10px',
                    color: '#FF6666',
                    fontWeight: '600',
                  }}
                >{`NO:${receiptsCode !== undefined ? receiptsCode : ''}`}</span> */}
              </div>
              <div style={{ display: 'flex' }}>
                <h3 style={{ flex: 1, textAlign: 'center', fontSize: '10px' }}>
                  {`${company.address} Tel: ${company.telphone} Fax: ${company.fax}`}
                  {/* 东莞市大朗镇富华北路238号 Tel：0769-83108043 Fax：0769-83180304 */}
                </h3>
              </div>
              <div>
                <div style={{ display: 'flex' }}>
                  <h3 style={{ flex: 1,  fontSize: '10px' }}>
                    {`购物单位:${data.clientname} `}
                  </h3>
                  <h3 style={{ flex: 2,  fontSize: '10px' }}>
                    {`日期:${getMyDateNoHMS(data.finishdate===undefined?data.createdate:data.finishdate)}`}
                  </h3>
                </div>
                <div style={{ display: 'flex' }}>
                  <h3 style={{ flex: 1,  fontSize: '10px', marginTop:10 }}>
                    {`电话:${data.shipphone } (${data.shipreceiver} 收)`}
                  </h3>
                  <h3 style={{ flex: 2,  fontSize: '10px',marginTop:10 }}>
                    {`收货地址:${data.sendplace}`}
                  </h3>
                </div>
                <div style={{ display: 'flex' }}>
                  <h3 style={{ flex: 1,  fontSize: '10px' }}>
                    {`取货方式:${data.takewayname}`}
                  </h3>
                  <h3 style={{ flex: 2,  fontSize: '10px' }}>
                    {`${takewaysub[data.takestatus]}${takewaysubval[data.takestatus]}`}
                  </h3>
                </div>
              </div>
              <div>
                <Detail dataSource={data.details} />
              </div>
              <div style={{ display: 'flex' }}>
                <h3 style={{ flex: 1, textAlign: 'center', fontSize: '10px' }}>
                  {`跟单:${data.usrid.substring(data.usrid.indexOf(":")+1)}`}
                </h3>
                <h3 style={{ flex: 1, textAlign: 'center', fontSize: '10px' }}>
                  {`发货员:${dpman}`}
                </h3> 
                <h3 style={{ flex: 1, textAlign: 'center', fontSize: '10px' }}>
                  {`收货人:`}
                </h3>
              </div>
            </div>
          </Card>
        </div>
      </Fragment>
    );
  }
}
