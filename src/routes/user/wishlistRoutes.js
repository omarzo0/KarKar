const express = require("express");
const router = express.Router();
const { userAuth } = require("../../middleware/userAuth");

const {
  validateAddToWishlist,
  validateProductId,
  validateUpdateWishlistItem,
  validateMoveToCart,
} = require("../../validations/user/wishlistValidation");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkProductInWishlist,
  moveToCart,
  updateWishlistItem,
} = require("../../controllers/user/wishlistController");

// All routes require user authentication
router.use(userAuth);

// Wishlist management routes
router.get("/", getWishlist);
router.post("/", validateAddToWishlist, addToWishlist);
router.delete("/", clearWishlist);

// Check if product is in wishlist
router.get("/check/:productId", validateProductId, checkProductInWishlist);

// Single item operations
router.put("/:productId", validateUpdateWishlistItem, updateWishlistItem);
router.delete("/:productId", validateProductId, removeFromWishlist);

// Move to cart
router.post("/:productId/move-to-cart", validateMoveToCart, moveToCart);

module.exports = router;
