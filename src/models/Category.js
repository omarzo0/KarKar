const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Subcategory name is required"],
    trim: true,
  },
  icon: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    icon: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showInMenu: {
      type: Boolean,
      default: true,
    },
    showInHomepage: {
      type: Boolean,
      default: false,
    },
    subcategories: [subcategorySchema],
    statistics: {
      productCount: {
        type: Number,
        default: 0,
      },
      activeProductCount: {
        type: Number,
        default: 0,
      },
      totalSales: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });
categorySchema.index({ "subcategories.name": 1 });

// Method to update product count
categorySchema.methods.updateProductCount = async function () {
  const Product = mongoose.model("Product");

  const productCount = await Product.countDocuments({ category: this.name });
  const activeProductCount = await Product.countDocuments({
    category: this.name,
    status: "active",
  });

  this.statistics.productCount = productCount;
  this.statistics.activeProductCount = activeProductCount;

  await this.constructor.updateOne(
    { _id: this._id },
    {
      $set: {
        "statistics.productCount": productCount,
        "statistics.activeProductCount": activeProductCount,
      },
    }
  );
};

// Static method to update all statistics
categorySchema.statics.updateAllStatistics = async function () {
  const categories = await this.find();
  for (const category of categories) {
    await category.updateProductCount();
  }
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
