const express = require("express");
const router = express.Router();
const employeeResignationController = require("../controllers/employeeResignationController");

// Debug middleware - logs all requests
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// @route   POST /api/employee-resignation
// @desc    Create a new employee resignation WITH PASSWORD
router.post("/", employeeResignationController.createResignation);

// @route   POST /api/employee-resignation/login
// @desc    Employee login with email/employeeId and password
router.post("/login", employeeResignationController.employeeLogin);

// @route   POST /api/employee-resignation/validate
// @desc    Validate employee credentials
router.post("/validate", employeeResignationController.validateEmployee);

// @route   GET /api/employee-resignation
// @desc    Get all employee resignations
router.get("/", employeeResignationController.getAllResignations);

// @route   POST /api/employee-resignation/bulk-upload
// @desc    Bulk upload resignations from Excel
router.post("/bulk-upload", employeeResignationController.bulkUploadResignations);

// @route   GET /api/employee-resignation/stats
// @desc    Get resignation statistics
router.get("/stats", employeeResignationController.getResignationStats);

// @route   GET /api/employee-resignation/names
// @desc    Get all employee names for dropdown
router.get("/names", employeeResignationController.getEmployeeNames);

// @route   GET /api/employee-resignation/latest-id
// @desc    Get latest employee ID
router.get("/latest-id", employeeResignationController.getLatestEmployeeId);

// @route   GET /api/employee-resignation/all-ids
// @desc    Get all employee IDs
router.get("/all-ids", employeeResignationController.getAllEmployeeIds);

// @route   GET /api/employee-resignation/employee-id/:employeeId
// @desc    Get resignation by employeeId (exact match)
router.get("/employee-id/:employeeId", employeeResignationController.getResignationByEmployeeId);

// @route   GET /api/employee-resignation/email/:email
// @desc    Get resignation by email (for password recovery)
router.get("/email/:email", employeeResignationController.getResignationByEmail);

// @route   GET /api/employee-resignation/search/by-employee-id/:employeeId
// @desc    Search resignations by employee ID (partial match)
router.get("/search/by-employee-id/:employeeId", employeeResignationController.searchByEmployeeId);

// @route   GET /api/employee-resignation/profile/:employeeId
// @desc    Get employee profile
router.get("/profile/:employeeId", employeeResignationController.getEmployeeProfile);

// @route   GET /api/employee-resignation/:id
// @desc    Get single resignation by ID (can use employeeId or MongoDB _id)
router.get("/:id", employeeResignationController.getResignationById);

// @route   PUT /api/employee-resignation/:id
// @desc    Update employee resignation (can use employeeId or MongoDB _id) WITH PASSWORD SUPPORT
router.put("/:id", employeeResignationController.updateResignation);

// @route   PUT /api/employee-resignation/change-password/:employeeId
// @desc    Change employee password
router.put("/change-password/:employeeId", employeeResignationController.changeEmployeePassword);

// @route   DELETE /api/employee-resignation/:id
// @desc    Delete employee resignation (can use employeeId or MongoDB _id)
router.delete("/:id", employeeResignationController.deleteResignation);

module.exports = router;