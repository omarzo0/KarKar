// controllers/user/shippingController.js
const ShippingFee = require("../../models/ShippingFee");
const Cart = require("../../models/Cart");
const { validationResult } = require("express-validator");

// @desc    Get available shipping options for checkout
// @route   GET /api/user/shipping/options
// @access  Private (User)
const getShippingOptions = async (req, res) => {
  try {
    const { country, state, city, zipCode } = req.query;

    // Get user's cart to calculate based on order total
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Calculate cart totals
    await cart.calculateTotals();
    const totalAmount = cart.summary.totalPrice;

    // Calculate total weight (if products have weight)
    let totalWeight = 0;
    for (const item of cart.items) {
      // Assuming weight is stored in product, default to 0.5kg per item
      totalWeight += (item.weight || 0.5) * item.quantity;
    }

    // Get all active shipping fees
    const shippingFees = await ShippingFee.find({ isActive: true }).sort({
      priority: 1,
    });

    // Calculate applicable shipping options
    const orderData = {
      totalAmount,
      totalWeight,
      country: country || cart.shippingAddress?.country,
      state: state || cart.shippingAddress?.state,
      city: city || cart.shippingAddress?.city,
      zipCode: zipCode || cart.shippingAddress?.zipCode,
    };

    const availableOptions = [];

    for (const shippingFee of shippingFees) {
      const result = shippingFee.calculateFee(orderData);
      if (result) {
        availableOptions.push(result);
      }
    }

    // If no options available, add default if exists
    if (availableOptions.length === 0) {
      const defaultFee = await ShippingFee.findOne({
        isActive: true,
        isDefault: true,
      });
      if (defaultFee) {
        availableOptions.push({
          shippingFeeId: defaultFee._id,
          name: defaultFee.name,
          description: defaultFee.description,
          fee: defaultFee.flatRate,
          estimatedDelivery: defaultFee.estimatedDelivery,
        });
      }
    }

    res.json({
      success: true,
      data: {
        shippingOptions: availableOptions,
        orderSummary: {
          subtotal: totalAmount,
          totalWeight,
          itemsCount: cart.summary.itemsCount,
        },
      },
    });
  } catch (error) {
    console.error("Get shipping options error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching shipping options",
      error: error.message,
    });
  }
};

// @desc    Calculate shipping fee for specific option
// @route   POST /api/user/shipping/calculate
// @access  Private (User)
const calculateShippingFee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { shippingFeeId, country, state, city, zipCode } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Get shipping fee
    const shippingFee = await ShippingFee.findOne({
      _id: shippingFeeId,
      isActive: true,
    });

    if (!shippingFee) {
      return res.status(404).json({
        success: false,
        message: "Shipping option not found or inactive",
      });
    }

    // Calculate cart totals
    await cart.calculateTotals();
    const totalAmount = cart.summary.totalPrice;

    // Calculate total weight
    let totalWeight = 0;
    for (const item of cart.items) {
      totalWeight += (item.weight || 0.5) * item.quantity;
    }

    const orderData = {
      totalAmount,
      totalWeight,
      country,
      state,
      city,
      zipCode,
    };

    const result = shippingFee.calculateFee(orderData);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "This shipping option is not available for your order",
      });
    }

    // Calculate final totals
    const subtotal = cart.summary.totalPrice;
    const discount = cart.summary.totalDiscount;
    const shippingCost = result.fee;
    const tax = cart.summary.taxAmount;
    const grandTotal = subtotal - discount + shippingCost + tax;

    res.json({
      success: true,
      data: {
        shipping: result,
        orderTotals: {
          subtotal,
          discount,
          shippingFee: shippingCost,
          tax,
          grandTotal: Math.round(grandTotal * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error("Calculate shipping fee error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while calculating shipping fee",
      error: error.message,
    });
  }
};

// @desc    Apply shipping to cart
// @route   POST /api/user/shipping/apply
// @access  Private (User)
const applyShippingToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { shippingFeeId, shippingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Get shipping fee
    const shippingFee = await ShippingFee.findOne({
      _id: shippingFeeId,
      isActive: true,
    });

    if (!shippingFee) {
      return res.status(404).json({
        success: false,
        message: "Shipping option not found or inactive",
      });
    }

    // Calculate cart totals
    await cart.calculateTotals();
    const totalAmount = cart.summary.totalPrice;

    // Calculate total weight
    let totalWeight = 0;
    for (const item of cart.items) {
      totalWeight += (item.weight || 0.5) * item.quantity;
    }

    const orderData = {
      totalAmount,
      totalWeight,
      country: shippingAddress?.country,
      state: shippingAddress?.state,
      city: shippingAddress?.city,
      zipCode: shippingAddress?.zipCode,
    };

    const result = shippingFee.calculateFee(orderData);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "This shipping option is not available for your location",
      });
    }

    // Update cart with shipping
    cart.shippingAddress = shippingAddress;
    cart.summary.shippingFee = result.fee;
    cart.selectedShipping = {
      shippingFeeId: shippingFee._id,
      name: shippingFee.name,
      fee: result.fee,
      estimatedDelivery: shippingFee.estimatedDelivery,
    };

    // Recalculate grand total
    cart.summary.grandTotal =
      cart.summary.totalPrice -
      cart.summary.totalDiscount +
      cart.summary.shippingFee +
      cart.summary.taxAmount;

    await cart.save();

    res.json({
      success: true,
      message: "Shipping applied successfully",
      data: {
        cart: {
          shippingAddress: cart.shippingAddress,
          selectedShipping: cart.selectedShipping,
          summary: cart.summary,
        },
      },
    });
  } catch (error) {
    console.error("Apply shipping error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while applying shipping",
      error: error.message,
    });
  }
};

module.exports = {
  getShippingOptions,
  calculateShippingFee,
  applyShippingToCart,
};
