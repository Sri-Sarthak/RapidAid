const asyncHandler = require("express-async-handler");
const Hospital = require("../models/Hospital");
const generateToken = require("../utils/generateToken");
const { withinRadius, haversineDistanceKm, isValidCoordinates } = require("../utils/geoUtils");
const { HOSPITAL_SEARCH_RADIUS_KM, HOSPITAL_FACILITIES } = require("../config/constants");

const sanitizeHospital = (h) => ({
  _id: h._id,
  name: h.name,
  email: h.email,
  phone: h.phone,
  address: h.address,
  location: h.location,
  totalBeds: h.totalBeds,
  availableBeds: h.availableBeds,
  facilities: h.facilities,
  isActive: h.isActive,
});

// @route  POST /api/hospitals/register
// @access Public
const registerHospital = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, location, totalBeds, availableBeds, facilities } = req.body;

  if (!name || !email || !password || !phone || !address || !location) {
    res.status(400);
    throw new Error("Name, email, password, phone, address and location are required");
  }

  if (!isValidCoordinates([location.lng, location.lat])) {
    res.status(400);
    throw new Error("A valid hospital location (lat/lng) is required");
  }

  const existing = await Hospital.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error("A hospital account with this email already exists");
  }

  const total = Number(totalBeds) || 0;
  let available = Number(availableBeds);
  if (Number.isNaN(available)) available = total;
  available = Math.min(Math.max(available, 0), total);

  const hospital = await Hospital.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    address,
    location: { type: "Point", coordinates: [location.lng, location.lat] },
    totalBeds: total,
    availableBeds: available,
    facilities: Array.isArray(facilities) ? facilities : [],
  });

  res.status(201).json({
    token: generateToken(hospital._id, "hospital"),
    hospital: sanitizeHospital(hospital),
  });
});

// @route  POST /api/hospitals/login
// @access Public
const loginHospital = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const hospital = await Hospital.findOne({ email: email.toLowerCase() });

  if (!hospital || !(await hospital.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    token: generateToken(hospital._id, "hospital"),
    hospital: sanitizeHospital(hospital),
  });
});

// @route  GET /api/hospitals/me
// @access Private (hospital)
const getHospitalProfile = asyncHandler(async (req, res) => {
  res.json(sanitizeHospital(req.hospital));
});

// @route  PUT /api/hospitals/availability
// @access Private (hospital)
const updateAvailability = asyncHandler(async (req, res) => {
  const { totalBeds, availableBeds, facilities, address, location } = req.body;
  const hospital = req.hospital;

  if (totalBeds !== undefined) hospital.totalBeds = Math.max(0, Number(totalBeds));
  if (availableBeds !== undefined) hospital.availableBeds = Math.max(0, Number(availableBeds));

  // Keep availableBeds sane relative to totalBeds
  if (hospital.availableBeds > hospital.totalBeds) {
    hospital.availableBeds = hospital.totalBeds;
  }

  if (facilities !== undefined) hospital.facilities = facilities;
  if (address !== undefined) hospital.address = address;
  if (location && isValidCoordinates([location.lng, location.lat])) {
    hospital.location = { type: "Point", coordinates: [location.lng, location.lat] };
  }

  await hospital.save();
  res.json(sanitizeHospital(hospital));
});

// @route  GET /api/hospitals/facilities-list
// @access Public
// Returns the standard list of facility tags for the frontend's checkboxes
const getFacilitiesList = asyncHandler(async (req, res) => {
  res.json(HOSPITAL_FACILITIES);
});

// @route  GET /api/hospitals/nearby?lat=&lng=&radius=
// @access Public
const getNearbyHospitals = asyncHandler(async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radiusKm = parseFloat(req.query.radius) || HOSPITAL_SEARCH_RADIUS_KM;

  if (!isValidCoordinates([lng, lat])) {
    res.status(400);
    throw new Error("Valid lat and lng query parameters are required");
  }

  const hospitals = await Hospital.find({
    isActive: true,
    ...withinRadius(lng, lat, radiusKm),
  }).lean();

  const withDistance = hospitals
    .map((h) => ({
      ...sanitizeHospital(h),
      distanceKm: Number(haversineDistanceKm([lng, lat], h.location.coordinates).toFixed(2)),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json(withDistance);
});

// @route  GET /api/hospitals/:id
// @access Public
const getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) {
    res.status(404);
    throw new Error("Hospital not found");
  }
  res.json(sanitizeHospital(hospital));
});

module.exports = {
  registerHospital,
  loginHospital,
  getHospitalProfile,
  updateAvailability,
  getNearbyHospitals,
  getHospitalById,
  getFacilitiesList,
  sanitizeHospital,
};
