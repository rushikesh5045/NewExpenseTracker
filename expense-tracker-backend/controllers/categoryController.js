const Category = require("../models/Category");
const { asyncHandler } = require("../utils");
const { NotFoundError, ForbiddenError, ConflictError } = require("../utils/errors");
const { HTTP_STATUS, MESSAGES } = require("../constants");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    $or: [{ isDefault: true }, { userId: req.user._id }],
  }).sort({ type: 1, name: 1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: categories,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, type, color, icon } = req.body;

  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
    $or: [{ isDefault: true }, { userId: req.user._id }],
  });

  if (existingCategory) {
    throw new ConflictError(MESSAGES.CATEGORY.EXISTS);
  }

  const category = await Category.create({
    name,
    type,
    color,
    icon,
    userId: req.user._id,
    isDefault: false,
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: category,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, color, icon } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new NotFoundError(MESSAGES.CATEGORY.NOT_FOUND);
  }

  if (category.isDefault) {
    throw new ForbiddenError(MESSAGES.CATEGORY.DEFAULT_CANNOT_MODIFY);
  }

  if (category.userId.toString() !== req.user._id.toString()) {
    throw new ForbiddenError(MESSAGES.CATEGORY.NOT_AUTHORIZED_UPDATE);
  }

  category.name = name || category.name;
  category.color = color || category.color;
  category.icon = icon || category.icon;

  const updatedCategory = await category.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: updatedCategory,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new NotFoundError(MESSAGES.CATEGORY.NOT_FOUND);
  }

  if (category.isDefault) {
    throw new ForbiddenError(MESSAGES.CATEGORY.DEFAULT_CANNOT_DELETE);
  }

  if (category.userId.toString() !== req.user._id.toString()) {
    throw new ForbiddenError(MESSAGES.CATEGORY.NOT_AUTHORIZED_DELETE);
  }

  await category.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.CATEGORY.REMOVED,
  });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
