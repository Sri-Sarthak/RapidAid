const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  setAvailability,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  acceptAlert,
  getAcceptedAlerts,
} = require("../controllers/volunteerController");

router.put("/availability", protect, setAvailability);
router.get("/notifications", protect, getNotifications);
router.put("/notifications/read-all", protect, markAllNotificationsRead);
router.put("/notifications/:id/read", protect, markNotificationRead);
router.post("/alerts/:id/accept", protect, acceptAlert);
router.get("/alerts/accepted", protect, getAcceptedAlerts);

module.exports = router;
