const User = require("../models/User");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { username, email, password, firstName, lastName, phone } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      profile: {
        firstName,
        lastName,
        phone,
      },
    });

    await user.save();

    // Create empty cart for user
    const cart = new Cart({
      userId: user._id,
    });
    await cart.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Remove password from response
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
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

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Remove password from response
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      preferences: user.preferences,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
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
      firstName,
      lastName,
      phone,
      street,
      city,
      state,
      zipCode,
      country,
      newsletter,
      notifications,
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update profile fields
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (phone) user.profile.phone = phone;

    // Update address
    if (street || city || state || zipCode || country) {
      user.address = {
        street: street || user.address?.street,
        city: city || user.address?.city,
        state: state || user.address?.state,
        zipCode: zipCode || user.address?.zipCode,
        country: country || user.address?.country || "USA",
      };
    }

    // Update preferences
    if (newsletter !== undefined) user.preferences.newsletter = newsletter;
    if (notifications !== undefined)
      user.preferences.notifications = notifications;

    user.updatedAt = new Date();
    await user.save();

    // Remove password from response
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      address: user.address,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
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

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
      error: error.message,
    });
  }
};

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId: req.user.userId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("items.productId", "name images");

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
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
};

// @desc    Get user order by ID
// @route   GET /api/users/orders/:orderId
// @access  Private
const getUserOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.userId,
    }).populate("items.productId", "name images specifications");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order",
      error: error.message,
    });
  }
};

// @desc    Deactivate user account
// @route   PUT /api/users/deactivate
// @access  Private
const deactivateAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { password } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    user.isActive = false;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deactivating account",
      error: error.message,
    });
  }
};

// @desc    Reactivate user account
// @route   PUT /api/users/reactivate
// @access  Public
const reactivateAccount = async (req, res) => {
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    user.isActive = true;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Account reactivated successfully",
    });
  } catch (error) {
    console.error("Reactivate account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reactivating account",
      error: error.message,
    });
  }
};

// @desc    Get user dashboard statistics
// @route   GET /api/users/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [totalOrders, pendingOrders, deliveredOrders, recentOrders, cart] =
      await Promise.all([
        Order.countDocuments({ userId }),
        Order.countDocuments({ userId, status: "pending" }),
        Order.countDocuments({ userId, status: "delivered" }),
        Order.find({ userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("orderNumber status total totalAmount createdAt"),
        Cart.findOne({ userId }).populate("items.productId", "name images"),
      ]);

    res.json({
      success: true,
      data: {
        statistics: {
          totalOrders,
          pendingOrders,
          deliveredOrders,
        },
        recentOrders,
        cart: cart || { items: [] },
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
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
};
