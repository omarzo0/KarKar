const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  metrics: {
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    adminActivities: { type: Number, default: 0 },
  },
  salesByCategory: { type: Map, of: Number },
  topProducts: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      productName: { type: String },
      salesCount: { type: Number },
      revenue: { type: Number },
    },
  ],
  adminStats: {
    totalAdmins: { type: Number, default: 0 },
    activeAdmins: { type: Number, default: 0 },
    adminActions: { type: Number, default: 0 },
  },
  visitorStats: {
    totalVisitors: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Analytics", analyticsSchema);
