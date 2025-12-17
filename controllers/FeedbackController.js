const Feedback = require("../models/FeedbackModel");

// Create new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { feedback, development, strengths, rating, employee, employeeId } = req.body;
    
    // Validation
    if (!feedback || !rating || !employee || !employeeId) {
      return res.status(400).json({ 
        error: "Missing required fields: feedback, rating, employee, and employeeId are required" 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: "Rating must be between 1 and 5" 
      });
    }
    
    const newFeedback = await Feedback.create({
      feedback,
      development: development || "",
      strengths: strengths || "",
      rating,
      employee,
      employeeId
    });
    
    res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      data: newFeedback
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all feedback
exports.getFeedback = async (req, res) => {
  try {
    const data = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: "Feedback not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update feedback
exports.updateFeedback = async (req, res) => {
  try {
    const { feedback, development, strengths, rating, employee, employeeId } = req.body;
    
    // Check if feedback exists
    const existingFeedback = await Feedback.findById(req.params.id);
    if (!existingFeedback) {
      return res.status(404).json({
        success: false,
        error: "Feedback not found"
      });
    }
    
    // Validation
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        error: "Rating must be between 1 and 5" 
      });
    }
    
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        feedback: feedback || existingFeedback.feedback,
        development: development !== undefined ? development : existingFeedback.development,
        strengths: strengths !== undefined ? strengths : existingFeedback.strengths,
        rating: rating || existingFeedback.rating,
        employee: employee || existingFeedback.employee,
        employeeId: employeeId || existingFeedback.employeeId
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedFeedback
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: "Feedback not found"
      });
    }
    
    await Feedback.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully"
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get feedback by employee ID
exports.getFeedbackByEmployeeId = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ employeeId: req.params.employeeId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get feedback by employee name
exports.getFeedbackByEmployee = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ 
      employee: { $regex: req.params.name, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};