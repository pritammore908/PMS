const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkImportEmployees
} = require("../controllers/EmployeeOnboardingController");

// Routes
router.route("/")
  .post(createEmployee)          // Create new employee
  .get(getAllEmployees);         // Get all employees

router.route("/bulk-import")
  .post(bulkImportEmployees);    // Bulk import from Excel

router.route("/:id")
  .get(getEmployeeById)          // Get single employee
  .put(updateEmployee)           // Update employee
  .delete(deleteEmployee);       // Delete employee

module.exports = router;