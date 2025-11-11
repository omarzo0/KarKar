const { body, param, query } = require("express-validator");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Create order validation
const validateCreateOrder = [
  body("shippingAddress.street")
    .notEmpty()
    .withMessage("Street address is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Street address must be between 5 and 200 characters"),

  body("shippingAddress.city")
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("shippingAddress.state")
    .notEmpty()
    .withMessage("State is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),

  body("shippingAddress.zipCode")
    .notEmpty()
    .withMessage("Zip code is required")
    .isPostalCode("any")
    .withMessage("Valid zip/postal code is required"),

  body("shippingAddress.country")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters")
    .default("USA"),

  body("billingAddress")
    .optional()
    .isObject()
    .withMessage("Billing address must be an object"),

  body("billingAddress.useShippingAddress")
    .optional()
    .isBoolean()
    .withMessage("useShippingAddress must be a boolean"),

  body("shippingMethod")
    .notEmpty()
    .withMessage("Shipping method is required")
    .isIn(["standard", "express", "overnight"])
    .withMessage("Shipping method must be standard, express, or overnight"),

  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["credit_card", "debit_card", "paypal", "stripe"])
    .withMessage(
      "Payment method must be credit_card, debit_card, paypal, or stripe"
    ),

  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

// Order ID validation
const validateOrderId = [
  param("orderId")
    .isMongoId()
    .withMessage("Valid order ID is required")
    .custom(async (orderId, { req }) => {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // For regular users, ensure they can only access their own orders
      if (
        req.user?.role === "user" &&
        order.userId.toString() !== req.user.userId
      ) {
        throw new Error("Access denied");
      }

      return true;
    }),
];

// Update order status validation (Admin)
const validateUpdateOrderStatus = [
  param("orderId").isMongoId().withMessage("Valid order ID is required"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"])
    .withMessage(
      "Status must be pending, confirmed, shipped, delivered, or cancelled"
    ),

  body("trackingNumber")
    .optional()
    .isLength({ min: 5, max: 50 })
    .withMessage("Tracking number must be between 5 and 50 characters"),
];

// Update payment status validation (Admin)
const validateUpdatePaymentStatus = [
  param("orderId").isMongoId().withMessage("Valid order ID is required"),

  body("paymentStatus")
    .notEmpty()
    .withMessage("Payment status is required")
    .isIn(["pending", "paid", "failed", "refunded"])
    .withMessage("Payment status must be pending, paid, failed, or refunded"),

  body("refundAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Refund amount must be a positive number"),
];

// Query validation for order listing
const validateOrderQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),

  query("status")
    .optional()
    .isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"])
    .withMessage(
      "Status must be pending, confirmed, shipped, delivered, or cancelled"
    ),

  query("paymentStatus")
    .optional()
    .isIn(["pending", "paid", "failed", "refunded"])
    .withMessage("Payment status must be pending, paid, failed, or refunded"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((endDate, { req }) => {
      if (
        req.query.startDate &&
        new Date(endDate) < new Date(req.query.startDate)
      ) {
        throw new Error("End date cannot be before start date");
      }
      return true;
    }),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "updatedAt", "total", "status"])
    .withMessage("Sort by must be createdAt, updatedAt, total, or status"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either asc or desc"),
];

// Cancel order validation
const validateCancelOrder = [
  param("orderId").isMongoId().withMessage("Valid order ID is required"),

  body("reason")
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage("Reason must be between 5 and 500 characters"),
];

// Refund validation
const validateRefundOrder = [
  param("orderId").isMongoId().withMessage("Valid order ID is required"),

  body("refundAmount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Refund amount must be a positive number"),

  body("reason")
    .notEmpty()
    .withMessage("Refund reason is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Reason must be between 5 and 500 characters"),
];

// Order items validation (for direct order creation)
const validateOrderItems = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),

  body("items.*.productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Valid product ID is required")
    .custom(async (productId) => {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }
      if (product.status !== "active") {
        throw new Error(`Product is not available: ${product.name}`);
      }
      return true;
    }),

  body("items.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1, max: 10 })
    .withMessage("Quantity must be between 1 and 10")
    .custom(async (quantity, { req, path }) => {
      const index = path.match(/\[(\d+)\]/)[1];
      const productId = req.body.items[index].productId;

      if (productId) {
        const product = await Product.findById(productId);
        if (product && quantity > product.inventory.quantity) {
          throw new Error(
            `Only ${product.inventory.quantity} items available for ${product.name}`
          );
        }
      }
      return true;
    }),
];

// Bulk order operations validation (Admin)
const validateBulkOrderOperation = [
  body("orderIds")
    .isArray({ min: 1 })
    .withMessage("Order IDs array is required with at least one ID")
    .custom((orderIds) => {
      if (!orderIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("All order IDs must be valid MongoDB IDs");
      }
      return true;
    }),

  body("action")
    .isIn(["confirm", "ship", "cancel", "refund"])
    .withMessage("Action must be one of: confirm, ship, cancel, refund"),

  body("data").optional().isObject().withMessage("Data must be an object"),
];

module.exports = {
  validateCreateOrder,
  validateOrderId,
  validateUpdateOrderStatus,
  validateUpdatePaymentStatus,
  validateOrderQuery,
  validateCancelOrder,
  validateRefundOrder,
  validateOrderItems,
  validateBulkOrderOperation,
};
