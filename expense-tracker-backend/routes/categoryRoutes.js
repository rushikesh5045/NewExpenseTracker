const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/auth");
const {
  validateBody,
  validateParams,
  createCategorySchema,
  updateCategorySchema,
  objectIdSchema,
} = require("../validators");

router.use(protect);

router
  .route("/")
  .get(getCategories)
  .post(validateBody(createCategorySchema), createCategory);

router
  .route("/:id")
  .put(
    validateParams(objectIdSchema),
    validateBody(updateCategorySchema),
    updateCategory
  )
  .delete(validateParams(objectIdSchema), deleteCategory);

module.exports = router;
