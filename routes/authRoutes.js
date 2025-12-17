const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// @route   POST /api/auth/register
// @desc    Register a new company/admin
// @access  Public
router.post("/register", authController.register);

// @route   POST /api/auth/login
// @desc    Login user/company
// @access  Public
router.post("/login", authController.login);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset OTP
// @access  Public
router.post("/forgot-password", authController.forgotPassword);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for password reset
// @access  Public
router.post("/verify-otp", authController.verifyOTP);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post("/reset-password", authController.resetPassword);

// @route   POST /api/auth/validate-token
// @desc    Validate JWT token
// @access  Public
router.post("/validate-token", authController.validateToken);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Public (for testing)
router.get("/profile", authController.getProfile);

module.exports = router;