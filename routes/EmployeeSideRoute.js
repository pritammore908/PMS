const express = require('express');
const router = express.Router();
const {
  // Goals
  getEmployeeGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  toggleGoalCompletion,
  
  // Queries
  getEmployeeQueries,
  createQuery,
  
  // Feedback
  getEmployeeFeedback,
  submitFeedback,
  
  // Performance
  getEmployeePerformance,
  
  // Sync
  syncOfflineGoals,
  syncOfflineQueries,
  syncOfflineFeedback,
  
  // Dashboard
  getDashboardStats
} = require('../controllers/EmployeeSideController');

// ============ GOALS ROUTES ============
router.get('/employee/:employeeId/goals', getEmployeeGoals);
router.post('/employee/:employeeId/goals', createGoal);
router.put('/employee/goals/:goalId', updateGoal);
router.delete('/employee/goals/:goalId', deleteGoal);
router.patch('/employee/goals/:goalId/toggle', toggleGoalCompletion);

// ============ QUERIES ROUTES ============
router.get('/employee/:employeeId/queries', getEmployeeQueries);
router.post('/employee/:employeeId/queries', createQuery);

// ============ FEEDBACK ROUTES ============
router.get('/employee/:employeeId/feedback', getEmployeeFeedback);
router.post('/employee/:employeeId/feedback', submitFeedback);

// ============ PERFORMANCE ROUTES ============
router.get('/employee/:employeeId/performance', getEmployeePerformance);

// ============ SYNC ROUTES ============
router.post('/employee/:employeeId/goals/sync', syncOfflineGoals);
router.post('/employee/:employeeId/queries/sync', syncOfflineQueries);
router.post('/employee/:employeeId/feedback/sync', syncOfflineFeedback);

// ============ DASHBOARD ROUTES ============
router.get('/employee/:employeeId/dashboard/stats', getDashboardStats);
// Add to your imports at the top
const { getAllEmployeesData } = require('../controllers/EmployeeSideController');

// Add this route (at the beginning or wherever appropriate)
router.get('/employees/all', getAllEmployeesData);
module.exports = router;