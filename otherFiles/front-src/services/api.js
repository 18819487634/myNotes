import { stringify } from 'querystring';
import request from '../utils/request';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}
// export async function submitPayDetail(params){
 
  
//   return request('/api/paydetail', {
//     method: 'POST',
//     body: {
//       ...params,
//       method: 'post',
//     },
//   });
// }

/**
 *
 * 色卡的api
 */
export async function fakeColorInputForm(params) {
  return request('/api/ColorProduct/save01', {
    method: 'POST',
    body: params,
  });
}
export async function queryColor(params) {
  return request('/api/ColorProduct/list', {
    method: 'POST',
    body: params,
  });
  // return request(`/procductData/selectByParams?${stringify(params)}`);
}

/**
 *
 * 2.0色卡的api
 */
export async function saveColorProduct(params) {
  return request('/api/productall', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
export async function saveOrupdateColorProduct(params) {
  return request('/api/productall', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'patch',
    },
  });
}
export async function queryColorProduct(params) {
  return request(`/api/productall?${params}`);
}
export async function queryProductids(params) {
  return request(`/api/productall/productids`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 
 * 色纱库存
 */
export async function queryDyedyarnForm(params) {
  return request(`/api/gooddetail/findAllStock`, {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
/**
 * 
 * 色卡类别api
 */
export async function saveOrupdatekind(params) {
  return request('/api/productkind', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}
export async function queryColorKind(params) {
  return request(`/api/productkind?${params}`);
}

export async function saveOrupdateseries(params) {
  return request('/api/productseries', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}
export async function queryColorseries(params) {
  return request(`/api/productseries?${params}`);
}

// return request(`/procductData/selectByParams?${stringify(params)}`);

export async function queryColorBook(params) {
  return request(`/api/colorbook/no-paging?${stringify(params)}`);

  // return request(`/procductData/selectByParams?${stringify(params)}`);
}
export async function addColorBook(params) {
  return request('/api/colorbook', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function querySupply(params) {
  return request(`/api/usersupply?${params}`);
}

export async function removeSupply(params) {
  return request('/api/usersupply', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addSupply(params) {
  return request('/api/usersupply', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
export async function updateSupply(params) {
  return request(`/api/usersupply/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
      method: 'PUT',
    },
  });
}

export async function removeColor(params) {
  return request(`/api/productall/${params.id}`, {
    method: 'DELETE',
  });
}
export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  // return request('/api/login/account', {
  return request('/authorize/login', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/nanxinuser/register', {
    // 这个是要权限的，要开放出来。
    method: 'POST',
    body: params,
  });
}
export async function refreshToken() {
  return request('/api/nanxinuser/authorize/refresh');
}
export async function registByAdmin(params) {
  return request('/api/nanxinuser/registerUser', {
    method: 'POST',
    body: params,
  });
}

export async function disableUser(id) {
  return request(`/user/${id}/disable`, {
    method: 'PUT',
  });
}
export async function enableUser(id) {
  return request(`/user/${id}/enable`, {
    method: 'PUT',
  });
}
export async function registCompany(params) {
  return request('/api/nanxinuser/company', {
    // 这个是要权限的，要开放出来。
    method: 'POST',
    body: params,
  });
}
/**
 * 
 *  报表管理 
 */
export async function queryclientDispatchDetail(params) {
  return request('/api/report/saleclientreport', {
    method: 'POST',
    body: params,
  });
}
export async function queryproductSalesList(params) {
  return request('/api/report/saleproductreport', {
    method: 'POST',
    body: params,
  });
}
export async function querybusinessList(params) {
  return request('/api/report/businessreport', {
    method: 'POST',
    body: params,
  });
}
/**
 * 
 * 获得所有业务员
 */
export async function queryallsaleids() {
  return request('/api/report/allsaleids');
}
/**
 * 公司详情
 */
export async function companyDetail(params) {
  return request(`/api/nanxinuser/company/selectById?${stringify(params)}`);
}

export async function queryCompanyAddress(params) {
  return request(`/api/comAddress?${params}`);
}

export async function removeCompanyAddress(params) {
  return request('/api/comAddress', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}
export async function addCompanyAddress(params) {
  return request('/api/comAddress', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
export async function updateCompanyAddress(params) {
  return request(`/api/comAddress/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
      method: 'PUT',
    },
  });
}

/**
 * 数据字典操作
 */
export async function queryDictionary(params) {
  return request(`dictionary?${stringify(params)}`);
}

export async function removeDictionary(params) {
  return request('/dictionary', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}
export async function addDictionary(params) {
  return request('dictionary', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

/**
 * 收款账户
 */
export async function queryAccountnumber(params) {
  return request(`/api/accountnumber?${params}`);
}

export async function addAccountnumber(params) {
  return request('/api/accountnumber', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

/**
 * 询价单
 */

export async function queryInquire(params) {
  return request(`/api/inquiry?${params}`);
}
export async function queryInquireBasic(params) {
  return request(`/api/inquiry/${params}`);
}
export async function inquery2presale(params) {
  return request('/api/presale/inquiry2presale', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
// 竞选客户， 点击询价单号时候调用
export async function inquiryToSale(params) {
  return request(`/api/inquiry/inquiryToSale?${params}`);
}

// 判断是否有修改单价的权限
export async function canChangePrice(params) {
  return request(`/api/inquiry/canChangePrice?${params}`);
}

/**
 * erp客户
 */

export async function queryErpClient(params) {
  return request(`/api/erpclient?${params}`);
}

export async function addErpClient(params) {
  return request('/api/erpclient', {
    method: 'PATCH',
    body: {
      ...params,
    },
  });
}
export async function queryListClients(params) {
  return request('/api/erpclient/listClients', {
    method: 'POST',
    body: params,
  });
}

export async function queryErpClientContact(params) {
  return request(`/api/clientcontact?${params}`);
}
export async function deleteContact(params) {
  return request(`/api/clientcontact/${params.id}`, {
    method: 'DELETE',
    body: {
      ...params,
      method: 'DELETE',
    },
  });
}

export async function saveOrupdateContact(params) {
  return request('/api/clientcontact', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}

// 快速询价
export async function quickInquery(params) {
  return request('/api/inquiry/quickadd', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function tempsaveInquiry(params) {
  return request('/api/inquiry/tempsave', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
export async function queryDescBatchno(params) {
  return request('/api/inquiry/findClientRecentBatchno', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

// 生成拣货单
export async function addPickUp(params) {
  return request('/api/pickup', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
// 生成箱号
export async function createCartno(params) {
  return request(`/api/gooddisassembly/makenewcartnoWithoutSave?batchno=${params}`);
}
// 判断缸号是否存在
export async function queryBatchnoStatus(params) {
  return request(`api/gooddetail/findBatchnoStatus`, {
    method: 'POST',
    body: params,
  });
}

// 生成入库单
export async function addGoods(params) {
  return request('/api/goods', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

// 生成入库明细单
export async function addGoodsDetails(params) {
  return request('/api/gooddetail', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
// 生成入库细码单
export async function addGoodsLocations(params) {
  return request('/api/gooddetaillocation', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
// 修改入库明细单
export async function updateGoodsDetails(params){
  return request(`/api/gooddetail/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
      method: 'PUT',
    },
  });
}
export async function updatePickDetailIds(params) {
  return request(`api/pickdetail/processerror`, {
    method: 'POST',
    body: params,
  });
}
// 拆单
export async function queryPickuptmpdetail(params) {
  return request(`/api/pickuptmpdetail?${params}`)
 
}
export async function updatePickuptmpdetail(params) {
 
  return request(`/api/pickuptmpdetail/updateallpicktmpdetail`, {
    method: 'POST',
    body: params,
  });

 
}

export async function pickupAgain(params) {
  return request('/api/pickup/savePickupForGoodError', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
/**
 * 快递，物流，保险
 */
export async function queryExpress(params) {
  return request(`api/express?${params}`);
}
export async function saveOrupdateExpress(params) {
  return request('/api/express', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}

export async function queryExpressCost(params) {
  return request(`api/logisticalcost?${params}`);
}
export async function saveOrupdateExpressCost(params) {
  return request('/api/logisticalcost', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}


export async function queryinsurer(params) {
  return request(`api/insurer?${params}`);
}
export async function saveOrupdateinsurer(params) {
  return request('/api/insurer', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}

export async function queryinsurerCost(params) {
  return request(`api/insurercost?${params}`);
}
export async function saveOrupdateinsurerCost(params) {
  return request('/api/insurercost', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}

/**
 * 省
 */
export async function queryProvince(params) {
  return request(`api/province?${params}`);
}

/**
 * 预售
 */
export async function queryPresale(params) {
  return request(`/api/presale?${params}`);
}
export async function queryPresaleById(params) {
  return request(`/api/presale/${params}`);
}

export async function queryPresaleDetail(params) {
  return request(`/api/presaledetail?${params}`);
}
/**
 * 收银台需要的
 * @param {*} params 
 */
export async function queryAllPresale(params) {
  return request(`/api/presale/gettosale?${params}`);
}

export async function updatePrease(params) {
  return request(`/api/presale/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
      method: 'PUT',
    },
  });
}
export async function updatePresaledetail(params) {
  return request(`/api/presaledetail/changepick/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
      method: 'PUT',
    },
  });
}

export async function saveOrupdatePrease(params) {
  return request('/api/presale', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}
/**
 * 销售
 */
export async function querySale(params) {
  return request(`/api/sale?${params}`);
}
export async function querySaleDetail(params) {
  return request(`/api/sale/${params}`);
}
export async function addSale(params) {
  return request('/api/sale/adddata', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

/**
 * 欠货，追染
 */
export async function queryPresaleSpecial(params) {
  return request(`/api/presalespecial?${params}`);
}
export async function querypresalespecialdetail(params) {
  return request(`/api/presalespecial?${params}`);
}
/**
 * 拣货单
 */
export async function queryPickup(params) {
  return request(`/api/pickup?${params}`);
}
export async function queryPickupForid(params) {
  return request(`/api/pickup/${params}`);
}
export async function queryPickDetail(params) {
  return request(`/api/pickdetail?${params}`);
}
export async function saveOrupdatePickup(params) {
  return request('/api/pickup', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}
export async function addPickDetail(params) {
  return request('/api/pickdetail', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function queryactualdetails(params) {
  return request(`/api/pickactualdetail/actualdetails`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 预订货款
 */
export async function queryPrereceive(params){
  return request(`/api/prereceive?${params}`);
}
export async function queryPrereceivepForid(params){
  return request(`/api/prereceive/${params}`);
}
/**
 * 送货方式
 */
export async function queryDeliveryWay(params) {
  return request(`/api/deliveryway?${params}`);
}
export async function saveOrupdateDeliveryWay(params) {
  return request('/api/deliveryway', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}



/**
 * 送货单
 */
export async function queryDelivery(params) {
  return request(`/api/delivery?${params}`);
}
export async function queryDeliveryForId(params) {
  return request(`/api/delivery/${params.id}`);
}

export async function queryDeliveryCartno(params) {
  return request(`/api/deliverydetailcartno?${params}`);
}

export async function addDelivery(params) {
  return request('/api/delivery', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
export async function updateDelivery(params) {
  return request(`/api/delivery/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
      method: 'PUT',
    },
  });
}
/**
 * 库存
 */
export async function queryGoods(params) {
  return request(`/api/goods?${params}`);
}
export async function queryGoodsBasic(params) {
  return request(`/api/gooddetail?${params}`);
}
export async function queryGoodsBasicNoPaging(params) {
  return request(`/api/gooddetail/no-paging?${params}`);
}
export async function queryGoodslocation(params) {
  return request(`/api/gooddetaillocation?${params}`);
}

export async function querynocodeGoodslocation(params) {
  return request(`/api/gooddetail/uploadgooddetail`,{
    method:'POST',
    headers: {
      credentials: 'same-origin',
      'Content-Type': 'multipart/form-data',  // 不要加上这个文件类型说明
    },
    body:params,
  });
}

export async function queryGoodsStock(params) {
  return request('/api/gooddetail/findAllStock', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function queryStockDetails(params) {
  return request(`/api/gooddetail/reportByBatchnoAndProductid?productid=${params.productid}&area=${params.area}&batchno=${params.batchno}`);
}


/**
 * 细码详情
 */

export async function querycartnodetail(params) {
  return request(`/api/gooddetaillocation/cartnodetail`, {
    method: 'POST',
    body: params,
  });
}
export async function querycartno(params) {
  return request(`/api/gooddetaillocation?${params}`);
}

/**
 * 细码详情
 */

export async function getTrackStatusForId(params) {
  return request(`/api/trackstatus/getTrackStatus`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 线下产品关系表查询
 */
export async function queryProductreLation(params) {
  return request(`/api/productrelation?${params}`);
}
/**
 * 线下调货
 */
export async function queryofflinepurchasen(params) {
  return request(`/api/offlinepurchase?${params}`);
}
export async function queryofflinepurchasenBasic(params) {
  return request(`/api/offlinepurchase/${params}`);
}
export async function addofflinepurchase(params) {
  return request('/api/offlinepurchase', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
export async function updateofflinepurchase(params) {
  return request(`/api/offlinepurchase/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
      method: 'PUT',
    },
  });
}
export async function updateofflinedetails(params) {
  return request(`/api/offlinepurchasedetail/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
      method: 'PUT',
    },
  });
}
/**
 * 付款记录
 */
export async function querypaydetail(params) {
  return request(`/api/paydetail?${params}`);
}

export async function queryallpaydetail(params) {
  return request(`/api/paydetail/allpaydetail?${params}`);
}

export async function addpaydetail(params) {
  return request('/api/paydetail', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function updatePaydetail(params) {
  return request(`/api/paydetail/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
      method: 'PUT',
    },
  });
}
/**
 * 数据字典
 */
export async function querysupplydictionry(params) {
  return request(`/api/supplydictionry?${params}`);
}

export async function addsupplydictionry(params) {
  return request('/api/supplydictionry', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
export async function updatesupplydictionry(params) {
  return request(`/api/supplydictionry/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
      method: 'PUT',
    },
  });
}

/**
 * 用户仓库关联
 */
export async function queryuserlocation(params) {
  return request(`/api/userlocation?${params}`);
}
export async function updateuserlocation(params) {
  return request('/api/userlocation', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}
export async function deleteuserlocation(params) {
  return request(`/api/userlocation/${params.id}`, {
    method: 'DELETE',
    body: {
      ...params,
      method: 'DELETE',
    },
  });
}
/**
 * 拣货时间管理
 */
export async function querypicktimesetting(params) {
  return request(`/api/picktimesetting?${params}`);
}
export async function savepicktimesetting(params) {
  return request('/api/picktimesetting', {
    method: 'PATCH',
    body: {
      ...params,
      method: 'PATCH',
    },
  });
}
// mock 模拟板毛api 
export async function querygetbanmao(){
  return request ('/api/banmao');
}
// mock 模拟大货api
export async function querygetbigcarg(){
  return request ('/api/bigcarg');
}

/**
 * 登录用户获取自己的菜单
 */
export async function queryAllmenu(params) {
  return request(`/permission?paging=false${stringify(params)}`);
}

export async function queryCompanyUser(params) {
  return request(`/api/nanxinuser/myuser?${params}`);
}
/**
 * 获取登录用户的权限。
 * @param {} params
 */
export async function queryAuthSetting(params) {
  return request(`/autz-setting/user/${params}`);
}

export async function makeAuthSetting(params) {
  return request('/autz-setting', {
    // 这个是要权限的，要开放出来。
    method: 'PATCH',

    body: params,
  });
}
export async function getuuid(params) {
  return request('/api/loginqrcode/create', {
    method: 'POST',
    body: params,
  });
}

export async function longforsearch(params) {
  return request(`/api/loginqrcode/getToken?${stringify(params)}`);
}
// 修改密码(本人)
export async function updateLoginUserPassword(params) {
  return request(
    `/api/nanxinuser/password?password=${params.password}&oldPassword=${params.oldPassword}`
  );
}
// 修改密码(管理员)
export async function updateUserPassword(params) {
  return request(
    `/api/nanxinuser/superchangepasswdWithoutPassword?password=${params.password}&username=${params.username}`
  );
}