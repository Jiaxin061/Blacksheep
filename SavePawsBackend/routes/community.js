const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const CommunityController = require('../controllers/CommunityController');

// Configure multer for image uploads (using same config as server.js is best, but defining here for specific route control if needed)
// However, server.js likely exposes a generic upload, but for specific post creation with image, we might handle it here or reuse.
// Let's use a local storage config for this route to be safe and self-contained, or reuse if available.
// Since we can't easily import the instance from server.js, we create a new one.

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'community-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// GET /feed - Get all posts
router.get('/feed', async (req, res) => {
    const posts = await CommunityController.getCommunityFeed();
    res.json(posts);
});

// GET /posts/:id - Get specific post details
router.get('/posts/:id', async (req, res) => {
    const result = await CommunityController.getPostDetails(req.params.id);
    if (result) {
        res.json(result);
    } else {
        res.status(404).json({ success: false, message: 'Post not found' });
    }
});

// POST /create - Create a new post with image
router.post('/create', upload.single('image'), async (req, res) => {
    const { userId, text } = req.body;
    let imageUrl = null;

    if (req.file) {
        // Use the host from request, but allow override via X-Forwarded-Host for emulator
        const host = req.get('X-Forwarded-Host') || req.get('host');
        const protocol = req.protocol;
        let imageHost = host;

        // Check if request is from Android emulator
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
            // For emulator access, we might need 10.0.2.2 on the CLIENT, but the URL stored in DB is usually relative or absolute.
            // Best practice is often to store just the filename or relative path.
            // But existing code seems to expect full URL or filename.
            // CommunityController.shareExperience takes 'imageUrl'.

            // Let's check how frontend uses it. It checks if starts with http.
            // We will pass just the filename to the controller if the controller expects that, OR the full URL.
            // Looking at CommunityPage.js:
            // uri: item.contentImage.startsWith('http') ... ? item.contentImage : `${CommunityController.API_URL}/${item.contentImage}`

            // So it handles relative paths. Let's just store the filename for simplicity and portability.
            // WAIT, CommunityController.shareExperience takes 'imageUrl'.

            imageUrl = req.file.filename;
        } else {
            imageUrl = req.file.filename;
        }
    }

    const result = await CommunityController.shareExperience(userId, text, imageUrl);
    res.json(result);
});

// POST /update/:id - Update a post
router.post('/update/:id', upload.single('image'), async (req, res) => {
    const { userId, text } = req.body;
    // contentImage might be passed as string if keeping old image, or file if new.
    let imageUrl = req.body.existingImage; // Check if frontend sends this

    if (req.file) {
        imageUrl = req.file.filename;
    }

    const result = await CommunityController.updatePost(req.params.id, userId, text, imageUrl);
    res.json(result);
});

// DELETE /delete/:id - Delete a post
router.delete('/delete/:id', async (req, res) => {
    const result = await CommunityController.deletePost(req.params.id);
    res.json(result);
});

// DELETE /comments/:id - Delete a comment
router.delete('/comments/:id', async (req, res) => {
    const result = await CommunityController.deleteComment(req.params.id);
    res.json(result);
});

// POST /comments - Add a comment
router.post('/comments', upload.none(), async (req, res) => {
    const { postId, userId, text } = req.body;
    const result = await CommunityController.addComment(postId, userId, text);
    res.json(result);
});

// ==================== ADMIN ROUTES ====================
const AdminCommunityController = require('../controllers/AdminCommunityController');

// GET /admin/posts - Get all posts (filtered by status)
router.get('/admin/posts', AdminCommunityController.getAllPosts);

// POST /admin/posts/:id/restore - Restore a deleted post
router.post('/admin/posts/:id/restore', AdminCommunityController.restorePost);

// Admin can also delete posts using the existing DELETE /delete/:id or a specific admin route
router.delete('/admin/posts/:id', AdminCommunityController.deletePost);

module.exports = router;
