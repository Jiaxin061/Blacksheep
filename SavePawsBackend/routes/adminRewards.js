const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/rewardController");
const { requireAuth, requireAdmin } = require("../middleware/demoAuth");

// All routes here require Admin check
router.use(requireAuth);
router.use(requireAdmin);

const upload = require("../middleware/upload");

// GET /api/admin/rewards
router.get("/", rewardController.getAllRewards);

// POST /api/admin/rewards
router.post("/", upload.single("image"), rewardController.createReward);

// PUT /api/admin/rewards/:rewardID
router.put("/:rewardID", upload.single("image"), rewardController.updateReward);

// DELETE /api/admin/rewards/:rewardID
router.delete("/:rewardID", rewardController.deleteReward);

module.exports = router;
