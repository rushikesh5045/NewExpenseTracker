const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  validateResetToken,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  validateBody,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators");

router.post("/register", validateBody(registerSchema), registerUser);
router.post("/login", validateBody(loginSchema), loginUser);
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  forgotPassword
);
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  resetPassword
);
router.get("/validate-reset-token/:token", validateResetToken);

router.get("/profile", protect, getUserProfile);

module.exports = router;
