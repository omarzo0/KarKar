const mongoose = require("mongoose");

const shippingFeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["flat", "weight_based", "price_based", "location_based", "free"],
      default: "flat",
    },
    // Flat rate fee
    flatRate: {
      type: Number,
      default: 0,
    },
    // Weight-based pricing (per kg)
    weightBased: {
      baseWeight: { type: Number, default: 1 }, // kg
      basePrice: { type: Number, default: 0 },
      additionalPerKg: { type: Number, default: 0 },
    },
    // Price-based (free shipping over certain amount)
    priceBased: {
      minOrderAmount: { type: Number, default: 0 },
      feeUnderMinimum: { type: Number, default: 0 },
    },
    // Location-based pricing
    locations: [
      {
        country: { type: String },
        state: { type: String },
        city: { type: String },
        zipCodeRange: {
          from: { type: String },
          to: { type: String },
        },
        fee: { type: Number, required: true },
      },
    ],
    // Applicable regions (if empty, applies to all)
    applicableCountries: [{ type: String }],
    applicableStates: [{ type: String }],
    // Conditions
    conditions: {
      minOrderAmount: { type: Number, default: 0 },
      maxOrderAmount: { type: Number },
      minWeight: { type: Number, default: 0 },
      maxWeight: { type: Number },
    },
    // Estimated delivery
    estimatedDelivery: {
      minDays: { type: Number, default: 1 },
      maxDays: { type: Number, default: 7 },
    },
    // Priority (lower = higher priority for selection)
    priority: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default shipping fee
shippingFeeSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Index for faster queries
shippingFeeSchema.index({ isActive: 1, priority: 1 });
shippingFeeSchema.index({ type: 1 });
shippingFeeSchema.index({ "applicableCountries": 1 });

// Method to calculate shipping fee
shippingFeeSchema.methods.calculateFee = function (orderData) {
  const { totalAmount, totalWeight, country, state, city, zipCode } = orderData;

  // Check conditions
  if (this.conditions.minOrderAmount && totalAmount < this.conditions.minOrderAmount) {
    return null; // Not applicable
  }
  if (this.conditions.maxOrderAmount && totalAmount > this.conditions.maxOrderAmount) {
    return null;
  }
  if (this.conditions.minWeight && totalWeight < this.conditions.minWeight) {
    return null;
  }
  if (this.conditions.maxWeight && totalWeight > this.conditions.maxWeight) {
    return null;
  }

  // Check location restrictions
  if (this.applicableCountries.length > 0 && !this.applicableCountries.includes(country)) {
    return null;
  }
  if (this.applicableStates.length > 0 && !this.applicableStates.includes(state)) {
    return null;
  }

  let fee = 0;

  switch (this.type) {
    case "free":
      fee = 0;
      break;

    case "flat":
      fee = this.flatRate;
      break;

    case "weight_based":
      if (totalWeight <= this.weightBased.baseWeight) {
        fee = this.weightBased.basePrice;
      } else {
        const additionalWeight = totalWeight - this.weightBased.baseWeight;
        fee = this.weightBased.basePrice + (additionalWeight * this.weightBased.additionalPerKg);
      }
      break;

    case "price_based":
      if (totalAmount >= this.priceBased.minOrderAmount) {
        fee = 0; // Free shipping
      } else {
        fee = this.priceBased.feeUnderMinimum;
      }
      break;

    case "location_based":
      const location = this.locations.find((loc) => {
        if (loc.country && loc.country !== country) return false;
        if (loc.state && loc.state !== state) return false;
        if (loc.city && loc.city !== city) return false;
        if (loc.zipCodeRange?.from && loc.zipCodeRange?.to) {
          if (zipCode < loc.zipCodeRange.from || zipCode > loc.zipCodeRange.to) {
            return false;
          }
        }
        return true;
      });
      fee = location ? location.fee : this.flatRate; // Fallback to flat rate
      break;

    default:
      fee = this.flatRate;
  }

  return {
    shippingFeeId: this._id,
    name: this.name,
    description: this.description,
    fee: Math.round(fee * 100) / 100,
    estimatedDelivery: this.estimatedDelivery,
  };
};

module.exports = mongoose.model("ShippingFee", shippingFeeSchema);
