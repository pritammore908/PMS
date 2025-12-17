const express = require("express");
const router = express.Router();
const selfAppraisalController = require("../controllers/SelfAppraisalController");

// CRUD Operations for Self Appraisal
router.post("/", selfAppraisalController.createSelfAppraisal); // CREATE
router.get("/", selfAppraisalController.getAllSelfAppraisals); // READ all
router.get("/:id", selfAppraisalController.getSelfAppraisalById); // READ one
router.put("/:id", selfAppraisalController.updateSelfAppraisal); // UPDATE
router.delete("/:id", selfAppraisalController.deleteSelfAppraisal); // DELETE

// Get by employee
router.get("/employee/:employeeId", selfAppraisalController.getSelfAppraisalsByEmployee);

// Ratings CRUD
router.post("/:id/ratings", selfAppraisalController.addRating); // Add rating
router.put("/:id/ratings/:ratingId", selfAppraisalController.updateRating); // Update rating
router.delete("/:id/ratings/:ratingId", selfAppraisalController.deleteRating); // Delete rating

// Feedback Cards CRUD
router.post("/:id/feedback", selfAppraisalController.addFeedbackCard); // Add feedback
router.put("/:id/feedback/:feedbackId", selfAppraisalController.updateFeedbackCard); // Update feedback
router.delete("/:id/feedback/:feedbackId", selfAppraisalController.deleteFeedbackCard); // Delete feedback

// Submit appraisal
router.post("/:id/submit", selfAppraisalController.submitAppraisal);

// Statistics
router.get("/stats/statistics", selfAppraisalController.getStatistics);

module.exports = router;