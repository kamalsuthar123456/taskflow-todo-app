const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

//Toggle task (track completion date)
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed;
    
    // ✅ Track completion timestamp
    if (task.completed) {
      task.completedAt = new Date();
      task.completionHistory.push({
        completedAt: new Date(),
        action: 'completed'
      });
    } else {
      task.completedAt = null;
      task.completionHistory.push({
        completedAt: new Date(),
        action: 'uncompleted'
      });
    }

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ NEW: Get streak data
router.get('/streak', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      userId: req.user.userId,
      completed: true,
      completedAt: { $ne: null }
    }).select('completedAt');

    // Calculate streak
    const completionDates = tasks
      .map(t => t.completedAt)
      .filter(d => d)
      .map(d => {
        const date = new Date(d);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      });

    // Get unique dates
    const uniqueDates = [...new Set(completionDates)].sort().reverse();

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      
      if (uniqueDates.includes(dateKey)) {
        streak++;
      } else {
        break;
      }
    }

    // Get completions by day
    const completionsByDay = {};
    uniqueDates.forEach(date => {
      completionsByDay[date] = true;
    });

    res.json({
      streak,
      completionsByDay,
      uniqueDates
    });
  } catch (error) {
    console.error('Streak error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
