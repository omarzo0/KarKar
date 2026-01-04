const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/user/categoryController');

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get category by ID
router.get('/:categoryId', categoryController.getCategoryById);

module.exports = router;
