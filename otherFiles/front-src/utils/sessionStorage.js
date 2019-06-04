export function setCaliColor(lab) {
  return sessionStorage.setItem('cali_lab', lab);

}
export function getCaliColor() {
  const caliLab = sessionStorage.getItem('cali_lab');
  let tag;
  if (caliLab === null) {
    tag = false;
  } else {
    tag = true;
  }
  const reuslt = { cali_lab: caliLab, flag: tag };
  return reuslt;
}

export function setKind(kind) {
  return sessionStorage.setItem('kind', kind);
}
export function setLocation(location) {
  return sessionStorage.setItem('location', location);
}
export function setLargeType(largetype) {
  return sessionStorage.setItem('largetype', largetype);
}
export function setSeries(series) {
  return sessionStorage.setItem('series', series);
}

export function getKind() {
  return sessionStorage.getItem('kind');
}
export function getLocation() {
  let location = sessionStorage.getItem('location');
  if (location !== null && location !== undefined) {
    const arr = location.split('-');
    if (arr.length === 3) {
      let num = parseInt(arr[2], 10) + 1;
      if (num < 10) {
        num = `0${num}`;
      }
      location = `${arr[0]}-${arr[1]}-${num}`;
    }
  }

  return location;
}
export function getLargeType() {
  return sessionStorage.getItem('largetype');
}
export function getSeries() {
  let val = sessionStorage.getItem('series');
  if (val === null) {
    val = '';
  }
  return val;
}

/**
 * 供应商ID
 */
export function getSupplyId() {
  return sessionStorage.getItem('supplyid');
}

export function setTreeTempData(selectKeys) {
  if (selectKeys == null) {
    sessionStorage.removeItem('selectedmenus');
    return;
  }
  return sessionStorage.setItem('selectedmenus', selectKeys);
}
export function getTreeTempData() {
  return sessionStorage.getItem('selectedmenus');
}

export function setAllTreeData(menudata) {
  if (menudata == null) {
    sessionStorage.removeItem('menudata');
    return;
  }
  return sessionStorage.setItem('menudata', menudata);
}
export function getAllTreeData() {
  return sessionStorage.getItem('menudata');
}

export function setTempMenu(selectKeys) {
  if (selectKeys == null) {
    sessionStorage.removeItem('myselectmenu');
    return;
  }
  return sessionStorage.setItem('myselectmenu', selectKeys);
}
export function getTempMenu() {
  return sessionStorage.getItem('myselectmenu');
}

export function setSupplyId(supplyid) {
  if (supplyid == null) {
    sessionStorage.removeItem('supplyid');
    return;
  }
  return sessionStorage.setItem('supplyid', supplyid);
}

export function getCurrentUser() {
  return sessionStorage.getItem('currentUser');
}

export function setCurrentUser(username) {
  if (username == null) {
    sessionStorage.removeItem('currentUser');
    return;
  }
  return sessionStorage.setItem('currentUser', username);
}

export function setUserToken(token) {
  if (token == null) {
    sessionStorage.removeItem('usertoken');
    return;
  }

  return sessionStorage.setItem('usertoken', token);
}

export function setUserCompany(company) {
  if (company == null) {
    sessionStorage.removeItem('usercompany');
    return;
  }

  return sessionStorage.setItem('usercompany', company);
}

export function getUserCompany() {
  return sessionStorage.getItem('usercompany');
}
/**
 * 注意退出也要关闭这个token。如果浏览器意外关闭呢。
 */
export function getUserToken() {
  return sessionStorage.getItem('usertoken');
}
