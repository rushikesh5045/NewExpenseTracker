require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const defaultCategories = require("../config/defaultCategories");
const connectDB = require("../config/db");

const seedCategories = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if default categories already exist
    const existingCategories = await Category.find({ isDefault: true });

    if (existingCategories.length > 0) {
      console.log("Default categories already exist. Skipping seed.");
      process.exit(0);
    }

    // Insert default categories
    await Category.insertMany(defaultCategories);

    console.log("Default categories have been seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding default categories:", error);
    process.exit(1);
  }
};

seedCategories();
