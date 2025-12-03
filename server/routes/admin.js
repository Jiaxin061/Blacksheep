const express = require("express");
const adminController = require("../controllers/adminController");
const {
  validateCreateAnimal,
  validateUpdateAnimal,
} = require("../middleware/validation");

const router = express.Router();

// GET /api/admin/animals
router.get("/", adminController.getAllAnimals);

// POST /api/admin/animals
router.post("/", validateCreateAnimal, adminController.createAnimal);

// PUT /api/admin/animals/:id
router.put("/:id", validateUpdateAnimal, adminController.updateAnimal);

// DELETE /api/admin/animals/:id
router.delete("/:id", adminController.deleteAnimal);

// PATCH /api/admin/animals/:id/archive
router.patch("/:id/archive", adminController.archiveAnimal);

module.exports = router;


