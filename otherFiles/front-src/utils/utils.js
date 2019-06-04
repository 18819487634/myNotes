import moment from 'moment';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getUploadStaticUrl(){
  const  domain = window.location.host;
  return `http://${domain}/file/upload-static`;
}
export function getUploadUrl(){
  const  domain = window.location.host;
  return `http://${domain}/file/upload`;
}

export function queryLoadgoodLocation(){
  const  domain = window.location.host;
  return `http://${domain}/api/gooddetail/uploadgooddetail`;
}


export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}
export function treeConvertList(root) {
  const list = [];
  if (root) {
    const Root = JSON.parse(JSON.stringify(root));
    const queue = [];
    queue.push(Root);
    while (queue.length) {
      const node = queue.shift();
      if (node.children && node.children.length) {
        queue.push(...node.children);
      }
      delete node.children;
      if (node.parentId !== null && node.parentId !== undefined ) {
        list.push(node);
      }
    }
  }
  return list;
}
export function listConvertTree(list) {
  let root = null;
  if (list && list.length) {
    root = { id: -1, parentId: null,title:'菜单', children: [] };
    const group = {};
    for (let index = 0; index < list.length; index += 1) {
      if (list[index].parentId !== null && list[index].parentId !== undefined ) {
        if (!group[list[index].parentId]) {
          group[list[index].parentId] = [];
        }
        group[list[index].parentId].push(list[index]);
      }
    }
    const queue = [];
    queue.push(root);
    while (queue.length) {
      const node = queue.shift();
      node.children = group[node.id] && group[node.id].length ? group[node.id] : null;
      if (node.children) {
        queue.push(...node.children);
      }
    }
  }
  return root;
}

export function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * 10 ** index) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整');
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    // 是否包含
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;

export function isUrl(path) {
  return reg.test(path);
}


// 这些函数要做成公用的组件，不要写在这里，否则不好维护
export function toDecimal(x) {
  let f = parseFloat(x);
  if (isNaN(f)) {
      return;
  }
  f = Math.round(x*100)/100;
  return f;
}
export function toDecimal5(x) {
  let f = parseFloat(x);
  if (isNaN(f)) {
      return;
  }
  f = Math.round(x*100000)/100000;
  return f;
}

export function hex2rgb(hex){
  return `${parseInt(hex.substring(0,2),16)},${parseInt(hex.substring(2,4),16)},${parseInt(hex.substring(4,6),16)}`;
}

export function getLrv(lab){
  return Math.round(100 *(((lab.l + 16) / 116)**3));
}

export function lab2rgb(lab){
  const Xn = 95.04;
  const Yn = 100;
  const Zn = 108.89;

  const {l,a,b} = lab;
 

  const fy = toDecimal((l + 16) / 116);
  const fx = toDecimal((a/500) + fy);
  const fz = toDecimal(fy - (b / 200));

  let X = null;
  let Y = null;
  let Z = null;

  if (fx > 0.2069) {
      X = toDecimal(Xn * (fx**3));
  } else {
      X = toDecimal(Xn * (fx - 0.1379) * 0.1284);
  }

  if ((fy > 0.2069) || (l > 8)) {
      Y = toDecimal(Yn * (fy**3));
  } else {
      Y = toDecimal(Yn * (fy - 0.1379) * 0.1284);
  }

  if (fz > 0.2069) {
      Z = toDecimal(Zn * (fz**3));
  } else {
      Z = toDecimal(Zn * (fz - 0.1379) * 0.1284);
  }
  let dr = toDecimal5(0.032406 * X - 0.015371 * Y - 0.0049895 * Z);
  let dg = toDecimal5(-0.0096891 * X + 0.018757 * Y + 0.00041914 * Z);
  let db = toDecimal5(0.00055708 * X - 0.0020401 * Y + 0.01057 * Z);

  if (dr <= 0.00313) {
      dr = toDecimal5(dr * 12.92);
  } else {
      dr = toDecimal5(Math.exp(Math.log(dr) / 2.4) * 1.055 - 0.055);
  }

  if (dg <= 0.00313) {
      dg = toDecimal5(dg * 12.92);
  } else {
      dg = toDecimal5(Math.exp(Math.log(dg) / 2.4) * 1.055 - 0.055);
  }

  if (db <= 0.00313) {
      db = toDecimal5(db * 12.92);
  } else {
      db = toDecimal5(Math.exp(Math.log(db) / 2.4) * 1.055 - 0.055);
  }

  dr = Math.round(dr * 255);
  dg = Math.round(dg * 255);
  db = Math.round(db * 255);

  dr = Math.min(255, dr);
  dg = Math.min(255, dg);
  db = Math.min(255, db);

  const sRGB0 = Math.round(dr + 0.5);
  const sRGB1 = Math.round(dg + 0.5);
  const sRGB2 = Math.round(db + 0.5);

  return ((sRGB0 << 16) | (sRGB1 << 8) | sRGB2).toString(16);
}

export function termsIn(parmasList,column){
  let parmas ="";
  parmasList.forEach(i=>{
    if(parmasList.szie===0){
      parmas += `terms[0].value=${i}`;
    }else{
      parmas += `terms[0].value=${i}&`;
    }
  });
   return `${parmas}terms[0].termType=in&terms[0].column=${column}`;
  
}


export function getMyDate(str){
  if(str === null || str === undefined){
    return null;
  }
  const oDate = new Date(str);
  const oYear = oDate.getFullYear();
  const oMonth = oDate.getMonth()+1;
  const oDay = oDate.getDate();
  const oHour = oDate.getHours();
  const oMin = oDate.getMinutes();
  const oSen = oDate.getSeconds();
  const oTime = `${oYear}-${getzf(oMonth)}-${getzf(oDay)} ${getzf(oHour)}:${getzf(oMin)}:${getzf(oSen)}`;// 最后拼接时间
  return oTime;
};
export function getMyDateNoHMS(str){
  if(str === null || str === undefined){
    return null;
  }
  const oDate = new Date(str);
  const oYear = oDate.getFullYear();
  const oMonth = oDate.getMonth()+1;
  const oDay = oDate.getDate();
  const oTime = `${oYear}-${getzf(oMonth)}-${getzf(oDay)}`;// 最后拼接时间
  return oTime;
};
// 补0操作
function getzf(num){
  let nums = num;
  if(Number(nums) < 10){
    nums = `0${nums}`; 
  }
  return nums;
}
// trackid查询
export const trackiList =["","询价单","现货预售单","欠货单","追染单","拣货单生成","拣货单开始","拣货单完成","拣货单异常","出货单生成","销售单生成","拣货费付款","现货费预付款",
"（欠货或追染）货费付款 定金","销售单付款","拣货单开始","出库单完成"];

export const DictionaryTypeEnum=[
  {key:"异常原因",value:"1"},
  {key:"仓库信息",value:"3"},
  {key:"拣货总数量",value:"4"},
  {key:"拣货总重量",value:"5"},
  {key:"拣货偏差量",value:"6"},
  {key:"流程类型",value:"7"},
  {key:"审核是否需要扫码",value:"8"},
  {key:"除桶数",value:"12"},
]

export const DictionaryType =["异常原因","位置信息","区域类型","拣货总数量","拣货总重量","拣货偏差量","流程类型","审核是否需要扫码"];

export function  createTerms(obj,pageIndex=1,pageSize=12){
  let i =0;
  let params = `pageIndex=${pageIndex}&pageSize=${pageSize}`;
  Object.keys(obj).forEach((key)=>{
      params += `&terms[${i}].value=${obj[key]}&terms[${i}].column=${key}`;
      i+=1; 
  });
  
  return params;
  
}
export function ArrayRepeat(arryList){// 数组判断重复，返回重复的值
   const b =arryList;
   let temp = ""; 
   for (let i = 0; i < b.length- 1; i++){
       temp = b[i];
       for (let j = i + 1; j < b.length; j++) {
          if (temp ===b[j]){ 
                    return temp;
                  }
            }
        }
    return "";


}
export const recordstatusList = ["正常","加急","现场"];
export const creditList = ["优","良","中","差"];
export const paywayList = ['在线支付', '货到付款', '物流代收', '现场支付'];
export const ismergeList =["正常","加急","现场"];
export const everlastpaywayList =["全款","月结","预收"];
export const takewayList = ["自提","快递","物流","送货上门"];
export const changTypeEnum=[
  {key:"客户",value:"0"},
  {key:"仓库",value:"1"},
  {key:"业务员",value:"2"},
]


export const takeWayEnum=[
  {key:"自提",value:0},
  {key:"快递",value:1},
  {key:"物流",value:2},
  {key:"送货上门",value:3},
]

export const payWayEnum=[
  {key:"在线支付",value:0},
  {key:"货到付款",value:1},
  {key:"物流代收",value:2},
  {key:"现场支付",value:3},
]


export const everyLastPayEnum=[
  {key:"全款",value:0},
  {key:"月结",value:1},
  {key:"预收",value:2},
]

export const trackEnum=[
  {key:"询价单",value:1},
  {key:"现货预售单",value:2},
  {key:"欠货单",value:3},
  {key:"追染单",value:4},
  {key:"拣货单生成",value:5},
  {key:"拣货单开始",value:6},
  {key:"拣货单开始",value:15},
  {key:"拣货单完成",value:7},
  {key:"拣货单异常",value:8},
  {key:"出货单生成",value:9},
  {key:"拣货费付款",value:11},
  {key:"现货费预付款",value:12},
  {key:"（欠货或追染）货费付款 定金",value:13},
  {key:"销售单付款",value:14},
  {key:"销售单生成",value:10},
  {key:"出库单完成",value:16},
]

export const NoCodeImgUrl ='';
export const ImgUrl = 'data:image/png;base64,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'