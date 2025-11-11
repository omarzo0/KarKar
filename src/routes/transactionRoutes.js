const express = require("express");
const router = express.Router();
const { adminAuth, requirePermission } = require("../middleware/adminAuth");

// Import validation middleware
const {
  validateCreateTransaction,
  validateTransactionId,
  validateTransactionQuery,
  validateRefundTransaction,
  validateUpdateTransactionStatus,
  validateBulkTransactionOperation,
  validateTransactionSearch,
  validateTransactionAnalytics,
} = require("../validations/transactionValidation");

// Import controller
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getUserTransactions,
  updateTransactionStatus,
  processRefundTransaction,
  searchTransactions,
  getTransactionAnalytics,
  bulkTransactionOperation,
} = require("../controllers/transactionController");

// All routes are protected and require admin permissions
router.use(adminAuth);

// Transaction management routes
router.post(
  "/",
  requirePermission("canManagePayments"),
  validateCreateTransaction,
  createTransaction
);
router.get(
  "/",
  requirePermission("canManagePayments"),
  validateTransactionQuery,
  getAllTransactions
);
router.get(
  "/search",
  requirePermission("canManagePayments"),
  validateTransactionSearch,
  searchTransactions
);
router.get(
  "/analytics",
  requirePermission("canViewAnalytics"),
  validateTransactionAnalytics,
  getTransactionAnalytics
);
router.get(
  "/:transactionId",
  requirePermission("canManagePayments"),
  validateTransactionId,
  getTransactionById
);
router.put(
  "/:transactionId/status",
  requirePermission("canManagePayments"),
  validateTransactionId,
  validateUpdateTransactionStatus,
  updateTransactionStatus
);
router.post(
  "/:transactionId/refund",
  requirePermission("canManagePayments"),
  validateTransactionId,
  validateRefundTransaction,
  processRefundTransaction
);

// User transactions route
router.get(
  "/user/:userId",
  requirePermission("canManagePayments"),
  getUserTransactions
);

// Bulk operations
router.post(
  "/bulk",
  requirePermission("canManagePayments"),
  validateBulkTransactionOperation,
  bulkTransactionOperation
);

module.exports = router;
