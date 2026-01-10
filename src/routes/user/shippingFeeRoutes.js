const express = require("express");
const router = express.Router();
const { getShippingFees } = require("../../controllers/user/shippingFeeController");

// Get all active shipping fees
router.get("/", getShippingFees);

module.exports = router;
