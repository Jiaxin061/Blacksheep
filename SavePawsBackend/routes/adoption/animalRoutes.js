const express = require('express');
const {
  getAllAnimals,
  getAnimalById,
  searchAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal
} = require('../../controllers/Adoption/animalController.js');
const { verifyToken } = require('../../middleware/authMiddleware.js');

const router = express.Router();

// Middleware to check for Admin role
// Assuming verifyToken attaches `req.userType` or `req.userRole`
const isAdmin = (req, res, next) => {
  if (req.userType === 'admin' || req.userRole === 'admin' || req.userRole === 'super_admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admins only' });
  }
};

// UC05: Get all animal records (Public)
router.get('/', getAllAnimals);

// UC06: Search and filter animal records (Public)
router.get('/search/filter', searchAnimals);

// UC05: Get single animal record by ID (Public)
router.get('/:id', getAnimalById);

// UC07: Create new animal record (Admin only)
router.post('/', verifyToken, isAdmin, createAnimal);

// UC07: Update animal record (Admin only)
router.put('/:id', verifyToken, isAdmin, updateAnimal);

// UC07: Delete animal record (Admin only)
router.delete('/:id', verifyToken, isAdmin, deleteAnimal);

module.exports = router;
