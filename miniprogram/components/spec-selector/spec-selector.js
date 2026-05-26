// components/spec-selector/spec-selector.js
Component({
  properties: {
    product: {
      type: Object,
      value: null,
      observer: 'onProductChange'
    },
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    specGroups: [],
    selectedOptions: [],
    quantity: 1,
    calcPrice: 0,
    totalPrice: 0,
    canSubmit: false
  },

  lifetimes: {},

  methods: {
    /**
     * Called when product property changes
     */
    onProductChange(product) {
      if (!product) return;

      const specGroups = (product.specs || []).map(spec => ({
        specGroupId: spec.specGroupId,
        name: spec.specGroup.name,
        isRequired: spec.specGroup.isRequired,
        options: spec.specGroup.options || []
      }));

      // Auto-select from spec groups with only one option
      const autoSelected = [];
      specGroups.forEach(group => {
        if (group.options.length === 1) {
          autoSelected.push(group.options[0].id);
        }
      });

      const basePrice = parseFloat(product.basePrice) || 0;

      this.setData({
        specGroups,
        selectedOptions: autoSelected,
        quantity: 1,
        calcPrice: basePrice
      }, () => {
        this.recalc();
      });
    },

    /**
     * Handle option selection
     */
    onSelectOption(e) {
      const { groupId, optionId } = e.currentTarget.dataset;
      let selectedOptions = [...this.data.selectedOptions];

      // Find the group this option belongs to
      const group = this.data.specGroups.find(g => g.specGroupId === groupId);
      if (!group) return;

      // Remove any previously selected option from the same group
      const groupOptionIds = group.options.map(o => o.id);
      selectedOptions = selectedOptions.filter(id => !groupOptionIds.includes(id));

      // Toggle: if the same option was already selected, just remove it (no toggle-add)
      // For required groups, we re-add it only if it was not already selected
      const wasAlreadySelected = this.data.selectedOptions.includes(optionId);

      if (!wasAlreadySelected) {
        selectedOptions.push(optionId);
      }
      // If the option was already selected (toggle off), we leave it removed
      // But for required groups we want to keep it selected
      // So we only remove if not the same, then add if not already present

      this.setData({ selectedOptions }, () => {
        this.recalc();
      });
    },

    /**
     * Recalculate price based on selected options
     */
    recalc() {
      const product = this.properties.product;
      if (!product) return;

      let price = parseFloat(product.basePrice) || 0;

      this.data.specGroups.forEach(group => {
        group.options.forEach(opt => {
          if (this.data.selectedOptions.includes(opt.id)) {
            price += parseFloat(opt.priceDelta) || 0;
          }
        });
      });

      const totalPrice = (price * this.data.quantity).toFixed(2);
      const calcPrice = price.toFixed(2);

      // Check if all required groups have a selection
      let canSubmit = true;
      const requiredGroupIds = this.data.specGroups
        .filter(g => g.isRequired)
        .map(g => g.specGroupId);

      for (const groupId of requiredGroupIds) {
        const group = this.data.specGroups.find(g => g.specGroupId === groupId);
        if (!group) continue;
        const hasSelection = group.options.some(opt =>
          this.data.selectedOptions.includes(opt.id)
        );
        if (!hasSelection) {
          canSubmit = false;
          break;
        }
      }

      this.setData({ calcPrice, totalPrice, canSubmit });
    },

    /**
     * Quantity controls
     */
    onQtyMinus() {
      if (this.data.quantity <= 1) return;
      this.setData({ quantity: this.data.quantity - 1 }, () => {
        this.recalc();
      });
    },

    onQtyPlus() {
      this.setData({ quantity: this.data.quantity + 1 }, () => {
        this.recalc();
      });
    },

    /**
     * Build spec summary text
     */
    buildSpecSummary() {
      const parts = [];
      this.data.specGroups.forEach(group => {
        const selectedOpt = group.options.find(opt =>
          this.data.selectedOptions.includes(opt.id)
        );
        if (selectedOpt) {
          parts.push(selectedOpt.label);
        }
      });
      return parts.join(' / ');
    },

    /**
     * Add to cart
     */
    onAddToCart() {
      if (!this.data.canSubmit) return;

      const product = this.properties.product;
      const unitPrice = parseFloat(this.data.calcPrice);
      const specSummary = this.buildSpecSummary();

      this.triggerEvent('add', {
        product,
        selectedOptions: [...this.data.selectedOptions],
        quantity: this.data.quantity,
        unitPrice,
        specSummary
      });
    },

    /**
     * Close overlay
     */
    onOverlayTap() {
      this.triggerEvent('close');
    }
  }
});
