const Report = require('../models/Report');

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.getAll();
    res.json(reports);
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ 
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
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({ 
      message: 'Failed to fetch report', 
      error: error.message 
    });
  }
};

// Get reports by status
exports.getReportsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const reports = await Report.getByStatus(status);
    res.json(reports);
  } catch (error) {
    console.error('Error getting reports by status:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reports', 
      error: error.message 
    });
  }
};

// Create new report
exports.createReport = async (req, res) => {
  try {
    const reportData = req.body;
    
    // Validate required fields
    const requiredFields = ['animal_type', 'description', 'location', 'reporter_name', 'reporter_contact'];
    for (const field of requiredFields) {
      if (!reportData[field]) {
        return res.status(400).json({ 
          message: `Missing required field: ${field}` 
        });
      }
    }
    
    // Validate animal type
    const validTypes = ['dog', 'cat', 'bird', 'rabbit', 'other'];
    if (!validTypes.includes(reportData.animal_type)) {
      return res.status(400).json({ message: 'Invalid animal type' });
    }
    
    const reportId = await Report.create(reportData);
    const newReport = await Report.getById(reportId);
    
    res.status(201).json({
      message: 'Report created successfully',
      report: newReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ 
      message: 'Failed to create report', 
      error: error.message 
    });
  }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updated = await Report.updateStatus(id, status);
    
    if (!updated) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const updatedReport = await Report.getById(id);
    res.json({
      message: 'Report status updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ 
      message: 'Failed to update report status', 
      error: error.message 
    });
  }
};

// Update entire report
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const reportData = req.body;
    
    const updated = await Report.update(id, reportData);
    
    if (!updated) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const updatedReport = await Report.getById(id);
    res.json({
      message: 'Report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ 
      message: 'Failed to update report', 
      error: error.message 
    });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Report.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ 
      message: 'Failed to delete report', 
      error: error.message 
    });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await Report.getStats();
    const distribution = await Report.getAnimalDistribution();
    
    res.json({
      statusStats: stats,
      animalDistribution: distribution
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch statistics', 
      error: error.message 
    });
  }
};

// Search reports
exports.searchReports = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const reports = await Report.search(q);
    res.json(reports);
  } catch (error) {
    console.error('Error searching reports:', error);
    res.status(500).json({ 
      message: 'Failed to search reports', 
      error: error.message 
    });
  }
};