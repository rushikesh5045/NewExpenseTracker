const express = require("express");
const router = express.Router();
const {
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const {
  validateBody,
  updateProfileSchema,
  changePasswordSchema,
} = require("../validators");

router.use(protect);

router.put("/profile", validateBody(updateProfileSchema), updateProfile);
router.put(
  "/change-password",
  validateBody(changePasswordSchema),
  changePassword
);
router.delete("/account", deleteAccount);

module.exports = router;
