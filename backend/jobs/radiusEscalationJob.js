const cron = require("node-cron");
const EmergencyAlert = require("../models/EmergencyAlert");
const { findEligibleVolunteers, notifyVolunteers, notifyRadiusExpanded } = require("../services/alertService");
const { RADIUS_STEP_KM, MAX_VOLUNTEER_RADIUS_KM, ESCALATION_INTERVAL_MINUTES } = require("../config/constants");

/**
 * Runs every minute. For any "pending" alert that hasn't been escalated in
 * the last ESCALATION_INTERVAL_MINUTES and hasn't reached MAX_VOLUNTEER_RADIUS_KM,
 * grow the search radius by RADIUS_STEP_KM and notify any newly-in-range
 * available volunteers who haven't already been notified.
 */
const startRadiusEscalationJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const cutoff = new Date(Date.now() - ESCALATION_INTERVAL_MINUTES * 60 * 1000);

      const pendingAlerts = await EmergencyAlert.find({
        status: "pending",
        currentRadiusKm: { $lt: MAX_VOLUNTEER_RADIUS_KM },
        lastEscalatedAt: { $lte: cutoff },
      }).populate("reportedBy", "name");

      for (const alert of pendingAlerts) {
        const newRadius = Math.min(alert.currentRadiusKm + RADIUS_STEP_KM, MAX_VOLUNTEER_RADIUS_KM);
        const [lng, lat] = alert.location.coordinates;
        const alreadyNotifiedIds = alert.notifiedVolunteers.map((nv) => nv.volunteer);

        // eslint-disable-next-line no-await-in-loop
        const newVolunteers = await findEligibleVolunteers({
          lng,
          lat,
          radiusKm: newRadius,
          excludeUserId: alert.reportedBy?._id,
          alreadyNotifiedIds,
        });

        alert.currentRadiusKm = newRadius;
        alert.lastEscalatedAt = new Date();
        if (newRadius >= MAX_VOLUNTEER_RADIUS_KM) alert.maxRadiusReached = true;

        if (newVolunteers.length > 0) {
          // eslint-disable-next-line no-await-in-loop
          await notifyVolunteers(alert, newVolunteers, alert.reportedBy?.name || "Someone nearby");

          alert.notifiedVolunteers.push(
            ...newVolunteers.map((v) => ({
              volunteer: v._id,
              notifiedAt: new Date(),
              radiusAtNotification: newRadius,
            }))
          );
        }

        // eslint-disable-next-line no-await-in-loop
        await alert.save();
        // eslint-disable-next-line no-await-in-loop
        await notifyRadiusExpanded(alert);

        console.log(
          `[escalation] Alert ${alert._id}: radius -> ${newRadius}km, newly notified: ${newVolunteers.length}`
        );
      }
    } catch (err) {
      console.error("Radius escalation job error:", err.message);
    }
  });

  console.log(
    `Radius escalation job scheduled (checks every minute, expands radius after ${ESCALATION_INTERVAL_MINUTES} min without acceptance)`
  );
};

module.exports = startRadiusEscalationJob;
