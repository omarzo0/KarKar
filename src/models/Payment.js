const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "debit_card", "paypal", "stripe"],
    required: true,
  },
  paymentDetails: {
    cardLast4: { type: String },
    cardBrand: { type: String },
    paymentGateway: { type: String },
    transactionId: { type: String },
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  paymentDate: { type: Date },
  refundAmount: { type: Number, default: 0 },
  refundDate: { type: Date },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
