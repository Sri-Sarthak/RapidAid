const mongoose = require("mongoose");
const { INITIAL_VOLUNTEER_RADIUS_KM } = require("../config/constants");

const notifiedVolunteerSchema = new mongoose.Schema(
  {
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notifiedAt: { type: Date, default: Date.now },
    radiusAtNotification: { type: Number },
  },
  { _id: false }
);

const emergencyAlertSchema = new mongoose.Schema(
  {
    // "sos"        -> raised by the victim themselves via the SOS button
    // "bystander"  -> raised by someone who witnessed the accident
    type: { type: String, enum: ["sos", "bystander"], required: true },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional extra context (mainly used for bystander reports)
    victimName: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: { type: String, trim: true, default: "" },

    status: {
      type: String,
      enum: ["pending", "accepted", "resolved", "cancelled"],
      default: "pending",
    },

    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    acceptedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },

    // --- Radius escalation tracking ---
    currentRadiusKm: { type: Number, default: INITIAL_VOLUNTEER_RADIUS_KM },
    maxRadiusReached: { type: Boolean, default: false },
    lastEscalatedAt: { type: Date, default: Date.now },
    notifiedVolunteers: { type: [notifiedVolunteerSchema], default: [] },

    // Snapshot of nearby hospitals at the time the alert was created
    // (kept so the user can review them later without re-querying)
    nearbyHospitals: { type: [mongoose.Schema.Types.Mixed], default: [] },

    // Family members notified for this specific alert (sos type only)
    familyNotified: { type: [String], default: [] }, // emails
  },
  { timestamps: true }
);

emergencyAlertSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("EmergencyAlert", emergencyAlertSchema);
