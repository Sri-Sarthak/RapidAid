const express = require("express");
const router = express.Router();
const { protectHospital } = require("../middleware/authMiddleware");
const {
  registerHospital,
  loginHospital,
  getHospitalProfile,
  updateAvailability,
  getNearbyHospitals,
  getHospitalById,
  getFacilitiesList,
} = require("../controllers/hospitalController");

// Public
router.post("/register", registerHospital);
router.post("/login", loginHospital);
router.get("/facilities-list", getFacilitiesList);
router.get("/nearby", getNearbyHospitals);

// Hospital-only (must come before the "/:id" wildcard route below)
router.get("/me", protectHospital, getHospitalProfile);
router.put("/availability", protectHospital, updateAvailability);

// Public - keep last since ":id" would otherwise swallow routes above
router.get("/:id", getHospitalById);

module.exports = router;
