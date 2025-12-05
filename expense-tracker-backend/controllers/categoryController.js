const Category = require("../models/Category");

// @desc    Get all categories (default + user's custom categories)
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    // Get default categories and user's custom categories
    const categories = await Category.find({
      $or: [{ isDefault: true }, { userId: req.user._id }],
    }).sort({ type: 1, name: 1 });

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;

    // Validate input
    if (!name || !type || !color || !icon) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if category with same name already exists for this user
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") }, // Case insensitive
      $or: [{ isDefault: true }, { userId: req.user._id }],
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    // Create category
    const category = await Category.create({
      name,
      type,
      color,
      icon,
      userId: req.user._id,
      isDefault: false,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    // Find category
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if it's a default category
    if (category.isDefault) {
      return res
        .status(403)
        .json({ message: "Default categories cannot be modified" });
    }

    // Check if user owns this category
    if (category.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this category" });
    }

    // Update category
    category.name = name || category.name;
    category.color = color || category.color;
    category.icon = icon || category.icon;

    const updatedCategory = await category.save();

    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    // Find category
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if it's a default category
    if (category.isDefault) {
      return res
        .status(403)
        .json({ message: "Default categories cannot be deleted" });
    }

    // Check if user owns this category
    if (category.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this category" });
    }

    await category.deleteOne();

    res.json({ message: "Category removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
