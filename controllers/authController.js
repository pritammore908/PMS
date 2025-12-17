const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendOTPEmail, sendWelcomeEmail, isEmailConfigured } = require("../utils/emailService");

// Generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET || "kra_secret_key_2024",
    { expiresIn: "7d" }
  );
};

// Generate reset token
const generateResetToken = (userId) => {
  return jwt.sign(
    { userId, purpose: 'password_reset' },
    process.env.JWT_SECRET || "kra_secret_key_2024",
    { expiresIn: '10m' }
  );
};

// 1. REGISTER
exports.register = async (req, res) => {
  try {
    const { companyName, email, password } = req.body;

    // Validation
    if (!companyName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: companyName, email, password"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Create new user
    const user = new User({
      companyName: companyName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "admin"
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    // Send welcome email (don't wait for it)
    sendWelcomeEmail(user.email, user.companyName)
      .then(result => {
        if (result.success && !result.skipped) {
          console.log(`✅ Welcome email sent to ${user.email}`);
        } else if (result.skipped) {
          console.log(`ℹ️  Welcome email skipped for ${user.email} (email not configured)`);
        } else {
          console.log(`⚠️  Welcome email failed for ${user.email}:`, result.error);
        }
      })
      .catch(err => {
        console.log(`⚠️  Welcome email error for ${user.email}:`, err.message);
      });

    // Return success response
    res.status(201).json({
      success: true,
      message: "Registration successful" + (isEmailConfigured() ? "" : " (Email not configured, check console for OTP)"),
      token,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      note: isEmailConfigured() ? undefined : "Email service not configured. Check backend console for any OTP messages."
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration. Please try again later."
    });
  }
};

// 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    // Return success response
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login. Please try again later."
    });
  }
};

// 3. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // For security, return success even if user not found
    if (!user) {
      console.log(`ℹ️  Forgot password requested for non-existent email: ${email}`);
      return res.json({
        success: true,
        message: "If an account exists with this email, OTP has been sent",
        note: isEmailConfigured() ? undefined : "Email service not configured"
      });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save OTP to user
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otp, user.companyName);

    // Prepare response
    const response = {
      success: true,
      message: emailResult.mode === 'email' ? 
        "OTP has been sent to your email address" : 
        "OTP generated. Check console/backend logs.",
      email: user.email,
      mode: emailResult.mode
    };

    // If using console mode, include OTP in response for testing
    if (emailResult.mode === 'console' || emailResult.mode === 'console-fallback') {
      response.debugOTP = otp;
      response.note = "Email service not configured. Use this OTP for testing.";
      
      // Log to console for backend visibility
      console.log(`\n🔑 OTP for ${user.email}: ${otp}`);
      console.log(`⏰ Expires: ${new Date(otpExpiry).toLocaleTimeString()}`);
    }

    res.json(response);

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      note: "Check backend console for error details"
    });
  }
};

// 4. VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Find user with valid OTP
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Generate password reset token (short-lived)
    const resetToken = generateResetToken(user._id);

    res.json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
      userId: user._id,
      email: user.email
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

// 5. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, userId } = req.body;

    // Validation
    if (!resetToken || !newPassword || !userId) {
      return res.status(400).json({
        success: false,
        message: "Reset token, new password, and user ID are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || "kra_secret_key_2024");
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Check token purpose and user ID
    if (decoded.purpose !== 'password_reset' || decoded.userId !== userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token"
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update password (password will be hashed by pre-save middleware)
    user.password = newPassword;
    
    // Clear OTP fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    console.log(`✅ Password reset successful for ${user.email}`);

    res.json({
      success: true,
      message: "Password reset successful. You can now login with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
};

// 6. VALIDATE TOKEN
exports.validateToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.json({ 
        valid: false,
        message: "No token provided" 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "kra_secret_key_2024");
    } catch (jwtError) {
      return res.json({ 
        valid: false,
        message: "Invalid or expired token" 
      });
    }

    // Check if user exists
    const user = await User.findById(decoded.userId).select('-password -resetPasswordOTP -resetPasswordExpires');
    
    if (!user) {
      return res.json({ 
        valid: false,
        message: "User not found" 
      });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error("Token validation error:", error);
    res.json({ 
      valid: false,
      message: "Token validation failed" 
    });
  }
};

// 7. GET USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const user = await User.findById(userId).select('-password -resetPasswordOTP -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};