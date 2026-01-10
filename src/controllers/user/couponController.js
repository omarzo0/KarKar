const Coupon = require("../../models/Coupon");
const Cart = require("../../models/Cart");
const { validationResult } = require("express-validator");

// @desc    Get available coupons for user
// @route   GET /api/user/coupons
// @access  Private
const getAvailableCoupons = async (req, res) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({
            isActive: true,
            status: "active",
            startDate: { $lte: now },
            endDate: { $gte: now },
            $or: [
                { "usageLimit.total": null },
                { $expr: { $lt: ["$usageCount", "$usageLimit.total"] } }
            ]
        }).select("code name description discountType discountValue minimumPurchase minimumItems endDate");

        res.json({
            success: true,
            data: {
                coupons
            }
        });
    } catch (error) {
        console.error("Get available coupons error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching coupons",
            error: error.message
        });
    }
};

// @desc    Validate coupon code
// @route   POST /api/user/coupons/validate
// @access  Private
const validateCouponCode = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }

        const { code, email, items: itemsFromBody, totalPrice: totalFromBody } = req.body;
        const userId = req.user?.userId;

        let cartItems = [];
        let totalPrice = 0;
        let validationEmail = email;

        // Try to get from cart first if userId exists
        if (userId) {
            const cart = await Cart.findOne({ userId }).populate("items.productId");
            if (cart && cart.items.length > 0) {
                cartItems = cart.items.map(item => ({
                    productId: item.productId._id,
                    price: item.productId.price,
                    quantity: item.quantity,
                    category: item.productId.category
                }));
                totalPrice = cart.summary.totalPrice;
                if (!validationEmail && req.user.email) {
                    validationEmail = req.user.email;
                }
            }
        }

        // Fallback to body data (for guest or manual override)
        if (cartItems.length === 0) {
            if (!itemsFromBody || itemsFromBody.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cart is empty or no items provided"
                });
            }
            cartItems = itemsFromBody;
            totalPrice = totalFromBody || cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        if (!validationEmail && !userId) {
            // For guests, we might want to skip per-customer check if no email, 
            // but it's better to require it if we want to be accurate.
            // However, let's keep it optional for just "checking" if valid general criteria are met.
        }

        const coupon = await Coupon.findValidByCode(code);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired coupon code"
            });
        }

        // Add email to validation context if available
        const validationContext = {
            email: validationEmail
        };

        const canUse = await coupon.canBeUsedBy(userId, totalPrice, cartItems, validationEmail);
        if (!canUse.valid) {
            return res.status(400).json({
                success: false,
                message: canUse.message
            });
        }

        const discountInfo = coupon.calculateDiscount(totalPrice, cartItems);

        res.json({
            success: true,
            data: {
                coupon: {
                    code: coupon.code,
                    name: coupon.name,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue
                },
                discount: discountInfo
            }
        });
    } catch (error) {
        console.error("Validate coupon error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while validating coupon",
            error: error.message
        });
    }
};

module.exports = {
    getAvailableCoupons,
    validateCouponCode
};
