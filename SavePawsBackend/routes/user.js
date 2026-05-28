const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const certificateService = require("../services/certificateService");
const { requireAuth } = require("../middleware/demoAuth");

// All routes in this file require authentication
router.use(requireAuth);

// GET /api/user/profile
router.get("/profile", userController.getUserProfile);

// GET /api/user/donations/impact
router.get("/donations/impact", userController.getDonationImpact);

// GET /api/user/donations/:transactionID/impact
router.get("/donations/:transactionID/impact", userController.getDonationImpactDetail);

// GET /api/user/donations/:transactionID/certificate
router.get("/donations/:transactionID/certificate", async (req, res, next) => {
  try {
    const userID = req.userID;
    const { transactionID } = req.params;

    const pdfBuffer = await certificateService.generateCertificate(userID, transactionID);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="donation-certificate-${transactionID}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Certificate generation error:", error);
    next({
      status: error.message.includes("not found") ? 404 : 500,
      message: error.message || "Failed to generate certificate",
    });
  }
});

module.exports = router;