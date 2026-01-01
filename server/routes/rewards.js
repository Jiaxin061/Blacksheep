const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/rewardController");
const { requireAuth } = require("../middleware/demoAuth");

// All routes require authentication
router.use(requireAuth);

router.get("/balance", rewardController.getRewardBalance);
router.get("/catalogue", rewardController.getCatalogue);
router.get("/history", rewardController.getHistory);
router.get("/:rewardID", rewardController.getRewardDetail);
router.post("/redeem", rewardController.redeemReward);

module.exports = router;
