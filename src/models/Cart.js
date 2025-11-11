const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  discount: {
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "fixed",
    },
    value: { type: Number, default: 0 },
    discountedPrice: { type: Number },
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  maxQuantity: {
    type: Number,
    default: 10,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  sessionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  items: [cartItemSchema],
  summary: {
    itemsCount: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  currency: {
    type: String,
    default: "USD",
  },
  shippingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
  },
  coupon: {
    code: { type: String },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
    },
    discountValue: { type: Number },
    minOrderValue: { type: Number },
  },
  notes: {
    type: String,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update updatedAt timestamp
cartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate cart totals
cartSchema.methods.calculateTotals = function () {
  let itemsCount = 0;
  let totalPrice = 0;
  let totalDiscount = 0;

  this.items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;

    if (item.discount && item.discount.discountedPrice) {
      const originalTotal = item.price * item.quantity;
      const discountedTotal = item.discount.discountedPrice * item.quantity;
      totalDiscount += originalTotal - discountedTotal;
    }

    itemsCount += item.quantity;
  });

  // Apply coupon discount if exists
  let couponDiscount = 0;
  if (this.coupon && this.coupon.code) {
    if (this.coupon.discountType === "percentage") {
      couponDiscount = (totalPrice * this.coupon.discountValue) / 100;
    } else {
      couponDiscount = this.coupon.discountValue;
    }
    totalDiscount += couponDiscount;
  }

  const subtotal = totalPrice - totalDiscount;
  const grandTotal =
    subtotal + this.summary.shippingFee + this.summary.taxAmount;

  this.summary = {
    itemsCount,
    totalPrice,
    totalDiscount,
    shippingFee: this.summary.shippingFee || 0,
    taxAmount: this.summary.taxAmount || 0,
    grandTotal: Math.max(0, grandTotal),
  };
};

// Method to add item to cart
cartSchema.methods.addItem = function (product, quantity = 1) {
  const existingItemIndex = this.items.findIndex(
    (item) => item.productId.toString() === product._id.toString()
  );

  if (existingItemIndex > -1) {
    // Update existing item
    const newQuantity = this.items[existingItemIndex].quantity + quantity;
    if (newQuantity <= this.items[existingItemIndex].maxQuantity) {
      this.items[existingItemIndex].quantity = newQuantity;
    }
  } else {
    // Add new item
    this.items.push({
      productId: product._id,
      quantity: quantity,
      price: product.price,
      name: product.name,
      image: product.images?.[0],
      sku: product.sku,
      maxQuantity: Math.min(product.inventory?.quantity || 10, 10),
    });
  }

  this.calculateTotals();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  this.calculateTotals();
};

// Method to update item quantity
cartSchema.methods.updateQuantity = function (productId, quantity) {
  const item = this.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (item && quantity > 0 && quantity <= item.maxQuantity) {
    item.quantity = quantity;
    this.calculateTotals();
    return true;
  }
  return false;
};

// Method to clear cart
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.summary = {
    itemsCount: 0,
    totalPrice: 0,
    totalDiscount: 0,
    shippingFee: 0,
    taxAmount: 0,
    grandTotal: 0,
  };
  this.coupon = undefined;
};

// Static method to find cart by session (for guest users)
cartSchema.statics.findBySession = function (sessionId) {
  return this.findOne({ sessionId, isActive: true });
};

// Static method to merge guest cart with user cart
cartSchema.statics.mergeCarts = async function (guestCartId, userId) {
  const guestCart = await this.findById(guestCartId);
  const userCart = await this.findOne({ userId });

  if (!guestCart) return userCart;

  if (!userCart) {
    // If user doesn't have a cart, convert guest cart to user cart
    guestCart.userId = userId;
    guestCart.sessionId = undefined;
    return await guestCart.save();
  }

  // Merge items from guest cart to user cart
  guestCart.items.forEach((guestItem) => {
    userCart.addItem(
      {
        _id: guestItem.productId,
        price: guestItem.price,
        name: guestItem.name,
        images: guestItem.image ? [guestItem.image] : [],
        sku: guestItem.sku,
        inventory: { quantity: guestItem.maxQuantity },
      },
      guestItem.quantity
    );
  });

  await userCart.save();
  await guestCart.deleteOne(); // Remove guest cart after merge

  return userCart;
};

module.exports = mongoose.model("Cart", cartSchema);
