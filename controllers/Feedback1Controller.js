const Feedback1 = require("../models/Feedback1Model");

// Create new feedback
exports.createFeedback1 = async (req, res) => {
  try {
    const { feedback, development, strengths, rating, employee, employeeId } = req.body;
    
    // Validate required fields
    if (!feedback || !rating) {
      return res.status(400).json({ 
        success: false,
        error: "Feedback and Rating are required fields" 
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        error: "Rating must be between 1 and 5" 
      });
    }

    const feedbackData = {
      feedback,
      development: development || "",
      strengths: strengths || "",
      rating,
      editing: false,
      employee: employee || "",
      employeeId: employeeId || ""
    };

    const newFeedback = await Feedback1.create(feedbackData);
    
    res.status(201).json({
      success: true,
      message: "Feedback created successfully",
      data: newFeedback
    });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all feedback
exports.getAllFeedback1 = async (req, res) => {
  try {
    const { employeeId, employee } = req.query;
    
    let query = {};
    
    if (employeeId) query.employeeId = employeeId;
    if (employee) query.employee = { $regex: employee, $options: 'i' };
    
    const feedbacks = await Feedback1.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get single feedback by ID
exports.getFeedback1ById = async (req, res) => {
  try {
    const feedback = await Feedback1.findById(req.params.id);
    
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
    console.error("Fetch single error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get feedback by employee ID
exports.getFeedback1ByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const feedbacks = await Feedback1.find({ employeeId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error("Fetch by employeeId error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get feedback by employee name
exports.getFeedback1ByEmployee = async (req, res) => {
  try {
    const { employee } = req.params;
    
    const feedbacks = await Feedback1.find({ 
      employee: { $regex: employee, $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error("Fetch by employee name error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update feedback
exports.updateFeedback1 = async (req, res) => {
  try {
    const { feedback, development, strengths, rating, employee, employeeId } = req.body;
    
    // Check if feedback exists
    const existingFeedback = await Feedback1.findById(req.params.id);
    if (!existingFeedback) {
      return res.status(404).json({ 
        success: false,
        error: "Feedback not found" 
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        success: false,
        error: "Rating must be between 1 and 5" 
      });
    }

    const updateData = {
      feedback: feedback !== undefined ? feedback : existingFeedback.feedback,
      development: development !== undefined ? development : existingFeedback.development,
      strengths: strengths !== undefined ? strengths : existingFeedback.strengths,
      rating: rating !== undefined ? rating : existingFeedback.rating,
      employee: employee !== undefined ? employee : existingFeedback.employee,
      employeeId: employeeId !== undefined ? employeeId : existingFeedback.employeeId
    };

    const updatedFeedback = await Feedback1.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedFeedback
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete feedback
exports.deleteFeedback1 = async (req, res) => {
  try {
    const feedback = await Feedback1.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ 
        success: false,
        error: "Feedback not found" 
      });
    }

    await Feedback1.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully"
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Bulk import from Excel
exports.bulkImportFeedback1 = async (req, res) => {
  try {
    const feedbacksData = req.body;
    
    if (!Array.isArray(feedbacksData) || feedbacksData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid data format or empty array" 
      });
    }

    const importedFeedbacks = [];
    
    for (const fb of feedbacksData) {
      // Validate each feedback
      if (!fb.feedback || !fb.rating) {
        console.warn("Skipping feedback with missing required fields:", fb);
        continue;
      }

      const feedbackData = {
        feedback: fb.feedback.toString(),
        development: fb.development?.toString() || "",
        strengths: fb.strengths?.toString() || "",
        rating: parseInt(fb.rating) || 0,
        editing: false,
        employee: fb.employee?.toString() || "",
        employeeId: fb.employeeId?.toString() || ""
      };

      // Validate rating
      if (feedbackData.rating < 1 || feedbackData.rating > 5) {
        console.warn("Skipping feedback with invalid rating:", feedbackData.rating);
        continue;
      }

      const newFeedback = await Feedback1.create(feedbackData);
      importedFeedbacks.push(newFeedback);
    }

    res.status(201).json({
      success: true,
      message: `${importedFeedbacks.length} feedbacks imported successfully`,
      data: importedFeedbacks
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Toggle edit mode (for frontend editing state)
exports.toggleEditMode = async (req, res) => {
  try {
    const feedback = await Feedback1.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ 
        success: false,
        error: "Feedback not found" 
      });
    }

    const updatedFeedback = await Feedback1.findByIdAndUpdate(
      req.params.id,
      { editing: req.body.editing },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Edit mode updated",
      data: updatedFeedback
    });
  } catch (error) {
    console.error("Toggle edit error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};