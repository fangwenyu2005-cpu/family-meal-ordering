// pages/menu/menu.js - Menu Browse Page
const api = require('../../utils/api');

Page({
  data: {
    categories: [],
    currentCategoryId: null,
    products: [],
    loading: true,
    error: '',

    // Cart summary
    cartCount: 0,
    cartTotal: 0,

    // Spec selector
    selectedProduct: null,
    showSpecSelector: false
  },

  onLoad() {
    this.fetchCategories();
  },

  onShow() {
    this.updateCartBar();
  },

  // ===== Data fetching =====

  async fetchCategories() {
    try {
      const categories = await api.get('/api/categories');
      categories.sort((a, b) => a.sortOrder - b.sortOrder);
      this.setData({ categories });

      if (categories.length > 0) {
        this.setData({ currentCategoryId: categories[0].id });
        this.fetchProducts(categories[0].id);
      } else {
        this.setData({ loading: false });
      }
    } catch (err) {
      this.setData({
        error: err.message || '加载分类失败',
        loading: false
      });
    }
  },

  async fetchProducts(categoryId) {
    this.setData({ loading: true, error: '' });

    try {
      const products = await api.get(`/api/products?category=${categoryId}`);
      this.setData({ products, loading: false });
    } catch (err) {
      this.setData({
        error: err.message || '加载产品失败',
        loading: false
      });
    }
  },

  onSwitchCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    if (categoryId === this.data.currentCategoryId) return;
    this.setData({ currentCategoryId: categoryId, products: [] });
    this.fetchProducts(categoryId);
  },

  // ===== Cart operations =====

  updateCartBar() {
    const app = getApp();
    this.setData({
      cartCount: app.getCartCount(),
      cartTotal: app.getCartTotal().toFixed(2)
    });
  },

  // ===== Spec selector =====

  onTapAdd(e) {
    const product = e.currentTarget.dataset.product;
    this.setData({
      selectedProduct: product,
      showSpecSelector: true
    });
  },

  onSpecClose() {
    this.setData({ showSpecSelector: false });
  },

  onSpecAdd(e) {
    const { product, selectedOptions, quantity, unitPrice, specSummary } = e.detail;
    const app = getApp();

    app.addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      specOptions: selectedOptions,
      specSummary: specSummary,
      unitPrice: unitPrice,
      quantity: quantity
    });

    this.setData({ showSpecSelector: false });
    this.updateCartBar();

    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 1200
    });
  },

  // ===== Navigation =====

  onGoCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  }
});
