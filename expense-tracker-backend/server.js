// server.js (update)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Better approach for handling Content-Type
app.use((req, res, next) => {
  // Only set default Content-Type if it hasn't been set yet
  const originalSetHeader = res.setHeader;
  res.setHeader = function (name, value) {
    if (name.toLowerCase() === "content-type") {
      // If Content-Type is being set, use that one
      return originalSetHeader.apply(this, arguments);
    }
    return originalSetHeader.apply(this, arguments);
  };

  // Set default Content-Type to application/json
  res.setHeader("Content-Type", "application/json");
  next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/users", require("./routes/userRoutes")); // Add this line
app.use("/api/data", require("./routes/dataRoutes")); // Add this line

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
