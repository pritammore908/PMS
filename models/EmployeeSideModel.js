const mongoose = require('mongoose');

// Employee Goal Schema
const goalSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Employee Query Schema
const querySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  queryText: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Employee Feedback Schema
const feedbackSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  feedbackText: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['360 Feedback', 'Manager Feedback', 'General'],
    default: '360 Feedback'
  },
  status: {
    type: String,
    default: 'Submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Create models - Check if they already exist to prevent OverwriteModelError
const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);
const Query = mongoose.models.Query || mongoose.model('Query', querySchema);
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

module.exports = {
  Goal,
  Query,
  Feedback
};