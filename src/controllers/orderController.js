const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Payment = require("../models/Payment");
const { validationResult } = require("express-validator");

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
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
      shippingAddress,
      billingAddress,
      shippingMethod,
      paymentMethod,
      notes,
    } = req.body;
    const userId = req.user.userId;

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Validate cart items availability and calculate totals
    const orderItems = [];
    let subtotal = 0;
    let outOfStockItems = [];

    for (const cartItem of cart.items) {
      const product = cartItem.productId;

      if (!product || product.status !== "active") {
        outOfStockItems.push({
          productId: product?._id,
          name: product?.name || "Unknown Product",
          reason: "Product no longer available",
        });
        continue;
      }

      if (product.inventory.quantity < cartItem.quantity) {
        outOfStockItems.push({
          productId: product._id,
          name: product.name,
          reason: `Only ${product.inventory.quantity} available in stock`,
        });
        continue;
      }

      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        subtotal: itemTotal,
        image: product.images?.[0],
      });
    }

    // Check if any items are out of stock
    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some items are no longer available",
        data: {
          outOfStockItems,
        },
      });
    }

    // Calculate totals
    const shippingFee = calculateShippingFee(shippingMethod, subtotal);
    const taxAmount = calculateTax(subtotal, shippingAddress.state);
    const total = subtotal + shippingFee + taxAmount;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = new Order({
      orderNumber,
      userId,
      customer: await getCustomerInfo(userId),
      items: orderItems,
      totals: {
        subtotal,
        tax: taxAmount,
        shipping: shippingFee,
        discount: cart.summary.totalDiscount || 0,
        total,
      },
      shippingAddress,
      billingAddress: billingAddress?.useShippingAddress
        ? shippingAddress
        : billingAddress,
      shippingMethod,
      paymentMethod,
      notes,
      status: "pending",
      paymentStatus: "pending",
    });

    await order.save();

    // Clear the cart after successful order creation
    await Cart.findOneAndUpdate(
      { userId },
      {
        items: [],
        summary: {
          itemsCount: 0,
          totalPrice: 0,
          totalDiscount: 0,
          shippingFee: 0,
          taxAmount: 0,
          grandTotal: 0,
        },
        coupon: undefined,
      }
    );

    // Update product inventory
    await updateProductInventory(orderItems);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order,
        paymentRequired: true, // Indicate that payment should be processed
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error: error.message,
    });
  }
};

// @desc    Create direct order (without cart)
// @route   POST /api/orders/direct
// @access  Private
const createDirectOrder = async (req, res) => {
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
      items,
      shippingAddress,
      billingAddress,
      shippingMethod,
      paymentMethod,
      notes,
    } = req.body;
    const userId = req.user.userId;

    // Validate items and calculate totals
    const orderItems = [];
    let subtotal = 0;
    let outOfStockItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || product.status !== "active") {
        outOfStockItems.push({
          productId: product?._id,
          name: product?.name || "Unknown Product",
          reason: "Product no longer available",
        });
        continue;
      }

      if (product.inventory.quantity < item.quantity) {
        outOfStockItems.push({
          productId: product._id,
          name: product.name,
          reason: `Only ${product.inventory.quantity} available in stock`,
        });
        continue;
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal,
        image: product.images?.[0],
      });
    }

    // Check if any items are out of stock
    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some items are no longer available",
        data: {
          outOfStockItems,
        },
      });
    }

    // Calculate totals
    const shippingFee = calculateShippingFee(shippingMethod, subtotal);
    const taxAmount = calculateTax(subtotal, shippingAddress.state);
    const total = subtotal + shippingFee + taxAmount;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = new Order({
      orderNumber,
      userId,
      customer: await getCustomerInfo(userId),
      items: orderItems,
      totals: {
        subtotal,
        tax: taxAmount,
        shipping: shippingFee,
        discount: 0,
        total,
      },
      shippingAddress,
      billingAddress: billingAddress?.useShippingAddress
        ? shippingAddress
        : billingAddress,
      shippingMethod,
      paymentMethod,
      notes,
      status: "pending",
      paymentStatus: "pending",
    });

    await order.save();

    // Update product inventory
    await updateProductInventory(orderItems);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order,
        paymentRequired: true,
      },
    });
  } catch (error) {
    console.error("Create direct order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error: error.message,
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
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
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const userId = req.user.userId;

    // Build filter
    const filter = { userId };
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "asc" ? 1 : -1;

    const orders = await Order.find(filter)
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("items.productId", "name images slug");

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page * limit < totalOrders,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("items.productId", "name images slug specifications")
      .populate("userId", "username email profile");

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
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order",
      error: error.message,
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in ${order.status} status`,
      });
    }

    // Update order status
    order.status = "cancelled";
    order.cancellationReason = reason;
    order.updatedAt = new Date();
    await order.save();

    // Restore product inventory
    await restoreProductInventory(order.items);

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while cancelling order",
      error: error.message,
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getAllOrders = async (req, res) => {
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
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "asc" ? 1 : -1;

    const orders = await Order.find(filter)
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "username email profile")
      .populate("items.productId", "name images");

    const totalOrders = await Order.countDocuments(filter);

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totals.total" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totals.total" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page * limit < totalOrders,
          hasPrev: page > 1,
        },
        statistics: orderStats[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
        },
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

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:orderId/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order status
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.handledBy = req.admin.adminId;
    order.updatedAt = new Date();
    await order.save();

    // Populate the updated order
    const updatedOrder = await Order.findById(orderId)
      .populate("userId", "username email profile")
      .populate("handledBy", "username profile");

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating order status",
      error: error.message,
    });
  }
};

// @desc    Update payment status (Admin)
// @route   PUT /api/admin/orders/:orderId/payment-status
// @access  Private (Admin)
const updatePaymentStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { orderId } = req.params;
    const { paymentStatus, refundAmount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update payment status
    order.paymentStatus = paymentStatus;
    if (paymentStatus === "refunded" && refundAmount) {
      order.refundAmount = refundAmount;
      order.refundDate = new Date();
    }
    order.updatedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: "Payment status updated successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating payment status",
      error: error.message,
    });
  }
};

// @desc    Process refund (Admin)
// @route   POST /api/admin/orders/:orderId/refund
// @access  Private (Admin)
const processRefund = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { orderId } = req.params;
    const { refundAmount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate order can be refunded
    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid orders can be refunded",
      });
    }

    const actualRefundAmount = refundAmount || order.totals.total;

    // Update order
    order.paymentStatus = "refunded";
    order.refundAmount = actualRefundAmount;
    order.refundDate = new Date();
    order.refundReason = reason;
    order.updatedAt = new Date();
    await order.save();

    // Restore product inventory
    await restoreProductInventory(order.items);

    // Create refund record (you might want to create a separate Refund model)
    // await Refund.create({ ... })

    res.json({
      success: true,
      message: "Refund processed successfully",
      data: {
        order,
        refundAmount: actualRefundAmount,
      },
    });
  } catch (error) {
    console.error("Process refund error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing refund",
      error: error.message,
    });
  }
};

// @desc    Bulk order operations (Admin)
// @route   POST /api/admin/orders/bulk
// @access  Private (Admin)
const bulkOrderOperation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { orderIds, action, data } = req.body;

    let result;
    switch (action) {
      case "confirm":
        result = await Order.updateMany(
          { _id: { $in: orderIds }, status: "pending" },
          {
            $set: {
              status: "confirmed",
              updatedAt: new Date(),
              handledBy: req.admin.adminId,
            },
          }
        );
        break;

      case "ship":
        result = await Order.updateMany(
          { _id: { $in: orderIds }, status: "confirmed" },
          {
            $set: {
              status: "shipped",
              trackingNumber: data?.trackingNumber,
              updatedAt: new Date(),
              handledBy: req.admin.adminId,
            },
          }
        );
        break;

      case "cancel":
        result = await Order.updateMany(
          { _id: { $in: orderIds }, status: { $in: ["pending", "confirmed"] } },
          {
            $set: {
              status: "cancelled",
              cancellationReason: data?.reason,
              updatedAt: new Date(),
              handledBy: req.admin.adminId,
            },
          }
        );

        // Restore inventory for cancelled orders
        if (result.modifiedCount > 0) {
          const cancelledOrders = await Order.find({ _id: { $in: orderIds } });
          for (const order of cancelledOrders) {
            await restoreProductInventory(order.items);
          }
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action",
        });
    }

    res.json({
      success: true,
      message: `Bulk operation completed: ${action}`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Bulk order operation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while performing bulk operation",
      error: error.message,
    });
  }
};

// Helper functions
const calculateShippingFee = (shippingMethod, subtotal) => {
  const shippingRates = {
    standard: 4.99,
    express: 9.99,
    overnight: 19.99,
  };

  // Free shipping for orders over $50
  if (subtotal >= 50) {
    return 0;
  }

  return shippingRates[shippingMethod] || 4.99;
};

const calculateTax = (subtotal, state) => {
  // Simplified tax calculation - in real app, use tax API
  const taxRates = {
    CA: 0.0825,
    NY: 0.08875,
    TX: 0.0825,
    FL: 0.07,
  };

  const taxRate = taxRates[state] || 0.06; // Default 6%
  return parseFloat((subtotal * taxRate).toFixed(2));
};

const generateOrderNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Get today's order count
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const todaysOrderCount = await Order.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const sequence = String(todaysOrderCount + 1).padStart(4, "0");
  return `ORD-${year}${month}${day}-${sequence}`;
};

const getCustomerInfo = async (userId) => {
  const user = await User.findById(userId).select("email profile");
  return {
    email: user.email,
    firstName: user.profile.firstName,
    lastName: user.profile.lastName,
  };
};

const updateProductInventory = async (orderItems) => {
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { "inventory.quantity": -item.quantity },
    });
  }
};

const restoreProductInventory = async (orderItems) => {
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { "inventory.quantity": item.quantity },
    });
  }
};

module.exports = {
  createOrder,
  createDirectOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  processRefund,
  bulkOrderOperation,
};
