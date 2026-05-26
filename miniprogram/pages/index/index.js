// pages/index/index.js - Table Confirm Page
const api = require('../../utils/api');

Page({
  data: {
    tableNumber: '',
    manualTable: '',
    loading: false,
    errorMsg: ''
  },

  onLoad(options) {
    // Get table from QR code scan
    if (options && options.table) {
      this.setData({ tableNumber: options.table });
    }
  },

  onTableInput(e) {
    this.setData({
      manualTable: e.detail.value,
      errorMsg: ''
    });
  },

  async onStartOrder() {
    const app = getApp();
    let tableCode = this.data.tableNumber || this.data.manualTable.trim();

    if (!tableCode) {
      this.setData({ errorMsg: '请输入桌号' });
      return;
    }

    this.setData({ loading: true, errorMsg: '' });

    try {
      const result = await api.get(`/api/tables/${tableCode}`);

      // Store table info in global data
      app.globalData.tableId = result.id;
      app.globalData.tableNumber = result.tableNumber;

      // Navigate to menu page
      wx.navigateTo({
        url: '/pages/menu/menu'
      });
    } catch (err) {
      this.setData({
        errorMsg: err.message || '桌号验证失败，请重试'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  onShareAppMessage() {
    return {
      title: '点杯咖啡吧',
      path: '/pages/index/index'
    };
  }
});
