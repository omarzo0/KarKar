const { body, param } = require("express-validator");
const Admin = require("../models/Admin");
const User = require("../models/User");

// Admin registration validation
const validateAdminRegister = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters")
    .custom(async (username) => {
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        throw new Error("Username already exists");
      }
      return true;
    }),

  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail()
    .custom(async (email) => {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        throw new Error("Email already exists");
      }
      return true;
    }),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),

  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),
];

// Admin login validation
const validateAdminLogin = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Admin update profile validation
const validateAdminUpdateProfile = [
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  body("lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name cannot be empty")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Valid phone number is required"),
];

// Admin change password validation
const validateAdminChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    )
    .custom((newPassword, { req }) => {
      if (newPassword === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
];

// User management validation
const validateUserId = [
  param("userId")
    .isMongoId()
    .withMessage("Valid user ID is required")
    .custom(async (userId) => {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return true;
    }),
];

const validateUserUpdate = [
  param("userId").isMongoId().withMessage("Valid user ID is required"),

  body("profile.firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty"),

  body("profile.lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name cannot be empty"),

  body("profile.phone")
    .optional()
    .isMobilePhone()
    .withMessage("Valid phone number is required"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

// Product management validation
const validateProductId = [
  param("productId").isMongoId().withMessage("Valid product ID is required"),
];

// Order management validation
const validateOrderId = [
  param("orderId").isMongoId().withMessage("Valid order ID is required"),
];

const validateOrderUpdate = [
  param("orderId").isMongoId().withMessage("Valid order ID is required"),

  body("status")
    .optional()
    .isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid order status"),

  body("paymentStatus")
    .optional()
    .isIn(["pending", "paid", "failed", "refunded"])
    .withMessage("Invalid payment status"),

  body("trackingNumber")
    .optional()
    .notEmpty()
    .withMessage("Tracking number cannot be empty"),
];

// Analytics validation
const validateAnalyticsDateRange = [
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((endDate, { req }) => {
      if (
        req.body.startDate &&
        new Date(endDate) < new Date(req.body.startDate)
      ) {
        throw new Error("End date cannot be before start date");
      }
      return true;
    }),
];

// Permission update validation
const validatePermissionUpdate = [
  param("adminId").isMongoId().withMessage("Valid admin ID is required"),

  body("permissions").isObject().withMessage("Permissions must be an object"),

  body("permissions.canManageUsers")
    .optional()
    .isBoolean()
    .withMessage("canManageUsers must be a boolean"),

  body("permissions.canManageProducts")
    .optional()
    .isBoolean()
    .withMessage("canManageProducts must be a boolean"),

  body("permissions.canManageOrders")
    .optional()
    .isBoolean()
    .withMessage("canManageOrders must be a boolean"),

  body("permissions.canManageInventory")
    .optional()
    .isBoolean()
    .withMessage("canManageInventory must be a boolean"),

  body("permissions.canViewAnalytics")
    .optional()
    .isBoolean()
    .withMessage("canViewAnalytics must be a boolean"),

  body("permissions.canManagePayments")
    .optional()
    .isBoolean()
    .withMessage("canManagePayments must be a boolean"),
];

module.exports = {
  validateAdminRegister,
  validateAdminLogin,
  validateAdminUpdateProfile,
  validateAdminChangePassword,
  validateUserId,
  validateUserUpdate,
  validateProductId,
  validateOrderId,
  validateOrderUpdate,
  validateAnalyticsDateRange,
  validatePermissionUpdate,
};
