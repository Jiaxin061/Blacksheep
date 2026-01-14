const { query } = require('../config/database');

const CommunityService = {

    // UC27: Fetch all active posts
    getAllPosts: async () => {
        try {
            const sql = `
                SELECT cp.*, u.first_name, u.last_name 
                FROM community_posts cp
                JOIN users u ON cp.userID = u.id
                WHERE cp.post_status = 'Active'
                ORDER BY cp.post_created_at DESC
            `;
            const results = await query(sql);
            return results;
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    },

    // UC27: Get specific post details with comments
    getPostDetails: async (postId) => {
        try {
            const postSql = `
                SELECT cp.*, u.first_name, u.last_name 
                FROM community_posts cp
                JOIN users u ON cp.userID = u.id
                WHERE cp.postID = ?
            `;
            const postResults = await query(postSql, [postId]);

            if (postResults.length === 0) throw new Error('Post not found');

            const commentSql = `
                SELECT pc.*, u.first_name, u.last_name 
                FROM post_comments pc
                JOIN users u ON pc.userID = u.id
                WHERE pc.postID = ?
                ORDER BY pc.comment_date ASC
            `;
            const commentResults = await query(commentSql, [postId]);

            return { post: postResults[0], comments: commentResults };
        } catch (error) {
            console.error('Error fetching post details:', error);
            throw error;
        }
    },

    // UC29: Create a new post
    createPost: async (userId, contentText, contentImage) => {
        try {
            const sql = `
                INSERT INTO community_posts (userID, content_text, content_image, post_status)
                VALUES (?, ?, ?, 'Active')
            `;
            const result = await query(sql, [userId, contentText, contentImage]);
            return { success: true, insertId: result.insertId };
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    // UC29: Update an existing post
    updatePost: async (postId, userId, contentText, contentImage) => {
        try {
            const sql = `
                UPDATE community_posts 
                SET content_text = ?, content_image = ?
                WHERE postID = ? AND userID = ?
            `;
            const result = await query(sql, [contentText, contentImage, postId, userId]);
            if (result.affectedRows === 0) throw new Error('Post not found or unauthorized');
            return { success: true, message: 'Post updated successfully' };
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    },

    // UC27: Add a comment
    addComment: async (postId, userId, commentText) => {
        try {
            const sql = `
                INSERT INTO post_comments (postID, userID, comment_text)
                VALUES (?, ?, ?)
            `;
            const result = await query(sql, [postId, userId, commentText]);
            return { success: true, insertId: result.insertId };
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    // UC27: Delete a comment
    deleteComment: async (commentId) => {
        try {
            const sql = 'DELETE FROM post_comments WHERE commentID = ?';
            const result = await query(sql, [commentId]);
            if (result.affectedRows === 0) throw new Error('Comment not found');
            return { success: true, message: 'Comment deleted' };
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    },

    // UC29: Delete a post
    deletePost: async (postId) => {
        try {
            const sql = "UPDATE community_posts SET post_status = 'Deleted' WHERE postID = ?";
            const result = await query(sql, [postId]);
            if (result.affectedRows === 0) throw new Error('Post not found');
            return { success: true, message: 'Post deleted successfully' };
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }
};

module.exports = { CommunityService };
