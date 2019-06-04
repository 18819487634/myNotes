import React, { PureComponent, Fragment } from 'react';
import {connect} from 'dva';
import { Table, message, InputNumber, Button, Tooltip } from 'antd';
import FooterToolbar from 'components/FooterToolbar';

import { saveOrupdateExpressCost } from '../../services/api';
import { getSupplyId } from '../../utils/sessionStorage';

let selectedRowss = [];
let proviceDatas = [];
const checkMap = new Map();
let targetrow = {}

@connect(({ express, loading }) => ({
  express,
  loading: loading.models.express,
}))
export default class TableAdress extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      companyName: props.companyName,
      updateExpressCostParams: {},
    };
  }

  componentDidMount() {
    const params = `paging=false`;
    this.props.dispatch({
      type: 'express/getProviceList',
      payload: params,
      callback: (res) => {
        if(res !== 'local') {
          this.setState({
            dataprovice: res,
          })
        } else {
          this.getDataFromStorage()
        }
      },
    })
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      companyName: nextProps.title,
      sourcedata: nextProps.expressdata,
    });
  };
  componentDidUpdate(nextProps, nextState) {
    if(nextState.sourcedata) {
      this.state = {
        dataprovice: nextState.sourcedata,
        loading: false,
        selectedRows: selectedRowss,
        companyName: nextState.title,
        sourcedata: nextState.sourcedata,
      };
    } else {
      this.state = {
        loading: false,
        selectedRows: selectedRowss,
        companyName: nextState.title,
      };
    }
  };

  getDataFromStorage = () => {
    const data = JSON.parse(localStorage.getItem('proviceData'));
    this.setState({
      dataprovice: data,
    })
  };

  getRowByKey = (rec, newData) => {
    let key = 0;
    if(rec.id) {
      key = rec.id
    } else if(rec.cid) {
      key = rec.cid
    }
    let row =  newData.filter(item => item.id === key)[0];
    if(row === undefined) {
      for(let s = 0; s < newData.length; s++) {
        if(typeof newData[s] === 'object') {

          for(const item in newData[s]) {
            if(item === 'children') {
              for(let a = 0; a < newData[s][item].length; a++) {
                if(newData[s][item][a].cid === key) {
                  row = newData[s][item][a];
                  return row
                }
              }
            }
          }
        }
      }
    }
    return row
  }

  // eslint-disable-next-line react/sort-comp
  handleSelectRows = (selectedRowKeys, selectedRows) => {
    // 判断map里面是否有省的key，如果没有，就存，反之删除

    const datas = proviceDatas;
    const rowkeys = selectedRowKeys; // 最后输出的值
    const comkeys = selectedRowKeys; // 开始的值

    const selectRow = selectedRows;

    for (let i = 0; i < datas.length; i += 1) {
      const childrendata = datas[i].children;
      if (comkeys.indexOf(datas[i].codeP) > -1 && checkMap.has(datas[i].codeP) === false) {
        for (let j = 0; j < childrendata.length; j += 1) {
          if (
            datas[i].codeP === childrendata[j].codeP &&
            rowkeys.indexOf(childrendata[j].codeC) === -1
          ) {
            rowkeys.push(childrendata[j].codeC);
            selectRow.push(childrendata[j]);
          }
        }
        checkMap.set(datas[i].key, childrendata);
      } else if (comkeys.indexOf(datas[i].codeP) === -1 && checkMap.has(datas[i].codeP) === true) {
        for (let z = 0; z < childrendata.length; z += 1) {
          if (datas[i].codeP === childrendata[z].codeP) {
            rowkeys.splice(rowkeys.indexOf(childrendata[z].codeC), 1);
            selectRow.splice(selectRow.indexOf(childrendata[z]), 1);
          }
        }
        checkMap.delete(datas[i].codeP);
      }
    }

    // (guangdong)(全选)
    // (guangdong,guangdong-1.guangdong-2)
    // (guangdong,guangdong-1)
    // (guangdong)(子项全部取消)

    // (guangdong,jinan,jinan-1) 922
    // let arr =[];
    // for(let i =0;i<datas.length;i++){
    //   const childrendata = datas[i].children;
    //   let checkdata=[];

    //   if(comkeys.indexOf(datas[i].key)>-1 && checkMap.has(datas[i].key)===false){ // 第一次点击父类

    //     // 省父类
    //     arr=[];
    //     if(rowkeys.indexOf(datas[i].key)===-1){
    //       rowkeys.push(datas[i].key);selectRow.push(datas[i].key);
    //     }

    //     for(let c=0;c<childrendata.length;c++){// 已拥有省父类的市子类,第一次点击父类

    //         if(rowkeys.indexOf(childrendata[c].key)===-1){
    //           rowkeys.push(childrendata[c].key);
    //           selectRow.push(childrendata[c]);
    //           arr.push(childrendata[c].key);
    //         }

    //     }
    //     checkMap.set(datas[i].key,arr);

    //   }

    //   else if(checkMap.has(datas[i].key)=== true ){// 第二次点击有省父类的子类

    //        checkdata = checkMap.get(datas[i].key);
    //        let count =0;
    //        for(let j=0;j<comkeys.length;j++){
    //           if(checkdata.indexOf(comkeys[j])>-1 && rowkeys.indexOf(comkeys[j])===-1){
    //             count+=1;
    //             rowkeys.push(comkeys[j]);
    //             selectRow.push(selectedRows[j]);
    //           }

    //        }
    //        if(count===0){
    //          checkMap.delete(datas[i].key);
    //        }

    //         if(count === childrendata.length && rowkeys.indexOf(datas[i].key)===-1 && comkeys.indexOf(datas[i].key)>-1){
    //           rowkeys.push(datas[i].key);
    //           selectRow.push(datas[i]);
    //         }

    //   }else if(JSON.stringify(comkeys).indexOf(datas[i].key)>-1){
    //     for(let z=0;z<comkeys.length;z++){
    //       if(comkeys[z].indexOf(datas[i].key)>-1&&rowkeys.indexOf(comkeys[z])===-1){

    //         rowkeys.push(comkeys[z]);
    //         selectRow.push(selectedRows[z]);
    //       }

    //    }
    //   }

    // }

    //   const parentArr =[];
    //  for(let i =0;i<comkeys.length;i++){
    //     if(comkeys[i].indexOf("-")===-1){
    //       parentArr.push(comkeys[i]);
    //     }else{
    //       const value = `${comkeys[i]}`.substring(0,comkeys[i].indexOf("-"));
    //       checkMap.set(value,comkeys[i]);
    //       rowkeys.push(comkeys[i]);
    //     }

    //   }

    //   for(let p =0;p<parentArr.length;p++){
    //     if(checkMap.has(parentArr[p])=== false){
    //       rowkeys = this.handelcheckall(datas,comkeys,rowkeys);
    //     }else{
    //       const checkData = checkMap.get(parentArr[p]);

    //     }

    //   }

    // for(let i =0;i<comkeys.length;i++){
    //   if(comkeys[i].indexOf("-")>-1){
    //     const value = `${comkeys[i]}`.substring(0,comkeys[i].indexOf("-"));

    //     if(checkMap.has(value)===true){
    //       checkMap.set(value,comkeys[i]);
    //     }

    //   }else{

    //       checkMap.set(comkeys[i]);

    //   }

    // }

    // for(let i =0;i<comkeys.length;i++){
    //   const value = `${comkeys[i]}`.substring(0,comkeys[i].indexOf("-"));
    //   if(comkeys[i].indexOf("-")>-1){
    //     // 里面有子类的数据
    //     rowkeys.push(value);
    //     rowkeys.push(comkeys[i]);

    //     nocheck.add(value);
    //   }
    // }

    // for(let z=0;z<datas.length;z++){// 勾选省，所属的市全选
    //   const childrendata = datas[z].children;

    //     if(checkMap.has(datas[z].key)=== true){
    //       const valueMap = checkMap.get(datas[z].key);
    //       if(valueMap !== undefined){
    //         valueMap.forEach((value,key,map)=>{
    //           rowkeys.push(value);
    //         })
    //       }else{
    //         for(let c=0;c<childrendata.length;c++){
    //           if( datas[z].key.indexOf("-")===-1 &&comkeys.indexOf(datas[z].key)>-1){
    //            rowkeys.push(datas[z].key);
    //            rowkeys.push(childrendata[c].key);
    //          }
    //         }
    //       }

    //     }

    // }

    this.setState({
      selectedRowKeys: rowkeys,
      selectedRows: selectRow,
    });
  };

  handelcheckall = (datas, comkeys, rowkeys) => {
    for (let z = 0; z < datas.length; z++) {
      // 勾选省，所属的市全选
      const childrendata = datas[z].children;
      for (let c = 0; c < childrendata.length; c++) {
        if (datas[z].key.indexOf('-') === -1 && comkeys.indexOf(datas[z].key) > -1) {
          rowkeys.push(datas[z].key);
          rowkeys.push(childrendata[c].key);
        }
      }
    }
    return rowkeys;
  };

  handleSelect = (record, a, b) => {
    // console.log()
  };

  gettosave = () => {
    const params = this.state.updateExpressCostParams
    if(params.expressid === undefined) {
      if(this.props.expressid) {
        params.expressid = this.props.expressid
      }
    }
    
    if(targetrow.codeC === undefined) {
      params.provincec = targetrow.codeP;
      if(targetrow.updateid !== undefined) {
        params.id = targetrow.updateid;
      }
      this.props.dispatch({
        type: 'express/savePrice',
        payload: params,
        callback: (res) => {
          if(res === 'ok') {
            message.success('保存成功！')
          }
        },
      })
      
      const childrenarr = targetrow.children;
      for(let d = 0; d < childrenarr.length; d++) {
        params.codec = childrenarr[d].codeC;
        params.provincec = childrenarr[d].codeP;
        if(childrenarr[d].updateid !== undefined) {
          params.id = childrenarr[d].updateid;
        }
        this.props.dispatch({
          type: 'express/savePrice',
          payload: params,
          callback: () => {
            this.updatedata()
          },
        })
      } 
    } else {
      params.codec = targetrow.codeC;
      params.provincec = targetrow.codeP;
      params.id = targetrow.updateid;
      this.props.dispatch({
        type: 'express/savePrice',
        payload: params,
        callback: (res) => {
          if(res === 'ok') {
            message.success('保存成功！')
          }
        },
      })
    }
  };

  updatedata = () => {
    const id = sessionStorage.getItem('expressid')
    const params = `terms[0].value=${id}&terms[0].column=expressid&paging=false`;
    this.props.dispatch({
      type: 'express/getLogisticsData',
      payload: params,
      callback: (res) => {
        this.setState({
          sourcedata: res,
        })
      },
    })
  }

  savePrice = () => {
    const interval = setInterval(() => {
      if(this.state.updateExpressCostParams !== undefined) {
        this.gettosave()
        clearInterval(interval)
      }
    }, 100)
    
  }

  getData = () => {
    const params = this.state.sourcedata;
    this.props.dispatch({
      type: 'express/getLogisticsData',
      payload: params,
      callback: (res) => {
        this.setState({
          sourcedata: res,
        })
      },
    })
  }

  updatesource = (value, fieldName, rec) => {
    if(rec.codeC === undefined) {
      const index = Number(rec.id) -1
      const val = this.state.sourcedata
      val[index][fieldName] = value
      this.setState({
        sourcedata: val,
      }, () => {
        this.getData()
      })
    } else {
      const data = this.state.sourcedata;
      for(let i = 0; i < data.length; i++) {
        if(data[i].codeP === rec.codeP){
          const childrendata = data[i].children;
          for(let p = 0; p < childrendata.length; p++) {
            if(childrendata[p].codeC === rec.codeC) {
              childrendata[p][fieldName] = value
            }
          }
        }
      }
      this.setState({
        sourcedata: data,
      }, () => {
        this.getData()
      })
    }
  }

  handlechange = (value, fieldName, rec) => {
    const newData = this.state.dataprovice.map(item => ({ ...item }));
    targetrow = this.getRowByKey(rec, newData);
    const tmp = this.state.updateExpressCostParams;
    //  暂时不用这个字段
    // if(fieldName === 'overload') {
    //   tmp.overweight = e.target.value
    // }
    if(rec.updateid !== undefined) {
      tmp.id = rec.updateid
    }

    tmp.expressid = this.props.expressid;
    tmp[fieldName] = value;
    tmp.supplyid = getSupplyId();
    this.setState({
      updateExpressCostParams: tmp,
    })
  };

  handleRightChange = (value, fieldName, rec) => {
    const intervalsource = setInterval(() => {
      if(this.state.sourcedata !== undefined) {
        this.updatesource(value, fieldName, rec)
        clearInterval(intervalsource)
      }
    })

    const interval = setInterval(() => {
      if(this.state.updateExpressCostParams !== undefined) {
        this.handlechange(value, fieldName, rec)
        clearInterval(interval)
      }
    }, 100)

  }
  selectRow = recode => {
  
    this.setState({
      selectedRows: recode,
    });
  };

  render() {
    const { selectedRows, selectedRowKeys } = this.state;

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.handleSelectRows,
      onSelect: this.handleSelect,
    };

    const BatchColumns = [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        render: (text, record) => {
          if(record.id){
            return record.id
          }
        },
      },
      {
        title: '省、市',
        dataIndex: 'name',
        key: 'name',
        align: 'left',
      },
      {
        title: '首重',
        dataIndex: 'baseweight',
        key: 'baseweight',
        align: 'center',
        render: (text, record) => {
          return (
            <InputNumber
              min={0.0}
              value={text}
              onChange={e => this.handleRightChange(e, 'baseweight', record)}
            />
          );
        },
      },
      {
        title: '首重金额',
        dataIndex: 'basepay',
        key: 'basepay',
        align: 'center',
        render: (text, record) => {
          return (
            <InputNumber
              min={0.0}
              value={text}
              onChange={e => this.handleRightChange(e, 'basepay', record)}
            />
          );
        },
      },
      // {
      //   title: '续重/(Kg) ',
      //   dataIndex: 'overload',
      //   key: 'overload',
      //   align: 'center',
      //   render: (text, record) => {
      //     return (
      //       <InputNumber
      //         min={0.0}
      //         value={text}
      //         onChange={e => this.handleRightChange(e, 'overload', record)}
      //       />
      //     );
      //   },
      // },
    ];

    return (
      <Fragment>
        {/* <Tooltip placement="top" title="请选择一家快递公司" visible={!this.props.expressid}>
          <Button
            type="primary"
            style={{ marginTop: 16, marginBottom: 8 }}
            onClick={this.savePrice}
            disabled={!this.props.expressid}
          >
            保存
          </Button>
        </Tooltip> */}
        
        <Table
          rowKey={(record) => {
            if(record.id) {
              return record.id
            } else if(record.cid) {
              return record.cid
            }
          }}
          title={() => `${this.state.companyName}`}
          loading={this.state.loading}
          columns={BatchColumns}
          // dataSource={this.props.expressdata ? this.props.expressdata : this.state.dataprovice}
          dataSource={this.state.sourcedata ? this.state.sourcedata : this.state.dataprovice}
          pagination={false}
          bordered
          // rowSelection={rowSelection}
          onRow={record => ({
            onClick: () => {
              this.selectRow(record);
            },
          })}
        />

        <FooterToolbar style={{ width: this.state.width }}>
          <Tooltip placement="top" title="请选择一家快递公司" visible={!this.props.expressid}>
            <Button
              type="primary"
              style={{ marginTop: 16, marginBottom: 8 }}
              onClick={this.savePrice}
              disabled={!this.props.expressid}
            >
              提交
            </Button>
          </Tooltip>
        </FooterToolbar>
      </Fragment>
    );
  }
}
