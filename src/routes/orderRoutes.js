const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { adminAuth, requirePermission } = require("../middleware/adminAuth");

// Import validation middleware
const {
  validateCreateOrder,
  validateOrderId,
  validateUpdateOrderStatus,
  validateUpdatePaymentStatus,
  validateOrderQuery,
  validateCancelOrder,
  validateRefundOrder,
  validateOrderItems,
  validateBulkOrderOperation,
} = require("../validations/orderValidation");

// Import controller
const {
  createOrder,
  createDirectOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  processRefund,
  bulkOrderOperation,
} = require("../controllers/orderController");

// User routes
router.use(auth);

router.post("/", validateCreateOrder, createOrder);
router.post(
  "/direct",
  validateOrderItems,
  validateCreateOrder,
  createDirectOrder
);
router.get("/", validateOrderQuery, getUserOrders);
router.get("/:orderId", validateOrderId, getOrderById);
router.put(
  "/:orderId/cancel",
  validateOrderId,
  validateCancelOrder,
  cancelOrder
);

// Admin routes
router.get(
  "/admin/orders",
  adminAuth,
  requirePermission("canManageOrders"),
  validateOrderQuery,
  getAllOrders
);
router.put(
  "/admin/orders/:orderId/status",
  adminAuth,
  requirePermission("canManageOrders"),
  validateOrderId,
  validateUpdateOrderStatus,
  updateOrderStatus
);
router.put(
  "/admin/orders/:orderId/payment-status",
  adminAuth,
  requirePermission("canManagePayments"),
  validateOrderId,
  validateUpdatePaymentStatus,
  updatePaymentStatus
);
router.post(
  "/admin/orders/:orderId/refund",
  adminAuth,
  requirePermission("canManagePayments"),
  validateOrderId,
  validateRefundOrder,
  processRefund
);
router.post(
  "/admin/orders/bulk",
  adminAuth,
  requirePermission("canManageOrders"),
  validateBulkOrderOperation,
  bulkOrderOperation
);

module.exports = router;
