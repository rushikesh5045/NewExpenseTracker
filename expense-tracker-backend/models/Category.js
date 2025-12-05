const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["income", "expense"],
    default: "expense",
  },
  color: {
    type: String,
    required: true,
    default: "#6200ee", // Default Material You primary color
  },
  icon: {
    type: String,
    required: true,
    default: "category", // Default Material icon name
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // This will be null for default categories
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
