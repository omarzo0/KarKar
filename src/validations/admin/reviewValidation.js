const { body, param, query } = require("express-validator");

const validateGetAllReviews = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Invalid status"),

  query("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  query("productId")
    .optional()
    .isMongoId()
    .withMessage("Valid product ID is required"),

  query("userId")
    .optional()
    .isMongoId()
    .withMessage("Valid user ID is required"),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "rating", "helpful.count", "status"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];

const validateReviewId = [
  param("reviewId")
    .isMongoId()
    .withMessage("Valid review ID is required"),
];

const validateRejectReview = [
  param("reviewId")
    .isMongoId()
    .withMessage("Valid review ID is required"),

  body("reason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
];

const validateBulkAction = [
  body("reviewIds")
    .isArray({ min: 1 })
    .withMessage("At least one review ID is required"),

  body("reviewIds.*")
    .isMongoId()
    .withMessage("Each review ID must be valid"),

  body("reason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
];

const validateSellerResponse = [
  param("reviewId")
    .isMongoId()
    .withMessage("Valid review ID is required"),

  body("comment")
    .notEmpty()
    .withMessage("Response comment is required")
    .isLength({ max: 1000 })
    .withMessage("Response cannot exceed 1000 characters"),
];

module.exports = {
  validateGetAllReviews,
  validateReviewId,
  validateRejectReview,
  validateBulkAction,
  validateSellerResponse,
};
