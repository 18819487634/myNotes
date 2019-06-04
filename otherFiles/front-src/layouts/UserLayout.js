import React, { Fragment } from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
import moment from 'moment';
import DocumentTitle from 'react-document-title';
import { Icon } from 'antd';
import GlobalFooter from '../components/GlobalFooter';
import styles from './UserLayout.less';
import logo from '../assets/logo.svg';
import { getRoutes } from '../utils/utils';

const links = [
  {
    key: 'help',
    title: '帮助',
    href: '',
  },
  {
    key: 'privacy',
    title: '隐私',
    href: '',
  },
  {
    key: 'terms',
    title: '条款',
    href: '',
  },
];
const year = moment().format('YYYY');
const copyright = (
  <Fragment>
    Copyright <Icon type="copyright" /> {year} 信惠通<br />
    <a
      href="http://www.miitbeian.gov.cn/"
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#848587d4' }}
    >
      粤ICP备18145383号
    </a>
  </Fragment>
);

class UserLayout extends React.PureComponent {
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'Nan xin';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - Nan xin`;
    }
    return title;
  }
  render() {
    const { routerData, match } = this.props;
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src={logo} />
                  <span className={styles.title}>信惠通ERP</span>
                </Link>
              </div>
              <div className={styles.desc}>毛行版</div>
            </div>
            <Switch>
              {getRoutes(match.path, routerData).map(item => (
                <Route
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                />
              ))}
              <Redirect exact from="/user" to="/user/login" />
            </Switch>
          </div>
          <GlobalFooter links={links} copyright={copyright} />
        </div>
      </DocumentTitle>
    );
  }
}

export default UserLayout;
