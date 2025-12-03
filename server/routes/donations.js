const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donationController");

// POST /api/donate - Process donation
router.post("/donate", donationController.processDonation);

module.exports = router;

