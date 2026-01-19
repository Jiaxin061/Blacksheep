const express = require('express');

// Import the entire CommonJS object as a default 'pkg' to ensure compatibility
const { verifyToken, authenticateAdmin } = require('../middleware/authMiddleware');

const {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateStatus
} = require('../controllers/adoptionController');

const router = express.Router();

// UC016: Submit adoption request (Authenticated users)
router.post('/', verifyToken, createRequest);

// Get authenticated user's requests
router.get('/my-requests', verifyToken, getMyRequests);

// UC017: Get all adoption requests (Admin only, with optional status filter)
router.get('/', verifyToken, authenticateAdmin, getAllRequests);

// Get single adoption request by ID (Admin only)
router.get('/:id', verifyToken, authenticateAdmin, getRequestById);

// UC017: Update adoption request status (Admin only)
router.patch('/:id/status', verifyToken, authenticateAdmin, updateStatus);

module.exports = router;