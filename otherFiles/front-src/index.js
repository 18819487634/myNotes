import '@babel/polyfill';
import 'url-polyfill';
import dva from 'dva';


import createHistory from 'history/createHashHistory';
// user BrowserHistory
// import createHistory from 'history/createBrowserHistory';
import createLoading from 'dva-loading';
import 'moment/locale/zh-cn';
import './rollbar';
import model from './models/global';

import './index.less';

process.on('unhandledRejection', error => {

  // console.error('unhandledRejection', error);
  
  process.exit(1) // To exit with a 'failure' code
  
  });
// 1. Initialize a
const app = dva({
  history: createHistory(),
});

// 2. Plugins
app.use(createLoading());

// 3. Register global model
app.model(model);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');

export default app._store; // eslint-disable-line
