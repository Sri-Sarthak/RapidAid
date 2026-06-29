const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { isValidCoordinates } = require("../utils/geoUtils");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  familyMembers: user.familyMembers,
  isVolunteer: user.isVolunteer,
  volunteerAvailable: user.volunteerAvailable,
  volunteerSkills: user.volunteerSkills,
  location: user.location,
});

// @route  POST /api/auth/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, isVolunteer, volunteerSkills, familyMembers, location } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error("Name, email, password and phone are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const userData = {
    name,
    email: email.toLowerCase(),
    password,
    phone,
    isVolunteer: !!isVolunteer,
    volunteerSkills: Array.isArray(volunteerSkills) ? volunteerSkills : [],
    familyMembers: Array.isArray(familyMembers) ? familyMembers : [],
  };

  if (location && isValidCoordinates([location.lng, location.lat])) {
    userData.location = { type: "Point", coordinates: [location.lng, location.lat] };
    userData.locationUpdatedAt = new Date();
  }

  const user = await User.create(userData);

  res.status(201).json({
    token: generateToken(user._id, "user"),
    user: sanitizeUser(user),
  });
});

// @route  POST /api/auth/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    token: generateToken(user._id, "user"),
    user: sanitizeUser(user),
  });
});

// @route  GET /api/auth/me
// @access Private (user)
const getMe = asyncHandler(async (req, res) => {
  res.json(sanitizeUser(req.user));
});

// @route  PUT /api/auth/profile
// @access Private (user)
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, isVolunteer, volunteerSkills, familyMembers } = req.body;

  const user = req.user;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (isVolunteer !== undefined) user.isVolunteer = !!isVolunteer;
  if (volunteerSkills !== undefined) user.volunteerSkills = volunteerSkills;
  if (familyMembers !== undefined) user.familyMembers = familyMembers;

  // If the user opted out of volunteering, also turn off availability
  if (isVolunteer === false) user.volunteerAvailable = false;

  await user.save();

  res.json(sanitizeUser(user));
});

// @route  PUT /api/auth/location
// @access Private (user)
// Used by the volunteer dashboard to keep location fresh, and can also
// be used to update location right before triggering an SOS.
const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  if (!isValidCoordinates([lng, lat])) {
    res.status(400);
    throw new Error("Valid lat/lng coordinates are required");
  }

  req.user.location = { type: "Point", coordinates: [lng, lat] };
  req.user.locationUpdatedAt = new Date();
  await req.user.save();

  res.json({ location: req.user.location, locationUpdatedAt: req.user.locationUpdatedAt });
});

module.exports = { registerUser, loginUser, getMe, updateProfile, updateLocation, sanitizeUser };
