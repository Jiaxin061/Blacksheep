import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateStatus
} from '../controllers/adoptionController.js';

const router = express.Router();

// UC016: Submit adoption request (Authenticated users)
router.post('/', authenticateToken, createRequest);

// Get authenticated user's requests
router.get('/my-requests', authenticateToken, getMyRequests);

// UC017: Get all adoption requests (Admin only, with optional status filter)
router.get('/', authenticateToken, isAdmin, getAllRequests);

// Get single adoption request by ID (Admin only)
router.get('/:id', authenticateToken, isAdmin, getRequestById);

// UC017: Update adoption request status (Admin only)
router.patch('/:id/status', authenticateToken, isAdmin, updateStatus);

export default router;

