// Central place for all tunable constants used across the SOS matching
// and hospital search logic. Values are read from environment variables
// with sensible fallbacks so the app works even without a .env file.

module.exports = {
  EARTH_RADIUS_KM: 6378.1,

  // Radius (km) used for the FIRST round of volunteer notifications
  INITIAL_VOLUNTEER_RADIUS_KM: Number(process.env.INITIAL_VOLUNTEER_RADIUS_KM) || 3,

  // How much the radius grows on every escalation cycle
  RADIUS_STEP_KM: Number(process.env.RADIUS_STEP_KM) || 3,

  // The search radius will never grow past this value
  MAX_VOLUNTEER_RADIUS_KM: Number(process.env.MAX_VOLUNTEER_RADIUS_KM) || 25,

  // Radius (km) used when looking up nearby hospitals
  HOSPITAL_SEARCH_RADIUS_KM: Number(process.env.HOSPITAL_SEARCH_RADIUS_KM) || 15,

  // How often (minutes) the background job re-checks pending alerts
  ESCALATION_INTERVAL_MINUTES: Number(process.env.ESCALATION_INTERVAL_MINUTES) || 2,

  // Standard list of facilities a hospital can mark as available.
  // Used to drive the multi-select UI on the frontend.
  HOSPITAL_FACILITIES: [
    "Emergency Room",
    "ICU",
    "Trauma Center",
    "Ventilator Support",
    "Blood Bank",
    "Ambulance Service",
    "Operation Theatre",
    "Burn Unit",
    "Neurosurgery",
    "Orthopedics",
    "Pediatric Care",
    "Cardiac Care",
    "Pharmacy 24x7",
    "X-Ray / CT Scan",
    "Dialysis",
  ],
};
