const { body } = require("express-validator");

const validateCouponCode = [
    body("code")
        .notEmpty()
        .withMessage("Coupon code is required")
        .isLength({ min: 3, max: 20 })
        .withMessage("Coupon code must be between 3 and 20 characters")
        .matches(/^[A-Z0-9_-]+$/i)
        .withMessage("Coupon code can only contain letters, numbers, hyphens, and underscores"),
];

module.exports = {
    validateCouponCode
};
