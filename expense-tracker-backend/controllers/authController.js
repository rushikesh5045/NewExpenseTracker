const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const { sendPasswordResetEmail } = require("../services/emailService");
const crypto = require("crypto-js");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        message: "User registered successfully",
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Don't reveal if user exists or not for security reasons
    if (!user) {
      return res.status(200).json({
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Generate a random token
    const resetToken = crypto.lib.WordArray.random(32).toString();

    // Hash token before saving to database
    const hashedToken = crypto.SHA256(resetToken).toString();

    // Save token to database
    await PasswordReset.create({
      userId: user._id,
      token: hashedToken,
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    const emailSent = await sendPasswordResetEmail(user.email, resetUrl);

    if (!emailSent) {
      await PasswordReset.deleteMany({ userId: user._id });
      return res
        .status(500)
        .json({ message: "Failed to send email. Please try again." });
    }

    res.status(200).json({
      message:
        "If your email is registered, you will receive a password reset link",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    // Hash token to compare with stored hash
    const hashedToken = crypto.SHA256(token).toString();

    // Find valid token
    const passwordReset = await PasswordReset.findOne({ token: hashedToken });

    if (!passwordReset) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find user
    const user = await User.findById(passwordReset.userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user with new password
    await user.save();

    // Delete reset token
    await PasswordReset.deleteMany({ userId: user._id });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Validate reset token
// @route   GET /api/auth/validate-reset-token/:token
// @access  Public
const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash token to compare with stored hash
    const hashedToken = crypto.SHA256(token).toString();

    // Find valid token
    const passwordReset = await PasswordReset.findOne({ token: hashedToken });

    if (!passwordReset) {
      return res.status(400).json({ valid: false });
    }

    res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  validateResetToken,
};
