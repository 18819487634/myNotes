/**
 * 要自己实现心跳  linjiefeng
 * https://segmentfault.com/q/1010000012955944
 */
export default class NanxinWebSocket {
  constructor(url) {
    this.url = url;
    // close来源判断及后续操作
    this.closeConfig = {
      resolve: null,
      closing: false,
    };
    // promise池
    this.promisePool = {};
  }

  open() {
    return new Promise((resolve, reject) => {
      if (typeof this.Websocket === 'undefined') {
        this.Websocket = new WebSocket(this.url);
        this.Websocket.onopen = e => {
          resolve({ e, ws: this }); // 传递websocket
        };
        this.Websocket.onerror = e => {
          reject(e);
        };
      }
      this.Websocket.onclose = e => {
        // 非主动close
        if (!this.closeConfig.closing) {
          reject(e);
        }
        // 若手动close，恢复初始状态
        this.closeConfig.closing = false;
      };

      this.Websocket.onmessage = e => {
        const jsondata = JSON.parse(e.data);
        const key = jsondata.command;
        const req = this.promisePool[key];
        if (req !== undefined) {
          req.resolve(e);
        } else {
          return;
        }
        delete this.promisePool[key];
      };
    });
  }

  close() {
    this.closeConfig.closing = true;
    this.Websocket.close();
  }

  send(content) {
    const senddata = JSON.parse(content);

    const cmd = senddata.command;
    return new Promise((resolve, reject) => {
      this.promisePool[cmd] = {
        senddata,
        resolve,
        reject,
      };
      this.Websocket.send(content);
    });
  }
}
