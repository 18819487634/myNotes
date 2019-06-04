import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, InputNumber, Select, message } from 'antd';
import styles from './InputProfile.less';
import TableAdress from '../Express/TableAdress';
import { createCartno } from '../../services/api';


const {Option} = Select;
export default class LocationForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: props.dataSource.ximadata,
      sumdata:props.dataSource.sumdata,
      loading: false,
      titlename:props.dataSource.titlename,
      locations:props.dataSource.locations,
      productid:props.dataSource.productid,
      fineStatus:props.dataSource.fineStatus,
      num:props.dataSource.num,
      aw:props.dataSource.aw,
    };
 
  }
  componentDidMount(){
    const datas = this.state.data;
    const sumdatas = this.state.sumdata;
    this.props.onChange(datas.concat(sumdatas));
  }
  componentWillReceiveProps(nextProps) {
    if ( nextProps.value === undefined) {
      this.setState({
        data: nextProps.dataSource.ximadata,
        titlename:nextProps.dataSource.titlename,
        locations:nextProps.dataSource.locations,
        fineStatus:nextProps.dataSource.fineStatus,
        num:nextProps.dataSource.num,
        aw:nextProps.dataSource.aw,
      });
    }else{
      if(this.state.titlename !== undefined&& this.state.titlename !== nextProps.dataSource.titlename){ // 新的缸号产品
      
        this.setState({
          data: nextProps.dataSource.ximadata,
          sumdata: [{
            key:'sumkey_1',
            totalgw:"",
            totalnw:"",
            piecenum:"",
            allpiecenum:"",
           
          }],
          titlename:nextProps.dataSource.titlename,
          locationdata:nextProps.dataSource.locationdata,
          fineStatus:nextProps.dataSource.fineStatus,
          num:nextProps.dataSource.num,
          aw:nextProps.dataSource.aw,
        });
      }
      if(this.state.locations !== undefined && nextProps.dataSource.locations!== this.state.locations){
        this.setState({
        
          titlename:nextProps.dataSource.titlename,
          
          locationdata:nextProps.dataSource.locationdata,
          num:nextProps.dataSource.num,
          aw:nextProps.dataSource.aw,
          
        });
      }else{
        this.setState({
          fineStatus:nextProps.dataSource.fineStatus,
          titlename:nextProps.dataSource.titlename,
          locations:nextProps.dataSource.locations,
          locationdata:nextProps.dataSource.locationdata,
          num:nextProps.dataSource.num,
          aw:nextProps.dataSource.aw,
        });
      }
    }
    
  }
  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  }
  index = 0;
  cacheOriginData = {};
  toggleEditable = (e, key) => {
    e.preventDefault();
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: newData });
    }
  };
  remove(key) {
    const newData = this.state.data.filter(item => item.key !== key);
    this.setState({ data: newData });
    const datas = this.state.data;
    const sumdatas = this.state.sumdata;
    this.props.onChange(datas.concat(sumdatas));
  }
  newMember = () => {
    const newData = this.state.data.map(item => ({ ...item }));
   // const cartnos = `2019854214444001${this.index}`;
    if(this.state.fineStatus === 2 && newData.length >0){
      message.warning("没有细码单的，只能新增一条");
      return;
    }
    newData.push({
      key: `cartno_${this.index}`,

     // cartno: cartnos,
      productid:this.state.productid,
      tagno: '',
      glossweight: '',
      weight: '',
      num: this.state.num,
      batchnostatus:this.state.fineStatus,
      location: this.state.locations,
      aw:this.state.aw,
      editable: true,
      isNew: true,
    });
    this.index += 1;
    this.setState({ data: newData });

    // createCartno(this.state.batchno).then(res=>{
    //     if(res && res.status === 200){
    //      const cartnos = res.result;
    //       newData.push({
    //         key: `cartno_${this.index}`,
      
    //         cartno: cartnos,
    //         productid:this.state.productid,
    //         tagno: '',
    //         glossweight: '',
    //         weight: '',
    //         num: '',
    //         batchnostatus:this.state.fineStatus,
    //         location: this.state.locations,
    //         editable: true,
    //         isNew: true,
    //       });
    //       this.index += 1;
    //       this.setState({ data: newData });
    //     }else if(res && (res.status === 400 || res.status === 500)){
    //       message.warning("箱号已存在，请重新点击");
          
    //     }
    // })
   
  };
  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }
  handleFieldChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    
    if (target) {
      let values = e.target.value;
      if(!/^[0-9]*$/.test(values)){
        message.warning("请输入数字");
        values = 0;
      }
      target[fieldName] = values;
      this.setState({ data: newData }, () => {
        const datas = this.state.data;
        const sumdatas = this.state.sumdata;
        this.props.onChange(datas.concat(sumdatas));
      });
    }
  }

  handleWeightNumberChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    const numtname ="num";
    if (target) {
      target[fieldName] = e===undefined?0:e;
      target[numtname] = Math.round(e/target.aw);
      let totalgw =0;// 总毛重
      let totalnw =0;// 总净重
      let piecenum =0;// 总只数
      let allpiecenum =0;// 总件数
      for(let i =0;i<newData.length;i+=1){
        totalgw += parseFloat(newData[i].glossweight===""?0:newData[i].glossweight);
        totalnw += parseFloat(newData[i].weight===""?0:newData[i].weight);

        piecenum += parseFloat(newData[i].num===""?0:newData[i].num);
        allpiecenum +=1;
      }
      const sumdatas = this.state.sumdata;
      sumdatas[0].totalgw =totalgw.toFixed(2);
      sumdatas[0].totalnw =totalnw.toFixed(2);
      sumdatas[0].piecenum =piecenum.toFixed(2);
      sumdatas[0].allpiecenum =allpiecenum;
      this.setState({ data: newData,sumdata:sumdatas }, () => {
        
        this.props.onChange(this.state.data.concat(sumdatas));
      });
    }
  }
  handleNumberChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e===undefined?0:e;
      let totalgw =0;// 总毛重
      let totalnw =0;// 总净重
      let piecenum =0;// 总只数
      let allpiecenum =0;// 总件数
      for(let i =0;i<newData.length;i+=1){
        totalgw += parseFloat(newData[i].glossweight===""?0:newData[i].glossweight);
        totalnw += parseFloat(newData[i].weight===""?0:newData[i].weight);

        piecenum += parseFloat(newData[i].num===""?0:newData[i].num);
        allpiecenum +=1;
      }
      const sumdatas = this.state.sumdata;
      sumdatas[0].totalgw =totalgw.toFixed(2);
      sumdatas[0].totalnw =totalnw.toFixed(2);
      sumdatas[0].piecenum =piecenum.toFixed(2);
      sumdatas[0].allpiecenum =allpiecenum;
      this.setState({ data: newData,sumdata:sumdatas }, () => {
        
        this.props.onChange(this.state.data.concat(sumdatas));
      });
    }
  }

  InputBlur(e, fieldName, key){
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    let fieldValue = target[fieldName];
    if(fieldValue.length>0&&fieldValue.length<4&&fieldValue.length!==3){
      if(fieldValue.length ===1){
        fieldValue = `00${fieldValue}`;
      }else{
        fieldValue = `0${fieldValue}`;
      }
      for(let i=0;i<newData.length;i+=1){
        if(fieldValue === newData[i].tagno){
          message.warning("该序号已经存在");
          fieldValue = "";
        }
      }
    }
    
    if (target) {
      target[fieldName] = fieldValue;
      this.setState({ data: newData }, () => {
        const datas = this.state.data;
        const sumdatas = this.state.sumdata;
        this.props.onChange(datas.concat(sumdatas));
      });
    }
  }
  handlSelectChange(e, fieldName, key) {
    const newData = this.state.data.map(item => ({ ...item }));
   
   
    const target = this.getRowByKey(key, newData);
    if (target) { 
      target[fieldName] = e;
      
          
        this.setState({ data: newData,locations:e },()=>{
          const datas = this.state.data;
          const sumdatas = this.state.sumdata;
          this.props.onChange(datas.concat(sumdatas));


        })
        }

  }
 
  saveRow(e, key) {
    e.persist();
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(key) || {};
      // if (!target.workId || !target.name || !target.department) {
      //   message.error('请填写完整成员信息。');
      //   e.target.focus();
      //   this.setState({
      //     loading: false,
      //   });
      //   return;
      // }
      delete target.isNew;
      this.toggleEditable(e, key);
      const datas = this.state.data;
      const sumdatas = this.state.sumdata;
      this.props.onChange(datas.concat(sumdatas));
      this.setState({
        loading: false,
      });
    }, 500);
  }
  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.setState({ data: newData });
    this.clickedCancel = false;
  }
  render() {
    const {data,sumdata,titlename,locations,locationdata} =this.state;
    const columns = [
      // {
      //   title: '箱号(系统生成)',
      //   dataIndex: 'cartno',
      //   key: 'cartno',
      //   width: '20%',
        
      // },
      {
        title: '序号',
        dataIndex: 'tagno',
        key: 'tagno',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={record.tagno}
                onBlur={e => this.InputBlur(e, 'tagno', record.key)}
                onChange={e => this.handleFieldChange(e, 'tagno', record.key)}
              />
            );
          }
          return text;
        },
      },
      
      {
        title: '净重(Kg)',
        dataIndex: 'weight',
        key: 'weight',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <InputNumber
                value={record.weight}
                min={0.0}
                max={5000}
                onChange={e => this.handleWeightNumberChange(e, 'weight', record.key)}
              />
            );
          }
          return text;
        },
      },
      {
        title: '毛重(Kg)',
        dataIndex: 'glossweight',
        key: 'glossweight',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              
              <InputNumber
                value={record.glossweight}
                min={0.0}
                max={5000}
                onChange={e => this.handleNumberChange(e, 'glossweight', record.key)}

              />
            );
          }
          return text;
        },
      },
      {
        title: '只数',
        dataIndex: 'num',
        key: 'num',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <InputNumber
                value={record.num}
                min={0.0}
                onChange={e => this.handleNumberChange(e, 'num', record.key)}
              />
            );
          }
          return text;
        },
      },
      {
        title: '存放区域',
        dataIndex: 'location',
        key: 'location',
        width: '15%',
        render: (val, record) => {
         
            return (
              <Select
                defaultValue={locations}
                style={{ width: 120 }}
                onChange={e=>this.handlSelectChange(e,'location',record.key)}
                showSearch
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {/* {locationdata.map(locationdataMap => <Option key={locationdataMap}>{locationdataMap}</Option>)} */}
                {locationdata}
              </Select>
              );
          
        },
      },

      // {
      //   title: '操作',
      //   key: 'action',
      //   render: (text, record) => {
      //     if (!!record.editable && this.state.loading) {
      //       return null;
      //     }
      //     if (record.editable) {
      //       if (record.isNew) {
      //         return (
      //           <span>
      //             <a onClick={e => this.saveRow(e, record.key)}>添加</a>
      //             <Divider type="vertical" />
      //             <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
      //               <a>删除</a>
      //             </Popconfirm>
      //           </span>
      //         );
      //       }
      //       return (
      //         <span>
      //           <a onClick={e => this.saveRow(e, record.key)}>保存</a>
      //           <Divider type="vertical" />
      //           <a onClick={e => this.cancel(e, record.key)}>取消</a>
      //         </span>
      //       );
      //     }
      //     return (
      //       <span>
      //         <a onClick={e => this.toggleEditable(e, record.key)}>编辑</a>
      //         <Divider type="vertical" />
      //         <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
      //           <a>删除</a>
      //         </Popconfirm>
      //       </span>
      //     );
      //   },
      // },
    ];
    const columns2 = [
      {
        title: '',
        dataIndex: 'heji',
        key: 'heji',
        width: '20%',
        render:()=><span>合计</span>,
      },
      
      {
        title: '总净重(Kg)',
        dataIndex: 'totalnw',
        key: 'totalnw',
        width: '20%',
      },
      {
        title: '总毛重(Kg)',
        dataIndex: 'totalgw',
        key: 'totalgw',
        width: '20%',
      },
      {
        title: '总只数',
        dataIndex: 'piecenum',
        key: 'piecenum',
        width: '20%',
      },
      {
        title: '总件数',
        dataIndex: 'allpiecenum',
        key: 'allpiecenum',
        width: '20%',
      },
    ];
    return (
      <Fragment>
        <div className={styles.tableList}>
          <div style={{height:450 }}>
            <div style={{ width: 900,height:400,float:'left',overflowY:'auto' }}>
              <Table
                title={()=>titlename}
                loading={this.state.loading}
                columns={columns}
                dataSource={data}
                pagination={false}
                rowClassName={record => {
                  return record.editable ? styles.editable : '';
                }}
                rowKey={record => record.key}
              />

              <Button
                style={{ width: 860, marginTop: 16, marginBottom: 8 }}
                type="dashed"
                onClick={this.newMember}
                icon="plus"
              >
                新增
              </Button>
            </div>
            <div style={{ width: 620,display:'inline-block' }}>
              <Table
                
                columns={columns2}
                dataSource={sumdata}
                pagination={false}
               
                rowKey={record => record.key}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
