import React, { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import pathToRegexp from 'path-to-regexp';
import { Breadcrumb, Tabs } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import { urlToList } from '../_utils/pathTools';
import { connect } from 'dva';
import { Link, withRouter } from 'dva/router';

const { TabPane } = Tabs;
export function getBreadcrumb(breadcrumbNameMap, url) {
  let breadcrumb = breadcrumbNameMap[url];
  if (!breadcrumb) {
    Object.keys(breadcrumbNameMap).forEach(item => {
      if (pathToRegexp(item).test(url)) {
        breadcrumb = breadcrumbNameMap[item];
      }
    });
  }
  return breadcrumb || {};
}
class PageHeader extends React.PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    const panes = [{ title: '点我一下', content: 'Content of Tab Pane 1', key: '1' }];
    this.state = {
      breadcrumb: null,
      activeKey: "1",
      panes,
      mode: 'top',
      arr: [],
      shuaxin: 1,
    };
  }

  static contextTypes = {
    routes: PropTypes.array,
    params: PropTypes.object,
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  componentDidMount() {
    this.getBreadcrumbDom();
    this.setState({
      arr: this.props.arr,
    });
    // console.log(window.location.hash.slice(2))
    // console.log(this.props.arr)
    let currentPath = window.location.hash.slice(1);
    // console.log(currentPath);
    this.props.arr.map((item,index)=>{
      if(item.path == currentPath){
        this.setState({
          activeKey:item.key
        })
        // console.log(item.key)
      }
    })


  }
  componentWillReceiveProps() {
    this.getBreadcrumbDom();
    // ===========新增的代码================
  }
  // ============新增的代码================
  onChange = activeKey => {
    this.setState({ activeKey });
  };
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  remove = targetKey => {
    console.log(this.props.arr);
    // console.log(targetKey);
    this.props.arr.map((item, index) => {
      if (item.key == targetKey) {
        this.props.arr.splice(index, 1);
        this.setState({
          shuaxin: this.state.shuaxin + 1,
        });
      }
    });
  };
  //点击tabs跳转
  // tabsPathClick() {
  //   history.push("order/presale")
  // }
  // ==========分割线==================
  FonChange = key => {
    if (this.props.onTabChange) {
      this.props.onTabChange(key);
    }
  };
  getBreadcrumbProps = () => {
    return {
      routes: this.props.routes || this.context.routes,
      params: this.props.params || this.context.params,
      routerLocation: this.props.location || this.context.location,
      breadcrumbNameMap: this.props.breadcrumbNameMap || this.context.breadcrumbNameMap,
    };
  };
  getBreadcrumbDom = () => {
    const breadcrumb = this.conversionBreadcrumbList();
    this.setState({
      breadcrumb,
    });
  };
  // Generated according to props
  conversionFromProps = () => {
    const { breadcrumbList, breadcrumbSeparator, linkElement = 'a' } = this.props;
    return (
      <Breadcrumb className={styles.breadcrumb} separator={breadcrumbSeparator}>
        {breadcrumbList.map(item => (
          <Breadcrumb.Item key={item.title}>
            {item.href
              ? createElement(
                  linkElement,
                  {
                    [linkElement === 'a' ? 'href' : 'to']: item.href,
                  },
                  item.title
                )
              : item.title}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  };
  conversionFromLocation = (routerLocation, breadcrumbNameMap) => {
    const { breadcrumbSeparator, linkElement = 'a' } = this.props;
    // Convert the url to an array
    const pathSnippets = urlToList(routerLocation.pathname);
    // Loop data mosaic routing
    const extraBreadcrumbItems = pathSnippets.map((url, index) => {
      const currentBreadcrumb = getBreadcrumb(breadcrumbNameMap, url);
      const isLinkable = index !== pathSnippets.length - 1 && currentBreadcrumb.component;
      return currentBreadcrumb.name && !currentBreadcrumb.hideInBreadcrumb ? (
        <Breadcrumb.Item key={url}>
          {createElement(
            isLinkable ? linkElement : 'span',
            { [linkElement === 'a' ? 'href' : 'to']: url },
            currentBreadcrumb.name
          )}
        </Breadcrumb.Item>
      ) : null;
    });
    // Add home breadcrumbs to your head
    extraBreadcrumbItems.unshift(
      <Breadcrumb.Item key="home">
        {createElement(
          linkElement,
          {
            [linkElement === 'a' ? 'href' : 'to']: '/',
          },
          '首页'
        )}
      </Breadcrumb.Item>
    );
    return (
      <Breadcrumb className={styles.breadcrumb} separator={breadcrumbSeparator}>
        {extraBreadcrumbItems}
      </Breadcrumb>
    );
  };
  /**
   * 将参数转化为面包屑
   * Convert parameters into breadcrumbs
   */
  conversionBreadcrumbList = () => {
    const { breadcrumbList, breadcrumbSeparator } = this.props;
    const { routes, params, routerLocation, breadcrumbNameMap } = this.getBreadcrumbProps();
    if (breadcrumbList && breadcrumbList.length) {
      return this.conversionFromProps();
    }
    // 如果传入 routes 和 params 属性
    // If pass routes and params attributes
    if (routes && params) {
      return (
        <Breadcrumb
          className={styles.breadcrumb}
          routes={routes.filter(route => route.breadcrumbName)}
          params={params}
          itemRender={this.itemRender}
          separator={breadcrumbSeparator}
        />
      );
    }
    // 根据 location 生成 面包屑
    // Generate breadcrumbs based on location
    if (routerLocation && routerLocation.pathname) {
      return this.conversionFromLocation(routerLocation, breadcrumbNameMap);
    }
    return null;
  };
  // 渲染Breadcrumb 子节点
  // Render the Breadcrumb child node
  itemRender = (route, params, routes, paths) => {
    const { linkElement = 'a' } = this.props;
    const last = routes.indexOf(route) === routes.length - 1;
    return last || !route.component ? (
      <span>{route.breadcrumbName}</span>
    ) : (
      createElement(
        linkElement,
        {
          href: paths.join('/') || '/',
          to: paths.join('/') || '/',
        },
        route.breadcrumbName
      )
    );
  };

  render() {
    const {
      title,
      logo,
      action,
      content,
      extraContent,
      tabList,
      className,
      tabActiveKey,
      tabDefaultActiveKey,
      tabBarExtraContent,
    } = this.props;

    const clsString = classNames(styles.pageHeader, className);
    const activeKeyProps = {};
    if (tabDefaultActiveKey !== undefined) {
      activeKeyProps.defaultActiveKey = tabDefaultActiveKey;
    }
    if (tabActiveKey !== undefined) {
      activeKeyProps.activeKey = tabActiveKey;
    }

    return (
      <div className={clsString}>
        {this.state.breadcrumb}
        <div className={styles.detail}>
          {logo && <div className={styles.logo}>{logo}</div>}
          <div className={styles.main}>
            <div className={styles.row}>
              {(() => {
                if (this.props.arr.length >= 1) {
                  return (
                    <Tabs
                      hideAdd
                      onChange={this.onChange}
                      activeKey={this.state.activeKey}
                      type="editable-card"
                      onEdit={this.onEdit}
                    >
                      {this.state.arr.map(pane => <TabPane tab={<Link to={pane.path}>{pane.title}</Link>}  key={pane.key} />)}
                    </Tabs>
                  );
                } else if (this.props.arr.length < 1) {
                  return <h1 className={styles.title}>{title}</h1>;
                }
              })()}
              {action && <div className={styles.action}>{action}</div>}
            </div>
            <div className={styles.row}>
              {content && <div className={styles.content}>{content}</div>}
              {extraContent && <div className={styles.extraContent}>{extraContent}</div>}
            </div>
          </div>
        </div>
        {tabList &&
          tabList.length && (
            <Tabs
              className={styles.tabs}
              {...activeKeyProps}
              onChange={this.FonChange}
              tabBarExtraContent={tabBarExtraContent}
            >
              {tabList.map(item => <TabPane tab={item.tab} key={item.key} />)}
            </Tabs>
          )}
      </div>
    );
  }
}

export default connect(({ global }) => ({
  arr: global.MenuTabsArr,
}))(PageHeader);
