const express = require("express");
const router = express.Router();
const {
  createAnnualReport,
  getAllAnnualReports,
  getAnnualReportById,
  updateAnnualReport,
  deleteAnnualReport,
  bulkImportAnnualReports
} = require("../controllers/AnnualReportController");

// Routes
router.route("/")
  .post(createAnnualReport)          // Create new report
  .get(getAllAnnualReports);         // Get all reports

router.route("/bulk-import")
  .post(bulkImportAnnualReports);    // Bulk import from Excel

router.route("/:id")
  .get(getAnnualReportById)          // Get single report
  .put(updateAnnualReport)           // Update report
  .delete(deleteAnnualReport);       // Delete report

module.exports = router;