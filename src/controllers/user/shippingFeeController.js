const ShippingFee = require("../../models/ShippingFee");

// @desc    Get all active shipping fees
// @route   GET /api/user/shipping-fees
// @access  Public
const getShippingFees = async (req, res) => {
    try {
        const shippingFees = await ShippingFee.find({ isActive: true })
            .sort({ name: 1 })
            .select("name fee isFreeShipping");

        res.json({
            success: true,
            data: {
                shippingFees
            },
        });
    } catch (error) {
        console.error("Get shipping fees error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching shipping fees",
            error: error.message,
        });
    }
};

module.exports = {
    getShippingFees
};
