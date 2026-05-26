App({
  globalData: {
    apiBase: 'https://your-api-url.com',
    tableId: null,
    tableNumber: '',
    cart: []
  },

  onLaunch(options) {
    // Parse QR code table param from query
    if (options && options.query && options.query.table) {
      this.globalData.tableNumber = options.query.table;
    }
  },

  // Add item to cart
  addToCart(item) {
    const cart = this.globalData.cart;
    // Build a key from productId and sorted option IDs for dedup
    const key = this._makeCartKey(item);
    const existing = cart.find(c => this._makeCartKey(c) === key);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        specOptions: item.specOptions,
        specSummary: item.specSummary,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        cartKey: key
      });
    }
  },

  // Build a unique key for cart items
  _makeCartKey(item) {
    const sorted = [...item.specOptions].sort((a, b) => a - b);
    return item.productId + '_' + sorted.join('_');
  },

  // Get total count of items in cart
  getCartCount() {
    return this.globalData.cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Get total price of items in cart
  getCartTotal() {
    return this.globalData.cart.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity;
    }, 0);
  },

  // Remove item from cart by cartKey
  removeFromCart(cartKey) {
    const idx = this.globalData.cart.findIndex(c => c.cartKey === cartKey);
    if (idx >= 0) {
      this.globalData.cart.splice(idx, 1);
    }
  },

  // Update quantity of cart item
  updateCartQuantity(cartKey, quantity) {
    const item = this.globalData.cart.find(c => c.cartKey === cartKey);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(cartKey);
      }
    }
  },

  // Clear cart
  clearCart() {
    this.globalData.cart = [];
  }
});
