const { body, query } = require("express-validator");

const validateGetShippingOptions = [
  query("country")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Country cannot exceed 100 characters"),

  query("state")
    .optional()
    .isLength({ max: 100 })
    .withMessage("State cannot exceed 100 characters"),

  query("city")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters"),

  query("zipCode")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Zip code cannot exceed 20 characters"),
];

const validateCalculateShipping = [
  body("shippingFeeId")
    .notEmpty()
    .withMessage("Shipping fee ID is required")
    .isMongoId()
    .withMessage("Valid shipping fee ID is required"),

  body("country")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Country cannot exceed 100 characters"),

  body("state")
    .optional()
    .isLength({ max: 100 })
    .withMessage("State cannot exceed 100 characters"),

  body("city")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters"),

  body("zipCode")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Zip code cannot exceed 20 characters"),
];

const validateApplyShipping = [
  body("shippingFeeId")
    .notEmpty()
    .withMessage("Shipping fee ID is required")
    .isMongoId()
    .withMessage("Valid shipping fee ID is required"),

  body("shippingAddress.street")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Street cannot exceed 200 characters"),

  body("shippingAddress.city")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters"),

  body("shippingAddress.state")
    .optional()
    .isLength({ max: 100 })
    .withMessage("State cannot exceed 100 characters"),

  body("shippingAddress.zipCode")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Zip code cannot exceed 20 characters"),

  body("shippingAddress.country")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Country cannot exceed 100 characters"),
];

module.exports = {
  validateGetShippingOptions,
  validateCalculateShipping,
  validateApplyShipping,
};
