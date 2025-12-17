const mongoose = require("mongoose");

const UserViewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "User ID is required"],
    trim: true
  },
  userName: {
    type: String,
    required: [true, "User Name is required"],
    trim: true
  },
  employeeId: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    default: "Data Analyst",
    trim: true
  },
  department: {
    type: String,
    default: "Tech",
    trim: true
  },
  performance: {
    type: String,
    default: "Excellent",
    trim: true
  },
  q2Score: {
    type: Number,
    default: 85
  },
  q1GoalsMet: {
    type: Number,
    default: 4
  },
  q2GoalsMet: {
    type: Number,
    default: 3
  },
  contacts: [{
    name: {
      type: String,
      trim: true,
      default: "" // Make optional initially
    },
    employeeId: {
      type: String,
      trim: true,
      default: "" // Make optional initially
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true
    },
    contact: {
      type: String,
      required: [true, "Emergency contact is required"],
      trim: true
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true
    }
  }],
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['PDF', 'DOC', 'OTHER'],
      default: 'PDF'
    },
    url: {
      type: String,
      trim: true
    }
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model("UserView", UserViewSchema);