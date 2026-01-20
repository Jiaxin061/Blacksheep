const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateAdmin, authenticateUser } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

// ==================== GET USER REPORTS ====================

/**
 * GET /api/reports?user_id=1
 * Get reports for specific user or ALL reports (Admin view)
 * 
 * FIX: Made authenticateAdmin OPTIONAL - only checks token if provided
 */
// ==================== GET USER REPORTS ====================

/**
 * GET /api/reports
 * Get reports for specific user or ALL reports (Admin view)
 */
router.get('/', reportController.getAllReports);

// ==================== GET CURRENT USER REPORTS (token optional) ====================
/**
 * GET /api/reports/my-reports
 * Returns reports belonging to a user. Accepts either:
 *  - Bearer token (preferred), or
 *  - query param ?user_id=#
 */
router.get('/my-reports', async (req, res) => {
  try {
    const userId = req.userId || req.query.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required when no token is provided'
      });
    }

    console.log('👤 GET /api/reports/my-reports - User:', userId);

    const sql = `
            SELECT 
                r.*,
                r.reporter_name,
                r.reporter_contact as reporter_phone
            FROM reports r
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;

    const results = await query(sql, [userId]);

    res.json({
      success: true,
      reports: results
    });
  } catch (error) {
    console.error('❌ GET my-reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
});

// ==================== GET SINGLE REPORT ====================

/**
 * GET /api/reports/:id
 * Get report by ID (Public - no auth required)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 GET /api/reports/:id - Report ID:', id);

    const sql = `
            SELECT 
                r.*,
                r.reporter_name,
                r.reporter_contact as reporter_phone
            FROM reports r
            WHERE r.id = ?
        `;

    const results = await query(sql, [id]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    console.log('✅ Found report:', results[0].id);

    res.json({
      success: true,
      report: results[0]
    });

  } catch (error) {
    console.error('❌ GET report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
});

// ==================== CREATE REPORT ====================

/**
 * POST /api/reports
 * Create new report (Public - anyone can submit)
 */
/**
 * POST /api/reports
 * Create new report (Public - anyone can submit)
 */
router.post('/', reportController.submitReport);

// ==================== UPDATE REPORT (ADMIN ONLY) ====================

/**
 * PUT /api/reports/:id
 * Update report (Requires Admin Authentication)
 */
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, urgency_level, location, location_address, rescue_area } = req.body;

    console.log('🔄 PUT /api/reports/:id - Updating report:', id);

    let sql = 'UPDATE reports SET ';
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (urgency_level) {
      updates.push('urgency_level = ?');
      params.push(urgency_level);
    }

    if (location !== undefined) {
      updates.push('location = ?');
      params.push(location);
    }

    if (location_address !== undefined) {
      updates.push('location_address = ?');
      params.push(location_address);
    }

    if (rescue_area !== undefined) {
      updates.push('rescue_area = ?');
      params.push(rescue_area);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    sql += updates.join(', ');
    sql += ' WHERE id = ?';
    params.push(id);

    const result = await query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    console.log('✅ Report updated:', id);

    res.json({
      success: true,
      message: 'Report updated successfully'
    });

  } catch (error) {
    console.error('❌ Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
});

// ==================== UPDATE STATUS (ADMIN ONLY) ====================

/**
 * PATCH /api/reports/:id/status
 * Update report status (Requires Admin Authentication)
 */
router.patch('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('🔄 PATCH /api/reports/:id/status - Updating status:', id, status);

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'active', 'approved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, active, approved, or closed'
      });
    }

    const sql = 'UPDATE reports SET status = ? WHERE id = ?';
    const result = await query(sql, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    console.log('✅ Status updated:', id, '→', status);

    res.json({
      success: true,
      message: 'Status updated successfully'
    });

  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

// ==================== DELETE REPORT (ADMIN ONLY) ====================

/**
 * DELETE /api/reports/:id
 * Delete report (Requires Admin Authentication)
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ DELETE /api/reports/:id - Deleting report:', id);

    const sql = 'DELETE FROM reports WHERE id = ?';
    const result = await query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    console.log('✅ Report deleted:', id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
});

// ==================== GET STATISTICS (ADMIN ONLY) ====================

/**
 * GET /api/reports/stats
 * Get report statistics (Requires Admin Authentication)
 */
router.get('/stats/summary', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 GET /api/reports/stats/summary');

    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        SUM(CASE WHEN urgency_level = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN urgency_level = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN urgency_level = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN urgency_level = 'low' THEN 1 ELSE 0 END) as low
      FROM reports
    `;

    const results = await query(sql);

    res.json({
      success: true,
      stats: results[0]
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;