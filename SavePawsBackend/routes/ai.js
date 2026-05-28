// File: routes/ai.js

const express = require('express');
const router = express.Router();
const AIController = require('../controllers/AIController');

// POST /chat
router.post('/chat', AIController.handleChat);

// GET /history/:userId
router.get('/history/:userId', AIController.getHistory);

// GET /history/all/:userId
router.get('/history/all/:userId', AIController.getFullHistory);

// DELETE /history/:userId
router.delete('/history/:userId', AIController.clearHistory);

module.exports = router;
