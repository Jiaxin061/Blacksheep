const express = require('express');
const router = express.Router();
const taskVerificationController = require('../controllers/taskVerificationController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { query } = require('../config/database');

// Get all blacklisted users
router.get('/blacklisted', authenticateAdmin, async (req, res) => {
  try {
    const blacklistedUsers = await User.getBlacklisted();
    
    // Get task counts for each user
    const usersWithTaskCounts = await Promise.all(
      blacklistedUsers.map(async (user) => {
        const taskCount = await query(
          'SELECT COUNT(*) as count FROM rescue_tasks WHERE assigned_to_user_id = ?',
          [user.id]
        );
        return {
          ...user,
          active_task_count: taskCount[0].count || 0
        };
      })
    );

    res.json({
      success: true,
      users: usersWithTaskCounts,
      count: usersWithTaskCounts.length
    });
  } catch (error) {
    console.error('Get blacklisted users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blacklisted users',
      error: error.message
    });
  }
});

// UC02: Blacklist User (Admin)
router.post('/:id/blacklist', authenticateAdmin, taskVerificationController.blacklistUser);

// Toggle user status (block/unblock) - with rescue task detachment
router.post('/:id/toggle-status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current user status
    const user = await User.getById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Toggle status: if banned, unblock; if active, ban
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    await User.updateStatus(id, newStatus);

    let tasksDetached = 0;
    // If blacklisting (banning), detach all rescue tasks from this user
    if (newStatus === 'banned') {
      // Get all tasks assigned to this user
      const userTasks = await query(
        'SELECT id, report_id, status FROM rescue_tasks WHERE assigned_to_user_id = ?',
        [id]
      );

      if (userTasks.length > 0) {
        // Detach user from all tasks and set tasks to available
        await query(
          `UPDATE rescue_tasks 
           SET assigned_to_user_id = NULL, 
               assigned_at = NULL,
               status = CASE 
                 WHEN status IN ('assigned', 'in_progress') THEN 'available'
                 ELSE status
               END
           WHERE assigned_to_user_id = ?`,
          [id]
        );

        // Update report statuses for detached tasks
        for (const task of userTasks) {
          if (task.report_id) {
            await query(
              'UPDATE reports SET status = ? WHERE id = ? AND status IN (?, ?)',
              ['pending', task.report_id, 'active', 'approved']
            );
          }
        }

        tasksDetached = userTasks.length;
        console.log(`✅ Detached ${tasksDetached} rescue tasks from blacklisted user ${id}`);
      }
    }

    res.json({
      success: true,
      message: `User has been ${newStatus === 'banned' ? 'blocked' : 'unblocked'} successfully${tasksDetached > 0 ? `. ${tasksDetached} rescue task(s) have been detached and made available.` : ''}`,
      status: newStatus,
      tasks_detached: tasksDetached
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: error.message
    });
  }
});

module.exports = router;

