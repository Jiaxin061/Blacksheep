// File: controllers/AIController.js

const GeminiService = require('../services/GeminiService');

class AIController {

    // POST /api/ai/chat
    static async handleChat(req, res) {
        try {
            const { userID, user_query } = req.body;
            if (!userID || !user_query) {
                return res.status(400).json({ error: "UserID and user_query are required." });
            }

            const result = await GeminiService.askAI(userID, user_query);
            res.json(result);

        } catch (error) {
            console.error("AIController Chat Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/ai/history/:userId
    static async getHistory(req, res) {
        try {
            const { userId } = req.params;
            const history = await GeminiService.getFormattedHistory(userId);
            res.json(history);
        } catch (error) {
            console.error("AIController History Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // GET /api/ai/history/all/:userId
    static async getFullHistory(req, res) {
        try {
            const { userId } = req.params;
            const history = await GeminiService.getAllHistory(userId);
            res.json(history);
        } catch (error) {
            console.error("AIController Full History Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // DELETE /api/ai/history/:userId
    static async clearHistory(req, res) {
        try {
            const { userId } = req.params;
            await GeminiService.clearHistory(userId);
            res.json({ success: true, message: "History cleared." });
        } catch (error) {
            console.error("AIController Clear History Error:", error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AIController;
