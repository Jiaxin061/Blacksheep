const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateUser, authenticateAdmin } = require('../middleware/authMiddleware');

// ==================== GET ALL AVAILABLE RESCUE TASKS ====================

/**
 * GET /api/rescue-tasks
 * Get all available rescue tasks (for users to browse)
 * Shows: general location area, urgency (from rescue_tasks)
 * Hides: exact coordinates, reporter contact
 */
router.get('/', async (req, res) => {
    try {
        const { urgency, status, all } = req.query;

        console.log('🚑 GET /api/rescue-tasks - Fetching tasks', { urgency, status, all });

        let sql = `
            SELECT 
                rt.id,
                rt.report_id,
                rt.urgency_level,
                rt.status,
                rt.created_at,
                rt.assigned_to_user_id,
                rt.assigned_at,
                rt.completed_at,
                rt.update_text,
                rt.update_image,
                r.animal_type,
                r.description,
                r.location as rescue_area,
                r.latitude,
                r.longitude,
                r.reporter_name,
                r.reporter_contact,
                r.photo_url
            FROM rescue_tasks rt
            INNER JOIN reports r ON rt.report_id = r.id
            WHERE 1=1
        `;

        const params = [];

        // If 'all' parameter is not set, only show available tasks (for users)
        // If 'all' is set, show all tasks (for admin)
        if (!all || all !== 'true') {
            sql += ' AND rt.status = ?';
            params.push('available');
        }

        if (urgency) {
            sql += ' AND rt.urgency_level = ?';
            params.push(urgency);
        }

        if (status) {
            sql += ' AND rt.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY rt.urgency_level DESC, rt.created_at DESC';

        const results = await query(sql, params);

        console.log(`✅ Found ${results.length} rescue tasks`);

        res.json({
            success: true,
            tasks: results
        });

    } catch (error) {
        console.error('❌ Get rescue tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rescue tasks',
            error: error.message
        });
    }
});

// ==================== GET MY ACCEPTED TASKS ====================

/**
 * GET /api/rescue-tasks/my-tasks
 * Get tasks accepted by current user
 * Returns FULL details including exact location from reports table
 */
router.get('/my-tasks', async (req, res) => {
    try {
        const userId = req.userId || req.query.user_id;

        console.log('🚑 GET /api/rescue-tasks/my-tasks - User:', userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required when no token is provided'
            });
        }

        const sql = `
            SELECT 
                rt.*,
                r.animal_type,
                r.description,
                r.latitude,
                r.longitude,
                r.location,
                r.reporter_name,
                r.reporter_contact,
                r.photo_url
            FROM rescue_tasks rt
            INNER JOIN reports r ON rt.report_id = r.id
            WHERE rt.assigned_to_user_id = ?
                AND NOT (rt.status = 'completed' AND rt.verification_status = 'Verified')
            ORDER BY rt.assigned_at DESC
        `;

        const results = await query(sql, [userId]);

        console.log(`✅ Found ${results.length} tasks for user ${userId}`);

        res.json({
            success: true,
            tasks: results
        });

    } catch (error) {
        console.error('❌ Get my tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your tasks',
            error: error.message
        });
    }
});

// ==================== GET TASK DETAILS ====================

/**
 * GET /api/rescue-tasks/:id
 * Get full details of a rescue task (after user accepts it)
 * Location comes from reports table
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId || req.query.user_id;

        console.log('🔍 GET /api/rescue-tasks/:id - Task:', id, 'User:', userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required when no token is provided'
            });
        }

        const sql = `
            SELECT 
                rt.*,
                r.animal_type,
                r.description,
                r.latitude,
                r.longitude,
                r.location,
                r.reporter_name,
                r.reporter_contact,
                r.photo_url
            FROM rescue_tasks rt
            INNER JOIN reports r ON rt.report_id = r.id
            WHERE rt.id = ? AND rt.assigned_to_user_id = ?
        `;

        const results = await query(sql, [id, userId]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or not assigned to you'
            });
        }

        res.json({
            success: true,
            task: results[0]
        });

    } catch (error) {
        console.error('❌ Get task details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task details',
            error: error.message
        });
    }
});

// ==================== CREATE RESCUE TASK (ADMIN / OPEN) ====================

/**
 * POST /api/rescue-tasks
 * Admin creates rescue task from a report
 * Admin ONLY selects urgency_level
 * Location comes from reports table automatically
 */
router.post('/', async (req, res) => {
    try {
        const { report_id, urgency_level, admin_id } = req.body;
        const adminId = req.userId || admin_id || null;

        console.log('📝 POST /api/rescue-tasks - Creating task for report:', report_id);
        console.log('📝 Admin selected urgency:', urgency_level);

        // Validate
        if (!report_id || !urgency_level) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: report_id, urgency_level'
            });
        }

        // Validate urgency level
        const validUrgency = ['low', 'medium', 'high', 'critical'];
        if (!validUrgency.includes(urgency_level)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid urgency level. Must be: low, medium, high, or critical'
            });
        }

        // Check if report exists and doesn't already have a rescue task
        const checkSql = `
            SELECT 
                r.id, 
                r.location,
                rt.id as task_id
            FROM reports r
            LEFT JOIN rescue_tasks rt ON r.id = rt.report_id
            WHERE r.id = ?
        `;

        const checkResult = await query(checkSql, [report_id]);

        if (checkResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        if (checkResult[0].task_id) {
            return res.status(400).json({
                success: false,
                message: 'Rescue task already exists for this report'
            });
        }

        const reportLocation = checkResult[0].location || 'Location not specified';
        console.log('📍 Location from report:', reportLocation);

        // Create rescue task - use report_id as id (since id is not auto_increment)
        // NOTE: Location NOT stored in rescue_tasks, fetched from reports via JOIN
        const sql = `
            INSERT INTO rescue_tasks 
            (id, report_id, urgency_level, status, created_by_admin_id)
            VALUES (?, ?, ?, 'available', ?)
        `;

        await query(sql, [report_id, report_id, urgency_level, adminId || 1]);

        // Update report status to 'approved' when rescue task is created
        await query('UPDATE reports SET status = ? WHERE id = ?', ['approved', report_id]);

        console.log('✅ Rescue task created with urgency:', urgency_level);
        console.log('✅ Location will be fetched from reports table via JOIN');

        res.status(201).json({
            success: true,
            message: 'Rescue task created successfully',
            taskId: report_id,
            urgency_level: urgency_level,
            location_from_report: reportLocation
        });

    } catch (error) {
        console.error('❌ Create rescue task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create rescue task',
            error: error.message
        });
    }
});

// ==================== ACCEPT RESCUE TASK (USER) ====================

/**
 * POST /api/rescue-tasks/:id/accept
 * User accepts a rescue task
 */
router.post('/:id/accept', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId || req.body.user_id;

        console.log('✋ POST /api/rescue-tasks/:id/accept - Task:', id, 'User:', userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required when no token is provided'
            });
        }

        // Check if user is banned
        const User = require('../models/User');
        const user = await User.getById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (user.status === 'banned') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been banned. You cannot accept rescue tasks.',
                is_banned: true
            });
        }

        // Check if task exists and is available
        const checkSql = 'SELECT * FROM rescue_tasks WHERE id = ? AND status = ?';
        const taskCheck = await query(checkSql, [id, 'available']);

        if (taskCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or already assigned'
            });
        }

        // Get report_id from task
        const taskInfo = await query('SELECT report_id FROM rescue_tasks WHERE id = ?', [id]);
        if (taskInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        const reportId = taskInfo[0].report_id;

        // Accept the task
        const sql = `
            UPDATE rescue_tasks 
            SET status = 'assigned', 
                assigned_to_user_id = ?, 
                assigned_at = NOW()
            WHERE id = ? AND status = 'available'
        `;

        const result = await query(sql, [userId, id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: 'Task was just assigned by someone else'
            });
        }

        // Update report status to 'active' when task is accepted (user assigned)
        await query('UPDATE reports SET status = ? WHERE id = ?', ['active', reportId]);

        console.log('✅ Task accepted by user:', userId);

        res.json({
            success: true,
            message: 'Task accepted successfully! You can now see full location details.'
        });

    } catch (error) {
        console.error('❌ Accept task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept task',
            error: error.message
        });
    }
});

// ==================== UPDATE TASK STATUS (USER) ====================

/**
 * PATCH /api/rescue-tasks/:id/status
 * User updates task status (in_progress -> completed)
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.userId || req.body.user_id || req.query.user_id || null;

        console.log('🔄 PATCH /api/rescue-tasks/:id/status - Task:', id, 'Status:', status);

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const validStatuses = ['available', 'assigned', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: available, assigned, in_progress or completed'
            });
        }

        let sql = `
            UPDATE rescue_tasks 
            SET status = ?,
                completed_at = ${status === 'completed' ? 'NOW()' : 'NULL'}
        `;
        const params = [status];

        if (status === 'assigned' && userId) {
            sql += ', assigned_to_user_id = ?, assigned_at = NOW()';
            params.push(userId);
        }

        if (status === 'available') {
            sql += ', assigned_to_user_id = NULL, assigned_at = NULL';
        }

        sql += ' WHERE id = ?';
        params.push(id);

        const result = await query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Get report_id from task
        const taskInfo = await query('SELECT report_id FROM rescue_tasks WHERE id = ?', [id]);
        if (taskInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        const reportId = taskInfo[0].report_id;

        // Update report status
        const reportStatusMap = {
            available: 'pending',
            assigned: 'approved',
            in_progress: 'active',
            completed: 'closed'
        };
        const reportStatus = reportStatusMap[status] || 'pending';
        await query('UPDATE reports SET status = ? WHERE id = ?', [reportStatus, reportId]);

        console.log('✅ Task status updated:', status);

        res.json({
            success: true,
            message: 'Task status updated successfully'
        });

    } catch (error) {
        console.error('❌ Update task status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task status',
            error: error.message
        });
    }
});

// ==================== ADMIN/OPEN UPDATE TASK ====================
/**
 * PATCH /api/rescue-tasks/:id
 * Update rescue task fields (urgency_level, status, assignment)
 */
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { urgency_level, status, assigned_user_id, update_text, update_image } = req.body;
        const userId = assigned_user_id || req.userId || null;

        console.log('🛠️ PATCH /api/rescue-tasks/:id - Task:', id, { urgency_level, status, userId, update_text, update_image });

        if (!urgency_level && !status && !userId && !update_text && !update_image) {
            return res.status(400).json({
                success: false,
                message: 'Provide at least one field: urgency_level, status, assigned_user_id, update_text, or update_image'
            });
        }

        const validUrgency = ['low', 'medium', 'high', 'critical'];
        if (urgency_level && !validUrgency.includes(urgency_level)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid urgency_level. Must be low, medium, high, or critical'
            });
        }

        const validStatuses = ['available', 'assigned', 'in_progress', 'completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: available, assigned, in_progress or completed'
            });
        }

        let sql = 'UPDATE rescue_tasks SET ';
        const updates = [];
        const params = [];

        if (urgency_level) {
            updates.push('urgency_level = ?');
            params.push(urgency_level);
        }

        if (status) {
            updates.push('status = ?');
            params.push(status);
            updates.push(`completed_at = ${status === 'completed' ? 'NOW()' : 'NULL'}`);
        }

        if (status === 'assigned' && userId) {
            updates.push('assigned_to_user_id = ?');
            updates.push('assigned_at = NOW()');
            params.push(userId);
        }

        if (status === 'available') {
            updates.push('assigned_to_user_id = NULL');
            updates.push('assigned_at = NULL');
        }

        if (status === 'in_progress') {
            updates.push('assigned_at = IFNULL(assigned_at, NOW())');
        }

        if (update_text !== undefined) {
            updates.push('update_text = ?');
            params.push(update_text);
        }

        if (update_image !== undefined) {
            updates.push('update_image = ?');
            params.push(update_image);
        }

        sql += updates.join(', ');
        sql += ' WHERE id = ?';
        params.push(id);

        const result = await query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (status) {
            // Get report_id from task
            const taskInfo = await query('SELECT report_id FROM rescue_tasks WHERE id = ?', [id]);
            if (taskInfo.length > 0) {
                const reportId = taskInfo[0].report_id;
                const reportStatusMap = {
                    available: 'pending',
                    assigned: 'approved',
                    in_progress: 'active',
                    completed: 'closed'
                };
                const reportStatus = reportStatusMap[status] || 'pending';
                await query('UPDATE reports SET status = ? WHERE id = ?', [reportStatus, reportId]);
            }
        }

        res.json({
            success: true,
            message: 'Rescue task updated'
        });
    } catch (error) {
        console.error('❌ Update rescue task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update rescue task',
            error: error.message
        });
    }
});

// ==================== DELETE RESCUE TASK (ADMIN) ====================

/**
 * DELETE /api/rescue-tasks/:id
 * Admin deletes rescue task
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('🗑️ DELETE /api/rescue-tasks/:id - Task:', id);

        const sql = 'DELETE FROM rescue_tasks WHERE id = ?';
        const result = await query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        console.log('✅ Rescue task deleted:', id);

        res.json({
            success: true,
            message: 'Rescue task deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete rescue task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete rescue task',
            error: error.message
        });
    }
});

// ==================== MODULE 3: TASK VERIFICATION ====================

const taskVerificationController = require('../controllers/taskVerificationController');

// UC01: View Rescue Evidence (Admin)
router.get('/:id/evidence', authenticateAdmin, taskVerificationController.getTaskEvidence);

// UC02: Verify Task & Blacklist User (Admin)
router.post('/:id/verify', authenticateAdmin, taskVerificationController.verifyTask);

// UC03: View Task Outcomes (User)
router.get('/my-tasks/outcomes', taskVerificationController.getMyTaskOutcomes);

module.exports = router;