const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const { sendPasswordResetEmail } = require("../services/emailService");
const crypto = require("crypto-js");
const { asyncHandler } = require("../utils");
const { BadRequestError, NotFoundError, ConflictError } = require("../utils/errors");
const { HTTP_STATUS, MESSAGES, TOKEN_EXPIRY } = require("../constants");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN,
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new ConflictError(MESSAGES.AUTH.USER_EXISTS);
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (!user) {
    throw new BadRequestError("Invalid user data");
  }

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: MESSAGES.AUTH.REGISTER_SUCCESS,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    throw new BadRequestError(MESSAGES.AUTH.INVALID_CREDENTIALS);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    },
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw new NotFoundError(MESSAGES.AUTH.USER_NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: user,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.AUTH.PASSWORD_RESET_EMAIL_SENT,
    });
  }

  await PasswordReset.deleteMany({ userId: user._id });

  const resetToken = crypto.lib.WordArray.random(32).toString();
  const hashedToken = crypto.SHA256(resetToken).toString();

  await PasswordReset.create({
    userId: user._id,
    token: hashedToken,
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const emailSent = await sendPasswordResetEmail(user.email, resetUrl);

  if (!emailSent) {
    await PasswordReset.deleteMany({ userId: user._id });
    throw new BadRequestError(MESSAGES.AUTH.EMAIL_SEND_FAILED);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.AUTH.PASSWORD_RESET_EMAIL_SENT,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.SHA256(token).toString();

  const passwordReset = await PasswordReset.findOne({ token: hashedToken });

  if (!passwordReset) {
    throw new BadRequestError(MESSAGES.AUTH.INVALID_TOKEN);
  }

  const user = await User.findById(passwordReset.userId);

  if (!user) {
    throw new NotFoundError(MESSAGES.AUTH.USER_NOT_FOUND);
  }

  user.password = password;
  await user.save();

  await PasswordReset.deleteMany({ userId: user._id });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
  });
});

const validateResetToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto.SHA256(token).toString();

  const passwordReset = await PasswordReset.findOne({ token: hashedToken });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { valid: !!passwordReset },
  });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  validateResetToken,
};
