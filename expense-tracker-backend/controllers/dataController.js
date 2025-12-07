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
    const { format, startDate, endDate } = req.query;

    // Build query with optional date filter
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Get user's transactions
    const transactions = await Transaction.find(query)
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
      const doc = new PDFDocument({ margin: 40 });

      // Set response headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=expense-tracker-data.pdf"
      );

      // Pipe the PDF to the response
      doc.pipe(res);

      // Register a font that supports Rupee symbol
      const fontPath = path.join(__dirname, "../fonts");
      try {
        doc.registerFont(
          "NotoSans",
          path.join(fontPath, "NotoSans-Regular.ttf")
        );
        doc.registerFont(
          "NotoSans-Bold",
          path.join(fontPath, "NotoSans-Bold.ttf")
        );
        doc.font("NotoSans");
      } catch (err) {
        console.log("Custom font not found, using default font");
      }

      const colors = {
        primary: "#4285f4",
        success: "#1e8e3e",
        error: "#d93025",
        textPrimary: "#202124",
        textSecondary: "#5f6368",
        border: "#dadce0",
        background: "#f8f9fa",
        white: "#ffffff",
      };

      // Calculate summary
      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;

      // Format currency helper - use Rupee symbol with Noto Sans font
      const formatCurrency = (amount) => {
        return "\u20B9" + amount.toLocaleString("en-IN");
      };

      // Format date helper
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      };

      const pageWidth = doc.page.width - 80; // 40px margin on each side
      const startX = 40;

      // ========== HEADER SECTION ==========
      // Draw header background
      doc.rect(0, 0, doc.page.width, 100).fill(colors.primary);

      // App title
      doc.fontSize(24).fillColor(colors.white);
      doc.text("Expense Tracker", startX, 35, { align: "center" });

      // Subtitle
      doc.fontSize(11).fillColor(colors.white);
      doc.text(
        `Transaction Report • Generated on ${formatDate(new Date())}`,
        startX,
        65,
        {
          align: "center",
          width: pageWidth,
        }
      );

      // ========== SUMMARY CARD ==========
      const cardTop = 120;
      const cardHeight = 130;

      // Card shadow effect (light gray rectangle slightly offset)
      doc
        .roundedRect(startX + 2, cardTop + 2, pageWidth, cardHeight, 12)
        .fill("#e8eaed");

      // Card background
      doc
        .roundedRect(startX, cardTop, pageWidth, cardHeight, 12)
        .fill(colors.white);

      // Card border
      doc
        .roundedRect(startX, cardTop, pageWidth, cardHeight, 12)
        .strokeColor(colors.border)
        .lineWidth(1)
        .stroke();

      // Balance section (top part of card with blue background)
      doc
        .save()
        .roundedRect(startX, cardTop, pageWidth, 70, 12)
        .clip()
        .rect(startX, cardTop, pageWidth, 70)
        .fill(colors.primary)
        .restore();

      // Current Balance label
      doc.fontSize(11).fillColor(colors.white);
      doc.text("Current Balance", startX, cardTop + 15, {
        align: "center",
        width: pageWidth,
      });

      // Balance amount
      doc.fontSize(28).fillColor(colors.white);
      doc.text(formatCurrency(balance), startX, cardTop + 32, {
        align: "center",
        width: pageWidth,
      });

      // Income and Expense section
      const summaryY = cardTop + 85;
      const halfWidth = pageWidth / 2;

      // Income
      doc.fontSize(10).fillColor(colors.textSecondary);
      doc.text("Income", startX, summaryY, {
        width: halfWidth,
        align: "center",
      });
      doc.fontSize(16).fillColor(colors.success);
      doc.text(formatCurrency(totalIncome), startX, summaryY + 14, {
        width: halfWidth,
        align: "center",
      });

      // Vertical divider
      doc
        .moveTo(startX + halfWidth, cardTop + 78)
        .lineTo(startX + halfWidth, cardTop + cardHeight - 10)
        .strokeColor(colors.border)
        .lineWidth(1)
        .stroke();

      // Expense
      doc.fontSize(10).fillColor(colors.textSecondary);
      doc.text("Expense", startX + halfWidth, summaryY, {
        width: halfWidth,
        align: "center",
      });
      doc.fontSize(16).fillColor(colors.error);
      doc.text(
        formatCurrency(totalExpense),
        startX + halfWidth,
        summaryY + 14,
        {
          width: halfWidth,
          align: "center",
        }
      );

      // ========== TRANSACTIONS SECTION ==========
      let currentY = cardTop + cardHeight + 30;

      // Section title
      doc.fontSize(16).fillColor(colors.textPrimary);
      doc.text("Transactions", startX, currentY);
      currentY += 25;

      // Group transactions by date
      const groupedTransactions = {};
      transactions.forEach((t) => {
        const dateKey = formatDate(t.date);
        if (!groupedTransactions[dateKey]) {
          groupedTransactions[dateKey] = [];
        }
        groupedTransactions[dateKey].push(t);
      });

      // Helper function to get category initials
      const getCategoryInitials = (name) => {
        if (!name) return "";
        const words = name.split(" ");
        if (words.length >= 2) {
          return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };

      // Render each date group
      Object.keys(groupedTransactions).forEach((dateKey) => {
        // Check if we need a new page
        if (currentY > doc.page.height - 100) {
          doc.addPage();
          currentY = 40;
        }

        // Date header
        doc
          .roundedRect(startX, currentY, pageWidth, 28, 6)
          .fill(colors.background);
        doc.fontSize(11).fillColor(colors.textSecondary);
        doc.text(dateKey, startX + 12, currentY + 8);
        currentY += 35;

        // Transactions for this date
        groupedTransactions[dateKey].forEach((t, index) => {
          // Check if we need a new page
          if (currentY > doc.page.height - 80) {
            doc.addPage();
            currentY = 40;
          }

          const rowHeight = 50;
          const avatarSize = 36;
          const avatarX = startX + 10;
          const avatarY = currentY + 7;

         
          const avatarColor =
            t.type === "income"
              ? { bg: "#e6f4ea", text: colors.success }
              : { bg: "#fce8e6", text: colors.error };

          doc
            .circle(
              avatarX + avatarSize / 2,
              avatarY + avatarSize / 2,
              avatarSize / 2
            )
            .fill(avatarColor.bg);

         
          doc.fontSize(12).fillColor(avatarColor.text);
          const initials = getCategoryInitials(t.category?.name || "");
          doc.text(initials, avatarX + 5, avatarY + 12, {
            width: avatarSize - 10,
            align: "center",
          });

          // Category name
          const textX = avatarX + avatarSize + 12;
          doc.fontSize(13).fillColor(colors.textPrimary);
          doc.text(t.category?.name || "Unknown", textX, currentY + 10, {
            width: 200,
            lineBreak: false,
          });

          // Notes
          doc.fontSize(10).fillColor(colors.textSecondary);
          doc.text(t.notes || "No description", textX, currentY + 27, {
            width: 200,
            lineBreak: false,
          });

          // Amount (right aligned)
          const amountX = startX + pageWidth - 120;
          const amountColor =
            t.type === "income" ? colors.success : colors.error;
          const amountPrefix = t.type === "income" ? "+ " : "- ";
          doc.fontSize(13).fillColor(amountColor);
          doc.text(
            amountPrefix + formatCurrency(t.amount),
            amountX,
            currentY + 10,
            {
              width: 110,
              align: "right",
            }
          );

          // Date (right aligned, below amount)
          doc.fontSize(9).fillColor(colors.textSecondary);
          doc.text(
            new Date(t.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            }),
            amountX,
            currentY + 28,
            { width: 110, align: "right" }
          );

          currentY += rowHeight;

          // Draw divider (except for last item)
          if (index < groupedTransactions[dateKey].length - 1) {
            doc
              .moveTo(textX, currentY - 5)
              .lineTo(startX + pageWidth - 10, currentY - 5)
              .strokeColor(colors.border)
              .lineWidth(0.5)
              .stroke();
          }
        });

        currentY += 10; // Space between date groups
      });

      // ========== FOOTER ==========
      // Add footer on last page
      doc.fontSize(9).fillColor(colors.textSecondary);
      doc.text(
        "Generated by Expense Tracker App",
        startX,
        doc.page.height - 40,
        { align: "center", width: pageWidth }
      );

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
