const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // sos_alert            - new SOS/bystander alert near a volunteer
    // alert_accepted       - reporter is told a volunteer accepted
    // alert_taken          - tells other notified volunteers it's no longer needed
    // alert_resolved       - alert marked resolved
    // radius_expanded      - alert search radius increased, re-notified
    type: {
      type: String,
      enum: [
        "sos_alert",
        "alert_accepted",
        "alert_taken",
        "alert_resolved",
        "radius_expanded",
      ],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    alert: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyAlert", default: null },

    location: {
      lat: { type: Number },
      lng: { type: Number },
    },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
