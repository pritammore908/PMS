const mongoose = require("mongoose");

const KRASchema = new mongoose.Schema({
  template: {
    type: String,
    default: "",
    trim: true
  },
  manualRate: {
    type: Boolean,
    default: false
  },
  kra: {
    type: String,
    default: "",
    trim: true
  },
  weightage: {
    type: String,
    default: "",
    trim: true
  },
  goalCompletion: {
    type: String,
    default: "",
    trim: true
  },
  goalScore: {
    type: String,
    default: "",
    trim: true
  },
  editable: {
    type: Boolean,
    default: true
  },
  employee: String,
  employeeId: String
}, { 
  timestamps: true 
});

module.exports = mongoose.model("KRA", KRASchema);