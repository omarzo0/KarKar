const express = require("express");
const router = express.Router();
const { adminAuth, requirePermission } = require("../middleware/adminAuth");

// Import validation middleware
const {
  validateAdminRegister,
  validateAdminLogin,
  validateAdminUpdateProfile,
  validateAdminChangePassword,
  validateUserId,
  validateUserUpdate,
  validateOrderId,
  validateOrderUpdate,
} = require("../validations/adminValidation");

// Import controller
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAllUsers,
  getUserById,
  updateUser,
  getAdminDashboard,
  getAllOrders,
  updateOrder,
  getAllAdmins,
} = require("../controllers/adminController");

// Public routes
router.post("/login", validateAdminLogin, loginAdmin);

// Protected routes
router.get("/profile", adminAuth, getAdminProfile);
router.put(
  "/profile",
  adminAuth,
  validateAdminUpdateProfile,
  updateAdminProfile
);
router.put(
  "/change-password",
  adminAuth,
  validateAdminChangePassword,
  changeAdminPassword
);

// User management routes
router.get(
  "/users",
  adminAuth,
  requirePermission("canManageUsers"),
  getAllUsers
);
router.get(
  "/users/:userId",
  adminAuth,
  requirePermission("canManageUsers"),
  validateUserId,
  getUserById
);
router.put(
  "/users/:userId",
  adminAuth,
  requirePermission("canManageUsers"),
  validateUserId,
  validateUserUpdate,
  updateUser
);

// Order management routes
router.get(
  "/orders",
  adminAuth,
  requirePermission("canManageOrders"),
  getAllOrders
);
router.put(
  "/orders/:orderId",
  adminAuth,
  requirePermission("canManageOrders"),
  validateOrderId,
  validateOrderUpdate,
  updateOrder
);

// Dashboard route
router.get(
  "/dashboard",
  adminAuth,
  requirePermission("canViewAnalytics"),
  getAdminDashboard
);

// Admin management routes (Super Admin only)
router.post("/register", adminAuth, validateAdminRegister, registerAdmin);
router.get("/admins", adminAuth, getAllAdmins);

module.exports = router;
