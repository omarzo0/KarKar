const { body, param } = require("express-validator");
const mongoose = require("mongoose");
const Product = require("../models/Product");

// Add item to cart validation
const validateAddToCart = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Valid product ID is required")
    .custom(async (productId) => {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }
      if (product.status !== "active") {
        throw new Error("Product is not available");
      }
      if (product.inventory.quantity < 1) {
        throw new Error("Product is out of stock");
      }
      return true;
    }),

  body("quantity")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Quantity must be between 1 and 10")
    .custom(async (quantity, { req }) => {
      if (req.body.productId) {
        const product = await Product.findById(req.body.productId);
        if (product && quantity > product.inventory.quantity) {
          throw new Error(
            `Only ${product.inventory.quantity} items available in stock`
          );
        }
      }
      return true;
    }),
];

// Update cart item quantity validation
const validateUpdateCartItem = [
  param("itemId")
    .notEmpty()
    .withMessage("Item ID is required")
    .isMongoId()
    .withMessage("Valid item ID is required"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1, max: 10 })
    .withMessage("Quantity must be between 1 and 10")
    .custom(async (quantity, { req }) => {
      // This will be checked in the controller after we have the product ID
      return true;
    }),
];

// Remove item from cart validation
const validateRemoveCartItem = [
  param("itemId")
    .notEmpty()
    .withMessage("Item ID is required")
    .isMongoId()
    .withMessage("Valid item ID is required"),
];

// Apply coupon validation
const validateApplyCoupon = [
  body("couponCode")
    .notEmpty()
    .withMessage("Coupon code is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Coupon code must be between 3 and 20 characters")
    .matches(/^[A-Z0-9_-]+$/i)
    .withMessage(
      "Coupon code can only contain letters, numbers, hyphens and underscores"
    ),
];

// Update shipping address validation
const validateShippingAddress = [
  body("street")
    .notEmpty()
    .withMessage("Street address is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Street address must be between 5 and 200 characters"),

  body("city")
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("City can only contain letters, spaces and hyphens"),

  body("state")
    .notEmpty()
    .withMessage("State is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("State can only contain letters, spaces and hyphens"),

  body("zipCode")
    .notEmpty()
    .withMessage("Zip code is required")
    .isPostalCode("any")
    .withMessage("Valid zip/postal code is required"),

  body("country")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("Country can only contain letters, spaces and hyphens")
    .default("USA"),
];

// Update cart notes validation
const validateCartNotes = [
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters")
    .trim(),
];

module.exports = {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveCartItem,
  validateApplyCoupon,
  validateShippingAddress,
  validateCartNotes,
};
