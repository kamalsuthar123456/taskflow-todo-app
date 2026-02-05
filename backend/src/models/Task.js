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
  // ✅ NEW: Track WHEN task was completed
  completedAt: {
    type: Date,
    default: null
  },
  // ✅ NEW: Track completion history
  completionHistory: [{
    completedAt: Date,
    action: String // 'completed' or 'uncompleted'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
