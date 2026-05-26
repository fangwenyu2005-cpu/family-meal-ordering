// pages/checkout/checkout.js - Checkout Page
const api = require('../../utils/api');

Page({
  data: {
    cartItems: [],
    totalPrice: '0.00',
    dineType: 'EAT_IN',
    tableNumber: '',
    submitting: false
  },

  onLoad() {
    const app = getApp();
    this.setData({ tableNumber: app.globalData.tableNumber });
  },

  onShow() {
    this.loadCart();
  },

  loadCart() {
    const app = getApp();
    const cart = app.globalData.cart;

    const cartItems = cart.map(item => ({
      ...item,
      subtotal: (item.unitPrice * item.quantity).toFixed(2)
    }));

    this.setData({
      cartItems,
      totalPrice: app.getCartTotal().toFixed(2)
    });
  },

  /**
   * Select dine type
   */
  onSelectDineType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ dineType: type });
  },

  /**
   * Submit order
   */
  async onSubmitOrder() {
    const app = getApp();

    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      });
      return;
    }

    if (!app.globalData.tableId) {
      wx.showToast({
        title: '请先确认桌号',
        icon: 'none'
      });
      return;
    }

    this.setData({ submitting: true });

    // Build items array for API
    const items = app.globalData.cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      specOptionIds: item.specOptions
    }));

    try {
      const order = await api.post('/api/orders', {
        tableId: app.globalData.tableId,
        dineType: this.data.dineType,
        items
      });

      // Clear cart
      app.clearCart();

      // Navigate to order detail
      wx.redirectTo({
        url: `/pages/order/order?id=${order.id}`
      });
    } catch (err) {
      wx.showModal({
        title: '下单失败',
        content: err.message || '提交订单失败，请重试',
        showCancel: false,
        confirmColor: '#e0a96d'
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
