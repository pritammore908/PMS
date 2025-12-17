const mongoose = require("mongoose");

const CompetencySchema = new mongoose.Schema({
  name: String,
  rating: String,
  comments: String
});

const AnnualReportSchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: [true, "Employee name is required"],
    trim: true
  },
  jobTitle: {
    type: String,
    default: "",
    trim: true
  },
  department: {
    type: String,
    default: "",
    trim: true
  },
  reviewPeriod: {
    type: String,
    default: "Jan 1, 2024 - Dec 31, 2024",
    trim: true
  },
  managerName: {
    type: String,
    required: [true, "Manager name is required"],
    trim: true
  },
  dateOfReview: {
    type: String,
    default: "",
    trim: true
  },
  achievements: {
    type: String,
    default: "",
    trim: true
  },
  developmentGoals: {
    type: String,
    default: "",
    trim: true
  },
  performanceRating: {
    type: String,
    default: "",
    trim: true
  },
  managerComments: {
    type: String,
    default: "",
    trim: true
  },
  competencies: [CompetencySchema],
  employeeId: String  // Add this line
}, { 
  timestamps: true 
});

module.exports = mongoose.model("AnnualReport", AnnualReportSchema);