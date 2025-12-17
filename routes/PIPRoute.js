const express = require("express");
const router = express.Router();
const {
  createPIP,
  getAllPIPs,
  getPIPById,
  getPIPsByEmployeeId,   // Add this
  getPIPsByEmployee,     // Add this
  updatePIP,
  deletePIP,
  bulkImportPIPs
} = require("../controllers/PIPController");

// Routes
router.route("/")
  .post(createPIP)          // Create new PIP
  .get(getAllPIPs);         // Get all PIPs

router.route("/bulk-import")
  .post(bulkImportPIPs);    // Bulk import from Excel

// Add these new routes
router.route("/employee/:employeeId")  // Add this route
  .get(getPIPsByEmployeeId);           // Get PIPs by employee ID

router.route("/employee-name/:employee")  // Add this route
  .get(getPIPsByEmployee);               // Get PIPs by employee name

router.route("/:id")
  .get(getPIPById)          // Get single PIP
  .put(updatePIP)           // Update PIP
  .delete(deletePIP);       // Delete PIP

module.exports = router;