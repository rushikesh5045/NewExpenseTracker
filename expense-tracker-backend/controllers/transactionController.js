const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const { asyncHandler } = require("../utils");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../utils/errors");
const { HTTP_STATUS, MESSAGES, TRANSACTION_TYPE_VALUES } = require("../constants");

const getTransactions = asyncHandler(async (req, res) => {
  const { startDate, endDate, type, category } = req.query;

  const query = { userId: req.user._id };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    query.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.date = { $lte: new Date(endDate) };
  }

  if (type && TRANSACTION_TYPE_VALUES.includes(type)) {
    query.type = type;
  }

  if (category) {
    query.category = category;
  }

  const transactions = await Transaction.find(query)
    .populate("category", "name color icon")
    .sort({ date: -1 })
    .exec();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: transactions,
  });
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate(
    "category",
    "name color icon"
  );

  if (!transaction) {
    throw new NotFoundError(MESSAGES.TRANSACTION.NOT_FOUND);
  }

  if (transaction.userId.toString() !== req.user._id.toString()) {
    throw new ForbiddenError(MESSAGES.TRANSACTION.NOT_AUTHORIZED_ACCESS);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: transaction,
  });
});

const createTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new BadRequestError(MESSAGES.CATEGORY.NOT_FOUND);
  }

  const transaction = new Transaction({
    amount,
    type,
    category,
    date: date || new Date(),
    notes,
    userId: req.user._id,
  });

  await transaction.save();
  await transaction.populate("category", "name color icon");

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: transaction,
  });
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  let transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new NotFoundError(MESSAGES.TRANSACTION.NOT_FOUND);
  }

  if (transaction.userId.toString() !== req.user._id.toString()) {
    throw new ForbiddenError(MESSAGES.TRANSACTION.NOT_AUTHORIZED_UPDATE);
  }

  if (category !== undefined) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new BadRequestError(MESSAGES.CATEGORY.NOT_FOUND);
    }
  }

  transaction.amount = amount || transaction.amount;
  transaction.type = type || transaction.type;
  transaction.category = category || transaction.category;
  transaction.date = date || transaction.date;
  transaction.notes = notes !== undefined ? notes : transaction.notes;

  await transaction.save();
  await transaction.populate("category", "name color icon");

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: transaction,
  });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new NotFoundError(MESSAGES.TRANSACTION.NOT_FOUND);
  }

  if (transaction.userId.toString() !== req.user._id.toString()) {
    throw new ForbiddenError(MESSAGES.TRANSACTION.NOT_AUTHORIZED_DELETE);
  }

  await transaction.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.TRANSACTION.REMOVED,
  });
});

const getTransactionSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    dateFilter.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    dateFilter.date = { $lte: new Date(endDate) };
  }

  const summary = await Transaction.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId.createFromHexString(
          req.user._id.toString()
        ),
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const income = summary.find((item) => item._id === "income")?.total || 0;
  const expense = summary.find((item) => item._id === "expense")?.total || 0;
  const balance = income - expense;

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      income,
      expense,
      balance,
    },
  });
});

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
};
