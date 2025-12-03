const express = require("express");
const router = express.Router();
const animalsController = require("../controllers/animalsController");

// GET /api/animals - Get all active animals
router.get("/", animalsController.getAllAnimals);

// GET /api/animals/:id - Get animal by ID
router.get("/:id", animalsController.getAnimalById);

module.exports = router;

