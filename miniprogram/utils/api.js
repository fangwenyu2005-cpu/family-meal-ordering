/**
 * Promise-based wrapper for wx.request
 * Reads apiBase from app.globalData
 */

const api = {
  /**
   * Base request method
   */
  request(method, path, data) {
    const app = getApp();
    const url = app.globalData.apiBase + path;

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method,
        data,
        header: {
          'Content-Type': 'application/json'
        },
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject({
              statusCode: res.statusCode,
              message: res.data && res.data.message ? res.data.message : '请求失败',
              data: res.data
            });
          }
        },
        fail(err) {
          reject({
            statusCode: 0,
            message: '网络请求失败，请检查网络连接',
            error: err
          });
        }
      });
    });
  },

  /**
   * GET request
   */
  get(path, data) {
    return this.request('GET', path, data);
  },

  /**
   * POST request
   */
  post(path, data) {
    return this.request('POST', path, data);
  },

  /**
   * PATCH request
   */
  patch(path, data) {
    return this.request('PATCH', path, data);
  }
};

module.exports = api;
