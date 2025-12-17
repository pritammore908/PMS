const express = require("express");
const router = express.Router();
const {
  createEmployeePromotion,
  createBulkPromotions,
  getAllEmployeePromotions,
  getEmployeePromotionById,
  updateEmployeePromotion,
  deleteEmployeePromotion,
  importFromExcel
} = require("../controllers/EmployeePromotionController");

// Routes
router.route("/")
  .post(createEmployeePromotion)          // Create single promotion
  .get(getAllEmployeePromotions);         // Get all promotions

router.route("/bulk")
  .post(createBulkPromotions);            // Create multiple promotions

router.route("/import-excel")
  .post(importFromExcel);                 // Import from Excel format

router.route("/:id")
  .get(getEmployeePromotionById)          // Get single promotion
  .put(updateEmployeePromotion)           // Update promotion
  .delete(deleteEmployeePromotion);       // Delete promotion

module.exports = router;