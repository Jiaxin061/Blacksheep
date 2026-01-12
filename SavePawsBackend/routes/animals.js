const express = require("express");
const router = express.Router();
const animalsController = require("../controllers/animalsController");
const { query } = require("../config/database");

// GET /api/animals - Get all active animals (donation animals - animal_profile table)
router.get("/", animalsController.getAllAnimals);

// GET /api/animals/search/filter - Search and filter adoption animals (animals table)
router.get("/search/filter", async (req, res) => {
  try {
    const { keyword, species, status, gender, minAge, maxAge } = req.query;

    let querySql = 'SELECT id, name, species, breed, age, gender, status, description, image_url, weight, color, location, created_at, updated_at FROM animals WHERE 1=1';
    const params = [];

    // Search by keyword (name, breed, description)
    if (keyword) {
      querySql += ' AND (name LIKE ? OR breed LIKE ? OR description LIKE ?)';
      const searchTerm = `%${keyword}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Filter by species
    if (species) {
      querySql += ' AND species = ?';
      params.push(species);
    }

    // Filter by status
    if (status) {
      querySql += ' AND status = ?';
      params.push(status);
    }

    // Filter by gender
    if (gender) {
      querySql += ' AND gender = ?';
      params.push(gender);
    }

    // Filter by age range
    if (minAge) {
      querySql += ' AND age >= ?';
      params.push(minAge);
    }

    if (maxAge) {
      querySql += ' AND age <= ?';
      params.push(maxAge);
    }

    querySql += ' ORDER BY created_at DESC';

    const animals = await query(querySql, params);

    if (animals.length === 0) {
      return res.json({
        success: true,
        message: 'No matching animal records found',
        data: []
      });
    }

    res.json({
      success: true,
      data: animals,
      count: animals.length
    });
  } catch (error) {
    console.error('Error searching animals:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching animal records',
      error: error.message
    });
  }
});

// GET /api/animals/:id - Get animal by ID (donation animals - animal_profile table)
// NOTE: This route must come AFTER /search/filter to avoid route conflicts
router.get("/:id", animalsController.getAnimalById);

module.exports = router;

