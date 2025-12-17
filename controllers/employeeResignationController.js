const mongoose = require("mongoose");
const EmployeeResignation = require("../models/EmployeeResignation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token for employee
const generateEmployeeToken = (employeeId, email) => {
  return jwt.sign(
    { id: employeeId, email, type: "employee" },
    process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
    { expiresIn: process.env.JWT_EXPIRE || "30d" }
  );
};

// @desc    Create a new employee resignation WITH PASSWORD
// @route   POST /api/employee-resignation
// @access  Public
exports.createResignation = async (req, res) => {
  try {
    const {
      fullName,
      birthDate,
      email,
      phone,
      address,
      pincode,
      state,
      city,
      panNo,
      workEmail,
      hireDate,
      department,
      reportingManager,
      emergencyContact,
      currentAddress,
      password,
      addedOn,
      resignationDate,
      lastWorkingDay,
      resignationReason,
      status = "Pending",
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !workEmail || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: "Full Name, Email, Work Email, Phone, and Password are required fields",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if resignation already exists for this email
    const existingByEmail = await EmployeeResignation.findOne({ email });
    if (existingByEmail) {
      return res.status(400).json({
        success: false,
        error: "A resignation record already exists for this personal email",
      });
    }

    // Check if resignation already exists for this work email
    const existingByWorkEmail = await EmployeeResignation.findOne({ workEmail });
    if (existingByWorkEmail) {
      return res.status(400).json({
        success: false,
        error: "A resignation record already exists for this work email",
      });
    }

    // Create new resignation
    const resignation = new EmployeeResignation({
      fullName,
      birthDate: birthDate || null,
      email,
      phone: phone || "",
      workEmail,
      hireDate: hireDate || null,
      department: department || "",
      reportingManager: reportingManager || "",
      emergencyContact: emergencyContact || "",
      address: address || "",
      currentAddress: currentAddress || "",
      pincode: pincode || "",
      state: state || "",
      city: city || "",
      panNo: panNo ? panNo.toUpperCase() : "",
      password,
      addedOn: addedOn || Date.now(),
      resignationDate: resignationDate || Date.now(),
      lastWorkingDay: lastWorkingDay || null,
      resignationReason: resignationReason || "",
      status,
    });

    const savedResignation = await resignation.save();

    // Generate token for the new employee
    const token = generateEmployeeToken(savedResignation.employeeId, savedResignation.email);

    res.status(201).json({
      success: true,
      message: "Employee resignation submitted successfully",
      data: {
        employeeId: savedResignation.employeeId,
        fullName: savedResignation.fullName,
        email: savedResignation.email,
        workEmail: savedResignation.workEmail,
        status: savedResignation.status,
      },
      token,
      employeeId: savedResignation.employeeId,
    });
  } catch (error) {
    console.error("Error creating resignation:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = `Duplicate value for ${field}`;
      
      if (field === 'email') message = "Personal email already exists";
      else if (field === 'workEmail') message = "Work email already exists";
      else if (field === 'phone') message = "Phone number already exists";
      else if (field === 'panNo') message = "PAN number already exists";
      else if (field === 'emergencyContact') message = "Emergency contact number already exists";
      
      return res.status(400).json({
        success: false,
        error: message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Employee Login
// @route   POST /api/employee-resignation/login
// @access  Public
exports.employeeLogin = async (req, res) => {
  try {
    const { email, password, employeeId, workEmail } = req.body;

    if ((!email && !employeeId && !workEmail) || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email/work email/employee ID and password",
      });
    }

    let employee;
    if (email) {
      employee = await EmployeeResignation.findOne({ email }).select('+password +loginAttempts +lockUntil');
    } else if (workEmail) {
      employee = await EmployeeResignation.findOne({ workEmail }).select('+password +loginAttempts +lockUntil');
    } else if (employeeId) {
      employee = await EmployeeResignation.findOne({ employeeId }).select('+password +loginAttempts +lockUntil');
    }

    if (!employee) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if account is locked
    if (employee.lockUntil && employee.lockUntil > Date.now()) {
      return res.status(403).json({
        success: false,
        error: "Account is locked. Try again later.",
      });
    }

    // Check password
    const isPasswordMatch = await employee.comparePassword(password);
    if (!isPasswordMatch) {
      // Increment failed login attempts
      await employee.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Reset login attempts
    await employee.resetLoginAttempts();

    // Generate token
    const token = generateEmployeeToken(employee.employeeId, employee.email);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        workEmail: employee.workEmail,
        status: employee.status,
      },
      token,
    });
  } catch (error) {
    console.error("Error in employee login:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Get all employee resignations
// @route   GET /api/employee-resignation
// @access  Public
exports.getAllResignations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { employeeId: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { workEmail: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { reportingManager: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await EmployeeResignation.countDocuments(query);

    const resignations = await EmployeeResignation.find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-password -__v");

    res.status(200).json({
      success: true,
      data: resignations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching resignations:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Get single employee resignation by ID
// @route   GET /api/employee-resignation/:id
// @access  Public
exports.getResignationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let resignation;
    
    if (id.startsWith('EMP-RES-')) {
      resignation = await EmployeeResignation.findOne({ employeeId: id }).select("-password -__v");
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      resignation = await EmployeeResignation.findById(id).select("-password -__v");
    }
    
    if (!resignation) {
      return res.status(404).json({
        success: false,
        error: "Resignation record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: resignation,
    });
  } catch (error) {
    console.error("Error fetching resignation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Get employee resignation by employeeId
// @route   GET /api/employee-resignation/employee-id/:employeeId
// @access  Public
exports.getResignationByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: "Employee ID is required",
      });
    }

    const resignation = await EmployeeResignation.findOne({ 
      employeeId: employeeId 
    }).select("-password -__v");

    if (!resignation) {
      return res.status(404).json({
        success: false,
        error: `No resignation found with Employee ID: ${employeeId}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Resignation record found successfully",
      data: resignation,
    });
  } catch (error) {
    console.error("Error fetching resignation by employeeId:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Update employee resignation
// @route   PUT /api/employee-resignation/:id
// @access  Public
exports.updateResignation = async (req, res) => {
  try {
    const { id } = req.params;
    
    let resignation;
    
    if (id.startsWith('EMP-RES-')) {
      resignation = await EmployeeResignation.findOne({ employeeId: id });
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      resignation = await EmployeeResignation.findById(id);
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format",
      });
    }

    if (!resignation) {
      return res.status(404).json({
        success: false,
        error: "Resignation record not found",
      });
    }

    const {
      fullName,
      birthDate,
      email,
      workEmail,
      phone,
      emergencyContact,
      hireDate,
      department,
      reportingManager,
      addedOn,
      address,
      currentAddress,
      pincode,
      state,
      city,
      panNo,
      password,
      status,
      lastWorkingDay,
      resignationReason,
    } = req.body;

    const updateData = {};
    
    if (fullName !== undefined) updateData.fullName = fullName;
    if (birthDate !== undefined) updateData.birthDate = birthDate;
    
    if (email !== undefined && email !== resignation.email) {
      const existingResignation = await EmployeeResignation.findOne({ email });
      if (existingResignation && existingResignation._id.toString() !== resignation._id.toString()) {
        return res.status(400).json({
          success: false,
          error: "Personal email already exists for another resignation record",
        });
      }
      updateData.email = email;
    }
    
    if (workEmail !== undefined && workEmail !== resignation.workEmail) {
      const existingResignation = await EmployeeResignation.findOne({ workEmail });
      if (existingResignation && existingResignation._id.toString() !== resignation._id.toString()) {
        return res.status(400).json({
          success: false,
          error: "Work email already exists for another resignation record",
        });
      }
      updateData.workEmail = workEmail;
    }
    
    if (phone !== undefined && phone !== resignation.phone) {
      const existingResignation = await EmployeeResignation.findOne({ phone });
      if (existingResignation && existingResignation._id.toString() !== resignation._id.toString()) {
        return res.status(400).json({
          success: false,
          error: "Phone number already exists for another resignation record",
        });
      }
      updateData.phone = phone;
    }
    
    if (emergencyContact !== undefined && emergencyContact !== resignation.emergencyContact) {
      const existingResignation = await EmployeeResignation.findOne({ emergencyContact });
      if (existingResignation && existingResignation._id.toString() !== resignation._id.toString()) {
        return res.status(400).json({
          success: false,
          error: "Emergency contact number already exists for another resignation record",
        });
      }
      updateData.emergencyContact = emergencyContact;
    }
    
    if (hireDate !== undefined) updateData.hireDate = hireDate;
    if (department !== undefined) updateData.department = department;
    if (reportingManager !== undefined) updateData.reportingManager = reportingManager;
    if (addedOn !== undefined) updateData.addedOn = addedOn;
    if (address !== undefined) updateData.address = address;
    if (currentAddress !== undefined) updateData.currentAddress = currentAddress;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (state !== undefined) updateData.state = state;
    if (city !== undefined) updateData.city = city;
    
    if (panNo !== undefined && panNo.toUpperCase() !== resignation.panNo) {
      const existingResignation = await EmployeeResignation.findOne({ panNo: panNo.toUpperCase() });
      if (existingResignation && existingResignation._id.toString() !== resignation._id.toString()) {
        return res.status(400).json({
          success: false,
          error: "PAN number already exists for another resignation record",
        });
      }
      updateData.panNo = panNo.toUpperCase();
    }
    
    if (password !== undefined && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters",
        });
      }
      updateData.password = password;
    }
    
    if (status !== undefined) updateData.status = status;
    if (lastWorkingDay !== undefined) updateData.lastWorkingDay = lastWorkingDay;
    if (resignationReason !== undefined) updateData.resignationReason = resignationReason;

    Object.assign(resignation, updateData);
    const updatedResignation = await resignation.save();

    res.status(200).json({
      success: true,
      message: "Resignation updated successfully",
      data: {
        employeeId: updatedResignation.employeeId,
        fullName: updatedResignation.fullName,
        email: updatedResignation.email,
        workEmail: updatedResignation.workEmail,
        status: updatedResignation.status,
      },
    });
  } catch (error) {
    console.error("Error updating resignation:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = `Duplicate value for ${field}`;
      
      if (field === 'email') message = "Personal email already exists";
      else if (field === 'workEmail') message = "Work email already exists";
      else if (field === 'phone') message = "Phone number already exists";
      else if (field === 'panNo') message = "PAN number already exists";
      else if (field === 'emergencyContact') message = "Emergency contact number already exists";
      
      return res.status(400).json({
        success: false,
        error: message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Delete employee resignation
// @route   DELETE /api/employee-resignation/:id
// @access  Public
exports.deleteResignation = async (req, res) => {
  try {
    const { id } = req.params;
    
    let result;
    
    if (id.startsWith('EMP-RES-')) {
      result = await EmployeeResignation.findOneAndDelete({ employeeId: id });
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      result = await EmployeeResignation.findByIdAndDelete(id);
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format",
      });
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Resignation record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resignation deleted successfully",
      deletedEmployeeId: result.employeeId,
    });
  } catch (error) {
    console.error("Error deleting resignation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Bulk upload resignations from Excel
// @route   POST /api/employee-resignation/bulk-upload
// @access  Public
exports.bulkUploadResignations = async (req, res) => {
  try {
    const { resignations } = req.body;

    if (!Array.isArray(resignations) || resignations.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of resignation data",
      });
    }

    const validResignations = [];
    const errors = [];

    for (let i = 0; i < resignations.length; i++) {
      const resignation = resignations[i];
      
      if (!resignation.fullName || !resignation.email || !resignation.workEmail || !resignation.password) {
        errors.push(`Row ${i + 1}: Full Name, Email, Work Email and Password are required`);
        continue;
      }

      if (resignation.password.length < 6) {
        errors.push(`Row ${i + 1}: Password must be at least 6 characters`);
        continue;
      }

      const existingEmail = await EmployeeResignation.findOne({ email: resignation.email });
      if (existingEmail) {
        errors.push(`Row ${i + 1}: Personal email ${resignation.email} already exists`);
        continue;
      }

      const existingWorkEmail = await EmployeeResignation.findOne({ workEmail: resignation.workEmail });
      if (existingWorkEmail) {
        errors.push(`Row ${i + 1}: Work email ${resignation.workEmail} already exists`);
        continue;
      }

      validResignations.push({
        fullName: resignation.fullName,
        birthDate: resignation.birthDate || null,
        email: resignation.email,
        workEmail: resignation.workEmail,
        phone: resignation.phone || "",
        emergencyContact: resignation.emergencyContact || "",
        hireDate: resignation.hireDate || null,
        department: resignation.department || "",
        reportingManager: resignation.reportingManager || "",
        addedOn: resignation.addedOn || Date.now(),
        address: resignation.address || "",
        currentAddress: resignation.currentAddress || "",
        pincode: resignation.pincode || "",
        state: resignation.state || "",
        city: resignation.city || "",
        panNo: resignation.panNo || "",
        password: resignation.password,
        resignationDate: resignation.resignationDate || Date.now(),
        lastWorkingDay: resignation.lastWorkingDay || null,
        resignationReason: resignation.resignationReason || "",
        status: resignation.status || "Pending",
      });
    }

    if (validResignations.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid resignation records to upload",
        details: errors,
      });
    }

    const insertedResignations = await EmployeeResignation.insertMany(validResignations);
    const employeeIds = insertedResignations.map(res => res.employeeId);

    res.status(201).json({
      success: true,
      message: `${insertedResignations.length} resignation(s) uploaded successfully`,
      data: insertedResignations,
      employeeIds: employeeIds,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in bulk upload:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Get resignation statistics
// @route   GET /api/employee-resignation/stats
// @access  Public
exports.getResignationStats = async (req, res) => {
  try {
    const stats = await EmployeeResignation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = stats.reduce((sum, item) => sum + item.count, 0);

    const formattedStats = {
      total,
      byStatus: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Get all employee names for dropdown
// @route   GET /api/employee-resignation/names
// @access  Public
exports.getEmployeeNames = async (req, res) => {
  try {
    const names = await EmployeeResignation.distinct('fullName', { 
      fullName: { $ne: null, $ne: '' } 
    }).sort('fullName');

    res.status(200).json({
      success: true,
      data: names,
      count: names.length
    });
  } catch (error) {
    console.error("Error fetching employee names:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Search resignations by employeeId (partial match)
// @route   GET /api/employee-resignation/search/by-employee-id/:employeeId
// @access  Public
exports.searchByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: "Employee ID is required",
      });
    }

    const resignations = await EmployeeResignation.find({ 
      employeeId: { $regex: employeeId, $options: "i" } 
    }).select("-password -__v").limit(20);

    if (!resignations || resignations.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No resignation found with this employee ID pattern",
      });
    }

    res.status(200).json({
      success: true,
      count: resignations.length,
      data: resignations,
    });
  } catch (error) {
    console.error("Error searching by employee ID:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Get latest employee ID sequence
// @route   GET /api/employee-resignation/latest-id
// @access  Public
exports.getLatestEmployeeId = async (req, res) => {
  try {
    const latestResignation = await EmployeeResignation.findOne()
      .sort({ createdAt: -1 })
      .select('employeeId createdAt');

    res.status(200).json({
      success: true,
      data: {
        latestEmployeeId: latestResignation ? latestResignation.employeeId : null,
        createdAt: latestResignation ? latestResignation.createdAt : null,
        message: latestResignation ? "Latest employee ID retrieved" : "No resignations found"
      }
    });
  } catch (error) {
    console.error("Error fetching latest employee ID:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Get all employee IDs with basic info
// @route   GET /api/employee-resignation/all-ids
// @access  Public
exports.getAllEmployeeIds = async (req, res) => {
  try {
    const { status = "" } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const employeeIds = await EmployeeResignation.find(query)
      .select('employeeId fullName email workEmail status department createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employeeIds.length,
      data: employeeIds,
    });
  } catch (error) {
    console.error("Error fetching all employee IDs:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Get employee profile
// @route   GET /api/employee-resignation/profile/:employeeId
// @access  Public
exports.getEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await EmployeeResignation.findOne({ 
      employeeId 
    }).select('-password -__v');

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee profile:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Change employee password
// @route   PUT /api/employee-resignation/change-password/:employeeId
// @access  Public
exports.changeEmployeePassword = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters",
      });
    }

    const employee = await EmployeeResignation.findOne({ employeeId }).select('+password');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const isMatch = await employee.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    employee.password = newPassword;
    await employee.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Validate employee credentials
// @route   POST /api/employee-resignation/validate
// @access  Public
exports.validateEmployee = async (req, res) => {
  try {
    const { email, workEmail, password } = req.body;

    if ((!email && !workEmail) || !password) {
      return res.status(400).json({
        success: false,
        error: "Email/work email and password are required",
      });
    }

    let employee;
    if (email) {
      employee = await EmployeeResignation.findOne({ email }).select('+password');
    } else {
      employee = await EmployeeResignation.findOne({ workEmail }).select('+password');
    }
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const isPasswordMatch = await employee.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Credentials are valid",
      data: {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        workEmail: employee.workEmail,
      },
    });
  } catch (error) {
    console.error("Error validating employee:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

// @desc    Get resignation by email
// @route   GET /api/employee-resignation/email/:email
// @access  Public
exports.getResignationByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Try both personal and work email
    const resignation = await EmployeeResignation.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { workEmail: email.toLowerCase() }
      ]
    }).select('-password -__v');

    if (!resignation) {
      return res.status(404).json({
        success: false,
        error: `No resignation found with email: ${email}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Resignation record found",
      data: {
        employeeId: resignation.employeeId,
        fullName: resignation.fullName,
        email: resignation.email,
        workEmail: resignation.workEmail,
      },
    });
  } catch (error) {
    console.error("Error fetching resignation by email:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};