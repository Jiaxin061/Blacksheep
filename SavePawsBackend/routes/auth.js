const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser, authenticateAdmin } = require('../middleware/authMiddleware');
const { query } = require('../config/database');

// ==================== USER ROUTES ====================

/**
 * @route   POST /api/auth/user/signup
 * @desc    Register new user
 * @access  Public
 */
router.post('/user/signup', authController.userSignup);

/**
 * @route   POST /api/auth/user/login
 * @desc    User login
 * @access  Public
 */
router.post('/user/login', authController.userLogin);

/**
 * @route   POST /api/auth/user/forgot-password
 * @desc    Request password reset (verify user)
 * @access  Public
 */
router.post('/user/forgot-password', authController.forgotPasswordRequest);

/**
 * @route   POST /api/auth/user/reset-password
 * @desc    Reset user password
 * @access  Public
 */
router.post('/user/reset-password', authController.resetPassword);

/**
 * @route   GET /api/auth/user/me
 * @desc    Get current user
 * @access  Private (User)
 */
router.get('/user/me', authenticateUser, authController.getCurrentUser);

// ==================== ADMIN ROUTES ====================

/**
 * @route   POST /api/auth/admin/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/admin/login', authController.adminLogin);

/**
 * @route   POST /api/auth/admin/register
 * @desc    Register new admin (should be protected in production)
 * @access  Public (should be Protected - Super Admin only)
 */
router.post('/admin/register', authController.adminRegister);

/**
 * @route   GET /api/auth/admin/me
 * @desc    Get current admin
 * @access  Private (Admin)
 */
router.get('/admin/me', authenticateAdmin, authController.getCurrentUser); // FIXED: Changed to getCurrentUser

// ==================== GENERAL ROUTES ====================

/**
 * @route   POST /api/auth/verify
 * @desc    Verify JWT token
 * @access  Public
 */
router.post('/verify', authController.verifyToken);

module.exports = router;