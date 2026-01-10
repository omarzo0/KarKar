const User = require("../../models/User");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const mongoose = require("mongoose");
const { formatImageUrl } = require("../../utils/imageHelper");

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin - canViewAnalytics)
const getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayStats,
      totalStats,
      recentOrders,
      topProducts,
      orderSummary,
      productStatistics,
      lowStockAlerts
    ] = await Promise.all([
      // 1. Today's Stats (Orders and Revenue)
      Order.aggregate([
        { $match: { createdAt: { $gte: today } } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totals.total", 0] }
            }
          }
        }
      ]),

      // 2. Total Lifetime Stats (Revenue, Orders, Products)
      Promise.all([
        Order.aggregate([
          { $match: { paymentStatus: "paid" } },
          { $group: { _id: null, totalRevenue: { $sum: "$totals.total" } } }
        ]),
        Order.countDocuments(),
        Product.countDocuments()
      ]),

      // 3. Recent Orders with detailed customer info
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber customer totals.total status paymentStatus createdAt"),

      // 4. Top Products (by units sold)
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            totalUnits: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.subtotal" }
          }
        },
        { $sort: { totalUnits: -1 } },
        { $limit: 5 }
      ]),

      // 5. Order Summary (counts by status)
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),

      // 6. Product Statistics (Active/Draft/Stock)
      Product.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
            draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
            outOfStock: { $sum: { $cond: [{ $eq: ["$inventory.quantity", 0] }, 1, 0] } }
          }
        }
      ]),

      // 7. Low Stock Alerts
      Product.find({
        $or: [
          { "inventory.quantity": { $lte: 10 } },
          { $expr: { $lte: ["$inventory.quantity", "$inventory.lowStockAlert"] } }
        ],
        status: "active"
      })
        .select("name inventory.quantity inventory.lowStockAlert price images")
        .limit(5)
    ]);

    res.json({
      success: true,
      data: {
        today: {
          orders: todayStats[0]?.count || 0,
          revenue: todayStats[0]?.revenue || 0
        },
        totals: {
          revenue: totalStats[0][0]?.totalRevenue || 0,
          orders: totalStats[1],
          products: totalStats[2]
        },
        recentOrders: recentOrders.map(order => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          customer: {
            name: `${order.customer.firstName} ${order.customer.lastName}`,
            email: order.customer.email,
            phone: order.customer.phone
          },
          total: order.totals.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt
        })),
        topProducts: topProducts.map(p => ({
          productId: p._id,
          name: p.name,
          totalUnits: p.totalUnits,
          totalRevenue: p.totalRevenue
        })),
        orderSummary: orderSummary.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        productStatistics: productStatistics[0] || {
          total: 0,
          active: 0,
          draft: 0,
          outOfStock: 0
        },
        lowStockAlerts: lowStockAlerts.map(p => ({
          _id: p._id,
          name: p.name,
          quantity: p.inventory.quantity,
          lowStockAlert: p.inventory.lowStockAlert,
          price: p.price,
          image: p.images?.[0] ? formatImageUrl(req, p.images[0]) : null
        }))
      }
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
      error: error.message
    });
  }
};

module.exports = {
  getDashboardOverview
};
