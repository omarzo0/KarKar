// Notification Controller (Email and SMS)
const User = require("../models/User");
const Order = require("../models/Order");

// Send notification (placeholder)
exports.sendNotification = async (req, res) => {
  try {
    const { userId, type, message } = req.body;

    if (!userId || !type || !message) {
      return res
        .status(400)
        .json({ error: "Please provide userId, type, and message" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Here you would integrate with email/SMS services
    console.log(`Sending ${type} notification to ${user.email}: ${message}`);

    res.json({
      message: `${type} notification sent to ${user.email}`,
      userId,
      type,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send order confirmation
exports.sendOrderConfirmation = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("userId");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const user = order.userId;
    const message = `Your order #${orderId} has been confirmed. Total: $${order.totalAmount}`;

    console.log(`Sending order confirmation to ${user.email}: ${message}`);

    res.json({
      message: `Order confirmation sent to ${user.email}`,
      orderId,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send order status update
exports.sendOrderStatusUpdate = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId).populate("userId");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const user = order.userId;
    const message = `Your order #${orderId} status has been updated to: ${status}`;

    console.log(`Sending status update to ${user.email}: ${message}`);

    res.json({
      message: `Status update sent to ${user.email}`,
      orderId,
      status,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send payment confirmation
exports.sendPaymentConfirmation = async (req, res) => {
  try {
    const { userId, orderId, amount } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const message = `Payment of $${amount} for order #${orderId} has been confirmed`;

    console.log(`Sending payment confirmation to ${user.email}: ${message}`);

    res.json({
      message: `Payment confirmation sent to ${user.email}`,
      userId,
      orderId,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
