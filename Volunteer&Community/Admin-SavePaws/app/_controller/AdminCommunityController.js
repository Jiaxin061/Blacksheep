import { CommunityPost } from '../_model/CommunityPost';
import { CommunityService } from '../_services/CommunityService';

export class AdminCommunityController {
    // Re-use API_URL if needed, but not strictly necessary here as Helper manages it.

    // UC30: Load All Posts for Admin Review (Active or Deleted)
    static async getAllPosts(status = 'Active') {
        try {
            const rawPosts = await CommunityService.getAllPosts(status);
            // Map to Model
            return rawPosts.map(row => CommunityPost.fromDatabase(row));
        } catch (error) {
            console.error('Admin Controller Error (getAllPosts):', error);
            return [];
        }
    }

    // UC30: Delete Post
    static async deletePost(postId) {
        try {
            await CommunityService.deletePost(postId);
            return { success: true, message: "Post deleted successfully" };
        } catch (error) {
            console.error('Admin Controller Error (deletePost):', error);
            return { success: false, message: "Failed to delete post" };
        }
    }
}
