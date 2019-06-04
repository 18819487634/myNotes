


export function setUserPwd(userpwd){
  return localStorage.setItem('userpwd',userpwd);
}

export function getUserPwd(){
  return localStorage.getItem('userpwd');
}