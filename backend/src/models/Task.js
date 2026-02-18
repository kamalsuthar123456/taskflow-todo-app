const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  completed: {
    type: Boolean,
    default: false
  },

  completedAt: {
    type: Date,
    default: null
  },

  completionHistory: [{
    completedAt: Date,
    action: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
