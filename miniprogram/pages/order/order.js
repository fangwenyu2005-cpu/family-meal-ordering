// pages/order/order.js - Order Status Page
const api = require('../../utils/api');

// Status mapping
const STATUS_MAP = {
  'SUBMITTED': { text: '等待确认', hint: '您的订单已提交，请等待商家确认', idx: 0 },
  'CONFIRMED': { text: '商家已确认', hint: '商家已确认您的订单，正在准备中', idx: 1 },
  'PREPARING': { text: '制作中', hint: '您的饮品正在精心制作中', idx: 2 },
  'COMPLETED': { text: '请取餐', hint: '您的订单已完成，请取餐享用！', idx: 3 },
  'CANCELLED': { text: '已取消', hint: '订单已取消', idx: -1 }
};

const TIMELINE_STATES = ['submitted', 'confirmed', 'preparing', 'completed'];

Page({
  data: {
    orderId: null,
    order: null,
    tableNumber: '',
    statusText: '',
    statusHint: '',
    timelineState: {
      submitted: 'pending',
      confirmed: 'pending',
      preparing: 'pending',
      completed: 'pending'
    },
    loading: true,
    error: '',
    cancelling: false,
    refreshTimer: null
  },

  onLoad(options) {
    if (options && options.id) {
      this.setData({ orderId: options.id });
      this.fetchOrder();
      this.startAutoRefresh();
    } else {
      this.setData({
        loading: false,
        error: '未找到订单信息'
      });
    }
  },

  onShow() {
    // Refresh when returning to this page
    if (this.data.orderId && !this.data.refreshTimer) {
      this.fetchOrder();
      this.startAutoRefresh();
    }
  },

  onHide() {
    this.stopAutoRefresh();
  },

  onUnload() {
    this.stopAutoRefresh();
  },

  // ===== Auto-refresh =====

  startAutoRefresh() {
    this.stopAutoRefresh();
    const timer = setInterval(() => {
      this.fetchOrder(true);
    }, 5000);
    this.setData({ refreshTimer: timer });
  },

  stopAutoRefresh() {
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer);
      this.setData({ refreshTimer: null });
    }
  },

  // ===== Fetch order =====

  async fetchOrder(silent) {
    if (!this.data.orderId) return;

    if (!silent) {
      this.setData({ loading: true, error: '' });
    }

    try {
      const order = await api.get(`/api/orders/${this.data.orderId}`);
      const app = getApp();

      // Format times
      if (order.createdAt) {
        order._createdAt = this._formatTime(order.createdAt);
      }
      if (order.submittedAt) {
        order._submittedAt = this._formatTime(order.submittedAt);
      }
      if (order.confirmedAt) {
        order._confirmedAt = this._formatTime(order.confirmedAt);
      }
      if (order.preparingAt) {
        order._preparingAt = this._formatTime(order.preparingAt);
      }
      if (order.completedAt) {
        order._completedAt = this._formatTime(order.completedAt);
      }

      const statusInfo = STATUS_MAP[order.status] || STATUS_MAP['SUBMITTED'];
      const timelineState = this._buildTimeline(order.status);

      // Calculate item prices
      if (order.items) {
        order.items.forEach(item => {
          item._price = (parseFloat(item.price || item.unitPrice || 0)).toFixed(2);
        });
      }

      // Format total price
      if (order.totalPrice) {
        order._totalPrice = (parseFloat(order.totalPrice)).toFixed(2);
      }

      this.setData({
        order,
        tableNumber: app.globalData.tableNumber || (order.table ? order.table.tableNumber : ''),
        statusText: statusInfo.text,
        statusHint: statusInfo.hint,
        timelineState,
        loading: false,
        error: ''
      });
    } catch (err) {
      if (!silent) {
        this.setData({
          loading: false,
          error: err.message || '获取订单信息失败'
        });
      }
    }
  },

  /**
   * Build timeline state from order status
   */
  _buildTimeline(status) {
    const state = {
      submitted: 'pending',
      confirmed: 'pending',
      preparing: 'pending',
      completed: 'pending'
    };

    if (!status || status === 'CANCELLED') {
      return state;
    }

    const currentIdx = STATUS_MAP[status] ? STATUS_MAP[status].idx : 0;

    for (let i = 0; i <= currentIdx && i < TIMELINE_STATES.length; i++) {
      const key = TIMELINE_STATES[i];
      if (i < currentIdx) {
        state[key] = 'done';
      } else if (i === currentIdx) {
        state[key] = 'current';
      }
    }

    return state;
  },

  /**
   * Format ISO time string to readable format
   */
  _formatTime(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const pad = (n) => n < 10 ? '0' + n : '' + n;
      return d.getFullYear() + '-' +
        pad(d.getMonth() + 1) + '-' +
        pad(d.getDate()) + ' ' +
        pad(d.getHours()) + ':' +
        pad(d.getMinutes()) + ':' +
        pad(d.getSeconds());
    } catch (e) {
      return dateStr;
    }
  },

  // ===== Cancel order =====

  async onCancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消此订单吗？',
      confirmColor: '#e05252',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ cancelling: true });
          try {
            await api.patch(`/api/orders/${this.data.orderId}/cancel`);
            this.stopAutoRefresh();
            this.fetchOrder();
            wx.showToast({
              title: '订单已取消',
              icon: 'success'
            });
          } catch (err) {
            wx.showModal({
              title: '取消失败',
              content: err.message || '取消订单失败，请重试',
              showCancel: false,
              confirmColor: '#e0a96d'
            });
          } finally {
            this.setData({ cancelling: false });
          }
        }
      }
    });
  },

  // ===== Navigation =====

  onGoMenu() {
    wx.navigateTo({
      url: '/pages/menu/menu'
    });
  }
});
