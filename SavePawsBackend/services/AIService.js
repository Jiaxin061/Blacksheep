// File: app/services/AIService.js

const API_URL = 'http://10.0.2.2:3000';

const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 15000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
};

export const AIService = {
    // UC28: Consult AI
    askAI: async (userId, userQuery) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/ai-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: userId, user_query: userQuery }),
                timeout: 30000 // 30 seconds for AI responses
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error (${response.status}): ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('AIService Error (askAI):', error);
            throw error;
        }
    },

    // UC28: Get active AI chat history (Main Feed)
    getAIHistory: async (userId) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/ai-history/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch AI history');
            return await response.json();
        } catch (error) {
            console.error('AIService Error (getAIHistory):', error);
            throw error;
        }
    },

    // UC28: Get ALL AI Chat History (Modal)
    getFullAIHistory: async (userId) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/ai-history/all/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch full AI history');
            return await response.json();
        } catch (error) {
            console.error('AIService Error (getFullAIHistory):', error);
            throw error;
        }
    },

    // UC28: Clear AI chat session
    clearAIHistory: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/ai-history/clear/${userId}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to clear AI history');
            return await response.json();
        } catch (error) {
            console.error('AIService Error (clearAIHistory):', error);
            throw error;
        }
    }
};
