const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const {
  validateRegister,
  validateLogin,
} = require("../middleware/validateAuth");

// Public routes
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);

// Protected route
router.get("/profile", protect, getProfile);

module.exports = router;