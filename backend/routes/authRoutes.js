const express = require("express");//from module cache
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updateLocation,
} = require("../controllers/authController");


//only declaration working is done in the controllers part
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/location", protect, updateLocation);

module.exports = router;
