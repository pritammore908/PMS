const express = require("express");
const router = express.Router();
const {
  createFeedback1,
  getAllFeedback1,
  getFeedback1ById,
  updateFeedback1,
  deleteFeedback1,
  bulkImportFeedback1,
  toggleEditMode
} = require("../controllers/Feedback1Controller");

// Routes
router.route("/")
  .post(createFeedback1)          // Create new feedback
  .get(getAllFeedback1);          // Get all feedback

router.route("/bulk-import")
  .post(bulkImportFeedback1);     // Bulk import from Excel

router.route("/:id")
  .get(getFeedback1ById)          // Get single feedback
  .put(updateFeedback1)           // Update feedback
  .delete(deleteFeedback1);       // Delete feedback

router.route("/:id/edit-mode")
  .put(toggleEditMode);           // Toggle edit mode

module.exports = router;