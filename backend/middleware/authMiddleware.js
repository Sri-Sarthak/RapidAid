const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Hospital = require("../models/Hospital");

/**
 * Protects routes for regular users (and volunteers, who are just
 * users with isVolunteer = true).
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "user") {
      res.status(403);
      throw new Error("This route is for user accounts only");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error("User account not found");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

/**
 * Protects routes for hospital accounts.
 */
const protectHospital = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "hospital") {
      res.status(403);
      throw new Error("This route is for hospital accounts only");
    }

    const hospital = await Hospital.findById(decoded.id);
    if (!hospital) {
      res.status(401);
      throw new Error("Hospital account not found");
    }

    req.hospital = hospital;
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

module.exports = { protect, protectHospital };
