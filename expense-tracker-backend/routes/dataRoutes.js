const express = require("express");
const router = express.Router();
const { exportData, clearAllData } = require("../controllers/dataController");
const { protect } = require("../middleware/auth");
const { validateQuery, exportDataSchema } = require("../validators");

router.use(protect);

router.get("/export", validateQuery(exportDataSchema), exportData);
router.delete("/clear-all", clearAllData);

module.exports = router;
