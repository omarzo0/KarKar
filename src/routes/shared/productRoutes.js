const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middleware/userAuth");
const { optionalAuth } = require("../../middleware/userAuth");

// Import validation middleware
const {
  validateProductId,
  validateProductQuery,
} = require("../../validations/shared/productValidation");

// Import controller
const {
  getAllProducts,
  getProductById,
  getProductBySlug,

  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getSearchSuggestions,
  getPackages,
  getFiltersData,
  recordProductView,
  getStockAvailability,
  estimateShipping,
} = require("../../controllers/shared/productController");


// Public routes (no authentication required)
router.get("/", optionalAuth, validateProductQuery, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/search", searchProducts);
router.get("/search/suggestions", getSearchSuggestions);
router.get("/packages", getPackages);
router.get("/filters", getFiltersData);
router.get("/slug/:slug", getProductBySlug);
router.get("/:productId", optionalAuth, validateProductId, getProductById);
router.get("/:productId/stock", validateProductId, getStockAvailability);
router.post("/:productId/estimate-shipping", validateProductId, estimateShipping);

// Category endpoints (shared)
const { getAllCategories, getCategoryById, getAllPackages, getPackageById } = require("../../controllers/shared/productController");
router.get("/categories", getAllCategories);
router.get("/categories/:categoryId", getCategoryById);

// Package endpoints (shared)
router.get("/packages", getAllPackages);
router.get("/packages/:packageId", getPackageById);

// Optional auth route (tracks user views if logged in)
router.post("/:productId/view", optionalAuth, validateProductId, recordProductView);

module.exports = router;
