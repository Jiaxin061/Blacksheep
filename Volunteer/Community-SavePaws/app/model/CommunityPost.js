// File: app/model/CommunityPost.js

/**
 * Model class for Community Post
 * Maps database fields to application object
 */
export class CommunityPost {
    constructor(id, userId, userName, contentText, contentImage, status, createdAt) {
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
        return new CommunityPost(
            row.postID,
            row.userID,
            `${row.first_name} ${row.last_name}`,
            row.content_text,
            row.content_image,
            row.post_status,
            row.post_created_at
        );
    }
}
