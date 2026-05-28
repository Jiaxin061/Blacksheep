// File: services/GeminiService.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { query } = require("../config/database");
const API_KEY = process.env.GEMINI_API_KEY;

// List of models to try in order of preference
const MODELS_TO_TRY = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest"
];

class GeminiService {

    static getClient() {
        if (!API_KEY) {
            console.error("❌ GEMINI_API_KEY is missing from .env");
            return null;
        }
        return new GoogleGenerativeAI(API_KEY);
    }

    /**
     * Diagnostic: Logs available models for this API key
     */
    static async logAvailableModels() {
        const genAI = this.getClient();
        if (!genAI) return;
        try {
            console.log("🔍 Checking available models for your API key...");
            // Note: listModels might not be available on all SDK versions or keys
            // but we can try to fetch a known model to verify connectivity
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            console.log("✅ SDK check: Successfully initialized gemini-1.5-flash model object.");
        } catch (error) {
            console.error("❌ SDK Error during diagnostic:", error.message);
        }
    }

    /**
     * Fetches history from database formatted for Gemini SDK
     */
    static async getGeminiHistory(userId) {
        try {
            const sql = `
                SELECT user_query, ai_response 
                FROM ai_chats 
                WHERE userID = ? AND is_active = TRUE 
                ORDER BY chat_timestamp DESC 
                LIMIT 10
            `;
            const results = await query(sql, [userId]);

            // Format for Gemini (reverse to get chronological order for chat)
            const history = [];
            results.reverse().forEach(row => {
                history.push({ role: "user", parts: [{ text: row.user_query }] });
                history.push({ role: "model", parts: [{ text: row.ai_response }] });
            });
            return history;
        } catch (error) {
            console.error("Error fetching Gemini history:", error);
            return [];
        }
    }

    static async askAI(userId, userQuery) {
        console.log(`🤖 GeminiService: Starting chat for user ${userId}`);

        const genAI = this.getClient();
        let demoMode = !genAI;

        if (!demoMode) {
            const contextHistory = await this.getGeminiHistory(userId);
            let lastError = null;

            // Try models one by one
            for (const modelName of MODELS_TO_TRY) {
                try {
                    console.log(`🤖 Attempting model: ${modelName}`);
                    const model = genAI.getGenerativeModel({ model: modelName });

                    const chat = model.startChat({
                        history: contextHistory,
                        generationConfig: {
                            maxOutputTokens: 1000,
                        },
                    });

                    const result = await chat.sendMessage(userQuery);
                    const responseText = result.response.text();

                    if (!responseText) {
                        throw new Error("Empty response from AI");
                    }

                    // Save to Database
                    await query(
                        "INSERT INTO ai_chats (userID, user_query, ai_response) VALUES (?, ?, ?)",
                        [userId, userQuery, responseText]
                    );

                    console.log(`✅ Success with ${modelName}`);

                    return {
                        response: responseText,
                        timestamp: new Date().toISOString()
                    };

                } catch (error) {
                    console.warn(`❌ Model ${modelName} failed: ${error.message}`);
                    lastError = error;
                    // If the error is an API key issue, stop trying other models
                    if (error.message.includes("API_KEY_INVALID") || error.message.includes("403")) {
                        break;
                    }
                }
            }
        }

        // If we reach here, we are in Demo Mode (either missing key or all models failed)
        console.warn("ℹ️ Falling back to Demo Mode response.");

        const demoResponse = "Woof! I'm Pawlo! 🐾 I'm currently in 'offline mode' (Demo) because I can't reach my cloud brain. But don't worry, your messages are still being saved to my memory, and I can still chat with you!";

        // DO NOT save to DB in Demo Mode, as requested by the user
        return {
            response: demoResponse,
            timestamp: new Date().toISOString(),
            isDemo: true
        };
    }

    /**
     * Formats the internal history for the frontend (Active only)
     */
    static async getFormattedHistory(userId) {
        console.log(`📋 GeminiService: Fetching ACTIVE history from DB for user ${userId}`);
        try {
            const sql = `
                SELECT user_query, ai_response, chat_timestamp 
                FROM ai_chats 
                WHERE userID = ? AND is_active = TRUE 
                ORDER BY chat_timestamp ASC
            `;
            const results = await query(sql, [userId]);
            console.log(`📋 Found ${results.length} active messages in database`);
            return results;
        } catch (error) {
            console.error("Error fetching formatted history:", error);
            return [];
        }
    }

    /**
     * Fetches ALL history for the history modal
     */
    static async getAllHistory(userId) {
        console.log(`📋 GeminiService: Fetching ALL history from DB for user ${userId}`);
        try {
            const sql = `
                SELECT user_query, ai_response, chat_timestamp, is_active 
                FROM ai_chats 
                WHERE userID = ? 
                ORDER BY chat_timestamp DESC
            `;
            const results = await query(sql, [userId]);
            console.log(`📋 Found ${results.length} total messages in database`);
            return results;
        } catch (error) {
            console.error("Error fetching all history:", error);
            return [];
        }
    }

    static async clearHistory(userId) {
        try {
            // Update to inactive instead of hard delete for better data tracking
            await query("UPDATE ai_chats SET is_active = FALSE WHERE userID = ?", [userId]);
            return { success: true };
        } catch (error) {
            console.error("Error clearing history:", error);
            throw error;
        }
    }
}

// Run diagnostic on load
GeminiService.logAvailableModels();

module.exports = GeminiService;
