const mongoose = require("mongoose");

const EmployeeOnboardingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full Name is required"],
    trim: true
  },
  employeeId: {
    type: String,
    default: "",
    trim: true
  },
  workEmail: {
    type: String,
    required: [true, "Work Email is required"],
    trim: true,
    lowercase: true
  },
  hireDate: {
    type: Date,
    default: ""
  },
  department: {
    type: String,
    default: "",
    trim: true
  },
  reportingManager: {
    type: String,
    default: "",
    trim: true
  },
  addedOn: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("EmployeeOnboarding", EmployeeOnboardingSchema);