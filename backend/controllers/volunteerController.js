const asyncHandler = require("express-async-handler");
const EmergencyAlert = require("../models/EmergencyAlert");
const Notification = require("../models/Notification");
const { isValidCoordinates } = require("../utils/geoUtils");
const { notifyReporterAccepted, notifyAlertTaken } = require("../services/alertService");

// @route  PUT /api/volunteer/availability
// @access Private (user)
// Body: { available: boolean, lat?, lng? }
const setAvailability = asyncHandler(async (req, res) => {
  const { available, lat, lng } = req.body;
  const user = req.user;

  if (!user.isVolunteer) {
    res.status(403);
    throw new Error("You need to opt in as a volunteer in your profile first");
  }

  if (lat !== undefined && lng !== undefined) {
    if (!isValidCoordinates([lng, lat])) {
      res.status(400);
      throw new Error("Valid lat/lng coordinates are required");
    }
    user.location = { type: "Point", coordinates: [lng, lat] };
    user.locationUpdatedAt = new Date();
  }

  user.volunteerAvailable = !!available;
  await user.save();

  res.json({
    isVolunteer: user.isVolunteer,
    volunteerAvailable: user.volunteerAvailable,
    location: user.location,
  });
});

// @route  GET /api/volunteer/notifications
// @access Private (user)
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate({
      path: "alert",
      select: "type status location description victimName createdAt currentRadiusKm acceptedBy",
    });

  res.json(notifications);
});

// @route  PUT /api/volunteer/notifications/:id/read
// @access Private (user)
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  notification.isRead = true;
  await notification.save();

  res.json(notification);
});

// @route  PUT /api/volunteer/notifications/read-all
// @access Private (user)
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});

// @route  POST /api/volunteer/alerts/:id/accept
// @access Private (user)
const acceptAlert = asyncHandler(async (req, res) => {
  const alert = await EmergencyAlert.findById(req.params.id);

  if (!alert) {
    res.status(404);
    throw new Error("Alert not found");
  }

  if (alert.status !== "pending") {
    res.status(409);
    throw new Error("This alert has already been handled by another volunteer");
  }

  if (String(alert.reportedBy) === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot accept your own alert");
  }

  alert.status = "accepted";
  alert.acceptedBy = req.user._id;
  alert.acceptedAt = new Date();
  await alert.save();

  await notifyReporterAccepted(alert, req.user);
  await notifyAlertTaken(alert, req.user.name);

  const populated = await EmergencyAlert.findById(alert._id).populate("acceptedBy", "name phone location");

  res.json(populated);
});

// @route  GET /api/volunteer/alerts/accepted
// @access Private (user)
// Alerts this volunteer has accepted and is currently helping with
const getAcceptedAlerts = asyncHandler(async (req, res) => {
  const alerts = await EmergencyAlert.find({ acceptedBy: req.user._id })
    .sort({ createdAt: -1 })
    .populate("reportedBy", "name phone");

  res.json(alerts);
});

module.exports = {
  setAvailability,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  acceptAlert,
  getAcceptedAlerts,
};
