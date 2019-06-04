import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { Form,Tabs } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import UploadInventory from './UploadInventory';
import UploadInventoryNoCode from './UploadInventoryNoCode';

const TabPanes = Tabs.TabPane;



export default class UploadList extends PureComponent {


  state = {
    activeKey: "1",
    panes:[],
  }
  
  onChange = (activeKey) => {
   
    this.setState({activeKey });
   
  }
  
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
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
    this.setState({ panes, activeKey: activeKeys });
  };
  render() {
    
    const {panes} = this.state;
    const TabPaneList = panes;
   
    const panes1 = {
        title: '细码录入',
        content: (
          <div>
            <UploadInventory />
          </div>
        ),
        key: '1',
        closable: false,
      };
    const panes2 = {
        title: `无细码录入`,
        content: (
          <div>
            <UploadInventoryNoCode />
          </div>
        ),
        key: '2',
        closable: false,
      }; 
      if(TabPaneList.length === 0){
        TabPaneList.push(panes1);
      
        TabPaneList.push(panes2); 
      }

    return (
      <PageHeaderLayout title="库存导入">
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
