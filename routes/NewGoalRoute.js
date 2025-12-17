const express = require("express");
const router = express.Router();
const {
  createNewGoal,
  getAllNewGoals,
  getNewGoalById,
  getGoalsByEmployeeId,  // Add this
  getGoalsByEmployee,    // Add this
  getGoalsByStatus,      // Add this
  updateNewGoal,
  deleteNewGoal,
  bulkImportNewGoals
} = require("../controllers/NewGoalController");

// Routes
router.route("/")
  .post(createNewGoal)          // Create new goal
  .get(getAllNewGoals);         // Get all goals

router.route("/bulk-import")
  .post(bulkImportNewGoals);    // Bulk import from Excel

// Add these new routes
router.route("/employee/:employeeId")  // Add this route
  .get(getGoalsByEmployeeId);          // Get goals by employee ID

router.route("/employee-name/:employee")  // Add this route
  .get(getGoalsByEmployee);               // Get goals by employee name

router.route("/status/:status")  // Add this route
  .get(getGoalsByStatus);        // Get goals by status

router.route("/:id")
  .get(getNewGoalById)          // Get single goal
  .put(updateNewGoal)           // Update goal
  .delete(deleteNewGoal);       // Delete goal

module.exports = router;