const Admin = require("../models/Admin");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Analytics = require("../models/Analytics");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// @desc    Register a new admin (Super Admin only)
// @route   POST /api/admin/register
// @access  Private (Super Admin)
const registerAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      permissions,
    } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = new Admin({
      username,
      email,
      password: hashedPassword,
      profile: {
        firstName,
        lastName,
        phone,
      },
      permissions: permissions || {
        canManageUsers: false,
        canManageProducts: false,
        canManageOrders: false,
        canManageInventory: false,
        canViewAnalytics: false,
        canManagePayments: false,
      },
    });

    await admin.save();

    // Remove password from response
    const adminResponse = {
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      profile: admin.profile,
      permissions: admin.permissions,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        admin: adminResponse,
      },
    });
  } catch (error) {
    console.error("Admin register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during admin registration",
      error: error.message,
    });
  }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin account is deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from response
    const adminResponse = {
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      profile: admin.profile,
      permissions: admin.permissions,
      role: admin.role,
      lastLogin: admin.lastLogin,
    };

    res.json({
      success: true,
      message: "Admin login successful",
      data: {
        admin: adminResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during admin login",
      error: error.message,
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.adminId).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      data: {
        admin,
      },
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching admin profile",
      error: error.message,
    });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin)
const updateAdminProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, phone } = req.body;

    const admin = await Admin.findById(req.admin.adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Update profile fields
    if (firstName) admin.profile.firstName = firstName;
    if (lastName) admin.profile.lastName = lastName;
    if (phone) admin.profile.phone = phone;

    admin.updatedAt = new Date();
    await admin.save();

    // Remove password from response
    const adminResponse = {
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      profile: admin.profile,
      permissions: admin.permissions,
      role: admin.role,
      updatedAt: admin.updatedAt,
    };

    res.json({
      success: true,
      message: "Admin profile updated successfully",
      data: {
        admin: adminResponse,
      },
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating admin profile",
      error: error.message,
    });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private (Admin)
const changeAdminPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin.adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    admin.updatedAt = new Date();

    await admin.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change admin password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
      error: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin - canManageUsers)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalUsers = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:userId
// @access  Private (Admin - canManageUsers)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's orders count
    const ordersCount = await Order.countDocuments({ userId: user._id });

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          ordersCount,
        },
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:userId
// @access  Private (Admin - canManageUsers)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { profile, isActive } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields
    if (profile) {
      if (profile.firstName) user.profile.firstName = profile.firstName;
      if (profile.lastName) user.profile.lastName = profile.lastName;
      if (profile.phone) user.profile.phone = profile.phone;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          isActive: user.isActive,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: error.message,
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin - canViewAnalytics)
const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totals.total" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "username email profile"),
      Product.find({ "inventory.quantity": { $lte: 10 } })
        .sort({ "inventory.quantity": 1 })
        .limit(10)
        .select("name inventory.quantity images"),
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: revenue,
        },
        recentOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
      error: error.message,
    });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin - canManageOrders)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate("userId", "username email profile")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
};

// @desc    Update order
// @route   PUT /api/admin/orders/:orderId
// @access  Private (Admin - canManageOrders)
const updateOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { status, paymentStatus, trackingNumber } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order fields
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    order.handledBy = req.admin.adminId;
    order.updatedAt = new Date();
    await order.save();

    // Populate the updated order
    const updatedOrder = await Order.findById(order._id)
      .populate("userId", "username email profile")
      .populate("handledBy", "username profile");

    res.json({
      success: true,
      message: "Order updated successfully",
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating order",
      error: error.message,
    });
  }
};

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private (Super Admin)
const getAllAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const admins = await Admin.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalAdmins = await Admin.countDocuments(filter);

    res.json({
      success: true,
      data: {
        admins,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalAdmins / limit),
        totalAdmins,
      },
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching admins",
      error: error.message,
    });
  }
};

module.exports = {
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
};
