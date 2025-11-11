const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// Import validation middleware
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateDeactivateAccount,
  validateReactivateAccount,
} = require("../validation/userValidation");

// Import controller
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserOrders,
  getUserOrderById,
  deactivateAccount,
  reactivateAccount,
  getUserDashboard,
} = require("../controllers/userController");

// Public routes
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.put("/reactivate", validateReactivateAccount, reactivateAccount);

// Protected routes
router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, validateUpdateProfile, updateUserProfile);
router.put("/change-password", auth, validateChangePassword, changePassword);
router.get("/orders", auth, getUserOrders);
router.get("/orders/:orderId", auth, getUserOrderById);
router.put("/deactivate", auth, validateDeactivateAccount, deactivateAccount);
router.get("/dashboard", auth, getUserDashboard);

module.exports = router;
