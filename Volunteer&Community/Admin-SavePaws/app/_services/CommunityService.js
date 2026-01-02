// File: app/services/CommunityService.js

// Android Emulator localhost: 10.0.2.2
// iOS Simulator localhost: 127.0.0.1
// Physical Device: Use computer's IP address (e.g., 192.168.1.5)
const API_URL = 'http://192.168.1.75:3000'; // Defaulting to Emulator for stability

// Helper for timeout
const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 15000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
};

export const CommunityService = {

    // UC27: Fetch posts by status
    getAllPosts: async (status = 'Active') => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/posts?status=${status}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    },

    // UC27: Get specific post details with comments
    getPostDetails: async (postId) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/posts/${postId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching post details:', error);
            throw error;
        }
    },

    // UC29: Create a new post
    createPost: async (userId, contentText, contentImage) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: userId, content_text: contentText, content_image: contentImage })
            });
            if (!response.ok) throw new Error('Failed to create post');
            return await response.json();
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    // UC29: Update an existing post
    updatePost: async (postId, contentText, contentImage) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content_text: contentText, content_image: contentImage })
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Server Error (${response.status}): ${errorBody}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    },

    // UC27: Add a comment
    addComment: async (postId, userId, commentText) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postID: postId, userID: userId, comment_text: commentText })
            });
            if (!response.ok) throw new Error('Failed to add comment');
            return await response.json();
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    // UC28: Consult AI
    consultAI: async (userId, query) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/ai-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: userId, user_query: query })
            });
            if (!response.ok) throw new Error('Failed to consult AI');
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    // UC27: Delete a comment
    deleteComment: async (commentId) => {
        try {
            console.log(`Service: Attempting to delete comment ${commentId} at ${API_URL}`);
            const response = await fetchWithTimeout(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
            });
            console.log(`Service: DELETE response status: ${response.status}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete comment: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    },

    // UC30: Delete a post (Admin)
    deletePost: async (postId) => {
        try {
            console.log(`Service: Attempting to delete post ${postId} at ${API_URL}`);
            const response = await fetchWithTimeout(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete post: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    },

    // UC28: Fetch AI Chat History
    getAIHistory: async (userId) => {
        try {
            console.log(`Service: Fetching AI history for user ${userId} at ${API_URL}`);
            const response = await fetchWithTimeout(`${API_URL}/ai-history/${userId}`);
            console.log(`Service: AI history response status: ${response.status}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Service: AI history fetch failed: ${errorText}`);
                throw new Error(`Failed to fetch AI history: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching AI history:', error);
            throw error;
        }
    },

    // UC28: Fetch ALL AI Chat History (Modal)
    getFullAIHistory: async (userId) => {
        try {
            console.log(`Service: Fetching FULL AI history for user ${userId}`);
            const response = await fetchWithTimeout(`${API_URL}/ai-history/all/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch full history');
            return await response.json();
        } catch (error) {
            console.error('Error fetching full AI history:', error);
            throw error;
        }
    },

    // UC28: Clear Active AI Session
    clearAIHistory: async (userId) => {
        try {
            console.log(`Service: Clearing AI session for user ${userId}`);
            const response = await fetchWithTimeout(`${API_URL}/ai-history/clear/${userId}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to clear session');
            return await response.json();
        } catch (error) {
            console.error('Error clearing AI session:', error);
            throw error;
        }
    }
};
