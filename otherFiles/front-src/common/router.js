import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      // 这里是个component ，那么这里 可以 通过reducer进行获取。linjiefeng
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

/**
 *
 *dynamicWrapper 第二个是model数组，表示需要用到的models
 */
export const getRouterData = app => {
  const routerConfig = {
    '/color/show/search': {
      component: dynamicWrapper(app, ['color'], () => import('../routes/Color/ColorProfile')),
    },
    '/color/input': {
      component: dynamicWrapper(app, ['color'], () => import('../routes/Color/ColorInputProfile')),
    },
    '/color/kind': {
      component: dynamicWrapper(app, ['color'], () => import('../routes/Color/ColorKindProfile')),
    },
    '/color/show/mycolor': {
      component: dynamicWrapper(app, ['mycolor'], () => import('../routes/Color/MyColorProfile')),
    },
    '/color/show/colorbook': {
      component: dynamicWrapper(app, ['colorbook'], () => import('../routes/Colorbook/Colorbook')),
    },
    '/supply/supply': {
      component: dynamicWrapper(app, ['supply'], () => import('../routes/Supply/SupplyProfile')),
    },
    '/supply/customer': {
      component: dynamicWrapper(app, ['supply'], () =>
        import('../routes/Customer/CustomerProfile')
      ),
    },
    '/supply/erpcustomer': {
      component: dynamicWrapper(app, ['erpclient'], () =>
        import('../routes/Customer/ErpCustomerProfile')
      ),
    },
    '/supply/erpsupply': {
      component: dynamicWrapper(app, ['supply'], () => import('../routes/Supply/ErpSupplyProfile')),
    },
    '/supply/company': {
      component: dynamicWrapper(app, ['company'], () => import('../routes/Company/CompanyDetail')),
    },
    '/authorizemenu/authorizemenu': {
      component: dynamicWrapper(app, ['authorizemenu', 'mymenu'], () =>
        import('../routes/Authoritymenu/Authoritymenu')
      ),
    },
    // '/dictionary/dictionary': {
    //   component: dynamicWrapper(app, ['dictionary'], () => import('../routes/Dictionary/DictionaryProfile')),
    // },
    '/order/inquirybatchno': {
      component: dynamicWrapper(app, ['inquiry'], () => import('../routes/Inquiry/InquiryProfile')),
    },
    '/order/inquiryfast': {
      component: dynamicWrapper(app, ['inquiry'], () => import('../routes/Inquiry/InquiryFast')),
    },
    '/goods/directinput': {
      component: dynamicWrapper(app, ['goods'], () => import('../routes/Input/DirectInputProfile')),
    },
    '/goods/uploadInventory': {
      component: dynamicWrapper(app, ['goods'], () => import('../routes/Input/UploadList')),
    },
    '/goods/uploadInventorynocode': {
      component: dynamicWrapper(app, ['goods'], () => import('../routes/Input/UploadInventoryNoCode')),
    },
    '/order/presale': {
      component: dynamicWrapper(app, ['presale'], () => import('../routes/Presale/PresaleProfile')),
    },
    '/order/own': {
      component: dynamicWrapper(app, ['presalespecial'], () => import('../routes/Own/OwnProfile')),
    },
    '/order/chase': {
      component: dynamicWrapper(app, ['presalespecial'], () =>
        import('../routes/Chase/ChaseProfile')
      ),
    },
    '/order/prereceive': {
      component: dynamicWrapper(app, [], () => import('../routes/Prereceive/PrereceiveProfile')),
    },
    '/order/pickup': {
      component: dynamicWrapper(app, ['inquiry'], () => import('../routes/Pickup/PickUpProfile')),
    },
    '/order/biggoods': {
      component: dynamicWrapper(app, ['pickup'], () => import('../routes/Pickup/BigGoodsProfile')),
    },
    '/order/sales': {
      component: dynamicWrapper(app, ['sale'], () => import('../routes/Sale/SaleProfile')),
    },
    '/order/sale': {
      component: dynamicWrapper(app, ['sale'], () => import('../routes/Sale/SaleList')),
    },
    '/order/deliver': {
      component: dynamicWrapper(app, ['sale'], () => import('../routes/Deliver/DeliverProfile')),
    },
    '/order/delivers': {
      component: dynamicWrapper(app, ['delivery'], () => import('../routes/Deliver/DeliverList')),
    },
    '/order/offlinepurchase': {
      component: dynamicWrapper(app, ['offlinepurchase'], () =>
        import('../routes/OfflinePurchase/OfflinePurchaseProfile')
      ),
    },
    '/order/offlinepurchaseList': {
      component: dynamicWrapper(app, ['offlinepurchase'], () =>
        import('../routes/OfflinePurchase/OfflinePurchaseList')
      ),
    },
    '/order/nopayment': {
      component: dynamicWrapper(app, ['paydetail'], () =>
        import('../routes/WaitPayment/WaitPaymentProfile')
      ),
    },
    '/order/newnopayment': {
      component: dynamicWrapper(app, ['waitpaymentprofile', 'receiptrecord', 'splitorder'], () =>
        import('../routes/WaitPayment/NewWaitPaymentProfile')
      ),
    },
    '/order/printing': {
      component: dynamicWrapper(app, ['paydetail'], () => import('../routes/Sale/PrintingTable')),
    },
    '/order/receiptrecord': {
      component: dynamicWrapper(app, ['receiptrecord'], () => import('../routes/Record/ReceiptRecord')),
    },

    '/goods/goodsstock': {
      component: dynamicWrapper(app, ['goods'], () =>
        import('../routes/GoodsStock/GoodsStockProfile')
      ),
    },
    '/basic/express': {
      component: dynamicWrapper(app, ['express'], () => import('../routes/Express/ExpressProfile')),
    },
    '/basic/logistics': {
      component: dynamicWrapper(app, ['express'], () =>
        import('../routes/Logistics/LogisticsProfile')
      ),
    },
    '/basic/insurance': {
      component: dynamicWrapper(app, ['express'], () =>
        import('../routes/Insurance/InsuranceProfile')
      ),
    },
    '/basic/dictionry': {
      component: dynamicWrapper(app, ['supplydictionry'], () =>
        import('../routes/SupplyDictionry/SupplyDictionryProfile')
      ),
    },
    '/basic/userlocation': {
      component: dynamicWrapper(app, ['userlocation'], () =>
        import('../routes/UserLocation/UserLocationProfile')
      ),
    },
    '/basic/arealocation': {
      component: dynamicWrapper(app, ['supplydictionry'], () =>
        import('../routes/AreaLocation/AreaLocationProfile')
      ),
    },
    '/basic/takeway': {
      component: dynamicWrapper(app, ['deliveryway'], () =>
        import('../routes/TakeWay/TakeWayProfile')
      ),
    },
    '/basic/picktimesetting': {
      component: dynamicWrapper(app, ['pickupsetting'], () =>
        import('../routes/PicktimeSetting/PicktimeSettingProfile')
      ),
    },
    '/basic/pickingsetting': {
      component: dynamicWrapper(app, ['pickingsetting'], () =>
        import('../routes/PickingSetting/PickingSettingProfile')
      ),
    },
    // '/basic/samplelibrary': {
    //   component: dynamicWrapper(app, ['samplelibrary'], () =>
    //     import('../routes/SampleLibrary/SampleLibrary')
    //   ),
    // },
   

    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    // '/dashboard/analysis': {
    //   component: dynamicWrapper(app, ['chart'], () => import('../routes/Dashboard/Analysis')),
    // },
    // '/dashboard/monitor': {
    //   component: dynamicWrapper(app, ['monitor'], () => import('../routes/Dashboard/Monitor')),
    // },
    // '/dashboard/workplace': {
    //   component: dynamicWrapper(app, ['project', 'activities', 'chart'], () =>
    //     import('../routes/Dashboard/Workplace')
    //   ),
    // },

    // '/form/basic-form': {
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/BasicForm')),
    // },
    '/form/step-form': {
      component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm')),
    },
    '/form/step-form/info': {
      name: '分步表单（填写转账信息）',
      component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step1')),
    },
    '/form/step-form/confirm': {
      name: '分步表单（确认转账信息）',
      component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step2')),
    },
    // '/form/step-form/result': {
    //   name: '分步表单（完成）',
    //   component: dynamicWrapper(app, ['accountnumber'], () => import('../routes/Forms/StepForm/Step3')),
    // },
    // '/form/advanced-form': {
    //   component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/AdvancedForm')),
    // },
    // '/list/table-list': {
    //   component: dynamicWrapper(app, ['rule'], () => import('../routes/List/TableList')),
    // },
    // '/list/basic-list': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/BasicList')),
    // },
    // '/list/card-list': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/CardList')),
    // },
    // '/list/search': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/List')),
    // },
    // '/list/search/projects': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Projects')),
    // },
    // '/list/search/applications': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Applications')),
    // },
    // '/list/search/articles': {
    //   component: dynamicWrapper(app, ['list'], () => import('../routes/List/Articles')),
    // },
    // '/profile/basic': {
    //   component: dynamicWrapper(app, ['profile'], () => import('../routes/Profile/BasicProfile')),
    // },
    // '/profile/advanced': {
    //   component: dynamicWrapper(app, ['profile'], () =>
    //     import('../routes/Profile/AdvancedProfile')
    //   ),
    // },
    '/result/success': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Success')),
    },
    '/result/fail': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Error')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () =>
        import('../routes/Exception/triggerException')
      ),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    '/user/register': {
      component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
    },
    '/user/users': {
      component: dynamicWrapper(app, ['company'], () => import('../routes/Company/UpdatePwd')),
    },
    '/user/company': {
      component: dynamicWrapper(app, ['company'], () => import('../routes/Company/Company')),
    },

    '/user/register-result': {
      component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
    },

    '/finance/accountnumber': {
      component: dynamicWrapper(app, ['accountnumber'], () => import('../routes/Finance/AccountTab')),
    },
    '/finance/auditing/paydetaillist': {
      component: dynamicWrapper(app, ['financepaydetail'], () => import('../routes/Finance/PayDetailList')),
    },
    '/finance/auditing/cashdelivery': {
      component: dynamicWrapper(app, ['financepaydetail'], () => import('../routes/Finance/CashDelivery')),
    },
    '/finance/paydetail': {
      component: dynamicWrapper(app, ['financepaydetail'], () => import('../routes/Finance/PayDetail')),
    },
    '/finance/paydetail/paydetailone': {
      component: dynamicWrapper(app, ['financepaydetail'], () => import('../routes/Finance/PayDetailOne')),
    },
    '/finance/paydetail/paydetailtwo': {
      component: dynamicWrapper(app, ['financepaydetail'], () => import('../routes/Finance/PayDetailTwo')),
    },
    '/finance/cashier': {
      component: dynamicWrapper(app, ['cashier'], () => import('../routes/Finance/Cashier')),
    },
    '/finance/cashrecord': {
      component: dynamicWrapper(app, ['cashrecord'], () => import('../routes/Record/CashRecord')),
    },
    '/statement/productSalesList': {
      component: dynamicWrapper(app, ['statements'], () => import('../routes/Statement/ProductSalesList')),
    },
    '/statement/businessStatistics': {
      component: dynamicWrapper(app, ['statements'], () => import('../routes/Statement/BusinessStatistics')),
    },
    '/statement/clientDispatchDetail': {
      component: dynamicWrapper(app, ['statements'], () => import('../routes/Statement/ClientDispatchDetail')),
    },
    

    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
