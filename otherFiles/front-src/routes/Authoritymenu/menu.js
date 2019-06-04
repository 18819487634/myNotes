import React from 'react';
import { connect } from 'dva';

import { Tree } from 'antd';

const { TreeNode } = Tree;
@connect(({ mymenu, loading }) => ({
  mymenu,
  loading: loading.models.mymenu,
}))
export default class MenuTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedKeys: ['-1'],
    };
    const { getInstance } = props;
    if (typeof getInstance === 'function') {
      getInstance(this); // 在这里把this暴露给`parentComponent`
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'mymenu/fetchAuthorizeMenu',
    });
  }

  onCheck = checkedKeys1 => {
    this.setState({
      checkedKeys: checkedKeys1,
    });
  };

  onSelect = (selectedKeys, info) => {};
  onClick = (e, node) => {
    e.preventDefault();
  
  };
  //
  getCheckedNodes = () => {
    return this.state.checkedKeys;
  };

  renderTreeNodes = data => {
    const v = true;
    if (data === null) return <TreeNode expanded={v} title="菜单" key="-1:" />;
    if (data && data.children) {
      const ds = [];
      data.children.forEach(d => {
        ds.push(this.renderTreeNodes(d));
      });
      return (
        <TreeNode
          title={data.name}
          expanded={v}
          pos={`${data.permissionId ? data.permissionId : ''}`}
          key={`${data.id}`}
        >
          {[...ds]}
        </TreeNode>
      );
    } else {
      return (
        <TreeNode
          title={data.name}
          expanded={v}
          pos={`${data.permissionId ? data.permissionId : ''}`}
          key={`${data.id}`}
        />
      );
    }
  };

  renderActionTree = (action, p) => {
    return action.map(ac => {
      return <TreeNode title={`${p.name}-${ac.describe}`} key={`${p.id}~${ac.action}`} />;
    });
  };

  renderTreeNodesWithList = data => {
    if (data === undefined || data == null) {
      return <TreeNode title="菜单" />;
    }
    const psdata = Array.from(data);
    return psdata.map(item => {
      if (item.actions && item.actions.length > 0) {
        return (
          <TreeNode title={item.name} key={item.id}>
            {this.renderActionTree(item.actions, item)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.name} key={item.id} />;
    });
  };

  render() {
    const { mymenu, mySelectedKeys } = this.props;

    let tempchecked = [];
    if (this.tempTreeData !== JSON.stringify(mySelectedKeys)) {
      tempchecked = mySelectedKeys;
      this.tempTreeData = JSON.stringify(mySelectedKeys);
    } else if (JSON.stringify(this.state.checkedKeys) !== JSON.stringify(mySelectedKeys)) {
      tempchecked = this.state.checkedKeys;
    }

    let mydata = null;
    if (mymenu) {
      const { data } = mymenu;
      mydata = data;
    }
    const expandAllState = true;
    return (
      <Tree
        checkable
        defaultExpandAll={expandAllState}
        onCheck={this.onCheck}
        checkedKeys={tempchecked}
        selectedKeys={tempchecked}
      >
        {this.renderTreeNodesWithList(mydata)}
      </Tree>
    );
  }
}
