const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");
const {
  validateBody,
  validateQuery,
  validateParams,
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  objectIdSchema,
} = require("../validators");

router.use(protect);

router
  .route("/")
  .get(validateQuery(transactionQuerySchema), getTransactions)
  .post(validateBody(createTransactionSchema), createTransaction);

router.route("/summary").get(getTransactionSummary);

router
  .route("/:id")
  .get(validateParams(objectIdSchema), getTransactionById)
  .put(
    validateParams(objectIdSchema),
    validateBody(updateTransactionSchema),
    updateTransaction
  )
  .delete(validateParams(objectIdSchema), deleteTransaction);

module.exports = router;
