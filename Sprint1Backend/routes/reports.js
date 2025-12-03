const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

/**
 * @route   GET /api/reports
 * @desc    Get all reports
 * @access  Public
 */
router.get('/', reportController.getAllReports);

/**
 * @route   GET /api/reports/stats
 * @desc    Get statistics
 * @access  Public
 */
router.get('/stats', reportController.getStats);

/**
 * @route   GET /api/reports/search
 * @desc    Search reports
 * @access  Public
 */
router.get('/search', reportController.searchReports);

/**
 * @route   GET /api/reports/status/:status
 * @desc    Get reports by status
 * @access  Public
 */
router.get('/status/:status', reportController.getReportsByStatus);

/**
 * @route   GET /api/reports/:id
 * @desc    Get report by ID
 * @access  Public
 */
router.get('/:id', reportController.getReportById);

/**
 * @route   POST /api/reports
 * @desc    Create new report
 * @access  Public
 */
router.post('/', reportController.createReport);

/**
 * @route   PATCH /api/reports/:id/status
 * @desc    Update report status
 * @access  Public
 */
router.patch('/:id/status', reportController.updateReportStatus);

/**
 * @route   PUT /api/reports/:id
 * @desc    Update entire report
 * @access  Public
 */
router.put('/:id', reportController.updateReport);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete report
 * @access  Public
 */
router.delete('/:id', reportController.deleteReport);

module.exports = router;