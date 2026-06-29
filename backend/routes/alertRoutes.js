const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createBystanderAlert, getMyReportedAlerts, getAlertById } = require("../controllers/alertController");

router.post("/bystander", protect, createBystanderAlert);
router.get("/mine", protect, getMyReportedAlerts);
router.get("/:id", protect, getAlertById);

module.exports = router;
