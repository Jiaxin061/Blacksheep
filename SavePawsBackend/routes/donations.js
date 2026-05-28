const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donationController");
const { authenticateUser } = require("../middleware/authMiddleware");

/**
 * POST /api/donations
 * Process a donation payment
 * @access Private (User authenticated)
 */
router.post("/", authenticateUser, donationController.processDonation);

module.exports = router;

