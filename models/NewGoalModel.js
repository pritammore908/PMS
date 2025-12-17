const mongoose = require("mongoose");

const NewGoalSchema = new mongoose.Schema({
  goal: {
    type: String,
    required: [true, "Goal is required"],
    trim: true
  },
  progress: {
    type: String,
    default: "",
    trim: true
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Completed"],
    default: "Pending"
  },
  employee: {
    type: String,
    required: [true, "Employee is required"],
    trim: true
  },
  employeeId: {
    type: String,
    default: "",
    trim: true
  },
  company: {
    type: String,
    default: "",
    trim: true
  },
  description: {
    type: String,
    default: "",
    trim: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("NewGoal", NewGoalSchema);