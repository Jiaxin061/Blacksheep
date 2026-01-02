// File: app/controller/CommunityController.js

import { CommunityPost } from '../model/CommunityPost';
import { CommunityService } from '../services/CommunityService';

export class CommunityController {
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

    // UC28: Ask AI
    static async askAI(userId, query) {
        if (!query.trim()) return null;
        try {
            const result = await CommunityService.consultAI(userId, query);
            console.log('Controller: AI result received:', result);
            return result.response;
        } catch (error) {
            console.error('Controller Error (askAI):', error);
            console.error('Error details:', error.message, error.stack);
            return "Sorry, I'm having trouble connecting right now.";
        }
    }

    // UC29: Update a post
    static async updatePost(postId, contentText, contentImage) {
        try {
            const result = await CommunityService.updatePost(postId, contentText, contentImage);
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

    // UC28: Get AI Chat History
    static async getAIHistory(userId) {
        try {
            return await CommunityService.getAIHistory(userId);
        } catch (error) {
            console.error('Controller Error (getAIHistory):', error);
            return [];
        }
    }

    // UC28: Get Full AI Chat History
    static async getFullAIHistory(userId) {
        try {
            console.log('Controller: Calling getFullAIHistory');
            return await CommunityService.getFullAIHistory(userId);
        } catch (error) {
            console.error('Controller Error (getFullAIHistory):', error);
            return [];
        }
    }

    // UC28: Clear AI Chat Session
    static async clearAIHistory(userId) {
        try {
            return await CommunityService.clearAIHistory(userId);
        } catch (error) {
            console.error('Controller Error (clearAIHistory):', error);
            return { success: false };
        }
    }
}
