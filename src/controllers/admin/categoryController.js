const Category = require("../../models/Category");
const Product = require("../../models/Product");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { stripBaseUrl } = require("../../utils/imageHelper");

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private (Admin)
const getAllCategories = async (req, res) => {
  try {
    const { search, isActive } = req.query;

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Use aggregation to get categories with real-time product counts
    const categories = await Category.aggregate([
      { $match: filter },
      // Lookup products to get counts
      {
        $lookup: {
          from: "products",
          let: { categoryName: "$name" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$categoryName"] },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                activeCount: {
                  $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
                },
                sales: { $sum: "$sales.totalSold" },
                revenue: { $sum: "$sales.totalRevenue" },
              },
            },
          ],
          as: "productStats",
        },
      },
      // Lookup creator info
      {
        $lookup: {
          from: "admins",
          localField: "createdBy",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $project: {
          name: 1,
          icon: 1,
          isActive: 1,
          showInMenu: 1,
          showInHomepage: 1,
          subcategories: 1,
          createdAt: 1,
          updatedAt: 1,
          createdBy: { $arrayElemAt: ["$creator", 0] },
          statistics: {
            productCount: {
              $ifNull: [{ $arrayElemAt: ["$productStats.count", 0] }, 0],
            },
            activeProductCount: {
              $ifNull: [{ $arrayElemAt: ["$productStats.activeCount", 0] }, 0],
            },
            totalSales: {
              $ifNull: [{ $arrayElemAt: ["$productStats.sales", 0] }, 0],
            },
            totalRevenue: {
              $ifNull: [{ $arrayElemAt: ["$productStats.revenue", 0] }, 0],
            },
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        categories,
        totalCategories: categories.length,
      },
    });
  } catch (error) {
    console.error("Get all categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
      error: error.message,
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/admin/categories/:categoryId
// @access  Private (Admin)
const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(categoryId)
      .populate("createdBy", "username profile.firstName profile.lastName")
      .populate("updatedBy", "username profile.firstName profile.lastName");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    console.error("Get category by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching category",
      error: error.message,
    });
  }
};

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
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
      name,
      icon,
      isActive,
      showInMenu,
      showInHomepage,
      subcategories,
    } = req.body;

    let parsedSubcategories = subcategories;
    if (typeof subcategories === "string") {
      try {
        parsedSubcategories = JSON.parse(subcategories);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid subcategories format",
        });
      }
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }

    const category = new Category({
      name,
      icon: stripBaseUrl(icon) || "",
      isActive: isActive !== undefined ? isActive : true,
      showInMenu: showInMenu !== undefined ? showInMenu : true,
      showInHomepage: showInHomepage || false,
      subcategories: parsedSubcategories ? parsedSubcategories.map(sub => ({
        ...sub,
        icon: stripBaseUrl(sub.icon)
      })) : [],
      createdBy: req.admin.adminId,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating category",
      error: error.message,
    });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:categoryId
// @access  Private (Admin)
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { categoryId } = req.params;
    const updateData = req.body;

    if (updateData.subcategories && typeof updateData.subcategories === "string") {
      try {
        updateData.subcategories = JSON.parse(updateData.subcategories);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid subcategories format",
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // If category name changes, update all products
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
        _id: { $ne: categoryId },
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category name already exists",
        });
      }

      await Product.updateMany(
        { category: category.name },
        { $set: { category: updateData.name } }
      );
    }

    // Check for subcategory name changes to update products
    if (updateData.subcategories && Array.isArray(updateData.subcategories)) {
      for (const oldSub of category.subcategories) {
        const newSub = updateData.subcategories.find(s => s._id?.toString() === oldSub._id.toString());
        if (newSub && newSub.name !== oldSub.name) {
          // Subcategory name changed
          await Product.updateMany(
            { category: category.name, subcategory: oldSub.name },
            { $set: { subcategory: newSub.name } }
          );
        }
      }
    }

    // Apply updates
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        if (key === "icon") {
          category[key] = stripBaseUrl(updateData[key]);
        } else if (key === "subcategories" && Array.isArray(updateData[key])) {
          category[key] = updateData[key].map(sub => ({
            ...sub,
            icon: stripBaseUrl(sub.icon)
          }));
        } else {
          category[key] = updateData[key];
        }
      }
    });

    category.updatedBy = req.admin.adminId;
    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      data: { category },
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating category",
      error: error.message,
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:categoryId
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if products exist in this category
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${productCount} products are still assigned to it.`,
      });
    }

    await Category.findByIdAndDelete(categoryId);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
      error: error.message,
    });
  }
};

// @desc    Toggle category status
// @route   PATCH /api/admin/categories/:categoryId/toggle-status
// @access  Private (Admin)
const toggleCategoryStatus = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = !category.isActive;
    category.updatedBy = req.admin.adminId;
    await category.save();

    res.json({
      success: true,
      message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      data: { category },
    });
  } catch (error) {
    console.error("Toggle category status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while toggling category status",
      error: error.message,
    });
  }
};

// @desc    Get category statistics
// @route   GET /api/admin/categories/:categoryId/statistics
// @access  Private (Admin)
const getCategoryStatistics = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await category.updateProductCount();

    res.json({
      success: true,
      data: {
        category: {
          _id: category._id,
          name: category.name,
          statistics: category.statistics,
        },
      },
    });
  } catch (error) {
    console.error("Get category statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching statistics",
      error: error.message,
    });
  }
};

// @desc    Update all category statistics
// @route   POST /api/admin/categories/update-statistics
// @access  Private (Admin)
const updateAllStatistics = async (req, res) => {
  try {
    await Category.updateAllStatistics();
    res.json({
      success: true,
      message: "All category statistics updated successfully",
    });
  } catch (error) {
    console.error("Update all statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getCategoryStatistics,
  updateAllStatistics,
};
