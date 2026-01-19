const Report = require('../models/Report');

// ==================== PUBLIC ENDPOINTS ====================

// Get all reports (with optional filters)
exports.getAllReports = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      urgency: req.query.urgency,
      animal_type: req.query.animal_type
    };

    const reports = await Report.getAll(filters);
    
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// Get single report by ID
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.getById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
};

// ==================== USER ENDPOINTS (Protected) ====================

// Submit new report (authenticated user or anonymous)
exports.submitReport = async (req, res) => {
  try {
    const {
      animal_type,
      urgency_level,
      animal_condition,
      description,
      location_latitude,
      location_longitude,
      location_address,
      photo_url,
      reporter_name,
      reporter_phone
    } = req.body;

    // Validation
    if (!animal_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Animal type and description are required'
      });
    }

    // Validate animal type
    const validTypes = ['dog', 'cat', 'other'];
    if (!validTypes.includes(animal_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid animal type'
      });
    }

    // Validate urgency level
    const validUrgency = ['low', 'medium', 'high', 'critical'];
    if (urgency_level && !validUrgency.includes(urgency_level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid urgency level'
      });
    }

    // Check if location is provided
    if (!location_latitude || !location_longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    // Create report data
    const reportData = {
      user_id: req.userId || null, // Will be null for anonymous reports
      animal_type,
      urgency_level: urgency_level || 'medium',
      animal_condition,
      description,
      location_latitude,
      location_longitude,
      location_address,
      photo_url,
      reporter_name: reporter_name || (req.user ? `${req.user.first_name} ${req.user.last_name}` : null),
      reporter_phone: reporter_phone || (req.user ? req.user.phone_number : null),
      status: 'pending'
    };

    const reportId = await Report.create(reportData);
    const newReport = await Report.getById(reportId);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      reportId,
      report: newReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: error.message
    });
  }
};

// Get user's own reports (authenticated)
exports.getUserReports = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const reports = await Report.getByUserId(req.userId);

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Error getting user reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// ==================== ADMIN ENDPOINTS (Protected) ====================

// Update report (admin only)
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, urgency_level, animal_condition, notes, assigned_to } = req.body;

    // Validate status
    const validStatuses = ['pending', 'assigned', 'in_progress', 'rescued', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Validate urgency level
    const validUrgency = ['low', 'medium', 'high', 'critical'];
    if (urgency_level && !validUrgency.includes(urgency_level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid urgency level'
      });
    }

    // Check if report exists
    const existingReport = await Report.getById(id);
    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update report
    const updated = await Report.update(id, {
      status: status || existingReport.status,
      urgency_level: urgency_level || existingReport.urgency_level,
      animal_condition,
      notes,
      assigned_to
    });

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update report'
      });
    }

    const updatedReport = await Report.getById(id);

    res.json({
      success: true,
      message: 'Report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
};

// Update report status (admin only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'assigned', 'in_progress', 'rescued', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updated = await Report.updateStatus(id, status);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const updatedReport = await Report.getById(id);

    res.json({
      success: true,
      message: 'Report status updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: error.message
    });
  }
};

// Assign report to admin
exports.assignReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.body;

    const updated = await Report.assignToAdmin(id, admin_id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const updatedReport = await Report.getById(id);

    res.json({
      success: true,
      message: 'Report assigned successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error assigning report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign report',
      error: error.message
    });
  }
};

// Delete report (admin only)
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Report.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};

// Get statistics (admin only)
exports.getStats = async (req, res) => {
  try {
    const stats = await Report.getStats();
    const distribution = await Report.getAnimalDistribution();

    res.json({
      success: true,
      stats,
      distribution
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get urgent reports (admin only)
exports.getUrgentReports = async (req, res) => {
  try {
    const reports = await Report.getUrgentReports();

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Error getting urgent reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch urgent reports',
      error: error.message
    });
  }
};

// Search reports
exports.searchReports = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const reports = await Report.search(q);

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Error searching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search reports',
      error: error.message
    });
  }
};