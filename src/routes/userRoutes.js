const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// Authentication routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// User profile / account routes
router.get("/profile", userController.getUserProfile);
router.put("/profile", userController.updateUserProfile);
router.put("/change-password", userController.changePassword);

// Orders and dashboard
router.get("/orders", userController.getUserOrders);
router.get("/orders/:orderId", userController.getUserOrderById);

// Account management
router.put("/deactivate", userController.deactivateAccount);
router.put("/reactivate", userController.reactivateAccount);

// Dashboard
router.get("/dashboard", userController.getUserDashboard);

module.exports = router;
