// routes/user/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middleware/userAuth");

const {
  validateCreatePayment,
  validateProcessPayment,
  validatePaymentId,
  validatePaymentQuery,
  validatePaymentMethodCheck,
  validateOrderId,
  validateGuestProcessPayment,
  validateGuestPaymentId,
} = require("../../validations/user/paymentValidation");

const {
  createPayment,
  processPayment,
  getPaymentById,
  getUserPayments,
  getAvailablePaymentMethods,
  validatePaymentMethod,
  getPaymentByOrder,
  retryPayment,
  processGuestPayment,
  getGuestPaymentById,
} = require("../../controllers/user/paymentController");

// Public route - get available payment methods
router.get("/methods", getAvailablePaymentMethods);

// Guest payment routes (Public with email verification)
router.post(
  "/guest/:paymentId/process",
  validateGuestProcessPayment,
  processGuestPayment
);

router.get(
  "/guest/:paymentId",
  validateGuestPaymentId,
  getGuestPaymentById
);

// User payment routes (require authentication)
router.post("/", userAuth, validateCreatePayment, createPayment);

// Validate payment method before order
router.post("/validate-method", userAuth, validatePaymentMethodCheck, validatePaymentMethod);

router.post(
  "/:paymentId/process",
  userAuth,
  validatePaymentId,
  validateProcessPayment,
  processPayment
);

// Retry failed payment
router.post("/:paymentId/retry", userAuth, validatePaymentId, retryPayment);

router.get("/", userAuth, validatePaymentQuery, getUserPayments);

// Get payment by order ID
router.get("/order/:orderId", userAuth, validateOrderId, getPaymentByOrder);

router.get("/:paymentId", userAuth, validatePaymentId, getPaymentById);

module.exports = router;
