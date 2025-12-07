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
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=expense-tracker-data.pdf"
    );

    doc.pipe(res);

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

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const formatCurrency = (amount) => {
      return "\u20B9" + amount.toLocaleString("en-IN");
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    const pageWidth = doc.page.width - 80;
    const startX = 40;

    doc.rect(0, 0, doc.page.width, 100).fill(colors.primary);

    doc.fontSize(24).fillColor(colors.white);
    doc.text("Expense Tracker", startX, 35, { align: "center" });

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

    const cardTop = 120;
    const cardHeight = 130;

    doc
      .roundedRect(startX + 2, cardTop + 2, pageWidth, cardHeight, 12)
      .fill("#e8eaed");

    doc
      .roundedRect(startX, cardTop, pageWidth, cardHeight, 12)
      .fill(colors.white);

    doc
      .roundedRect(startX, cardTop, pageWidth, cardHeight, 12)
      .strokeColor(colors.border)
      .lineWidth(1)
      .stroke();

    doc
      .save()
      .roundedRect(startX, cardTop, pageWidth, 70, 12)
      .clip()
      .rect(startX, cardTop, pageWidth, 70)
      .fill(colors.primary)
      .restore();

    doc.fontSize(11).fillColor(colors.white);
    doc.text("Current Balance", startX, cardTop + 15, {
      align: "center",
      width: pageWidth,
    });

    doc.fontSize(28).fillColor(colors.white);
    doc.text(formatCurrency(balance), startX, cardTop + 32, {
      align: "center",
      width: pageWidth,
    });

    const summaryY = cardTop + 85;
    const halfWidth = pageWidth / 2;

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

    doc
      .moveTo(startX + halfWidth, cardTop + 78)
      .lineTo(startX + halfWidth, cardTop + cardHeight - 10)
      .strokeColor(colors.border)
      .lineWidth(1)
      .stroke();

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

    let currentY = cardTop + cardHeight + 30;

    doc.fontSize(16).fillColor(colors.textPrimary);
    doc.text("Transactions", startX, currentY);
    currentY += 25;

    const groupedTransactions = {};
    transactions.forEach((t) => {
      const dateKey = formatDate(t.date);
      if (!groupedTransactions[dateKey]) {
        groupedTransactions[dateKey] = [];
      }
      groupedTransactions[dateKey].push(t);
    });

    const getCategoryInitials = (name) => {
      if (!name) return "";
      const words = name.split(" ");
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    Object.keys(groupedTransactions).forEach((dateKey) => {
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = 40;
      }

      doc
        .roundedRect(startX, currentY, pageWidth, 28, 6)
        .fill(colors.background);
      doc.fontSize(11).fillColor(colors.textSecondary);
      doc.text(dateKey, startX + 12, currentY + 8);
      currentY += 35;

      groupedTransactions[dateKey].forEach((t, index) => {
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

        const textX = avatarX + avatarSize + 12;
        doc.fontSize(13).fillColor(colors.textPrimary);
        doc.text(t.category?.name || "Unknown", textX, currentY + 10, {
          width: 200,
          lineBreak: false,
        });

        doc.fontSize(10).fillColor(colors.textSecondary);
        doc.text(t.notes || "No description", textX, currentY + 27, {
          width: 200,
          lineBreak: false,
        });

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

        if (index < groupedTransactions[dateKey].length - 1) {
          doc
            .moveTo(textX, currentY - 5)
            .lineTo(startX + pageWidth - 10, currentY - 5)
            .strokeColor(colors.border)
            .lineWidth(0.5)
            .stroke();
        }
      });

      currentY += 10;
    });

    doc.fontSize(9).fillColor(colors.textSecondary);
    doc.text(
      "Generated by Expense Tracker App",
      startX,
      doc.page.height - 40,
      { align: "center", width: pageWidth }
    );

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
