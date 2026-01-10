const express = require("express");
const router = express.Router();

const {
    getPackages,
    getPackageById,
} = require("../../controllers/shared/productController");

// @route   GET /api/user/packages
// @desc    Get all packages
// @access  Public
router.get("/", getPackages);

// @route   GET /api/user/packages/:packageId
// @desc    Get package by ID
// @access  Public
router.get("/:packageId", getPackageById);

module.exports = router;
