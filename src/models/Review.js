const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    images: [
      {
        type: String,
      },
    ],
    // Detailed ratings (optional)
    detailedRatings: {
      quality: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
      delivery: { type: Number, min: 1, max: 5 },
    },
    // Helpful votes
    helpful: {
      count: { type: Number, default: 0 },
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    // Review status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    // Admin moderation
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    moderatedAt: {
      type: Date,
    },
    moderationNote: {
      type: String,
    },
    // Seller response
    sellerResponse: {
      comment: { type: String },
      respondedAt: { type: Date },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index - one review per user per product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, status: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Static method to calculate product rating stats
reviewSchema.statics.calculateProductRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        rating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        rating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
      },
    },
  ]);

  if (stats.length > 0) {
    const Product = require("./Product");
    await Product.findByIdAndUpdate(productId, {
      "ratings.average": Math.round(stats[0].averageRating * 10) / 10,
      "ratings.count": stats[0].totalReviews,
      "ratings.distribution": {
        5: stats[0].rating5,
        4: stats[0].rating4,
        3: stats[0].rating3,
        2: stats[0].rating2,
        1: stats[0].rating1,
      },
    });
  } else {
    const Product = require("./Product");
    await Product.findByIdAndUpdate(productId, {
      "ratings.average": 0,
      "ratings.count": 0,
      "ratings.distribution": { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });
  }

  return stats[0] || null;
};

// Update product rating after save
reviewSchema.post("save", async function () {
  if (this.status === "approved") {
    await this.constructor.calculateProductRating(this.productId);
  }
});

// Update product rating after remove
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calculateProductRating(doc.productId);
  }
});

module.exports = mongoose.model("Review", reviewSchema);
