const mongoose = require("mongoose");

const EmployeeDetailsSchema = new mongoose.Schema({
  employee: {
    type: String,
    required: [true, "Employee name is required"],
    trim: true
  },
  reviewer: {
    type: String,
    required: [true, "Reviewer name is required"],
    trim: true
  },
  addedOnInput: {
    type: String,
    required: [true, "Added date is required"]
  },
  addedOn: {
    type: String,
    required: [true, "Formatted date is required"]
  },
  company: {
    type: String,
    default: "S",
    trim: true
  },
  rating: {
    type: String,
    enum: ["Outstanding", "Excellent", "Satisfactory", "Need Improvement", "Poor", ""],
    default: ""
  },
  employeeId: String  // Add this line
}, { 
  timestamps: true 
});

module.exports = mongoose.model("EmployeeDetails", EmployeeDetailsSchema);