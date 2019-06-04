import React, { PureComponent,Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import stlyes from './SaleProfile.less';
import { Card, Button, Form, Table, message ,Modal} from 'antd';

import { digitUppercase } from '../../utils/utils';
// import { scale } from 'gl-matrix/src/gl-matrix/quat';
// import { fixedZeroTo4Bit } from '../../utils/utils';
// import styles from './Funds.less';
// import { isEmptyObject } from '../../utils/reg';
// import { Yuan } from '../../utils/math';
// import watermark from '../../assets/icon/revocation.png';
const confirms = Modal.confirm;
const QRCode = require('qrcode.react');


@connect(({ sale, loading }) => ({
  sale,
loading: loading.models.sale,
}))
@Form.create()
export default class PrintingView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      datas: props.dataSource,
      id:props.dataSource.saleid,
    };
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      datas : nextProps.dataSource,
      id : nextProps.dataSource.saleid,
    })
  }
  getCode =(value) =>{
    QRCode.toDataURL(value)
    .then(url => {
        this.setState({
            qrcodeImg:url
        })
    })
    .catch(err => {
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
    const {datas} = this.state
    let companys={};
    let data  = {
      clientname:"",
      makedate:"",
      phone:"",
      address:"",
      details:[],
    };
    const details = [];
    if(datas.length === 0){
      companys={
        fax:'',
        address:'',
        telphone:'',
        fullname:'',
        logo:'',
        needpay:"",
        shippay:"",
        taxmoney:"",
      }

    }else{
      companys = datas.company;
      data = datas;
      for(let i=0;i<data.length;i+=1){
        details.push(data[i]);
      }
    }
    const receiptsCode = this.state.id;
    // const company = sale.printSale.company;

   
    
    const columns = [
      {
        title: '货品名称',
        dataIndex: 'brandname',
        align: 'center',
        render: (val, record, index) => {
          if(record.kindname === undefined){
            return val;
          }else{
            return (
              <div>
                <li>{val}</li>
              </div>
            );
          }
          
        },
      },
      {
        title: '颜色',
        dataIndex: 'attrName',
        align: 'center',
        render: (val, record, index) => {
          if(record.productname!== undefined){
            return (
              <div>
                <li>{`${record.productname}#${record.colorname}`}</li>
              </div>
            );
          }
          
        },
      },
      {
        title: '缸号(批号)',
        dataIndex: 'batchno',
        align: 'center',
      },
      {
        title: '单位',
        dataIndex: 'unit',
        align: 'center',
      },
      {
        title: '数量',
        dataIndex: 'weight',
        align: 'center',
      },
      {
        title: '单价',
        dataIndex: 'price',
        align: 'center',
      },
      {
        title: '金额',
        dataIndex: 'sum',
        align: 'center',
      },
      {
        title: '件数',
        dataIndex: 'piece',
        align: 'center',
      },
      {
        title: '散只',
        dataIndex: 'scattered',
        align: 'center',
      },
      {
        title: '备注',
        dataIndex: 'comment',
        align: 'center',
      },
    ];
    
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
              <img src={`${companys.logo}`} style={{width:70,height:50}} alt="" className="CompanyLogo" />

              <div style={{ display: 'flex' }}>
                <h2 style={{ width:600, flex: 1, textAlign: 'center', marginBottom: '0' }}>
                  {`${companys.fullname}销售单`}
                </h2>
                <div>
                  <img src={`http://qr.topscan.com/api.php?text=${receiptsCode !== undefined ? receiptsCode : ''}`} style={{position:'absolute',right:10,width:70,height:70}} ></img> 
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
                  {`${companys.address} Tel: ${companys.telphone} Fax: ${companys.fax}`}
                  {/* 东莞市大朗镇富华北路238号 Tel：0769-83108043 Fax：0769-83180304 */}
                </h3>
              </div>

              <div style={{ display: 'flex', fontSize: '10px' }} className="TaiTou">
                <h3 style={{ flex: 2, textAlign: 'left' }}>{`购货单位:${data.clientname}`}</h3>
                <h3 style={{ flex: 4, textAlign: 'left' }}>{`日期:${moment(data.makedate).format(
                  'YYYY-MM-DD'
                )}`}</h3>
              </div>
              <div style={{ display: 'flex', fontSize: '10px' }} className="TaiTou">
                <h3 style={{ flex: 2, textAlign: 'left' }}>{`电话:${data.shipphone}`}</h3>
                <h3 style={{ flex: 3, textAlign: 'left' }}>{`地址:${
                  data.address
                }`}</h3>
                <h3 style={{ flex: 1, textAlign: 'left',color: '#FF6666',fontWeight: '600' }}>{`NO:${receiptsCode !== undefined ? receiptsCode : ''}`}</h3>
              </div>
              {/* // <img src={watermark} hidden={enable} style={{position: 'absolute', width: '100px', height: '100px', top: '120px', right: '80px',zIndex: 100}} /> */}
            </div>
          </Card>
          <Card bordered={false} title="" bodyStyle={{ padding: '0 16px' }} className="Gtable">
            <Table className={stlyes.Gtable} style={{backgroundColor:'#FFFFFFF'}} dataSource={details} columns={columns} bordered pagination={false} />
          </Card>

          <div
            style={{ border: '1px solid #000', margin: '0 auto', marginTop: '15px', width: '96%' }}
          >
            <div style={{ display: 'flex', borderBottom: '1px solid' }}>
              <h3 style={{ flex: 2, textAlign: 'left' }}>
                {`合计人民币大写:${digitUppercase(data.needpay)}`}
              </h3>
              {/* <h3 style={{ flex: 1 }}>{`重量合计(Kg):${this.state.weight}`}</h3> */}
              <h3 style={{ flex: 1 }}>{`小写(￥):${data.needpay}`}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex' }}>
                <div className="letfBox" style={{ flex: 4 }}>
                  <div className="topBox">
                    <h3 style={{ textAlign: 'center', borderBottom: '1px solid' }}>购销协议书</h3>
                    <div className="AgreementBox">
                      <span style={{ marginRight: '10px' }}>甲方：供货单位</span>
                      <span style={{ marginRight: '10px' }}>
                        乙方：购货单位
                      </span>乙方向甲方购进以上货品款额，由签订日期起乙方保证在(&nbsp;&nbsp;&nbsp;&nbsp;)天内付清，乙方如逾期不付清该货款，甲方有权向乙方加收总货款20%
                      的逾期滞纳金，并向供方所在地法院提出起诉，授理权属售货方法院，乙方需负上违约后的一切法律责任，由需方承担律师费、保全担保费等费用。以上协议经双方签字后生效并依据。
                      <p style={{ display: 'flex', margin: '0', lineHeight: '30px' }}>
                        <span style={{ flex: 1, paddingLeft: '9px' }}>供货单位(经办人)：</span>
                        <span style={{ flex: 1 }}>购货单位(验收人)：</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rightBox" style={{ flex: 1, borderLeft: '1px solid' }} >
                  {`运费:￥${data.shippay}`}<br />
                  {`税额:￥${data.taxmoney}`}

                </div>
              </div>
              <div
                className="bottomBox"
                style={{ width: '100%', borderTop: '1px solid', paddingRight: '10px' }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '3%',
                    float: 'left',
                    fontSize: '16px',
                    paddingLeft: '1%',
                  }}
                >
                  声明
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    width: '96%',
                    float: 'right',
                    paddingTop: '4px',
                  }}
                >
                  上列货品（颜色、缸号、重量）请当面验收，并先试小样织布或对准颜色再生产大货，如有质量问题或者颜色不符，请在七天内向本公司（书面或传真）提出处理，如经染色、编织布品或成品，本公司恕不负责！
                </span>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
