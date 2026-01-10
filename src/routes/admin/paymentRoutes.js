// routes/admin/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middleware/adminAuth");

const {
  validatePaymentId,
  validatePaymentQuery,
  validateCreatePayment,
  validateRefundPayment,
  validateUpdatePaymentStatus,
  validateBulkPaymentOperation,
  validateWebhook,
  validateCreatePaymentMethod,
  validateUpdatePaymentMethod,
  validateReorderPaymentMethods,
} = require("../../validations/admin/paymentValidation");

const {
  getAllPayments,
  getPaymentById,
  getPaymentsByUser,
  createPayment,
  refundPayment,
  updatePaymentStatus,
  confirmCODPayment,
  failCODPayment,
  getPaymentStatistics,
  bulkPaymentOperation,
  processWebhook,
  // Payment Methods Management
  getAllPaymentMethods,
  getPaymentMethodByName,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethod,
  setDefaultPaymentMethod,
  reorderPaymentMethods,
} = require("../../controllers/admin/paymentController");

// All routes require admin authentication
router.use(adminAuth);

// Payment listing and statistics
router.get(
  "/",
  validatePaymentQuery,
  getAllPayments
);

// Create payment
router.post(
  "/",
  validateCreatePayment,
  createPayment
);

router.get(
  "/statistics",
  getPaymentStatistics
);

// ==================== PAYMENT METHODS ROUTES ====================

// Get all payment methods
router.get(
  "/methods",
  getAllPaymentMethods
);

// Create payment method
router.post(
  "/methods",
  validateCreatePaymentMethod,
  createPaymentMethod
);

// Reorder payment methods
router.put(
  "/methods/reorder",
  validateReorderPaymentMethods,
  reorderPaymentMethods
);

// Get single payment method
router.get(
  "/methods/:methodName",
  getPaymentMethodByName
);

// Update payment method
router.put(
  "/methods/:methodName",
  validateUpdatePaymentMethod,
  updatePaymentMethod
);

// Delete payment method
router.delete(
  "/methods/:methodName",
  deletePaymentMethod
);

// Toggle payment method status
router.patch(
  "/methods/:methodName/toggle",
  togglePaymentMethod
);

// Set default payment method
router.patch(
  "/methods/:methodName/set-default",
  setDefaultPaymentMethod
);

// ==================== BULK OPERATIONS ====================

router.post(
  "/bulk",
  validateBulkPaymentOperation,
  bulkPaymentOperation
);

// Get payments by user
router.get(
  "/user/:userId",
  getPaymentsByUser
);

// ==================== SINGLE PAYMENT OPERATIONS ====================

router.get(
  "/:paymentId",
  validatePaymentId,
  getPaymentById
);

router.put(
  "/:paymentId/status",
  validatePaymentId,
  validateUpdatePaymentStatus,
  updatePaymentStatus
);

router.post(
  "/:paymentId/refund",
  validatePaymentId,
  validateRefundPayment,
  refundPayment
);

router.post(
  "/:paymentId/confirm-cod",
  validatePaymentId,
  confirmCODPayment
);

router.post(
  "/:paymentId/fail-cod",
  validatePaymentId,
  failCODPayment
);

// Webhook routes (public, called by payment gateways) - moved outside adminAuth
module.exports = router;

// Export webhook handler separately for public access
module.exports.webhookHandler = { processWebhook, validateWebhook };
