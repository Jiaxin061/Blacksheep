const CommunityPost = require('../models/CommunityPost');
const { CommunityService } = require('../services/CommunityService');

class AdminCommunityController {
    static async getAllPosts(req, res) {
        try {
            const status = req.query.status || 'Active';
            const rawPosts = await CommunityService.getAllPostsAdmin(status);
            const posts = rawPosts.map(row => CommunityPost.fromDatabase(row));
            res.json(posts);
        } catch (error) {
            console.error('Admin Controller Error (getAllPosts):', error);
            res.status(500).json({ success: false, message: "Failed to fetch posts" });
        }
    }

    static async deletePost(req, res) {
        try {
            const { id } = req.params;
            await CommunityService.deletePost(id);
            res.json({ success: true, message: "Post deleted successfully" });
        } catch (error) {
            console.error('Admin Controller Error (deletePost):', error);
            res.status(500).json({ success: false, message: "Failed to delete post" });
        }
    }

    static async restorePost(req, res) {
        try {
            const { id } = req.params;
            await CommunityService.restorePost(id);
            res.json({ success: true, message: "Post restored successfully" });
        } catch (error) {
            console.error('Admin Controller Error (restorePost):', error);
            res.status(500).json({ success: false, message: "Failed to restore post" });
        }
    }
}

module.exports = AdminCommunityController;
