// routes/dataRoutes.js
const express = require("express");
const router = express.Router();
const { exportData, clearAllData } = require("../controllers/dataController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.get("/export", exportData);
router.delete("/clear-all", clearAllData);

module.exports = router;
