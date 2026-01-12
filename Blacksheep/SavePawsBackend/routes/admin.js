const express = require("express");
const adminController = require("../controllers/adminController");
const upload = require("../middleware/upload");
const {
  validateCreateAnimal,
  validateUpdateAnimal,
} = require("../middleware/validation");

const router = express.Router();

// GET /api/admin/animals
router.get("/", adminController.getAllAnimals);

// POST /api/admin/animals - with file upload
router.post(
  "/",
  upload.single("photo"),
  validateCreateAnimal,
  adminController.createAnimal
);

// PUT /api/admin/animals/:id - with optional file upload
router.put(
  "/:id",
  upload.single("photo"),
  validateUpdateAnimal,
  adminController.updateAnimal
);

// DELETE /api/admin/animals/:id
router.delete("/:id", adminController.deleteAnimal);

// PATCH /api/admin/animals/:id/archive
router.patch("/:id/archive", adminController.archiveAnimal);

module.exports = router;


