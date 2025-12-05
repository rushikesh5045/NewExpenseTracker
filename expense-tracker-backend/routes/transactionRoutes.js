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

// All routes are protected with authentication
router.use(protect);

router.route("/").get(getTransactions).post(createTransaction);

router.route("/summary").get(getTransactionSummary);

router
  .route("/:id")
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
