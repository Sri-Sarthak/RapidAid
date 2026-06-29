const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT for either a "user" or "hospital" account.
 * The `type` claim lets middleware distinguish which model to load.
 */
const generateToken = (id, type = "user") => {
  return jwt.sign({ id, type }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

module.exports = generateToken;
