// routes/admin/couponRoutes.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middleware/adminAuth");
const {
  validateCreateCoupon,
  validateUpdateCoupon,
  validateCouponId,
  validateBulkStatus,
  validateValidateCoupon,
} = require("../../validations/admin/couponValidation");
const {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  generateCouponCode,
  getCouponAnalytics,
  bulkUpdateStatus,
  validateCoupon,
} = require("../../controllers/admin/couponController");

// All routes require admin authentication
router.use(adminAuth);

// Generate coupon code (no permission required)
router.get("/generate-code", generateCouponCode);

// Validate coupon
router.post("/validate", validateValidateCoupon, validateCoupon);

// Bulk operations
router.patch(
  "/bulk-status",
  validateBulkStatus,
  bulkUpdateStatus
);

// CRUD operations
router.get("/", getAllCoupons);
router.post(
  "/",
  validateCreateCoupon,
  createCoupon
);

// Single coupon operations
router.get(
  "/:couponId",
  validateCouponId,
  getCouponById
);
router.put(
  "/:couponId",
  validateCouponId,
  validateUpdateCoupon,
  updateCoupon
);
router.delete(
  "/:couponId",
  validateCouponId,
  deleteCoupon
);
router.patch(
  "/:couponId/toggle-status",
  validateCouponId,
  toggleCouponStatus
);
router.get(
  "/:couponId/analytics",
  validateCouponId,
  getCouponAnalytics
);

module.exports = router;
