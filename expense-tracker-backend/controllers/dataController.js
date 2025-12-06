// controllers/dataController.js
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

// @desc    Export user data
// @route   GET /api/data/export
// @access  Private
const exportData = async (req, res) => {
  try {
    const { format } = req.query;

    // Get user's transactions
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate("category", "name")
      .sort({ date: -1 });

    // Format transactions for export
    const formattedTransactions = transactions.map((t) => ({
      id: t._id,
      date: new Date(t.date).toLocaleDateString(),
      type: t.type,
      category: t.category.name,
      amount: t.amount,
      notes: t.notes || "",
    }));

    if (format.toLowerCase() === "csv") {
      // Export as CSV
      const fields = ["id", "date", "type", "category", "amount", "notes"];
      const parser = new Parser({ fields });
      const csv = parser.parse(formattedTransactions);

      res.header("Content-Type", "text/csv");
      res.attachment("expense-tracker-data.csv");
      return res.send(csv);
    } else if (format.toLowerCase() === "pdf") {
      // Export as PDF
      const doc = new PDFDocument();

      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=expense-tracker-data.pdf"
      );

      // Pipe the PDF to the response
      doc.pipe(res);

      // Add content to PDF
      doc
        .fontSize(20)
        .text("Expense Tracker - Transaction Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Add table header
      const tableTop = 150;
      const tableLeft = 50;
      const columnWidth = 100;

      doc
        .fontSize(10)
        .text("Date", tableLeft, tableTop)
        .text("Type", tableLeft + columnWidth, tableTop)
        .text("Category", tableLeft + columnWidth * 2, tableTop)
        .text("Amount", tableLeft + columnWidth * 3, tableTop)
        .text("Notes", tableLeft + columnWidth * 4, tableTop);

      doc
        .moveTo(tableLeft, tableTop + 15)
        .lineTo(tableLeft + columnWidth * 5, tableTop + 15)
        .stroke();

      // Add table rows
      let rowTop = tableTop + 25;

      formattedTransactions.forEach((t, i) => {
        doc
          .fontSize(9)
          .text(t.date, tableLeft, rowTop)
          .text(t.type, tableLeft + columnWidth, rowTop)
          .text(t.category, tableLeft + columnWidth * 2, rowTop)
          .text(t.amount.toString(), tableLeft + columnWidth * 3, rowTop)
          .text(t.notes.substring(0, 20), tableLeft + columnWidth * 4, rowTop);

        rowTop += 20;

        // Add a new page if needed
        if (rowTop > 700) {
          doc.addPage();
          rowTop = 50;
        }
      });

      // Finalize the PDF
      doc.end();
      return;
    } else {
      return res.status(400).json({ message: "Invalid export format" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Clear all user data
// @route   DELETE /api/data/clear-all
// @access  Private
const clearAllData = async (req, res) => {
  try {
    // Delete user's transactions
    await Transaction.deleteMany({ userId: req.user._id });

    // Delete user's custom categories
    await Category.deleteMany({ userId: req.user._id, isDefault: false });

    res.json({ message: "All data cleared successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  exportData,
  clearAllData,
};
