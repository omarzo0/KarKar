const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { adminAuth, requirePermission } = require("../middleware/adminAuth");

// Import validation middleware
const {
  validateCreatePayment,
  validateProcessPayment,
  validatePaymentId,
  validatePaymentQuery,
  validateRefundPayment,
  validateUpdatePaymentStatus,
  validateBulkPaymentOperation,
  validateWebhook,
} = require("../validations/paymentValidation");

// Import controller
const {
  createPayment,
  processPayment,
  getPaymentById,
  getUserPayments,
  getAllPayments,
  refundPayment,
  updatePaymentStatus,
  processWebhook,
  bulkPaymentOperation,
} = require("../controllers/paymentController");

// User routes
router.use(auth);

router.post("/", validateCreatePayment, createPayment);
router.post(
  "/:paymentId/process",
  validatePaymentId,
  validateProcessPayment,
  processPayment
);
router.get("/", validatePaymentQuery, getUserPayments);
router.get("/:paymentId", validatePaymentId, getPaymentById);

// Admin routes
router.get(
  "/admin/payments",
  adminAuth,
  requirePermission("canManagePayments"),
  validatePaymentQuery,
  getAllPayments
);
router.post(
  "/admin/payments/:paymentId/refund",
  adminAuth,
  requirePermission("canManagePayments"),
  validatePaymentId,
  validateRefundPayment,
  refundPayment
);
router.put(
  "/admin/payments/:paymentId/status",
  adminAuth,
  requirePermission("canManagePayments"),
  validatePaymentId,
  validateUpdatePaymentStatus,
  updatePaymentStatus
);
router.post(
  "/admin/payments/bulk",
  adminAuth,
  requirePermission("canManagePayments"),
  validateBulkPaymentOperation,
  bulkPaymentOperation
);

// Webhook routes (public, called by payment gateways)
router.post("/webhook/:gateway", validateWebhook, processWebhook);

module.exports = router;
