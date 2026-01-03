// File: app/services/CommunityService.js

// Android Emulator localhost: 10.0.2.2
// iOS Simulator localhost: 127.0.0.1
// Physical Device: Use computer's IP address (e.g., 192.168.1.5)
const API_URL = 'http://10.0.2.2:3000';

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

    // UC27: Fetch all active posts
    getAllPosts: async () => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/posts`);
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
            let body;
            let headers = {};

            if (contentImage && contentImage.startsWith('file://')) {
                // Use FormData for file upload
                body = new FormData();
                body.append('userID', userId);
                body.append('content_text', contentText);

                const fileName = contentImage.split('/').pop();
                const match = /\.(\w+)$/.exec(fileName);
                const type = match ? `image/${match[1]}` : `image`;

                body.append('content_image', {
                    uri: contentImage,
                    name: fileName,
                    type: type,
                });
            } else {
                // Use JSON
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify({ userID: userId, content_text: contentText, content_image: contentImage });
            }

            const response = await fetchWithTimeout(`${API_URL}/posts`, {
                method: 'POST',
                headers: headers,
                body: body
            });
            if (!response.ok) throw new Error('Failed to create post');
            return await response.json();
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    // UC29: Update an existing post
    updatePost: async (postId, userId, contentText, contentImage) => {
        try {
            let body;
            let headers = {};

            if (contentImage && contentImage.startsWith('file://')) {
                // Use FormData for file upload
                body = new FormData();
                body.append('userID', userId);
                body.append('content_text', contentText);

                const fileName = contentImage.split('/').pop();
                const match = /\.(\w+)$/.exec(fileName);
                const type = match ? `image/${match[1]}` : `image`;

                body.append('content_image', {
                    uri: contentImage,
                    name: fileName,
                    type: type,
                });
            } else {
                // Use JSON
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify({ userID: userId, content_text: contentText, content_image: contentImage });
            }

            const response = await fetchWithTimeout(`${API_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: headers,
                body: body
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


    // UC29: Delete a post
    deletePost: async (postId) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error (${response.status}): ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }
};
