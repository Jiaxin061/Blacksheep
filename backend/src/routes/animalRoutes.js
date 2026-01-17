import express from 'express';
import {
  getAllAnimals,
  getAnimalById,
  searchAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal
} from '../controllers/animalController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// UC05: Get all animal records (Public)
router.get('/', getAllAnimals);

// UC06: Search and filter animal records (Public)
router.get('/search/filter', searchAnimals);

// UC05: Get single animal record by ID (Public)
router.get('/:id', getAnimalById);

// UC07: Create new animal record (Admin only)
router.post('/', authenticateToken, isAdmin, createAnimal);

// UC07: Update animal record (Admin only)
router.put('/:id', authenticateToken, isAdmin, updateAnimal);

// UC07: Delete animal record (Admin only)
router.delete('/:id', authenticateToken, isAdmin, deleteAnimal);

export default router;
