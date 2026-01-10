const express = require("express");
const router = express.Router();
const { userAuth, optionalAuth } = require("../../middleware/userAuth");
const { validateCouponCode } = require("../../validations/user/couponValidation");
const { getAvailableCoupons, validateCouponCode: validateCouponController } = require("../../controllers/user/couponController");

// Get available coupons (now using optionalAuth to allow guests to see public coupons)
router.get("/", optionalAuth, getAvailableCoupons);

// Validate coupon code (optional auth for guests)
router.post("/validate", optionalAuth, validateCouponCode, validateCouponController);

module.exports = router;
