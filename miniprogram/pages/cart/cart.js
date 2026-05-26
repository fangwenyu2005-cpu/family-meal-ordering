// pages/cart/cart.js - Cart Page
Page({
  data: {
    cartItems: [],
    totalCount: 0,
    totalPrice: '0.00'
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
      totalCount: app.getCartCount(),
      totalPrice: app.getCartTotal().toFixed(2)
    });
  },

  /**
   * Change item quantity
   */
  onChangeQty(e) {
    const { cartKey, action } = e.currentTarget.dataset;
    const app = getApp();
    const item = app.globalData.cart.find(c => c.cartKey === cartKey);
    if (!item) return;

    const newQty = action === 'plus' ? item.quantity + 1 : item.quantity - 1;

    if (newQty <= 0) {
      wx.showModal({
        title: '移除商品',
        content: '确定要移除此商品吗？',
        confirmColor: '#e05252',
        success: (res) => {
          if (res.confirm) {
            app.removeFromCart(cartKey);
            this.loadCart();
          }
        }
      });
    } else {
      app.updateCartQuantity(cartKey, newQty);
      this.loadCart();
    }
  },

  /**
   * Clear entire cart
   */
  onClearCart() {
    if (this.data.cartItems.length === 0) return;

    wx.showModal({
      title: '清空购物车',
      content: '确定要清空所有商品吗？',
      confirmColor: '#e05252',
      success: (res) => {
        if (res.confirm) {
          getApp().clearCart();
          this.loadCart();
          wx.showToast({
            title: '已清空',
            icon: 'success',
            duration: 1000
          });
        }
      }
    });
  },

  /**
   * Navigate to checkout
   */
  onGoCheckout() {
    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/checkout/checkout'
    });
  },

  /**
   * Navigate back to menu
   */
  onGoMenu() {
    wx.navigateTo({
      url: '/pages/menu/menu'
    });
  }
});
