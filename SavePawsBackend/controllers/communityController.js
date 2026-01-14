// File: app/controller/CommunityController.js

const CommunityPost = require('../models/CommunityPost');
const { CommunityService } = require('../services/CommunityService');

class CommunityController {
    static API_URL = 'http://10.0.2.2:3000'; // Match CommunityService API_URL

    // UC27: Load specific post details
    static async getPostDetails(postId) {
        try {
            const data = await CommunityService.getPostDetails(postId);
            // Map main post to Model
            const postModel = CommunityPost.fromDatabase(data.post);
            return { post: postModel, comments: data.comments };
        } catch (error) {
            console.error('Controller Error (getPostDetails):', error);
            return null;
        }
    }

    // UC27: Load Feed
    static async getCommunityFeed() {
        try {
            const rawPosts = await CommunityService.getAllPosts();
            // Map all rows to Model objects
            return rawPosts.map(row => CommunityPost.fromDatabase(row));
        } catch (error) {
            console.error('Controller Error (getCommunityFeed):', error);
            return [];
        }
    }

    // UC29: Share Experience
    static async shareExperience(userId, text, imageUrl) {
        if (!text.trim()) return { success: false, message: "Content cannot be empty" };

        try {
            await CommunityService.createPost(userId, text, imageUrl);
            return { success: true, message: "Post shared successfully!" };
        } catch (error) {
            return { success: false, message: "Failed to share post. Try again." };
        }
    }


    // UC29: Update a post
    static async updatePost(postId, userId, contentText, contentImage) {
        try {
            const result = await CommunityService.updatePost(postId, userId, contentText, contentImage);
            return { success: true, message: result.message || 'Post updated successfully' };
        } catch (error) {
            console.error('Controller Error (updatePost):', error);
            return { success: false, message: error.message || 'Failed to update post' };
        }
    }

    // UC27: Delete Comment
    static async deleteComment(commentId) {
        try {
            await CommunityService.deleteComment(commentId);
            return { success: true, message: "Comment deleted" };
        } catch (error) {
            return { success: false, message: "Failed to delete comment" };
        }
    }
    // UC28: Add Comment
    static async addComment(postId, userId, text) {
        if (!text.trim()) return { success: false, message: "Comment cannot be empty" };
        try {
            await CommunityService.addComment(postId, userId, text);
            return { success: true, message: "Comment added" };
        } catch (error) {
            console.error('Controller Error (addComment):', error);
            return { success: false, message: "Failed to add comment" };
        }
    }

    // UC29: Delete a post
    static async deletePost(postId) {
        try {
            await CommunityService.deletePost(postId);
            return { success: true, message: "Post deleted successfully" };
        } catch (error) {
            console.error('Controller Error (deletePost):', error);
            return { success: false, message: error.message || "Failed to delete post" };
        }
    }
}

module.exports = CommunityController;
