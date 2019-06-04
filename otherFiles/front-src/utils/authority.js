// use sessionStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
  // 返回数组
  //return JSON.parse(sessionStorage.getItem('antd-pro-authority'));
  return sessionStorage.getItem('antd-pro-authority') || 'admin';
}

export function setAuthority(authority) {
  // 传进来是数组
  // return sessionStorage.setItem('antd-pro-authority',JSON.stringify(authority))
  return sessionStorage.setItem('antd-pro-authority', authority);
}
