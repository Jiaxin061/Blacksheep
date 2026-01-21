const express = require('express');
const router = express.Router();
const animalsController = require('../controllers/animalsController');

// GET /api/donation-animals - Get all donation animals
router.get('/', animalsController.getAllAnimals);

// GET /api/donation-animals/:id - Get donation animal by ID
router.get('/:id', animalsController.getAnimalById);

module.exports = router;
