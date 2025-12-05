const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const mongoose = require("mongoose");

// @desc    Get all transactions for a user with filtering
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;

    // Build query
    const query = { userId: req.user._id };

    // Add date range filter if provided
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

    // Add type filter if provided
    if (type && ["income", "expense"].includes(type)) {
      query.type = type;
    }

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Execute query with populated category
    const transactions = await Transaction.find(query)
      .populate("category", "name color icon")
      .sort({ date: -1 })
      .exec();

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "category",
      "name color icon"
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check if the transaction belongs to the user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this transaction" });
    }

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    // Validate required fields
    if (!amount || !type || !category) {
      return res
        .status(400)
        .json({ message: "Please provide amount, type and category" });
    }

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    // Validate type is either income or expense
    if (!["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Type must be either income or expense" });
    }

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Category not found" });
    }

    // Create transaction
    const transaction = new Transaction({
      amount,
      type,
      category,
      date: date || new Date(),
      notes,
      userId: req.user._id,
    });

    await transaction.save();

    // Populate category details before returning
    await transaction.populate("category", "name color icon");

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    // Find transaction
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check if the transaction belongs to the user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this transaction" });
    }

    // Validate amount if provided
    if (amount !== undefined) {
      if (isNaN(amount) || amount <= 0) {
        return res
          .status(400)
          .json({ message: "Amount must be a positive number" });
      }
    }

    // Validate type if provided
    if (type !== undefined && !["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Type must be either income or expense" });
    }

    // Validate category if provided
    if (category !== undefined) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Category not found" });
      }
    }

    // Update transaction
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;
    transaction.notes = notes !== undefined ? notes : transaction.notes;

    await transaction.save();

    // Populate category details before returning
    await transaction.populate("category", "name color icon");

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check if the transaction belongs to the user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this transaction" });
    }

    await transaction.deleteOne();

    res.json({ message: "Transaction removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get transaction summary (total income, expense, balance)
// @route   GET /api/transactions/summary
// @access  Private
const getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date range filter
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

    // Aggregate pipeline
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

    // Format the response
    const income = summary.find((item) => item._id === "income")?.total || 0;
    const expense = summary.find((item) => item._id === "expense")?.total || 0;
    const balance = income - expense;

    res.json({
      income,
      expense,
      balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
};
