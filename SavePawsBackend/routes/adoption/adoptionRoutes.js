const express = require('express');

// Import the entire CommonJS object as a default 'pkg' to ensure compatibility
const { verifyToken, authenticateAdmin } = require('../../middleware/authMiddleware');

const {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateStatus
} = require('../../controllers/Adoption/adoptionController');

const router = express.Router();

// UC016: Submit adoption request (Authenticated users)
router.post('/', verifyToken, createRequest);

// Get authenticated user's requests
router.get('/my-requests', verifyToken, getMyRequests);

// UC017: Get all adoption requests (Admin only, with optional status filter)
router.get('/', verifyToken, authenticateAdmin, getAllRequests);

// Adoption Updates Controllers
const {
  createUpdate,
  getUpdates,
  getMyUpdates,
  reviewUpdate
} = require('../../controllers/Adoption/adoptionUpdateController');

// Upload Middleware
const upload = require('../../middleware/uploadGeneric');

// UC025: Submit adoption follow-up update (Authenticated users)
router.post('/updates', verifyToken, upload.single('photo'), createUpdate);

// Get authenticated user's updates
router.get('/updates/my', verifyToken, getMyUpdates);

// UC025 / UC026: Get adoption updates (Admin - optional filters)
router.get('/updates', verifyToken, authenticateAdmin, getUpdates);

// UC026: Review adoption update (Admin only)
router.patch('/updates/:id/review', verifyToken, authenticateAdmin, reviewUpdate);

// Get single adoption request by ID (Admin only)
// IMPORTANT: This must come AFTER /updates routes to avoid collision
router.get('/:id', verifyToken, authenticateAdmin, getRequestById);

// UC017: Update adoption request status (Admin only)
router.patch('/:id/status', verifyToken, authenticateAdmin, updateStatus);

module.exports = router;