const { body, param, query } = require("express-validator");

const validateCreateReview = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Valid product ID is required"),

  body("orderId")
    .optional()
    .isMongoId()
    .withMessage("Valid order ID is required"),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("title")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("comment")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),

  body("images")
    .optional()
    .isArray({ max: 5 })
    .withMessage("Maximum 5 images allowed"),

  body("images.*")
    .optional()
    .isURL()
    .withMessage("Each image must be a valid URL"),

  body("detailedRatings.quality")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Quality rating must be between 1 and 5"),

  body("detailedRatings.value")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Value rating must be between 1 and 5"),

  body("detailedRatings.delivery")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Delivery rating must be between 1 and 5"),
];

const validateUpdateReview = [
  param("reviewId")
    .isMongoId()
    .withMessage("Valid review ID is required"),

  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("title")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("comment")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),

  body("images")
    .optional()
    .isArray({ max: 5 })
    .withMessage("Maximum 5 images allowed"),
];

const validateReviewId = [
  param("reviewId")
    .isMongoId()
    .withMessage("Valid review ID is required"),
];

const validateProductId = [
  param("productId")
    .isMongoId()
    .withMessage("Valid product ID is required"),
];

const validateGetProductReviews = [
  param("productId")
    .isMongoId()
    .withMessage("Valid product ID is required"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),

  query("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating filter must be between 1 and 5"),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "rating", "helpful.count"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];

module.exports = {
  validateCreateReview,
  validateUpdateReview,
  validateReviewId,
  validateProductId,
  validateGetProductReviews,
};
