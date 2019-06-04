import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { Form,Tabs } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './SaleProfile.less';
import SaleProfileList from './SaleProfileList';
import SaleDetailProfile from './SaleDetailProfile';

const TabPanes = Tabs.TabPane;



export default class SaleList extends PureComponent {


  state = {
    activeKey: "1",
    detailid:'',
    panes:[],
    actionFlag:false,
  }
  
  onChange = (activeKey) => {
   
    this.setState({activeKey });
   
  }
  
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  
  onChildChanged=(e)=>{// 列表返回销售单id
      this.setState({
          detailid:e,
          activeKey:'2',
          actionFlag:false,
      })
  }
  remove = targetKey => {
    let activeKeys = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKeys === targetKey) {
      activeKeys = panes[lastIndex].key;
    }
    this.setState({ panes, activeKey: activeKeys,actionFlag:true });
  };
  render() {
    
    const {detailid,panes,actionFlag} = this.state;
    const TabPaneList = panes;
   
    const panes1 = {
        title: '销售单列表',
        content: (
          <div>
            <SaleProfileList  callbackParent={this.onChildChanged} />
          </div>
        ),
        key: '1',
        closable: false,
      };
    const panes2 = {
        title: `销售单详情`,
        content: (
          <div>
            <SaleDetailProfile detailid={detailid} />
          </div>
        ),
        key: '2',
      }; 
    if(TabPaneList.length===0){
        TabPaneList.push(panes1); 
    }
    if(detailid !== "" && TabPaneList.length ===1 && actionFlag=== false){

        TabPaneList.push(panes2); 
    }else if(TabPaneList.length ===2){

      TabPaneList[1] = panes2; 
    }
    return (
      <PageHeaderLayout title="销售单">
        <Tabs
          hideAdd
          onChange={this.onChange}
          activeKey={this.state.activeKey}
          type="editable-card"
          onEdit={this.onEdit}
        >
          {TabPaneList.map(pane => (
            <TabPanes tab={pane.title} key={pane.key} closable={pane.closable}>
              {pane.content}
            </TabPanes>
            ))}
        </Tabs>
      </PageHeaderLayout>
    );
  }
}
