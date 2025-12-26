const express = require("express");
const router = express.Router();
const {
  adminAuth,
  requirePermission,
} = require("../../middleware/adminAuth");

const {
  getAllReviews,
  getReviewById,
  approveReview,
  rejectReview,
  deleteReview,
  bulkApproveReviews,
  bulkRejectReviews,
  addSellerResponse,
  getReviewStats,
} = require("../../controllers/admin/reviewController");

const {
  validateGetAllReviews,
  validateReviewId,
  validateRejectReview,
  validateBulkAction,
  validateSellerResponse,
} = require("../../validations/admin/reviewValidation");

// All routes require admin authentication
router.use(adminAuth);

// Get review statistics
router.get(
  "/stats",
  requirePermission("canManageProducts"),
  getReviewStats
);

// Get all reviews
router.get(
  "/",
  requirePermission("canManageProducts"),
  validateGetAllReviews,
  getAllReviews
);

// Bulk operations
router.post(
  "/bulk-approve",
  requirePermission("canManageProducts"),
  validateBulkAction,
  bulkApproveReviews
);

router.post(
  "/bulk-reject",
  requirePermission("canManageProducts"),
  validateBulkAction,
  bulkRejectReviews
);

// Get single review
router.get(
  "/:reviewId",
  requirePermission("canManageProducts"),
  validateReviewId,
  getReviewById
);

// Approve review
router.patch(
  "/:reviewId/approve",
  requirePermission("canManageProducts"),
  validateReviewId,
  approveReview
);

// Reject review
router.patch(
  "/:reviewId/reject",
  requirePermission("canManageProducts"),
  validateRejectReview,
  rejectReview
);

// Add seller response
router.post(
  "/:reviewId/respond",
  requirePermission("canManageProducts"),
  validateSellerResponse,
  addSellerResponse
);

// Delete review
router.delete(
  "/:reviewId",
  requirePermission("canManageProducts"),
  validateReviewId,
  deleteReview
);

module.exports = router;
