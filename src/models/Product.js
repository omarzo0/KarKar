const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  cost: { type: Number },
  inventory: {
    quantity: { type: Number, required: true, default: 0 },
    lowStockAlert: { type: Number, default: 10 },
    trackQuantity: { type: Boolean, default: true },
  },
  images: [{ type: String }],
  specifications: {
    brand: { type: String },
    model: { type: String },
    color: { type: String },
    storage: { type: String },
  },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    slug: { type: String, unique: true },
  },
  tags: [{ type: String }],
  status: {
    type: String,
    enum: ["active", "inactive", "draft"],
    default: "active",
  },
  featured: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
