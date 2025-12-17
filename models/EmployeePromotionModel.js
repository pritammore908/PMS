const mongoose = require("mongoose");

const EmployeePromotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Employee name is required"],
    trim: true
  },
  date: {
    type: String,
    required: [true, "Promotion date is required"],
    trim: true
  },
  currency: {
    type: String,
    default: "INR",
    trim: true
  },
  company: {
    type: String,
    default: "",
    trim: true
  },
  justification: {
    type: String,
    default: "",
    trim: true
  },
  property: {
    type: String,
    required: [true, "Property is required"],
    trim: true
  },
  current: {
    type: String,
    default: "",
    trim: true
  },
  newValue: {
    type: String,
    required: [true, "New value is required"],
    trim: true
  },
  employeeId: String  // Add this line
}, { 
  timestamps: true 
});

module.exports = mongoose.model("EmployeePromotion", EmployeePromotionSchema);