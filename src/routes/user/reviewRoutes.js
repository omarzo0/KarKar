const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middleware/userAuth");

const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  markReviewHelpful,
  canReviewProduct,
} = require("../../controllers/user/reviewController");

const {
  validateCreateReview,
  validateUpdateReview,
  validateReviewId,
  validateProductId,
  validateGetProductReviews,
} = require("../../validations/user/reviewValidation");

// Public routes - Get product reviews
router.get("/product/:productId", validateGetProductReviews, getProductReviews);

// Protected routes - require user authentication
router.use(userAuth);

// User's reviews
router.get("/", getUserReviews);
router.post("/", validateCreateReview, createReview);
router.put("/:reviewId", validateUpdateReview, updateReview);
router.delete("/:reviewId", validateReviewId, deleteReview);

// Check if user can review
router.get("/can-review/:productId", validateProductId, canReviewProduct);

// Mark review as helpful
router.post("/:reviewId/helpful", validateReviewId, markReviewHelpful);

module.exports = router;
