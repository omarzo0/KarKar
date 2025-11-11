const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { adminAuth, requirePermission } = require("../middleware/adminAuth");

// Import validation middleware
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateProductQuery,
  validateBulkOperation,
  validateInventoryUpdate,
} = require("../validations/productValidation");

// Import controller
const {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkProductOperation,
  updateProductInventory,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
} = require("../controllers/productController");

// Public routes
router.get("/", validateProductQuery, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/search", searchProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/slug/:slug", getProductBySlug);
router.get("/:productId", validateProductId, getProductById);

// Protected Admin routes
router.post(
  "/",
  adminAuth,
  requirePermission("canManageProducts"),
  validateCreateProduct,
  createProduct
);
router.put(
  "/:productId",
  adminAuth,
  requirePermission("canManageProducts"),
  validateProductId,
  validateUpdateProduct,
  updateProduct
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
