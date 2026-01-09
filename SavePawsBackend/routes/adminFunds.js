const express = require("express");
const router = express.Router();
const multer = require("multer"); // 1. Import multer
const path = require("path");
const fundAllocationController = require("../controllers/fundAllocationController");
const animalProgressController = require("../controllers/animalProgressController");
const { requireAuth, requireAdmin } = require("../middleware/demoAuth");

// 2. Configure Multer Storage
// This saves files to 'uploads/allocations/' folder with a unique name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure this directory exists in your project, or change to a temp folder
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// All routes require admin authentication
router.use(requireAuth);
router.use(requireAdmin);

// Fund Allocation Routes
router.get(
  "/fund-allocation/animals",
  fundAllocationController.getAllocationAnimals,
);
router.get(
  "/fund-allocation/detail/:allocationID",
  fundAllocationController.getAllocationDetail,
);

router.get(
  "/fund-allocation/:animalID",
  fundAllocationController.getAnimalAllocationDetails,
);

// 3. Apply Multer Middleware to the POST route
// .fields() allows us to accept multiple distinct files
router.post(
  "/fund-allocation/:animalID",
  upload.fields([
    { name: "receipt_image", maxCount: 1 },
    { name: "treatment_photo", maxCount: 1 },
  ]),
  fundAllocationController.createAnimalAllocation,
);

// GET /api/admin/allocations
router.get("/allocations", fundAllocationController.getAllocations);

// POST /api/admin/allocations (Apply here too if this route also handles uploads)
router.post(
  "/allocations",
  upload.fields([
    { name: "receipt_image", maxCount: 1 },
    { name: "treatment_photo", maxCount: 1 },
  ]),
  fundAllocationController.createAllocation
);

// PUT /api/admin/allocations/:allocationID
router.put(
  "/allocations/:allocationID",
  upload.fields([
    { name: "receipt_image", maxCount: 1 },
    { name: "treatment_photo", maxCount: 1 },
  ]),
  fundAllocationController.updateAllocation
);

// DELETE /api/admin/allocations/:allocationID
router.delete("/allocations/:allocationID", fundAllocationController.deleteAllocation);

// Animal Progress Update Routes
router.get("/animals/:animalID/progress", animalProgressController.getProgressUpdates);

router.post("/animals/:animalID/progress", animalProgressController.createProgressUpdate);

// FIX: Add upload.fields middleware to handle images during update
router.put(
  "/allocations/:allocationID", 
  upload.fields([
    { name: "receipt_image", maxCount: 1 },
    { name: "treatment_photo", maxCount: 1 },
  ]),
  fundAllocationController.updateAllocation
);

module.exports = router;