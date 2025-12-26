const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middleware/userAuth");

const {
  getShippingOptions,
  calculateShippingFee,
  applyShippingToCart,
} = require("../../controllers/user/shippingController");

const {
  validateGetShippingOptions,
  validateCalculateShipping,
  validateApplyShipping,
} = require("../../validations/user/shippingValidation");

// All routes require user authentication
router.use(userAuth);

// Get available shipping options
router.get("/options", validateGetShippingOptions, getShippingOptions);

// Calculate shipping fee for specific option
router.post("/calculate", validateCalculateShipping, calculateShippingFee);

// Apply shipping to cart
router.post("/apply", validateApplyShipping, applyShippingToCart);

module.exports = router;
