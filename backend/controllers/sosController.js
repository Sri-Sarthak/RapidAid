const asyncHandler = require("express-async-handler");
const EmergencyAlert = require("../models/EmergencyAlert");
const Hospital = require("../models/Hospital");
const { withinRadius, haversineDistanceKm, isValidCoordinates } = require("../utils/geoUtils");
const { sendSOSEmail } = require("../utils/emailService");
const { HOSPITAL_SEARCH_RADIUS_KM, INITIAL_VOLUNTEER_RADIUS_KM } = require("../config/constants");
const { sanitizeHospital } = require("./hospitalController");
const { findEligibleVolunteers, notifyVolunteers } = require("../services/alertService");

/**
 * Shared helper: finds nearby hospitals sorted by distance and returns a
 * plain-object array with a `distanceKm` field attached.
 */
const findNearbyHospitals = async (lng, lat, radiusKm = HOSPITAL_SEARCH_RADIUS_KM) => {
  const hospitals = await Hospital.find({
    isActive: true,
    ...withinRadius(lng, lat, radiusKm),
  }).lean();

  return hospitals
    .map((h) => ({
      ...sanitizeHospital(h),
      distanceKm: Number(haversineDistanceKm([lng, lat], h.location.coordinates).toFixed(2)),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

// @route  POST /api/sos/trigger
// @access Private (user)
const triggerSOS = asyncHandler(async (req, res) => {
  const { lat, lng, message } = req.body;

  if (!isValidCoordinates([lng, lat])) {
    res.status(400);
    throw new Error("A valid lat/lng location is required to trigger SOS");
  }

  const user = req.user;

  // Keep the user's stored location fresh too
  user.location = { type: "Point", coordinates: [lng, lat] };
  user.locationUpdatedAt = new Date();
  await user.save();

  // 1) Create the alert
  const alert = await EmergencyAlert.create({
    type: "sos",
    reportedBy: user._id,
    description: message || "SOS emergency triggered - immediate help needed",
    location: { type: "Point", coordinates: [lng, lat] },
    currentRadiusKm: INITIAL_VOLUNTEER_RADIUS_KM,
    lastEscalatedAt: new Date(),
  });

  // 2) Find nearby hospitals with bed availability + facilities
  const nearbyHospitals = await findNearbyHospitals(lng, lat);
  alert.nearbyHospitals = nearbyHospitals;

  // 3) Email family members the message + live location link
  const familyNotified = [];
  for (const fm of user.familyMembers || []) {
    if (fm.email) {
      // eslint-disable-next-line no-await-in-loop
      await sendSOSEmail({ to: fm.email, victimName: user.name, lat, lng, message });
      familyNotified.push(fm.email);
    }
  }
  alert.familyNotified = familyNotified;

  // 4) Find & notify nearby volunteers (initial radius)
  const volunteers = await findEligibleVolunteers({
    lng,
    lat,
    radiusKm: alert.currentRadiusKm,
    excludeUserId: user._id,
    alreadyNotifiedIds: [],
  });

  await notifyVolunteers(alert, volunteers, user.name);

  alert.notifiedVolunteers = volunteers.map((v) => ({
    volunteer: v._id,
    notifiedAt: new Date(),
    radiusAtNotification: alert.currentRadiusKm,
  }));

  await alert.save();

  res.status(201).json({
    alert,
    nearbyHospitals,
    volunteersNotified: volunteers.length,
    familyNotified,
  });
});

// @route  GET /api/sos/active
// @access Private (user)
// Returns the most recent pending/accepted alert raised by this user, if any.
const getActiveAlert = asyncHandler(async (req, res) => {
  const alert = await EmergencyAlert.findOne({
    reportedBy: req.user._id,
    status: { $in: ["pending", "accepted"] },
  })
    .sort({ createdAt: -1 })
    .populate("acceptedBy", "name phone");

  res.json(alert || null);
});

// @route  GET /api/sos/:id
// @access Private (user)
const getAlertById = asyncHandler(async (req, res) => {
  const alert = await EmergencyAlert.findById(req.params.id).populate("acceptedBy", "name phone location");

  if (!alert) {
    res.status(404);
    throw new Error("Alert not found");
  }

  res.json(alert);
});

// @route  PUT /api/sos/:id/resolve
// @access Private (user) - reporter marks the situation as resolved
const resolveAlert = asyncHandler(async (req, res) => {
  const alert = await EmergencyAlert.findById(req.params.id);

  if (!alert) {
    res.status(404);
    throw new Error("Alert not found");
  }

  if (String(alert.reportedBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Only the reporter can resolve this alert");
  }

  alert.status = "resolved";
  alert.resolvedAt = new Date();
  await alert.save();

  res.json(alert);
});

// @route  GET /api/sos/history/mine
// @access Private (user)
const getMyAlerts = asyncHandler(async (req, res) => {
  const alerts = await EmergencyAlert.find({ reportedBy: req.user._id })
    .sort({ createdAt: -1 })
    .populate("acceptedBy", "name phone");

  res.json(alerts);
});

module.exports = {
  triggerSOS,
  getActiveAlert,
  getAlertById,
  resolveAlert,
  getMyAlerts,
  findNearbyHospitals,
};
