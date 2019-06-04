import React, { PureComponent, Fragment } from 'react';
import { Table,Cascader,Input } from 'antd';
import styles from './PickUpProfile.less';
import { getMyDate } from '../../utils/utils';
import { queryProvince } from '../../services/api';


let arrData = [];
const takewayArr = ['自提', '快递', '物流', '送货上门'];
const paywayArr = ['在线支付', '货到付款', '物流代收', '现金'];
const recordstatusArr = ['正常', '加急'];

export default class SaleTop extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      
      data: props.dataSource,
      loading: false,
      concatData:
        [{
          key:'comment1',
          usrid:props.dataSource[0].comment},
    
        
          {
            key:'address1',
            usrid:props.dataSource[0].address,
            provice:props.dataSource[0].provice,
            shipphone:props.dataSource[0].shipphone,
            shipreceiver:props.dataSource[0].shipreceiver,
            provicelabel:props.dataSource[0].provicelabel,
          },
        ],
      
    };
  }

  componentDidMount() {
    
    queryProvince().then((ress=>{
      if(ress && ress.status===200){
        
        const proviceDatas= ress.result.data;
        for(let i=0;i<proviceDatas.length;i++){
          proviceDatas[i].key=`${proviceDatas[i].codeP}`;
          proviceDatas[i].value=`${proviceDatas[i].codeP}`;
          proviceDatas[i].label=`${proviceDatas[i].name}`;
          const childrendatas = proviceDatas[i].children;
          for(let j=0;j<childrendatas.length;j++){
            childrendatas[j].value=`${childrendatas[j].codeC}`;
            childrendatas[j].key=`${childrendatas[j].codeC}`;
            childrendatas[j].label=`${childrendatas[j].name}`;
            const childrenAear = childrendatas[j].areas;
            for(let z=0;z<childrenAear.length;z++){
              childrenAear[z].value=`${childrenAear[z].codeA}`;
              childrenAear[z].key=`${childrenAear[z].codeA}`;
              childrenAear[z].label=`${childrenAear[z].name}`;
            }
            proviceDatas[i].children[j].children =childrenAear;
          }
          proviceDatas[i].children =childrendatas;
        }
        this.props.onChange(this.state.data.concat(this.state.concatData));
        this.setState({
          options:proviceDatas,
         
        })
      }
      }))
  }
  componentWillReceiveProps(nextProps) {

    
    
    if(nextProps.value !== undefined){
      const value1 = nextProps.value[nextProps.value.length - 2];
      const value2 = nextProps.value[nextProps.value.length - 1];
     
      const values = [value1,value2];
      
      this.setState({
        
        concatData:values,
      })
    }else{
      const datas = nextProps.dataSource; 
      const concat1 = this.state.concatData;
      concat1[0].usrid = datas[0].comment;
      concat1[1].shipreceiver = datas[0].shipreceiver;
      concat1[1].shipphone = datas[0].shipphone;
      concat1[1].usrid = datas[0].address;
      concat1[1].provice = datas[0].provice;
      concat1[1].provicelabel = datas[0].provicelabel;
      this.setState({
        data:datas,
        concatData:concat1,
      })
    }
    
  }
  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
  handleFieldCascaderChange(e,option, fieldName, key) {
    
    const newData = this.state.concatData.map(item => ({ ...item }));
    const fieldName1 = "provicelabel";
    
    const target = this.getRowByKey(key, newData);
    if (target) {
      const labels = [option[0].name,option[1].name];
      if(option.length === 3){
        labels.push(option[2].name);
      }
      target[fieldName] = e;
      target[fieldName1] = labels;
      this.setState({ concatData: newData },()=>{
        this.props.onChange(this.state.data.concat(this.state.concatData));
      });
      
    }
    
  }

  handleFieldChange(e, fieldName, key) {
    
    const newData = this.state.concatData.map(item => ({ ...item }));
   
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ concatData: newData },()=>{
        this.props.onChange(this.state.data.concat(newData));
      });
      
    }
    
  }

  render() {
    const renderContent = (value, row, index) => {
      const obj = {
        children: value,
        props: {},
      };
      // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0
      if (
        index === dataSource.length ||
        index - 1 === dataSource.length ||
        index - 2 === dataSource.length ||
        index - 3 === dataSource.length ||
        index - 4 === dataSource.length ||
        index - 5 === dataSource.length ||
        index - 6 === dataSource.length ||
        index - 7 === dataSource.length ||
        index - 8 === dataSource.length
      ) {
        obj.props.colSpan = 0;
      }
      return obj;
    };
    const dataSource = this.state.data;
    console.log("tabletopsssss",dataSource);
    if (dataSource.length > 0) {
    
      arrData = dataSource.concat(this.state.concatData);
    } else {
      arrData = dataSource;
    }

    const columns = [
      {
        title: '预售单编号',
        dataIndex: 'id',
        key: 'id',
        width: '10%',
        render:(val,record)=>{
          if( `${record.key}`=== "address1"){
            return { 
              children :
  <div>
    <span style={{ fontWeight: 600,float:"left" ,width:100,marginTop:8}} >地址</span>
    {/* <Cascader style={{ fontWeight: 600,float:"left",width:400 }} options={this.state.options} placeholder="省/市/区" onChange={this.cascaderonChange} />   */}
    <Cascader  value={record.provice}  style={{ fontWeight: 600,float:"left",width:300 }}  options={this.state.options} placeholder="省/市/区"  onChange={(e,o)=> this.handleFieldCascaderChange(e, o,'provice', record.key)} />   
    <Input value={record.usrid} style={{ fontWeight: 600,float:"left",width:200 }} onChange={e => this.handleFieldChange(e, 'usrid', record.key)}  />
    <span style={{ fontWeight: 600,float:"left" ,width:60,marginTop:8}} >收件人</span>
    <Input value={record.shipreceiver} style={{ fontWeight: 600,float:"left",width:100 }} onChange={e => this.handleFieldChange(e, 'shipreceiver', record.key)}  />
    <span style={{ fontWeight: 600,float:"left" ,width:60,marginTop:8}} >电话</span>
    <Input value={record.shipphone} style={{ fontWeight: 600,float:"left",width:150 }} onChange={e => this.handleFieldChange(e, 'shipphone', record.key)}  />
  </div>,
             
                  props:{
                    colSpan:7,
                  },
                }
          }
          else if(`${record.key}`=== "comment1" ){
            return { 
              children :<div  ><span  style={{ fontWeight: 600,float:"left" ,width:100,marginTop:8}}>备注</span><Input value={record.usrid} style={{ fontWeight: 600,float:"left",width:400 }} onChange={e => this.handleFieldChange(e, 'usrid', record.key)} /></div>,
                  props:{
                    colSpan:7,
                  },
                }
          }else{
        
            return (
              <div>
                <li key={record.id}>{dataSource[0].id}</li>
                <li key={record.makedate}>{getMyDate(dataSource[0].makedate)}</li>
              </div>
            )
        
        }
      
      
        
      },
    },
      {
        title: '客户',
        dataIndex: 'userids',
        key: 'userids',
        width: '10%',
        render: renderContent,
      },
      // {
      //   title: '最早货期',
      //   dataIndex: 'deliverydate',
      //   key: 'deliverydate',
      //   width: '10%',
      //   render: renderContent,
      // },
      {
        title: '取货方式',
        dataIndex: 'takewayname',
        key: 'takewayname',
        width: '10%',
        render: (value) => {
          if (value !== undefined) {
            return <span>{value}</span>;
          } else {
            const obj = {
              children: value,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0

            obj.props.colSpan = 0;
            return obj;
          }
        },
      },
      {
        title: '支付方式',
        dataIndex: 'payway',
        key: 'payway',
        width: '10%',
       
        render: (value) => {
          if (value !== undefined) {
            return <span>{paywayArr[value]}</span>;
          } else {
            const obj = {
              children: value,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0

            obj.props.colSpan = 0;
            return obj;
          }
        },
      },
      {
        title: '客户评级 ',
        dataIndex: 'credit',
        key: 'credit',
        width: '5%',
        render: renderContent,
      },
      {
        title: '拣货单状态',
        dataIndex: 'ismerge',
        key: 'ismerge',
        width: '10%',
        filters: [
          {
            text: recordstatusArr[0],
            value: 0,
          },
          {
            text: recordstatusArr[1],
            value: 1,
          },
        ],
        onFilter: (value, record) => record.ismerge.toString() === value,
        render: (value) => {
          if (value !== undefined) {
            return <span>{recordstatusArr[value]}</span>;
          } else {
            const obj = {
              children: value,
              props: {},
            };
            // 总计合并时，多出来的不需要渲染的单元格设置为colspan=0

            obj.props.colSpan = 0;
            return obj;
          }
        },
      },
    ];

    return (
      <Fragment>
        <Table
          loading={this.state.loading}
          columns={columns}
          dataSource={arrData}
          pagination={false}
          rowKey={record => record.key}
          rowClassName={record => {
            return record.editable ? styles.editable : '';
          }}
        />
      </Fragment>
    );
  }
}
