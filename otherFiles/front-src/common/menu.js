import { isUrl } from '../utils/utils';

const menuData = [
  // {
  //   name: '异常页',
  //   icon: 'warning',
  //   path: 'exception',
  //   authority: '',
  //   children: [
  //     {
  //       name: '403',
  //       path: '403',
  //     },
  //     {
  //       name: '404',
  //       path: '404',
  //     },
  //     {
  //       name: '500',
  //       path: '500',
  //     },
  //     {
  //       name: '触发异常',
  //       path: 'trigger',
  //       hideInMenu: true,
  //     },
  //   ],
  // },
  {
    name: '账户',
    icon: 'user',
    path: 'user',
    authority: 'guest',
    children: [
      {
        name: '登录',
        path: 'login',
      },
      {
        name: '注册',
        path: 'register',
      },
      {
        name: '注册结果',
        path: 'register-result',
      },
    ],
  },
  // {
  //   name: '基础数据',
  //   icon: 'list',
  //   path: 'dictionary',
  //   authority: 'dictionary',
  //   children: [
  //     {
  //       name: '数据字典',
  //       path: 'dictionary',
  //     },

  //   ],
  // },
  {
    name: '基础数据',
    icon: 'database',
    path: 'basic',

    children: [
      {
        name: '快递',
        authority: 'express',
        path: 'express',
      },
      {
        name: '物流',
        authority: 'logistics',
        path: 'logistics',
      },
      {
        name: '保险',
        authority: 'insurance',
        path: 'insurance',
      },
      {
        name: '数据字典',
        authority: 'supplydictionry',
        path: 'dictionry',
      },
      {
        name: '仓库管理',
        authority: 'userlocation',
        path: 'userlocation',
      },
      {
        name: '仓库区域',
        authority: 'supplydictionry',
        path: 'arealocation',
      },
      {
        name: '送货方式',
        authority: 'deliveryway',
        path: 'takeway',
      },
      {
        name: '拣货时间管理',
        authority: 'picktimesetting',
        path: 'picktimesetting',
      },
      {
        name: '拣货设置',
        authority: 'picktimesetting',
        path: 'pickingsetting',
      },
      // {
      //   name: '板毛仓库',
      //   authority: 'picktimesettings',
      //   path: 'samplelibrary',
      // },
     
    ],
  },
  {
    name: '订单管理',
    icon: 'bars',
    path: 'order',
    authority: 'erpclient',
    children: [
      {
        name: '快速接单',
        path: 'inquiryfast',
        authority: 'presale',
      },
      // {
      //   name: '新询价单',
      //   path: 'inquirybatchno',
      // },
      {
        authority: 'presale',
        name: '预售单',
        path: 'presale',
      },

      {
        authority: 'presalespecial',
        name: '欠货单',
        path: 'chase',
      },
      {
        authority: 'prereceive',
        name: '预订货款',
        path: 'prereceive',
      },
      {
        authority: 'pickup',
        name: '拣货单队列',
        path: 'pickup',
      },
      {
        authority: 'pickup',
        name: '大货拣货单',
        path: 'biggoods',
      },
      {
        authority: 'sale',
        name: '销售单',
        path: 'sale',
      },
      {
        authority: 'sale',
        name: '出库单',
        path: 'deliver',
      },
      {
        authority: 'offlinepurchase',
        name: '线下调货',
        path: 'offlinepurchase',
      },
      {
        authority: 'offlinepurchase',
        name: '线下调货列表',
        path: 'offlinepurchaseList',
      },
      // {
      //   authority: 'paydetail',
      //   name: '待收款(旧)',
      //   path: 'nopayment',
      // },
      {
        authority: 'paydetail',
        name: '待收款',
        path: 'newnopayment',
      },
      {
        name: '收款记录',
        authority: 'paydetail',
        path: 'receiptrecord',
      },
    ],
  },
  // {
  //   name: '库存管理',
  //   icon: 'list',
  //   path: 'input',
  //   authority: 'inquiry',
  //   children: [
  //     {
  //       name: '手动入库',
  //       path: 'manualinput',
  //     },

  //   ],
  // },
  {
    name: '色卡管理',
    icon: 'appstore',
    path: 'color',
    authority: 'productall',
    children: [
      {
        name: '色卡建档',
        path: 'input',
      },
      {
        name: '产品类别',
        path: 'kind',
      },
      {
        name: '色卡显示',
        icon: 'table',
        path: 'show',
        authority: 'productall',
        children: [
          // {
          //   name: '图标/视图格式',
          //   path: 'mycolor',

          // },
          {
            name: '产品发布',
            path: 'search',
          },
          // {
          //   name: '色卡实物册',
          //   path: 'colorbook',
          // },
        ],
      },
    ],
  },
  {
    name: '供应商客户管理',
    icon: 'inbox',
    path: 'supply',
    authority: '',
    children: [
      {
        name: '我的供应商',
        authority: 'supply',
        path: 'supply',
      },
      {
        name: '我的客户',
        authority: 'supply',
        path: 'customer',
      },
      {
        name: '非平台客户', 
        authority: 'erpclient',
        path: 'erpcustomer',
      },
      {
        name: '非平台供应商',
        authority: 'erpclient',
        path: 'erpsupply',
      },
      {
        name: '个人中心',
        authority: 'nanxin-autz-setting',
        path: 'company',
      },
    ],
  },
  {
    name: '库存管理',
    icon: 'gift',
    path: 'goods',
    authority: 'gooddetail',
    children: [
      {
        name: '大货库存',
        path: 'goodsstock',
      },
      { 
              name: '直接入库',
              path: 'directinput',
      },
      {
        name: '导入库存',
        path: 'uploadInventory',
      },
      // {
      //   name: '导入库存',
      //   path: 'uploadInventorynocode',
      // },
    ],
  },
  {
    name: '财务管理',
    icon: 'pay-circle',
    path: 'finance',
    authority: '',
    children: [
      {
        name: '收款账户',
        authority: 'accountnumber',
        path: 'accountnumber',
      },
      // {
      //   name: '收款',
      //   authority: 'accountnumber',
      //   path: 'cashier',
      // },
      {
        name: '审核',
        authority: '',
        path: 'auditing',
        children: [
          {
            name: '收款审核',
            authority: 'accountnumber',
            path: 'paydetaillist',
          },
          {
            name: '现金交结',
            authority: 'accountnumber',
            path: 'cashdelivery',
          },
        ],
      },
      {
        name: '收银列表',
        authority: 'accountnumber',
        path: 'cashier',
      },
      {
        name: '收银记录',
        authority: 'accountnumber',
        path: 'cashrecord',
      },
    ],
  },
  {
    name: '报表管理',
    icon: 'hdd',
    path: 'statement',
    authority: 'nanxinreport',
    children: [
      {
        name: '产品销售汇总表',
        authority: '',
        path: 'productSalesList',
      },
      {
        name: '业务统计表',
        authority: '',
        path: 'businessStatistics',
      },
      {
        name: '客户出货明细表',
        authority: '',
        path: 'clientDispatchDetail',
      },
    ],
  },
  // {
  //   name: '分布表单',
  //   icon: 'pay-circle',
  //   path: 'form',
  //   authority: '',
  //   children: [
  //     {
  //       name: '分布表单',
  //       authority: 'accountnumber',
  //       path: 'step-form',
  //     },
  //   ],
  // },
  {
    name: '权限管理',
    icon: 'list',
    path: 'authorizemenu',
    authority: 'user',
    children: [
      {
        name: '授权',
        path: 'authorizemenu',
      },
    ],
  },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
