const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middleware/adminAuth");

const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getOrderStats,
  exportOrders,
  getOrderAnalytics,
  processRefund,
  addOrderNote,
  getOrderNotes,
  generateInvoice,
  cancelOrder,
} = require("../../controllers/admin/orderManagementController");

const {
  validateOrderQuery,
  validateOrderStatusUpdate,
  validatePaymentStatusUpdate,
  validateOrderExport,
  validateOrderAnalytics,
} = require("../../validations/admin/orderManagementValidation");

// All routes require admin authentication
router.use(adminAuth);

// Get all orders with filtering and pagination
router.get(
  "/",
  validateOrderQuery,
  getAllOrders
);

// Get order statistics
router.get(
  "/stats/overview",
  validateOrderAnalytics,
  getOrderStats
);

// Export orders
router.get(
  "/export",
  validateOrderExport,
  exportOrders
);

// Get order analytics
router.get(
  "/analytics",
  validateOrderAnalytics,
  getOrderAnalytics
);

// Get specific order by ID
router.get("/:id", getOrderById);

// Update order status
router.put(
  "/:id/status",
  validateOrderStatusUpdate,
  updateOrderStatus
);

// Update payment status
router.put(
  "/:id/payment-status",
  validatePaymentStatusUpdate,
  updatePaymentStatus
);

// Process refund
router.post(
  "/:id/refund",
  processRefund
);

// Cancel order
router.post(
  "/:id/cancel",
  cancelOrder
);

// Order notes
router.get(
  "/:id/notes",
  getOrderNotes
);

router.post(
  "/:id/notes",
  addOrderNote
);

// Generate invoice
router.get(
  "/:id/invoice",
  generateInvoice
);

// Delete order (soft delete)
router.delete("/:id", deleteOrder);

module.exports = router;
