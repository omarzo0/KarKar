const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middleware/adminAuth");

const {
    getAllShippingFees,
    getShippingFeeById,
    createShippingFee,
    updateShippingFee,
    deleteShippingFee,
    toggleShippingFeeStatus,
} = require("../../controllers/admin/shippingFeeController");

const {
    validateGetShippingFees,
    validateShippingFeeId,
    validateCreateShippingFee,
    validateUpdateShippingFee,

} = require("../../validations/admin/shippingFeeValidation");

// All routes require admin authentication
router.use(adminAuth);


// Get all shipping fees
router.get(
    "/",
    validateGetShippingFees,
    getAllShippingFees
);

// Get shipping fee by ID
router.get(
    "/:id",
    validateShippingFeeId,
    getShippingFeeById
);

// Create new shipping fee
router.post(
    "/",
    validateCreateShippingFee,
    createShippingFee
);

// Update shipping fee
router.put(
    "/:id",
    validateUpdateShippingFee,
    updateShippingFee
);

// Delete shipping fee
router.delete(
    "/:id",
    validateShippingFeeId,
    deleteShippingFee
);

// Toggle shipping fee status
router.patch(
    "/:id/toggle",
    validateShippingFeeId,
    toggleShippingFeeStatus
);

module.exports = router;
