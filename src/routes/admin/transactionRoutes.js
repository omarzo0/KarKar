// routes/admin/transactionRoutes.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middleware/adminAuth");

const {
  validateCreateTransaction,
  validateTransactionId,
  validateTransactionQuery,
  validateRefundTransaction,
  validateUpdateTransactionStatus,
  validateBulkTransactionOperation,
  validateTransactionSearch,
  validateTransactionAnalytics,
} = require("../../validations/admin/transactionValidation");

const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionsByUser,
  updateTransactionStatus,
  processRefundTransaction,
  searchTransactions,
  getTransactionAnalytics,
  bulkTransactionOperation,
} = require("../../controllers/admin/transactionController");

// All routes require admin authentication
router.use(adminAuth);

// Transaction listing and search
router.get(
  "/",
  validateTransactionQuery,
  getAllTransactions
);

router.get(
  "/search",
  validateTransactionSearch,
  searchTransactions
);

router.get(
  "/analytics",
  validateTransactionAnalytics,
  getTransactionAnalytics
);

// Create transaction
router.post(
  "/",
  validateCreateTransaction,
  createTransaction
);

// Bulk operations
router.post(
  "/bulk",
  validateBulkTransactionOperation,
  bulkTransactionOperation
);

// Get transactions by user
router.get(
  "/user/:userId",
  getTransactionsByUser
);

// Single transaction operations
router.get(
  "/:transactionId",
  validateTransactionId,
  getTransactionById
);

router.put(
  "/:transactionId/status",
  validateTransactionId,
  validateUpdateTransactionStatus,
  updateTransactionStatus
);

router.post(
  "/:transactionId/refund",
  validateTransactionId,
  validateRefundTransaction,
  processRefundTransaction
);

module.exports = router;
