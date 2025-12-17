const { Goal, Query, Feedback } = require('../models/EmployeeSideModel');
const mongoose = require('mongoose');

// Utility function for error handling
const handleError = (res, error, message = 'An error occurred') => {
  console.error(message, error);
  return res.status(500).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// ============ GOALS CONTROLLERS ============
const getEmployeeGoals = async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log('Fetching goals for employee:', employeeId);
    
    const goals = await Goal.find({ employeeId })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${goals.length} goals for employee ${employeeId}`);
    
    return res.status(200).json({
      success: true,
      count: goals.length,
      data: goals.map(goal => ({
        id: goal._id.toString(),
        text: goal.text,
        completed: goal.completed,
        createdAt: goal.createdAt,
        priority: goal.priority
      }))
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch goals');
  }
};

const createGoal = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { text } = req.body;
    
    console.log('Creating goal for employee:', employeeId, 'Text:', text);
    
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Goal text is required'
      });
    }
    
    const goal = new Goal({
      employeeId,
      text: text.trim()
    });
    
    await goal.save();
    
    console.log('Goal created successfully:', goal._id);
    
    return res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: {
        id: goal._id.toString(),
        text: goal.text,
        completed: goal.completed,
        createdAt: goal.createdAt,
        priority: goal.priority
      }
    });
  } catch (error) {
    handleError(res, error, 'Failed to create goal');
  }
};

const updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const updateData = req.body;
    
    console.log('Updating goal ID:', goalId);
    console.log('Update data:', updateData);
    
    // Validate goalId
    if (!goalId || goalId === 'undefined' || goalId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Valid goalId is required'
      });
    }
    
    // Validate if it's a valid MongoDB ObjectId
    let query;
    if (mongoose.Types.ObjectId.isValid(goalId)) {
      query = { _id: new mongoose.Types.ObjectId(goalId) };
    } else {
      // If not a valid ObjectId, treat it as a custom ID
      return res.status(400).json({
        success: false,
        message: 'Invalid goal ID format'
      });
    }
    
    // Find and update goal
    const goal = await Goal.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    console.log('Goal updated successfully:', goal._id);
    
    return res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: {
        id: goal._id.toString(),
        text: goal.text,
        completed: goal.completed,
        createdAt: goal.createdAt,
        priority: goal.priority
      }
    });
  } catch (error) {
    console.error('Update Goal Error:', error.message);
    return handleError(res, error, 'Failed to update goal');
  }
};

const deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    
    console.log('Deleting goal ID:', goalId);
    
    // Validate goalId
    if (!goalId || goalId === 'undefined' || goalId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Valid goalId is required'
      });
    }
    
    // Validate if it's a valid MongoDB ObjectId
    let query;
    if (mongoose.Types.ObjectId.isValid(goalId)) {
      query = { _id: new mongoose.Types.ObjectId(goalId) };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid goal ID format'
      });
    }
    
    const goal = await Goal.findOneAndDelete(query);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    console.log('Goal deleted successfully:', goalId);
    
    return res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete Goal Error:', error.message);
    return handleError(res, error, 'Failed to delete goal');
  }
};

const toggleGoalCompletion = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { completed } = req.body;
    
    console.log('Toggling goal completion for ID:', goalId, 'Completed:', completed);
    
    // Validate inputs
    if (!goalId || goalId === 'undefined' || goalId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Valid goalId is required'
      });
    }
    
    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Completed status must be a boolean'
      });
    }
    
    // Validate if it's a valid MongoDB ObjectId
    let query;
    if (mongoose.Types.ObjectId.isValid(goalId)) {
      query = { _id: new mongoose.Types.ObjectId(goalId) };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid goal ID format'
      });
    }
    
    const goal = await Goal.findOne(query);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }
    
    goal.completed = completed;
    await goal.save();
    
    console.log('Goal completion toggled successfully:', goal._id);
    
    return res.status(200).json({
      success: true,
      message: `Goal marked as ${completed ? 'completed' : 'incomplete'}`,
      data: {
        id: goal._id.toString(),
        text: goal.text,
        completed: goal.completed,
        createdAt: goal.createdAt,
        priority: goal.priority
      }
    });
  } catch (error) {
    console.error('Toggle Goal Error:', error.message);
    return handleError(res, error, 'Failed to update goal status');
  }
};

// ============ QUERIES CONTROLLERS ============
const getEmployeeQueries = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const queries = await Query.find({ employeeId })
      .sort({ submittedAt: -1 })
      .lean();
    
    return res.status(200).json({
      success: true,
      count: queries.length,
      data: queries.map(query => ({
        id: query._id.toString(),
        queryText: query.queryText,
        status: query.status,
        submittedAt: query.submittedAt
      }))
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch queries');
  }
};

const createQuery = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { queryText } = req.body;
    
    if (!queryText || !queryText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query text is required'
      });
    }
    
    const query = new Query({
      employeeId,
      queryText: queryText.trim()
    });
    
    await query.save();
    
    return res.status(201).json({
      success: true,
      message: 'Query submitted successfully',
      data: {
        id: query._id.toString(),
        queryText: query.queryText,
        status: query.status,
        submittedAt: query.submittedAt
      }
    });
  } catch (error) {
    handleError(res, error, 'Failed to submit query');
  }
};

// ============ FEEDBACK CONTROLLERS ============
const getEmployeeFeedback = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const feedback = await Feedback.find({ employeeId })
      .sort({ submittedAt: -1 })
      .lean();
    
    return res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback.map(fb => ({
        id: fb._id.toString(),
        feedbackText: fb.feedbackText,
        type: fb.type,
        status: fb.status,
        submittedAt: fb.submittedAt
      }))
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch feedback');
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { feedbackText } = req.body;
    
    if (!feedbackText || !feedbackText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback text is required'
      });
    }
    
    const feedback = new Feedback({
      employeeId,
      feedbackText: feedbackText.trim()
    });
    
    await feedback.save();
    
    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: feedback._id.toString(),
        feedbackText: feedback.feedbackText,
        type: feedback.type,
        status: feedback.status,
        submittedAt: feedback.submittedAt
      }
    });
  } catch (error) {
    handleError(res, error, 'Failed to submit feedback');
  }
};

// ============ PERFORMANCE DATA CONTROLLERS ============
const getEmployeePerformance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Return mock performance data
    const performanceData = {
      employeeId,
      overallRating: 'Meets Expectations',
      managerSummary: 'Employee has shown consistent performance throughout the year.',
      goalCompletionRate: 75,
      averageProjectScore: 4.2,
      improvementFocus: ['Technical Depth', 'Stakeholder Communication'],
      improvementTips: ['Schedule regular check-ins.', 'Document decisions clearly.'],
      lastReviewDate: new Date().toISOString().split('T')[0],
      strengths: ['Reliable', 'Team Player', 'Quick Learner'],
      developmentAreas: ['Public Speaking', 'Advanced Technical Skills']
    };
    
    return res.status(200).json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch performance data');
  }
};

// ============ SYNC OFFLINE DATA CONTROLLERS ============
const syncOfflineGoals = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { goals } = req.body;
    
    console.log('Syncing offline goals for employee:', employeeId);
    console.log('Goals to sync:', goals);
    
    if (!Array.isArray(goals)) {
      return res.status(400).json({
        success: false,
        message: 'Goals must be an array'
      });
    }
    
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };
    
    // Process each goal
    for (const offlineGoal of goals) {
      try {
        if (!offlineGoal.text || !offlineGoal.text.trim()) {
          results.failed++;
          results.errors.push({ goal: offlineGoal, error: 'Missing goal text' });
          continue;
        }
        
        // Check if goal already exists (by checking if offline ID matches any existing goal)
        // For simplicity, we'll always create new goals from offline data
        const newGoal = new Goal({
          employeeId,
          text: offlineGoal.text.trim(),
          completed: offlineGoal.completed || false,
          priority: offlineGoal.priority || 'Medium'
        });
        
        await newGoal.save();
        results.created++;
        
      } catch (error) {
        results.failed++;
        results.errors.push({ goal: offlineGoal, error: error.message });
      }
    }
    
    console.log('Sync results:', results);
    
    return res.status(200).json({
      success: true,
      message: `Sync completed: ${results.created} created, ${results.updated} updated, ${results.failed} failed`,
      results
    });
  } catch (error) {
    handleError(res, error, 'Failed to sync offline goals');
  }
};

const syncOfflineQueries = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { queries } = req.body;
    
    if (!Array.isArray(queries)) {
      return res.status(400).json({
        success: false,
        message: 'Queries must be an array'
      });
    }
    
    const results = {
      created: 0,
      failed: 0
    };
    
    // Process each query
    for (const offlineQuery of queries) {
      try {
        if (!offlineQuery.query || !offlineQuery.query.trim()) {
          results.failed++;
          continue;
        }
        
        const newQuery = new Query({
          employeeId,
          queryText: offlineQuery.query.trim(),
          submittedAt: offlineQuery.submittedAt || new Date()
        });
        
        await newQuery.save();
        results.created++;
      } catch (error) {
        results.failed++;
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Sync completed: ${results.created} queries submitted, ${results.failed} failed`,
      results
    });
  } catch (error) {
    handleError(res, error, 'Failed to sync offline queries');
  }
};

const syncOfflineFeedback = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { feedback } = req.body;
    
    if (!Array.isArray(feedback)) {
      return res.status(400).json({
        success: false,
        message: 'Feedback must be an array'
      });
    }
    
    const results = {
      created: 0,
      failed: 0
    };
    
    // Process each feedback
    for (const offlineFeedback of feedback) {
      try {
        if (!offlineFeedback.feedback || !offlineFeedback.feedback.trim()) {
          results.failed++;
          continue;
        }
        
        const newFeedback = new Feedback({
          employeeId,
          feedbackText: offlineFeedback.feedback.trim(),
          type: offlineFeedback.type || '360 Feedback',
          submittedAt: offlineFeedback.submittedAt || new Date()
        });
        
        await newFeedback.save();
        results.created++;
      } catch (error) {
        results.failed++;
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Sync completed: ${results.created} feedback submitted, ${results.failed} failed`,
      results
    });
  } catch (error) {
    handleError(res, error, 'Failed to sync offline feedback');
  }
};

// ============ DASHBOARD STATISTICS ============
const getDashboardStats = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const [totalGoals, completedGoals] = await Promise.all([
      Goal.countDocuments({ employeeId }),
      Goal.countDocuments({ employeeId, completed: true })
    ]);
    
    // Calculate goal completion percentage
    const goalCompletionRate = totalGoals > 0 
      ? Math.round((completedGoals / totalGoals) * 100)
      : 0;
    
    return res.status(200).json({
      success: true,
      data: {
        goalStats: {
          total: totalGoals,
          completed: completedGoals,
          pending: totalGoals - completedGoals,
          completionRate: goalCompletionRate
        },
        performance: {
          overallRating: 'Meets Expectations',
          averageProjectScore: 4.2,
          lastReviewDate: new Date().toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch dashboard statistics');
  }
};
// ============ GET ALL EMPLOYEES DATA ============
const getAllEmployeesData = async (req, res) => {
  try {
    // Get all distinct employee IDs from all collections
    const [goalEmployees, queryEmployees, feedbackEmployees] = await Promise.all([
      Goal.distinct('employeeId'),
      Query.distinct('employeeId'),
      Feedback.distinct('employeeId')
    ]);

    // Combine all unique employee IDs
    const allEmployeeIds = [...new Set([
      ...goalEmployees,
      ...queryEmployees,
      ...feedbackEmployees
    ])];

    // For demo/testing, if no data exists, create some mock employee IDs
    if (allEmployeeIds.length === 0) {
      allEmployeeIds.push('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005');
    }

    console.log('Found employees:', allEmployeeIds);

    // Fetch data for each employee
    const employeesData = await Promise.all(
      allEmployeeIds.map(async (employeeId) => {
        try {
          const [goals, queries, feedback, performance] = await Promise.all([
            Goal.find({ employeeId }).lean(),
            Query.find({ employeeId }).lean(),
            Feedback.find({ employeeId }).lean(),
            // For performance, we'll create mock data based on goals completion
            Promise.resolve({
              overallRating: 'Meets Expectations',
              goalCompletionRate: 0,
              averageProjectScore: 4.0,
              lastReviewDate: new Date().toISOString().split('T')[0]
            })
          ]);

          // Calculate goal completion rate
          const totalGoals = goals.length;
          const completedGoals = goals.filter(g => g.completed).length;
          const goalCompletionRate = totalGoals > 0 
            ? Math.round((completedGoals / totalGoals) * 100)
            : 0;

          return {
            employeeId,
            personalInfo: {
              name: `Employee ${employeeId.substr(3)}`, // Mock name
              department: getRandomDepartment(),
              position: getRandomPosition(),
              joinDate: getRandomDate(),
              email: `employee${employeeId.substr(3)}@company.com`,
              phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`
            },
            summary: {
              totalGoals,
              completedGoals,
              goalCompletionRate,
              totalQueries: queries.length,
              totalFeedback: feedback.length,
              pendingQueries: queries.filter(q => q.status === 'Pending').length,
              resolvedQueries: queries.filter(q => q.status === 'Resolved').length
            },
            recentGoals: goals.slice(0, 3).map(g => ({
              id: g._id,
              text: g.text,
              completed: g.completed,
              priority: g.priority,
              createdAt: g.createdAt
            })),
            recentQueries: queries.slice(0, 2).map(q => ({
              id: q._id,
              text: q.queryText,
              status: q.status,
              submittedAt: q.submittedAt
            })),
            recentFeedback: feedback.slice(0, 2).map(f => ({
              id: f._id,
              text: f.feedbackText,
              type: f.type,
              submittedAt: f.submittedAt
            })),
            performance: {
              ...performance,
              goalCompletionRate
            },
            lastActivity: getLatestActivity(goals, queries, feedback)
          };
        } catch (error) {
          console.error(`Error fetching data for employee ${employeeId}:`, error);
          return {
            employeeId,
            error: 'Failed to fetch data',
            personalInfo: {},
            summary: {},
            recentGoals: [],
            recentQueries: [],
            recentFeedback: []
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      count: employeesData.length,
      data: employeesData
    });
  } catch (error) {
    console.error('Get All Employees Error:', error);
    return handleError(res, error, 'Failed to fetch all employees data');
  }
};

// Helper functions for mock data
const getRandomDepartment = () => {
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
  return departments[Math.floor(Math.random() * departments.length)];
};

const getRandomPosition = () => {
  const positions = ['Software Engineer', 'Senior Developer', 'Team Lead', 'Manager', 'Analyst', 'Specialist'];
  return positions[Math.floor(Math.random() * positions.length)];
};

const getRandomDate = () => {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

const getLatestActivity = (goals, queries, feedback) => {
  const allActivities = [
    ...goals.map(g => ({ date: g.createdAt || g.updatedAt, type: 'goal' })),
    ...queries.map(q => ({ date: q.submittedAt, type: 'query' })),
    ...feedback.map(f => ({ date: f.submittedAt, type: 'feedback' }))
  ].filter(a => a.date);

  if (allActivities.length === 0) return null;
  
  const latest = allActivities.reduce((latest, current) => {
    return new Date(current.date) > new Date(latest.date) ? current : latest;
  });

  return latest.date;
};
module.exports = {
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
  getDashboardStats,
  getAllEmployeesData,
  getEmployeeGoals,

};