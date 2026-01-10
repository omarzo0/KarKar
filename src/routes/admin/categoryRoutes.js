// routes/admin/categoryRoutes.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middleware/adminAuth");
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
} = require("../../validations/admin/categoryValidation");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getCategoryStatistics,
  updateAllStatistics,
} = require("../../controllers/admin/categoryController");

// All routes require admin authentication
router.use(adminAuth);

// Update all statistics
router.post(
  "/update-statistics",
  updateAllStatistics
);

// CRUD operations
router.get("/", getAllCategories);
router.post(
  "/",
  validateCreateCategory,
  createCategory
);

// Single category operations
router.get(
  "/:categoryId",
  validateCategoryId,
  getCategoryById
);
router.put(
  "/:categoryId",
  validateCategoryId,
  validateUpdateCategory,
  updateCategory
);
router.delete(
  "/:categoryId",
  validateCategoryId,
  deleteCategory
);
router.patch(
  "/:categoryId/toggle-status",
  validateCategoryId,
  toggleCategoryStatus
);
router.get(
  "/:categoryId/statistics",
  validateCategoryId,
  getCategoryStatistics
);

module.exports = router;
