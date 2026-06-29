const asyncHandler = require("express-async-handler");
const EmergencyAlert = require("../models/EmergencyAlert");
const { isValidCoordinates } = require("../utils/geoUtils");
const { INITIAL_VOLUNTEER_RADIUS_KM } = require("../config/constants");
const { findNearbyHospitals } = require("./sosController");
const { findEligibleVolunteers, notifyVolunteers } = require("../services/alertService");

// @route  POST /api/alerts/bystander
// @access Private (user)
// A bystander who witnessed an accident reports it on behalf of the victim.
// This notifies nearby volunteers and returns nearby hospitals, but does
// NOT notify the victim's family (the bystander isn't the victim).
const createBystanderAlert = asyncHandler(async (req, res) => {
  const { lat, lng, description, victimName } = req.body;

  if (!isValidCoordinates([lng, lat])) {
    res.status(400);
    throw new Error("A valid lat/lng location is required");
  }

  if (!description || !description.trim()) {
    res.status(400);
    throw new Error("Please describe what happened so volunteers know what to expect");
  }

  const user = req.user;

  const alert = await EmergencyAlert.create({
    type: "bystander",
    reportedBy: user._id,
    victimName: victimName || "",
    description: description.trim(),
    location: { type: "Point", coordinates: [lng, lat] },
    currentRadiusKm: INITIAL_VOLUNTEER_RADIUS_KM,
    lastEscalatedAt: new Date(),
  });

  const nearbyHospitals = await findNearbyHospitals(lng, lat);
  alert.nearbyHospitals = nearbyHospitals;

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
  });
});

// @route  GET /api/alerts/mine
// @access Private (user)
// All alerts (SOS + bystander reports) raised by this user.
const getMyReportedAlerts = asyncHandler(async (req, res) => {
  const alerts = await EmergencyAlert.find({ reportedBy: req.user._id })
    .sort({ createdAt: -1 })
    .populate("acceptedBy", "name phone");

  res.json(alerts);
});

// @route  GET /api/alerts/:id
// @access Private (user)
const getAlertById = asyncHandler(async (req, res) => {
  const alert = await EmergencyAlert.findById(req.params.id).populate("acceptedBy", "name phone location");

  if (!alert) {
    res.status(404);
    throw new Error("Alert not found");
  }

  res.json(alert);
});

module.exports = { createBystanderAlert, getMyReportedAlerts, getAlertById };
