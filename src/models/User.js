const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" }, // Home, Work, Other
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: "USA" },
  isDefault: { type: Boolean, default: false },
  isDefaultBilling: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    dateOfBirth: { type: Date },
  },
  // Legacy single address (kept for backwards compatibility)
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: "USA" },
  },
  // Address book (multiple addresses)
  addresses: [addressSchema],
  // Recently viewed products
  recentlyViewed: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    viewedAt: { type: Date, default: Date.now },
  }],
  // Compare list
  compareList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  }],
  preferences: {
    newsletter: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
    emailNotifications: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      newProducts: { type: Boolean, default: false },
    },
  },
  // Account status
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerification: {
    token: { type: String },
    expiresAt: { type: Date },
  },
  passwordReset: {
    token: { type: String },
    expiresAt: { type: Date },
    lastRequestedAt: { type: Date },
  },
  // User role
  role: { type: String, enum: ["user"], default: "user" },
  // Account deletion request
  deletionRequest: {
    requested: { type: Boolean, default: false },
    requestedAt: { type: Date },
    scheduledDeletionAt: { type: Date },
    reason: { type: String },
  },
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
});

// Method to add recently viewed product
userSchema.methods.addRecentlyViewed = async function(productId) {
  // Remove if already exists
  this.recentlyViewed = this.recentlyViewed.filter(
    item => item.productId.toString() !== productId.toString()
  );
  
  // Add to beginning
  this.recentlyViewed.unshift({
    productId,
    viewedAt: new Date(),
  });
  
  // Keep only last 20 items
  if (this.recentlyViewed.length > 20) {
    this.recentlyViewed = this.recentlyViewed.slice(0, 20);
  }
  
  await this.save();
};

// Method to add/remove from compare list
userSchema.methods.toggleCompare = async function(productId) {
  const index = this.compareList.findIndex(
    id => id.toString() === productId.toString()
  );
  
  if (index > -1) {
    this.compareList.splice(index, 1);
    await this.save();
    return { added: false, message: "Product removed from compare list" };
  }
  
  // Max 4 products in compare
  if (this.compareList.length >= 4) {
    return { added: false, message: "Compare list is full (max 4 products)" };
  }
  
  this.compareList.push(productId);
  await this.save();
  return { added: true, message: "Product added to compare list" };
};

// Method to get default shipping address
userSchema.methods.getDefaultShippingAddress = function() {
  const defaultAddr = this.addresses.find(addr => addr.isDefault);
  if (defaultAddr) return defaultAddr;
  if (this.addresses.length > 0) return this.addresses[0];
  // Fall back to legacy address
  if (this.address && this.address.street) return this.address;
  return null;
};

// Method to get default billing address
userSchema.methods.getDefaultBillingAddress = function() {
  const billingAddr = this.addresses.find(addr => addr.isDefaultBilling);
  if (billingAddr) return billingAddr;
  return this.getDefaultShippingAddress();
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth token
userSchema.methods.generateAuthToken = function () {
  const jwt = require("jsonwebtoken");
  return jwt.sign({ userId: this._id, role: "user" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = mongoose.model("User", userSchema);
