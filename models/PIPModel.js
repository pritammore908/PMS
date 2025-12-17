const mongoose = require("mongoose");

const PIPSchema = new mongoose.Schema({
  employee: {
    type: String,
    required: [true, "Employee name is required"],
    trim: true
  },
  employeeId: {
    type: String,
    default: "",
    trim: true
  },
  dateIssued: {
    type: String,
    required: [true, "Date issued is required"],
    trim: true
  },
  reason: {
    type: String,
    default: "",
    trim: true
  },
  targets: {
    type: String,
    default: "",
    trim: true
  },
  comments: {
    type: String,
    default: "",
    trim: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("PIP", PIPSchema);