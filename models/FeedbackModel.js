const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  feedback: {
    type: String,
    required: [true, "Feedback is required"]
  },
  development: String,
  strengths: String,
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5
  },
  employee: {
    type: String,
    required: [true, "Employee name is required"]
  },
  employeeId: {
    type: String,
    required: [true, "Employee ID is required"]
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Feedback", FeedbackSchema);