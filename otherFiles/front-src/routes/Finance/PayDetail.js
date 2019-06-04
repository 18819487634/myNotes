import React, { PureComponent, Fragment } from 'react';
import { Route, Redirect, Switch } from 'dva/router';
import { connect } from 'dva';
import { Card, Steps } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import NotFound from '../Exception/404';
import { getRoutes } from '../../utils/utils';
import styles from './PayDetail.less';


const { Step } = Steps;
@connect() // 加这个是为了有dispatch 
export default class PayDetailForm extends PureComponent {
  getCurrentStep() {
    const { location} = this.props;
    
    const { pathname } = location;
    
    const pathList = pathname.split('/');
    switch (pathList[pathList.length - 1]) {
      case 'paydetailone':
        // 直接给state传递参数 ，路径就是type里面的
        
        // hashHistory.push({ pathname: '/a/b', state: {test:'ssss'}});  
        return 0;
      case 'paydetailtwo':
        return 1;
      default:
        return 0;
    }
  }
  render() {
    const { match, routerData,dispatch } = this.props;
    const urldata =this.props.location.state ;
    if(urldata!==undefined){
      dispatch({
        type: 'financepaydetail/saveStepFormData',
        payload: {
          address:urldata.address===undefined?"":urldata.address, // 收获地址 
          money:urldata.money , // 收货金额  
          preceiveid: urldata.preceiveid ,// 预收款ID 
          presaleid: urldata.presaleid, // 预销售单ID this.props.record.presaleid
          returnurl:urldata.returnurl,
          // clientid:urldata.clientid, // 客户信息
          clientid:'',
          paytype:urldata.paytype, // 付款方式
          contenttype:urldata.contenttype,// 付款内容
          clientname:urldata.clientname,
          comment:'',
          payaccountid:'',
          accountid:'',
          receiptno:'',
          addcomponent:'',// 进入之前把reducer的数据清理。

        },
        // payload: {
        //   address:'test', // 收获地址 
        //   money:100 , // 收货金额  
        //   preceiveid:'1341',// 预收款ID 
        //   presaleid: '', // 预销售单ID this.props.record.presaleid
        //   closeWindow:()=>{console.log("调用了");},
        // },
      });
     //  console.log("address:"+urldata.address+",money:"+urldata.money+",presaleid:"+urldata.presaleid);
    }
    
   
   

    // 当每次调用都要render ，所以这里就传递进来就可以了
    
    return (
      <PageHeaderLayout
        title="收银台"
      >
        <Card bordered={false}>
          <Fragment>
            <Steps current={this.getCurrentStep()} className={styles.steps}>
              <Step title="请选择付款方式" />
              <Step title="完善付款信息" />
            </Steps>
            <Switch>
              {getRoutes(match.path, routerData).map(item => (
                <Route
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                />
              ))}
              <Redirect exact from="/finance/paydetail" to="/finance/paydetail/paydetailone" />
              <Route render={NotFound} />
            </Switch>
          </Fragment>
        </Card>
      </PageHeaderLayout>
    );
  }
}
