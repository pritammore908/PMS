const SelfAppraisal = require("../models/SelfAppraisalModel");

// CREATE: Create new self appraisal
exports.createSelfAppraisal = async (req, res) => {
  try {
    const {
      userId,
      userName,
      employeeId,
      employee,
      appraisalPeriod,
      ratings = [],
      feedbackCards = [],
      status = "draft"
    } = req.body;

    // Validate required fields
    if (!userId || !userName || !employeeId || !appraisalPeriod) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId, userName, employeeId, appraisalPeriod"
      });
    }

    const selfAppraisal = new SelfAppraisal({
      userId,
      userName,
      employeeId,
      employee,
      appraisalPeriod,
      ratings,
      feedbackCards,
      status
    });

    await selfAppraisal.save();

    res.status(201).json({
      success: true,
      message: "Self appraisal created successfully",
      data: selfAppraisal
    });
  } catch (error) {
    console.error("Error creating self appraisal:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

// READ: Get all self appraisals
exports.getAllSelfAppraisals = async (req, res) => {
  try {
    const {
      status,
      employeeId,
      employee,
      page = 1,
      limit = 20
    } = req.query;

    let query = {};

    if (status) query.status = status;
    if (employeeId) query.employeeId = employeeId;
    if (employee) query.employee = { $regex: employee, $options: 'i' };

    const skip = (page - 1) * limit;

    const [appraisals, total] = await Promise.all([
      SelfAppraisal.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SelfAppraisal.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: appraisals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching self appraisals:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

// READ: Get single self appraisal by ID
exports.getSelfAppraisalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const selfAppraisal = await SelfAppraisal.findById(id);
    
    if (!selfAppraisal) {
      return res.status(404).json({
        success: false,
        error: "Self appraisal not found"
      });
    }

    res.json({
      success: true,
      data: selfAppraisal
    });
  } catch (error) {
    console.error("Error fetching self appraisal:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

// READ: Get self appraisals by employee ID
exports.getSelfAppraisalsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const appraisals = await SelfAppraisal.find({ employeeId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: appraisals
    });
  } catch (error) {
    console.error("Error fetching employee appraisals:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

// UPDATE: Update self appraisal
exports.updateSelfAppraisal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating these fields
    delete updateData._id;
    delete updateData.createdAt;
    
    const selfAppraisal = await SelfAppraisal.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!selfAppraisal) {
      return res.status(404).json({
        success: false,
        error: "Self appraisal not found"
      });
    }

    res.json({
      success: true,
      message: "Self appraisal updated successfully",
      data: selfAppraisal
    });
  } catch (error) {
    console.error("Error updating self appraisal:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

// DELETE: Delete self appraisal
exports.deleteSelfAppraisal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const selfAppraisal = await SelfAppraisal.findByIdAndDelete(id);
    
    if (!selfAppraisal) {
      return res.status(404).json({
        success: false,
        error: "Self appraisal not found"
      });
    }

    res.json({
      success: true,
      message: "Self appraisal deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting self appraisal:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

// CRUD for Ratings
exports.addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const ratingData = req.body;

    const selfAppraisal = await SelfAppraisal.findById(id);
    
    if (!selfAppraisal) {
      return res.status(404).json({
        success: false,
        error: "Self appraisal not found"
      });
    }

    selfAppraisal.ratings.push(ratingData);
    await selfAppraisal.save();

    const addedRating = selfAppraisal.ratings[selfAppraisal.ratings.length - 1];
    
    res.json({
      success: true,
      message: "Rating added successfully",
      data: addedRating
    });
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const { id, ratingId } = req.params;
    const ratingData = req.body;

    const selfAppraisal = await SelfAppraisal.findById(id);
    
    if (!selfAppraisal) {
      return res.status(404).json({
        success: false,
        error: "Self appraisal not found"
      });
    }

    const ratingIndex = selfAppraisal.ratings.findIndex(
      r => r._id.toString() === ratingId
    );
    
    if (ratingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Rating not found"
      });
    }

    // Update rating
    selfAppraisal.ratings[ratingIndex] = {
      ...selfAppraisal.ratings[ratingIndex].toObject(),
      ...ratingData,
      updatedAt: Date.now()
    };

    await selfAppraisal.save();

    res.json({
      success: true,
      message: "Rating updated successfully",
      data: selfAppraisal.ratings[ratingIndex]
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    const { id, ratingId } = req.params;

    const selfAppraisal = await SelfAppraisal.findById(id);
    
    if (!selfAppraisal) {
      return res.status(404).json({
        success: false,
        error: "Self appraisal not found"
      });
    }

    const ratingIndex = selfAppraisal.ratings.findIndex(
      r => r._id.toString() === ratingId
    );
    
    if (ratingIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Rating not found"
      });
    }

    // Remove rating
    selfAppraisal.ratings.splice(ratingIndex, 1);
    await selfAppraisal.save();

    res.json({
      success: true,
      message: "Rating deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

// CRUD for Feedback Cards
exports.addFeedbackCard = async (req, res) => {
  try {
    const { id } = req.params;
    const feedbackData = req.body;

    const selfAppraisal = await SelfAppraisal.findById(id);
    
    if (!selfAppraisal) {
      return res.status(404).json({
        success: false,
        error: "Self appraisal not found"
      });
    }

    selfAppraisal.feedbackCards.push(feedbackData);
    await selfAppraisal.save();

    const addedFeedback = selfAppraisal.feedbackCards[selfAppraisal.feedbackCards.length - 1];
    
    res.json({
      success: true,
      message: "Feedback card added successfully",
      data: addedFeedback
    });
  } catch (error) {
    console.error("Error adding feedback card:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

exports.updateFeedbackCard = async (req, res) => {
  try {
    const { id, feedbackId } = req.params;
    const feedbackData = req.body;

    const selfAppraisal = await SelfAppraisal.findById(id);
    
    if (!selfAppraisal) {
      return res.status(404).json({
        success: false,
        error: "Self appraisal not found"
      });
    }

    const feedbackIndex = selfAppraisal.feedbackCards.findIndex(
      f => f._id.toString() === feedbackId
    );
    
    if (feedbackIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Feedback card not found"
      });
    }

    // Update feedback card
    selfAppraisal.feedbackCards[feedbackIndex] = {
      ...selfAppraisal.feedbackCards[feedbackIndex].toObject(),
      ...feedbackData,
      updatedAt: Date.now()
    };

    await selfAppraisal.save();

    res.json({
      success: true,
      message: "Feedback card updated successfully",
      data: selfAppraisal.feedbackCards[feedbackIndex]
    });
  } catch (error) {
    console.error("Error updating feedback card:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

exports.deleteFeedbackCard = async (req, res) => {
  try {
    const { id, feedbackId } = req.params;

    const selfAppraisal = await SelfAppraisal.findById(id);
    
    if (!selfAppraisal) {
      return res.status(404).json({
        success: false,
        error: "Self appraisal not found"
      });
    }

    const feedbackIndex = selfAppraisal.feedbackCards.findIndex(
      f => f._id.toString() === feedbackId
    );
    
    if (feedbackIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Feedback card not found"
      });
    }

    // Remove feedback card
    selfAppraisal.feedbackCards.splice(feedbackIndex, 1);
    await selfAppraisal.save();

    res.json({
      success: true,
      message: "Feedback card deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting feedback card:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

// Submit appraisal
exports.submitAppraisal = async (req, res) => {
  try {
    const { id } = req.params;

    const selfAppraisal = await SelfAppraisal.findById(id);
    
    if (!selfAppraisal) {
      return res.status(404).json({
        success: false,
        error: "Self appraisal not found"
      });
    }

    if (selfAppraisal.status === "submitted") {
      return res.status(400).json({
        success: false,
        error: "Appraisal already submitted"
      });
    }

    // Validate ratings exist
    if (!selfAppraisal.ratings || selfAppraisal.ratings.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot submit without ratings"
      });
    }

    selfAppraisal.status = "submitted";
    selfAppraisal.submittedAt = Date.now();
    await selfAppraisal.save();

    res.json({
      success: true,
      message: "Self appraisal submitted successfully",
      data: selfAppraisal
    });
  } catch (error) {
    console.error("Error submitting appraisal:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const { employeeId, employee } = req.query;

    let query = {};
    if (employeeId) query.employeeId = employeeId;
    if (employee) query.employee = { $regex: employee, $options: 'i' };

    const [totalAppraisals, submittedCount, averageScore] = await Promise.all([
      SelfAppraisal.countDocuments(query),
      SelfAppraisal.countDocuments({ ...query, status: "submitted" }),
      SelfAppraisal.aggregate([
        { $match: query },
        { $group: { _id: null, avgScore: { $avg: "$overallScore" } } }
      ])
    ]);

    const stats = {
      totalAppraisals,
      submittedCount,
      draftCount: totalAppraisals - submittedCount,
      averageScore: averageScore[0]?.avgScore || 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error"
    });
  }
};