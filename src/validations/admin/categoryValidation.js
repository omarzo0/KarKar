const { body, param } = require("express-validator");

const validateCreateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),

  body("icon")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Icon path/name too long"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("showInMenu")
    .optional()
    .isBoolean()
    .withMessage("showInMenu must be a boolean"),

  body("showInHomepage")
    .optional()
    .isBoolean()
    .withMessage("showInHomepage must be a boolean"),

  body("subcategories")
    .optional()
    .isArray()
    .withMessage("Subcategories must be an array"),

  body("subcategories.*.name")
    .if(body("subcategories").exists())
    .trim()
    .notEmpty()
    .withMessage("Subcategory name is required"),

  body("subcategories.*.icon")
    .optional()
    .trim(),

  body("subcategories.*.isActive")
    .optional()
    .isBoolean(),
];

const validateUpdateCategory = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),

  body("icon")
    .optional()
    .trim(),

  body("isActive")
    .optional()
    .isBoolean(),

  body("showInMenu")
    .optional()
    .isBoolean(),

  body("showInHomepage")
    .optional()
    .isBoolean(),

  body("subcategories")
    .optional()
    .isArray(),

  body("subcategories.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Subcategory name is required"),

  body("subcategories.*.icon")
    .optional()
    .trim(),

  body("subcategories.*.isActive")
    .optional()
    .isBoolean(),
];

const validateCategoryId = [
  param("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Invalid category ID format"),
];

const validateReorderCategories = [
  body("categories")
    .isArray({ min: 1 })
    .withMessage("Categories must be a non-empty array"),

  body("categories.*.categoryId")
    .isMongoId()
    .withMessage("Invalid category ID format"),

  body("categories.*.displayOrder")
    .isInt({ min: 0 })
    .withMessage("Display order must be a non-negative integer"),
];

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
  validateReorderCategories,
};
