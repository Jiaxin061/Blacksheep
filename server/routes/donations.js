const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donationController");
const { requireAuth } = require("../middleware/demoAuth");

// POST /api/donate - Process donation (now requires authentication)
router.post("/donate", requireAuth, donationController.processDonation);

module.exports = router;

