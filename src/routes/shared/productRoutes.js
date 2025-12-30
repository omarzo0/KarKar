const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middleware/userAuth");
const { adminAuth, requirePermission } = require("../../middleware/adminAuth");
const { optionalAuth } = require("../../middleware/userAuth");

// Import validation middleware
const {
  validateCreateProduct,
  validateProductId,
  validateProductQuery,
  validateBulkOperation,
  validateInventoryUpdate,
} = require("../../validations/shared/productValidation");

// Import controller
const {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
  bulkProductOperation,
  updateProductInventory,
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
router.get("/category/:category", getProductsByCategory);
router.get("/:productId", optionalAuth, validateProductId, getProductById);
router.get("/:productId/stock", validateProductId, getStockAvailability);
router.post("/:productId/estimate-shipping", validateProductId, estimateShipping);

// Optional auth route (tracks user views if logged in)
router.post("/:productId/view", optionalAuth, validateProductId, recordProductView);

// Protected Admin routes
router.post(
  "/",
  adminAuth,
  requirePermission("canManageProducts"),
  validateCreateProduct,
  createProduct
);
router.delete(
  "/:productId",
  adminAuth,
  requirePermission("canManageProducts"),
  validateProductId,
  deleteProduct
);
router.post(
  "/bulk",
  adminAuth,
  requirePermission("canManageProducts"),
  validateBulkOperation,
  bulkProductOperation
);
router.put(
  "/:productId/inventory",
  adminAuth,
  requirePermission("canManageInventory"),
  validateProductId,
  validateInventoryUpdate,
  updateProductInventory
);

module.exports = router;
