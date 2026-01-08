const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const path = require("path");
const { asyncHandler } = require("../utils");
const { BadRequestError } = require("../utils/errors");
const { HTTP_STATUS, MESSAGES, EXPORT_FORMATS } = require("../constants");

const exportData = asyncHandler(async (req, res) => {
  const { format, startDate, endDate } = req.query;

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

  const transactions = await Transaction.find(query)
    .populate("category", "name")
    .sort({ date: -1 });

  const formattedTransactions = transactions.map((t) => ({
    id: t._id,
    date: new Date(t.date).toLocaleDateString(),
    type: t.type,
    category: t.category.name,
    amount: t.amount,
    notes: t.notes || "",
  }));

  if (format.toLowerCase() === EXPORT_FORMATS.CSV) {
    const fields = ["id", "date", "type", "category", "amount", "notes"];
    const parser = new Parser({ fields });
    const csv = parser.parse(formattedTransactions);

    res.header("Content-Type", "text/csv");
    res.attachment("expense-tracker-data.csv");
    return res.send(csv);
  } else if (format.toLowerCase() === EXPORT_FORMATS.PDF) {
    // 1. Setup Document
    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=expense-tracker-data.pdf"
    );

    doc.pipe(res);

    // 2. Register Fonts (Critical for Devanagari & Rupee Support)
    const fontPath = path.join(__dirname, "../fonts");
    let activeFont = "Helvetica";
    let boldFont = "Helvetica-Bold";

    try {
      const fs = require("fs");
      const devanagariPath = path.join(
        fontPath,
        "NotoSansDevanagari-Regular.ttf"
      );
      const notoSansPath = path.join(fontPath, "NotoSans-Regular.ttf");
      const notoSansBoldPath = path.join(fontPath, "NotoSans-Bold.ttf");

      if (fs.existsSync(devanagariPath)) {
        doc.registerFont("Regular", devanagariPath);
        doc.registerFont("Bold", devanagariPath);
        activeFont = "Regular";
        boldFont = "Bold";
      } else if (fs.existsSync(notoSansPath)) {
        doc.registerFont("Regular", notoSansPath);
        if (fs.existsSync(notoSansBoldPath)) {
          doc.registerFont("Bold", notoSansBoldPath);
        } else {
          doc.registerFont("Bold", notoSansPath);
        }
        activeFont = "Regular";
        boldFont = "Bold";
      }
      doc.font(activeFont);
    } catch (err) {
      console.log("Custom font not found, using default:", err.message);
    }

    // 3. Styling Palette
    const colors = {
      primary: "#1976D2", // Professional Blue
      headerText: "#FFFFFF",
      rowEven: "#FFFFFF",
      rowOdd: "#F5F7FA", // Very light grey-blue
      border: "#E0E0E0", // Soft border
      textPrimary: "#333333",
      textSecondary: "#666666",
      success: "#2E7D32", // Green
      error: "#D32F2F", // Red
    };

    const formatCurrency = (amount) =>
      "\u20B9" + amount.toLocaleString("en-IN");
    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    // Layout Config
    const startX = 30;
    const pageWidth = doc.page.width - startX * 2;

    // Column Configuration
    const columns = [
      { header: "Date", width: 75, align: "left" },
      { header: "Category", width: 100, align: "left" },
      { header: "Description", width: 200, align: "left" },
      { header: "Type", width: 70, align: "center" },
      { header: "Amount", width: 90, align: "right" },
    ];

    let currentY = 50;

    // --- Helper: Header Drawer ---
    const drawTableHeaders = (y) => {
      // Header Background
      doc.rect(startX, y, pageWidth, 30).fill(colors.primary);

      doc.fillColor(colors.headerText).fontSize(10).font(boldFont);

      let currentX = startX;
      columns.forEach((col, i) => {
        // White separator lines
        if (i > 0) {
          doc
            .lineWidth(0.5)
            .moveTo(currentX, y + 5)
            .lineTo(currentX, y + 25)
            .strokeColor("rgba(255,255,255,0.3)")
            .stroke();
        }

        doc.text(col.header, currentX + 8, y + 9, {
          width: col.width - 16,
          align: col.align,
        });
        currentX += col.width;
      });

      // Reset Styles
      doc.font(activeFont).fillColor(colors.textPrimary);
      return y + 30;
    };

    // --- Title Section ---
    doc.rect(0, 0, doc.page.width, 100).fill("#F8F9FA"); // Light header bg for page

    doc
      .fillColor(colors.primary)
      .fontSize(22)
      .font(boldFont)
      .text("Expense Report", startX, 35);

    doc
      .fillColor(colors.textSecondary)
      .fontSize(10)
      .font(activeFont)
      .text(`Generated on ${formatDate(new Date())}`, startX, 65);

    currentY = 110;

    // Draw Initial Headers
    currentY = drawTableHeaders(currentY);

    // 5. Render Transaction Rows
    doc.fontSize(9);

    transactions.forEach((t, rowIndex) => {
      const isIncome = t.type === "income";
      const typeLabel = t.type.charAt(0).toUpperCase() + t.type.slice(1);

      const rowData = [
        formatDate(t.date),
        t.category?.name || "Uncategorized",
        t.notes || "-",
        typeLabel,
        formatCurrency(t.amount),
      ];

      // A. Calculate Row Height
      let maxCellHeight = 0;
      rowData.forEach((text, index) => {
        const height = doc.heightOfString(text, {
          width: columns[index].width - 16, // account for padding
        });
        if (height > maxCellHeight) maxCellHeight = height;
      });

      const rowHeight = maxCellHeight + 16; // Add generous padding

      // B. Check Page Break
      if (currentY + rowHeight > doc.page.height - 50) {
        doc.addPage();
        currentY = 50;
        currentY = drawTableHeaders(currentY);
        doc.fontSize(9); // Reset font size after header
      }

      // C. Draw Zebra Striping Background
      // Even rows get white, Odd rows get light color (or vice versa)
      const rowColor = rowIndex % 2 === 0 ? colors.rowEven : colors.rowOdd;
      doc.rect(startX, currentY, pageWidth, rowHeight).fill(rowColor);

      // Draw soft bottom border
      doc
        .moveTo(startX, currentY + rowHeight)
        .lineTo(startX + pageWidth, currentY + rowHeight)
        .lineWidth(0.5)
        .strokeColor(colors.border)
        .stroke();

      // D. Draw Content
      let currentX = startX;
      rowData.forEach((text, index) => {
        // D.1 Specific Column Styling
        let textColor = colors.textPrimary;
        let fontToUse = activeFont;

        // Style "Amount" column
        if (index === 4) {
          textColor = isIncome ? colors.success : colors.error;
          fontToUse = boldFont;
        }
        // Style "Type" column
        if (index === 3) {
          textColor = colors.textSecondary;
        }

        doc.fillColor(textColor).font(fontToUse);

        // D.2 Draw Text
        doc.text(text, currentX + 8, currentY + 8, {
          width: columns[index].width - 16,
          align: columns[index].align,
        });

        // Vertical Separators (Subtle)
        if (index < columns.length - 1) {
          doc
            .moveTo(currentX + columns[index].width, currentY)
            .lineTo(currentX + columns[index].width, currentY + rowHeight)
            .lineWidth(0.5)
            .strokeColor(colors.border)
            .stroke();
        }

        currentX += columns[index].width;
      });

      currentY += rowHeight;
    });

    // 6. Summary Section
    const summaryHeight = 100;
    if (currentY + summaryHeight > doc.page.height - 50) {
      doc.addPage();
      currentY = 50;
    }

    currentY += 30;

    // Calculate Totals
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    // Draw Summary Card Background (Optional, helps it stand out)
    const summaryWidth = 250;
    const summaryX = startX + pageWidth - summaryWidth;

    doc
      .roundedRect(summaryX - 10, currentY - 10, summaryWidth + 10, 90, 8)
      .fill(colors.rowOdd);

    doc.fontSize(11).font(boldFont);

    const labelX = summaryX;
    const valueX = startX + pageWidth - 10; // Align right edge

    // Income
    doc.fillColor(colors.textSecondary).text("Total Income:", labelX, currentY);
    doc
      .fillColor(colors.success)
      .text(formatCurrency(totalIncome), labelX, currentY, {
        align: "right",
        width: summaryWidth,
      });

    currentY += 25;

    // Expense
    doc
      .fillColor(colors.textSecondary)
      .text("Total Expense:", labelX, currentY);
    doc
      .fillColor(colors.error)
      .text(formatCurrency(totalExpense), labelX, currentY, {
        align: "right",
        width: summaryWidth,
      });

    currentY += 25;

    // Line
    doc
      .moveTo(labelX, currentY)
      .lineTo(valueX, currentY)
      .strokeColor(colors.border)
      .stroke();
    currentY += 10;

    // Net Balance
    doc.fontSize(13);
    doc.fillColor(colors.textPrimary).text("Net Balance:", labelX, currentY);

    const balanceColor = netBalance >= 0 ? colors.primary : colors.error;
    doc
      .fillColor(balanceColor)
      .text(formatCurrency(netBalance), labelX, currentY, {
        align: "right",
        width: summaryWidth,
      });

    // 7. Footer
    doc.fontSize(9).font(activeFont).fillColor(colors.textSecondary);
    doc.text("Generated by Expense Tracker App", startX, doc.page.height - 40, {
      align: "center",
      width: pageWidth,
    });

    doc.end();
    return;
  } else {
    throw new BadRequestError(MESSAGES.DATA.INVALID_FORMAT);
  }
});

const clearAllData = asyncHandler(async (req, res) => {
  await Transaction.deleteMany({ userId: req.user._id });
  await Category.deleteMany({ userId: req.user._id, isDefault: false });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "All data cleared successfully",
  });
});

module.exports = {
  exportData,
  clearAllData,
};
