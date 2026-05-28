// File: app/model/CommunityPost.js

/**
 * Model class for Community Post
 * Maps database fields to application object
 */
class CommunityPost {
    constructor({ id, userId, userName, contentText, contentImage, status, createdAt }) {
        this.id = id;
        this.userId = userId;
        this.userName = userName; // Derived from join
        this.contentText = contentText;
        this.contentImage = contentImage;
        this.status = status;
        this.createdAt = new Date(createdAt);
    }

    /**
     * Factory method to create instance from Database Row
     * @param {Object} row - Row from MySQL query result
     */
    static fromDatabase(row) {
        return new CommunityPost({
            id: row.postID,
            userId: row.userID,
            userName: row.userName || `${row.first_name} ${row.last_name}`,
            contentText: row.content_text,
            contentImage: row.content_image,
            status: row.post_status,
            createdAt: row.post_created_at
        });
    }
}

module.exports = CommunityPost;
