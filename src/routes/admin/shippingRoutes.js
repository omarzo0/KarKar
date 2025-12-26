const express = require("express");
const router = express.Router();
const {
  adminAuth,
  requirePermission,
} = require("../../middleware/adminAuth");

const {
  getAllShippingFees,
  getShippingFeeById,
  createShippingFee,
  updateShippingFee,
  deleteShippingFee,
  toggleShippingFeeStatus,
  setDefaultShippingFee,
} = require("../../controllers/admin/shippingController");

const {
  validateGetShippingFees,
  validateShippingFeeId,
  validateCreateShippingFee,
  validateUpdateShippingFee,
} = require("../../validations/admin/shippingValidation");

// All routes require admin authentication
router.use(adminAuth);

// Get all shipping fees
router.get(
  "/",
  requirePermission("canManageProducts"),
  validateGetShippingFees,
  getAllShippingFees
);

// Get shipping fee by ID
router.get(
  "/:id",
  requirePermission("canManageProducts"),
  validateShippingFeeId,
  getShippingFeeById
);

// Create new shipping fee
router.post(
  "/",
  requirePermission("canManageProducts"),
  validateCreateShippingFee,
  createShippingFee
);

// Update shipping fee
router.put(
  "/:id",
  requirePermission("canManageProducts"),
  validateUpdateShippingFee,
  updateShippingFee
);

// Delete shipping fee
router.delete(
  "/:id",
  requirePermission("canManageProducts"),
  validateShippingFeeId,
  deleteShippingFee
);

// Toggle shipping fee status
router.patch(
  "/:id/toggle",
  requirePermission("canManageProducts"),
  validateShippingFeeId,
  toggleShippingFeeStatus
);

// Set default shipping fee
router.patch(
  "/:id/set-default",
  requirePermission("canManageProducts"),
  validateShippingFeeId,
  setDefaultShippingFee
);

module.exports = router;
