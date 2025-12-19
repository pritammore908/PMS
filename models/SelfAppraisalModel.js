const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  criteria: {
    type: String,
    required: [true, "Criteria is required"],
    trim: true
  },
  weightage: {
    type: Number,
    required: [true, "Weightage is required"],
    min: [0, "Weightage cannot be negative"],
    max: [100, "Weightage cannot exceed 100%"]
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const feedbackSchema = new mongoose.Schema({
  feedback: {
    type: String,
    required: [true, "Feedback is required"],
    trim: true
  },
  development: {
    type: String,
    trim: true,
    default: ""
  },
  strengths: {
    type: String,
    trim: true,
    default: ""
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const selfAppraisalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "User ID is required"],
    index: true
  },
  userName: {
    type: String,
    required: [true, "User name is required"],
    trim: true
  },
  employeeId: {
    type: String,
    required: [true, "Employee ID is required"],
    index: true
  },
  employee: String,
  appraisalPeriod: {
    type: String,
    required: [true, "Appraisal period is required"],
    trim: true
  },
  ratings: [ratingSchema],
  feedbackCards: [feedbackSchema],
  status: {
    type: String,
    enum: ["draft", "submitted", "reviewed", "approved"],
    default: "draft"
  },
  overallScore: {
    type: Number,
    default: 0
  },
  reviewerComments: {
    type: String,
    default: ""
  },
  submittedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate overall score before saving
selfAppraisalSchema.pre("save", function(next) {
  if (this.ratings.length > 0) {
    let totalWeightedScore = 0;
    let totalWeightage = 0;
    
    this.ratings.forEach(rating => {
      const weight = rating.weightage / 100;
      totalWeightedScore += (rating.rating * weight);
      totalWeightage += rating.weightage;
    });
    
    // Calculate weighted average
    if (totalWeightage > 0) {
      this.overallScore = parseFloat((totalWeightedScore / (totalWeightage / 100)).toFixed(2));
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("SelfAppraisal", selfAppraisalSchema);