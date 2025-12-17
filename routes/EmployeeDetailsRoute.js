const express = require("express");
const router = express.Router();
const {
  createEmployeeDetails,
  getAllEmployeeDetails,
  getEmployeeDetailsById,
  getEmployeeDetailsByEmployeeId,  // Add this
  getEmployeeDetailsByEmployeeName, // Add this
  updateEmployeeDetails,
  deleteEmployeeDetails,
  bulkImportEmployees
} = require("../controllers/EmployeeDetailsController");

// Routes
router.route("/")
  .post(createEmployeeDetails)          // Create new employee
  .get(getAllEmployeeDetails);          // Get all employees

router.route("/bulk-import")
  .post(bulkImportEmployees);           // Bulk import from Excel

router.route("/by-employee-id/:employeeId")  // Add this route
  .get(getEmployeeDetailsByEmployeeId);      // Get by employee ID

router.route("/by-employee-name/:employeeName")  // Add this route
  .get(getEmployeeDetailsByEmployeeName);        // Get by employee name

router.route("/:id")
  .get(getEmployeeDetailsById)          // Get single employee by MongoDB ID
  .put(updateEmployeeDetails)           // Update employee
  .delete(deleteEmployeeDetails);       // Delete employee

module.exports = router;