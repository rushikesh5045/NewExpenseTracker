const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const bcrypt = require("bcryptjs");
const { asyncHandler } = require("../utils");
const { BadRequestError, NotFoundError, ConflictError } = require("../utils/errors");
const { HTTP_STATUS, MESSAGES } = require("../constants");

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (email && email !== req.user.email) {
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ConflictError(MESSAGES.USER.EMAIL_IN_USE);
    }
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new NotFoundError(MESSAGES.USER.NOT_FOUND);
  }

  user.name = name || user.name;
  user.email = email || user.email;

  const updatedUser = await user.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new NotFoundError(MESSAGES.USER.NOT_FOUND);
  }

  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    throw new BadRequestError(MESSAGES.AUTH.CURRENT_PASSWORD_INCORRECT);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  await user.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.AUTH.PASSWORD_UPDATED,
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  await Transaction.deleteMany({ userId: req.user._id });
  await Category.deleteMany({ userId: req.user._id });
  await User.findByIdAndDelete(req.user._id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.USER.ACCOUNT_DELETED,
  });
});

module.exports = {
  updateProfile,
  changePassword,
  deleteAccount,
};
