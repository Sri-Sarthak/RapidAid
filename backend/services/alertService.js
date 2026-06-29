const User = require("../models/User");
const Notification = require("../models/Notification");
const { withinRadius, haversineDistanceKm } = require("../utils/geoUtils");
const { emitToUser } = require("../sockets/socketManager");

/**
 * Finds available volunteers within `radiusKm` of [lng, lat], excluding
 * the reporter and anyone already notified for this alert.
 * Returns volunteers annotated with `distanceKm`.
 */
const findEligibleVolunteers = async ({ lng, lat, radiusKm, excludeUserId, alreadyNotifiedIds = [] }) => {
  const excludeIds = [excludeUserId, ...alreadyNotifiedIds].filter(Boolean);

  const volunteers = await User.find({
    isVolunteer: true,
    volunteerAvailable: true,
    _id: { $nin: excludeIds },
    ...withinRadius(lng, lat, radiusKm),
  }).lean();

  return volunteers.map((v) => ({
    ...v,
    distanceKm: Number(haversineDistanceKm([lng, lat], v.location.coordinates).toFixed(2)),
  }));
};

/**
 * Creates an in-app Notification for each volunteer and pushes a realtime
 * "new-alert" event over Socket.IO so dashboards update instantly.
 */
const notifyVolunteers = async (alert, volunteers, reporterName) => {
  const created = [];

  for (const v of volunteers) {
    const isSOS = alert.type === "sos";
    const title = isSOS ? "🚨 Nearby SOS - someone needs help" : "Accident reported nearby";
    const descPart = alert.description ? ` Details: ${alert.description}` : "";
    const message = `${reporterName} ${
      isSOS ? "triggered an SOS" : "reported an accident"
    } about ${v.distanceKm} km from your location.${descPart}`;

    const notif = await Notification.create({
      recipient: v._id,
      type: "sos_alert",
      title,
      message,
      alert: alert._id,
      location: { lat: alert.location.coordinates[1], lng: alert.location.coordinates[0] },
    });

    created.push(notif);

    emitToUser(v._id, "new-alert", {
      notification: notif,
      alert: {
        _id: alert._id,
        type: alert.type,
        status: alert.status,
        location: alert.location,
        description: alert.description,
        victimName: alert.victimName,
        createdAt: alert.createdAt,
        currentRadiusKm: alert.currentRadiusKm,
      },
      distanceKm: v.distanceKm,
    });
  }

  return created;
};

/**
 * Notifies every volunteer who was previously notified (other than the one
 * who accepted) that this alert has been taken care of.
 */
const notifyAlertTaken = async (alert, acceptedByName) => {
  const otherVolunteerIds = alert.notifiedVolunteers
    .map((nv) => String(nv.volunteer))
    .filter((id) => id !== String(alert.acceptedBy));

  for (const volunteerId of otherVolunteerIds) {
    const notif = await Notification.create({
      recipient: volunteerId,
      type: "alert_taken",
      title: "This alert has been handled",
      message: `${acceptedByName} is already on the way. Thanks for being ready to help!`,
      alert: alert._id,
    });

    emitToUser(volunteerId, "alert-taken", { alertId: alert._id, notification: notif });
  }
};

/**
 * Notifies the original reporter that a volunteer accepted their alert.
 */
const notifyReporterAccepted = async (alert, volunteer) => {
  const notif = await Notification.create({
    recipient: alert.reportedBy,
    type: "alert_accepted",
    title: "Help is on the way!",
    message: `${volunteer.name} (${volunteer.phone}) has accepted your alert and is coming to help.`,
    alert: alert._id,
  });

  emitToUser(alert.reportedBy, "alert-accepted", {
    alertId: alert._id,
    notification: notif,
    volunteer: {
      _id: volunteer._id,
      name: volunteer.name,
      phone: volunteer.phone,
      location: volunteer.location,
    },
  });
};

/**
 * Notifies the reporter that the search radius has expanded because no
 * volunteer has accepted yet.
 */
const notifyRadiusExpanded = async (alert) => {
  const notif = await Notification.create({
    recipient: alert.reportedBy,
    type: "radius_expanded",
    title: "Still searching for a volunteer",
    message: `No volunteer has responded yet. We've expanded the search radius to ${alert.currentRadiusKm} km.`,
    alert: alert._id,
  });

  emitToUser(alert.reportedBy, "radius-expanded", {
    alertId: alert._id,
    notification: notif,
    currentRadiusKm: alert.currentRadiusKm,
  });
};

module.exports = {
  findEligibleVolunteers,
  notifyVolunteers,
  notifyAlertTaken,
  notifyReporterAccepted,
  notifyRadiusExpanded,
};
