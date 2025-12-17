const mongoose = require("mongoose");

const Feedback1Schema = new mongoose.Schema({
  feedback: {
    type: String,
    required: [true, "Feedback is required"],
    trim: true
  },
  development: {
    type: String,
    default: "",
    trim: true
  },
  strengths: {
    type: String,
    default: "",
    trim: true
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"],
    validate: {
      validator: Number.isInteger,
      message: "Rating must be an integer"
    }
  },
  editing: {
    type: Boolean,
    default: false
  },
  employee: String,        // Add this line
  employeeId: String      // Add this line
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Feedback1", Feedback1Schema);