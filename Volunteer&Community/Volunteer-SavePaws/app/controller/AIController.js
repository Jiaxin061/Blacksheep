// File: app/controller/AIController.js

import { AIService } from '../services/AIService';

export class AIController {
    // UC28: Ask AI
    static async askAI(userId, userQuery) {
        if (!userQuery.trim()) return null;
        try {
            const data = await AIService.askAI(userId, userQuery);
            return data.response;
        } catch (error) {
            console.error('AIController Error (askAI):', error);
            return `Error: ${error.message || "Failed to connect to AI"}`;
        }
    }

    // UC28: Get AI Chat History
    static async getAIHistory(userId) {
        try {
            return await AIService.getAIHistory(userId);
        } catch (error) {
            console.error('AIController Error (getAIHistory):', error);
            return [];
        }
    }

    // UC28: Get Full AI Chat History
    static async getFullAIHistory(userId) {
        try {
            return await AIService.getFullAIHistory(userId);
        } catch (error) {
            console.error('AIController Error (getFullAIHistory):', error);
            return [];
        }
    }

    // UC28: Clear AI Chat Session
    static async clearAIHistory(userId) {
        try {
            return await AIService.clearAIHistory(userId);
        } catch (error) {
            console.error('AIController Error (clearAIHistory):', error);
            return { success: false };
        }
    }
}
