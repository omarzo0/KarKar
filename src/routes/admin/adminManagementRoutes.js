// routes/admin/adminManagementRoutes.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middleware/adminAuth");
const {
  validateAdminId,
  validateCreateAdmin,
  validateUpdateAdmin,
} = require("../../validations/admin/adminManagementValidation");
const {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin,
} = require("../../controllers/admin/adminManagementController");

// All routes require admin authentication
router.use(adminAuth);

// Admin users management (Super Admin only)
router.get("/",  getAllAdmins);
router.post("/", validateCreateAdmin, createAdmin);
router.get("/:adminId", validateAdminId, getAdminById);
router.put("/:adminId", validateAdminId, validateUpdateAdmin, updateAdmin);
router.patch(
  "/:adminId/toggle-status",
  validateAdminId,
  toggleAdminStatus
);
router.delete("/:adminId", validateAdminId, deleteAdmin);

module.exports = router;
