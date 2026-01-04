const Category = require('../../models/Category');

// @desc    Get all categories
// @route   GET /api/user/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get category by ID
// @route   GET /api/user/categories/:categoryId
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findOne({ _id: categoryId, isActive: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
