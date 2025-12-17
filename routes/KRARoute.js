const express = require("express");
const router = express.Router();
const {
  createKRA,
  getAllKRAs,
  getKRAById,
  updateKRA,
  deleteKRA,
  bulkImportKRAs,
  clearAllKRAs
} = require("../controllers/KRAController");

// Routes
router.route("/")
  .post(createKRA)          // Create new KRA
  .get(getAllKRAs);         // Get all KRAs

router.route("/bulk-import")
  .post(bulkImportKRAs);    // Bulk import from Excel

router.route("/clear-all")
  .delete(clearAllKRAs);    // Clear all KRAs

router.route("/:id")
  .get(getKRAById)          // Get single KRA
  .put(updateKRA)           // Update KRA
  .delete(deleteKRA);       // Delete KRA

module.exports = router;