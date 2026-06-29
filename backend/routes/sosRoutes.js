const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  triggerSOS,
  getActiveAlert,
  getAlertById,
  resolveAlert,
  getMyAlerts,
} = require("../controllers/sosController");

router.post("/trigger", protect, triggerSOS);
router.get("/active", protect, getActiveAlert);
router.get("/history/mine", protect, getMyAlerts);
router.get("/:id", protect, getAlertById);
router.put("/:id/resolve", protect, resolveAlert);

module.exports = router;
