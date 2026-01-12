const { query } = require('../config/database');
const User = require('../models/User');

// ==================== UC01: VIEW RESCUE EVIDENCE (ADMIN) ====================

/**
 * GET /api/rescue-tasks/:id/evidence
 * Admin views evidence (update_text and update_image) for a specific task
 */
exports.getTaskEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Admin fetching evidence for task ID:', id);

    const sql = `
      SELECT 
        rt.id,
        rt.report_id,
        rt.update_text as notes,
        rt.update_image as photo_path,
        rt.verification_status,
        rt.feedback_note,
        rt.status as task_status,
        rt.assigned_to_user_id,
        rt.completed_at,
        u.first_name,
        u.last_name,
        u.email,
        u.status as user_status,
        r.animal_type,
        r.description,
        r.location
      FROM rescue_tasks rt
      LEFT JOIN users u ON rt.assigned_to_user_id = u.id
      LEFT JOIN reports r ON rt.report_id = r.id
      WHERE rt.id = ?
    `;

    const results = await query(sql, [id]);
    console.log('📋 Query results:', results.length, 'tasks found');

    if (results.length === 0) {
      console.log('❌ Task not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = results[0];
    console.log('✅ Task found:', {
      id: task.id,
      status: task.task_status,
      has_notes: !!task.notes,
      has_photo: !!task.photo_path
    });

    res.json({
      success: true,
      evidence: {
        task_id: task.id,
        report_id: task.report_id,
        notes: task.notes,
        photo_path: task.photo_path,
        verification_status: task.verification_status || 'Pending',
        feedback_note: task.feedback_note,
        task_status: task.task_status,
        completed_at: task.completed_at,
        user: {
          id: task.assigned_to_user_id,
          name: `${task.first_name} ${task.last_name}`,
          email: task.email,
          status: task.user_status
        },
        report: {
          animal_type: task.animal_type,
          description: task.description,
          location: task.location
        }
      }
    });
  } catch (error) {
    console.error('Get task evidence error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task evidence',
      error: error.message
    });
  }
};

// ==================== UC02: REPORT & BLACKLIST USER (ADMIN) ====================

/**
 * POST /api/rescue-tasks/:id/verify
 * Admin verifies task and can blacklist user if evidence is fake
 */
exports.verifyTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_status, feedback_note, blacklist_user } = req.body;

    // Validation
    if (!verification_status) {
      return res.status(400).json({
        success: false,
        message: 'verification_status is required (Pending, Verified, or Flagged)'
      });
    }

    const validStatuses = ['Pending', 'Verified', 'Flagged'];
    if (!validStatuses.includes(verification_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification_status. Must be: Pending, Verified, or Flagged'
      });
    }

    // Get task details to find assigned user and report_id
    const taskSql = 'SELECT assigned_to_user_id, report_id, status FROM rescue_tasks WHERE id = ?';
    const taskResults = await query(taskSql, [id]);

    if (taskResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = taskResults[0];
    const assignedUserId = task.assigned_to_user_id;
    const reportId = task.report_id;

    // Update task verification status and feedback
    const updateSql = `
      UPDATE rescue_tasks 
      SET verification_status = ?, 
          feedback_note = ?
      WHERE id = ?
    `;
    await query(updateSql, [verification_status, feedback_note || null, id]);

    let message = 'Task verification updated successfully';
    let taskStatusUpdated = false;
    let tasksDetached = 0;

    // Handle verification status-specific logic
    if (verification_status === 'Pending') {
      // Change rescue task status to 'in_progress'
      await query(
        'UPDATE rescue_tasks SET status = ? WHERE id = ?',
        ['in_progress', id]
      );
      // Update report status to 'active' when task is in progress
      if (reportId) {
        await query('UPDATE reports SET status = ? WHERE id = ?', ['active', reportId]);
      }
      message = 'Verification status set to Pending. Rescue task status changed to "In Progress".';
      taskStatusUpdated = true;
      console.log(`✅ Task ${id} status changed to in_progress (verification: Pending)`);
    } else if (verification_status === 'Flagged') {
      // Withdraw user from rescue task and set task to 'available'
      await query(
        `UPDATE rescue_tasks 
         SET status = ?, 
             assigned_to_user_id = NULL, 
             assigned_at = NULL 
         WHERE id = ?`,
        ['available', id]
      );
      // Update report status to 'pending' when task is available again
      if (reportId) {
        await query('UPDATE reports SET status = ? WHERE id = ?', ['pending', reportId]);
      }
      message = 'Task flagged. User has been withdrawn from the rescue task and task is now "Available".';
      taskStatusUpdated = true;
      console.log(`✅ Task ${id} flagged - user withdrawn, task set to available`);
    }

    // If admin wants to blacklist user
    if (blacklist_user === true) {
      if (!assignedUserId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot blacklist user: No user is assigned to this task'
        });
      }
      // Check if user is already blacklisted
      const user = await User.getById(assignedUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.status === 'banned') {
        return res.status(400).json({
          success: false,
          message: 'User is already blacklisted'
        });
      }

      // Blacklist the user
      await User.updateStatus(assignedUserId, 'banned');
      console.log(`✅ User ${assignedUserId} has been banned`);

      // Detach all rescue tasks from this user
      const userTasks = await query(
        'SELECT id, report_id, status FROM rescue_tasks WHERE assigned_to_user_id = ?',
        [assignedUserId]
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
          [assignedUserId]
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
        console.log(`✅ Detached ${tasksDetached} rescue tasks from blacklisted user ${assignedUserId}`);
      }

      message += ` User has been banned successfully${tasksDetached > 0 ? `. ${tasksDetached} rescue task(s) have been detached and made available.` : ''}`;
    }

    res.json({
      success: true,
      message: message,
      blacklisted: blacklist_user === true && assignedUserId ? true : false,
      task_status_updated: taskStatusUpdated,
      tasks_detached: blacklist_user === true && assignedUserId ? tasksDetached : undefined
    });
  } catch (error) {
    console.error('Verify task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify task',
      error: error.message
    });
  }
};

/**
 * POST /api/users/:id/blacklist
 * Admin directly blacklists a user and detaches all rescue tasks
 */
exports.blacklistUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.getById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already banned
    if (user.status === 'banned') {
      return res.status(400).json({
        success: false,
        message: 'User is already blacklisted'
      });
    }

    await User.updateStatus(id, 'banned');

    // Detach all rescue tasks from this user
    const userTasks = await query(
      'SELECT id, report_id, status FROM rescue_tasks WHERE assigned_to_user_id = ?',
      [id]
    );

    let tasksDetached = 0;
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

    res.json({
      success: true,
      message: `User has been banned successfully${tasksDetached > 0 ? `. ${tasksDetached} rescue task(s) have been detached and made available.` : ''}`,
      tasks_detached: tasksDetached
    });
  } catch (error) {
    console.error('Blacklist user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to blacklist user',
      error: error.message
    });
  }
};

// ==================== UC03: VIEW TASK OUTCOME (USER) ====================

/**
 * GET /api/rescue-tasks/my-tasks/outcomes
 * User views their rescue history with admin feedback (both in_progress and completed tasks)
 */
exports.getMyTaskOutcomes = async (req, res) => {
  try {
    const userId = req.userId || req.query.user_id; // From authenticateUser middleware or query param

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required when no token is provided'
      });
    }

    const sql = `
      SELECT 
        rt.id,
        rt.report_id,
        rt.status as task_status,
        rt.verification_status,
        rt.feedback_note,
        rt.completed_at,
        rt.update_text,
        rt.update_image,
        rt.assigned_at,
        r.animal_type,
        r.description,
        r.location
      FROM rescue_tasks rt
      INNER JOIN reports r ON rt.report_id = r.id
      WHERE rt.assigned_to_user_id = ? 
        AND rt.status IN ('assigned', 'in_progress', 'completed')
      ORDER BY 
        CASE rt.status 
          WHEN 'assigned' THEN 1
          WHEN 'in_progress' THEN 2 
          WHEN 'completed' THEN 3 
        END,
        rt.completed_at DESC,
        rt.assigned_at DESC
    `;

    const results = await query(sql, [userId]);

    console.log(`📋 Found ${results.length} tasks for user ${userId}`);
    console.log('📋 Task statuses:', results.map(t => t.task_status));

    // Separate tasks into in_progress (includes assigned) and completed
    const inProgressTasks = results.filter(task => 
      task.task_status === 'assigned' || task.task_status === 'in_progress'
    );
    const completedTasks = results.filter(task => task.task_status === 'completed');

    const response = {
      success: true,
      count: results.length,
      in_progress: {
        count: inProgressTasks.length,
        tasks: inProgressTasks.map(task => ({
          task_id: task.id,
          report_id: task.report_id,
          animal_type: task.animal_type,
          description: task.description,
          location: task.location,
          task_status: task.task_status,
          verification_status: task.verification_status || 'Pending',
          feedback_note: task.feedback_note,
          assigned_at: task.assigned_at,
          evidence_submitted: !!(task.update_text || task.update_image)
        }))
      },
      completed: {
        count: completedTasks.length,
        tasks: completedTasks.map(task => ({
        task_id: task.id,
        report_id: task.report_id,
        animal_type: task.animal_type,
        description: task.description,
        location: task.location,
        task_status: task.task_status,
        verification_status: task.verification_status || 'Pending',
        feedback_note: task.feedback_note,
        completed_at: task.completed_at,
        evidence_submitted: !!(task.update_text || task.update_image)
      }))
      }
    };

    console.log('📋 Response structure:', {
      total: response.count,
      in_progress_count: response.in_progress.count,
      completed_count: response.completed.count
    });

    res.json(response);
  } catch (error) {
    console.error('Get task outcomes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task outcomes',
      error: error.message
    });
  }
};

