const { body, param, query } = require("express-validator");

const validateGetShippingFees = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("type")
    .optional()
    .isIn(["flat", "weight_based", "price_based", "location_based", "free"])
    .withMessage("Invalid shipping fee type"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  query("search")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Search query cannot exceed 100 characters"),
];

const validateShippingFeeId = [
  param("id").isMongoId().withMessage("Valid shipping fee ID is required"),
];

const validateCreateShippingFee = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["flat", "weight_based", "price_based", "location_based", "free"])
    .withMessage("Invalid shipping fee type"),

  body("flatRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Flat rate must be a positive number"),

  body("weightBased.baseWeight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Base weight must be a positive number"),

  body("weightBased.basePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Base price must be a positive number"),

  body("weightBased.additionalPerKg")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Additional per kg must be a positive number"),

  body("priceBased.minOrderAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min order amount must be a positive number"),

  body("priceBased.feeUnderMinimum")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Fee under minimum must be a positive number"),

  body("locations")
    .optional()
    .isArray()
    .withMessage("Locations must be an array"),

  body("locations.*.fee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Location fee must be a positive number"),

  body("applicableCountries")
    .optional()
    .isArray()
    .withMessage("Applicable countries must be an array"),

  body("applicableStates")
    .optional()
    .isArray()
    .withMessage("Applicable states must be an array"),

  body("conditions.minOrderAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min order amount must be a positive number"),

  body("conditions.maxOrderAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max order amount must be a positive number"),

  body("conditions.minWeight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min weight must be a positive number"),

  body("conditions.maxWeight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max weight must be a positive number"),

  body("estimatedDelivery.minDays")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Min days must be a non-negative integer"),

  body("estimatedDelivery.maxDays")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Max days must be a non-negative integer"),

  body("priority")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Priority must be a non-negative integer"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
];

const validateUpdateShippingFee = [
  param("id").isMongoId().withMessage("Valid shipping fee ID is required"),

  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("type")
    .optional()
    .isIn(["flat", "weight_based", "price_based", "location_based", "free"])
    .withMessage("Invalid shipping fee type"),

  body("flatRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Flat rate must be a positive number"),

  body("weightBased.baseWeight")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Base weight must be a positive number"),

  body("weightBased.basePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Base price must be a positive number"),

  body("weightBased.additionalPerKg")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Additional per kg must be a positive number"),

  body("priceBased.minOrderAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min order amount must be a positive number"),

  body("priceBased.feeUnderMinimum")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Fee under minimum must be a positive number"),

  body("locations")
    .optional()
    .isArray()
    .withMessage("Locations must be an array"),

  body("applicableCountries")
    .optional()
    .isArray()
    .withMessage("Applicable countries must be an array"),

  body("applicableStates")
    .optional()
    .isArray()
    .withMessage("Applicable states must be an array"),

  body("conditions.minOrderAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min order amount must be a positive number"),

  body("conditions.maxOrderAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max order amount must be a positive number"),

  body("estimatedDelivery.minDays")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Min days must be a non-negative integer"),

  body("estimatedDelivery.maxDays")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Max days must be a non-negative integer"),

  body("priority")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Priority must be a non-negative integer"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
];

module.exports = {
  validateGetShippingFees,
  validateShippingFeeId,
  validateCreateShippingFee,
  validateUpdateShippingFee,
};
