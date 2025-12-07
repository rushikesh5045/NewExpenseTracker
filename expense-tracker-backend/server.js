const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const originalSetHeader = res.setHeader;
  res.setHeader = function (name, value) {
    if (name.toLowerCase() === "content-type") {
      return originalSetHeader.apply(this, arguments);
    }
    return originalSetHeader.apply(this, arguments);
  };

  res.setHeader("Content-Type", "application/json");
  next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/data", require("./routes/dataRoutes"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/health-check", (req, res) => {
  res.json({
    status: "active",
    version: "1.1.0",
    update: "Phase 1: Code Quality - Added validation, error handling, constants",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
