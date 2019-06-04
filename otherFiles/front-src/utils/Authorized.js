import RenderAuthorized from '../components/Authorized';
import { getAuthority } from './authority';

// 这里应该是传递一个数组进去。而不是一个字符进去。linjiefeng
let Authorized = RenderAuthorized(getAuthority()); // eslint-disable-line

// Reload the rights component
const reloadAuthorized = () => {
  Authorized = RenderAuthorized(getAuthority());
};

export { reloadAuthorized };
export default Authorized;
