const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenAI } = require("@google/genai");

// Import database config
const dbConfig = require('../src/resources/db_config');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini AI (New SDK)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Database Connection
const db = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL Database');
        connection.release();
    }
});

// --- API Endpoints ---

// Health Check
app.get('/', (req, res) => {
    res.send('SavePaws Server is running!');
});

// UC27: Get All Posts
// UC27: Get Posts (Support filtering)
app.get('/posts', (req, res) => {
    const status = req.query.status || 'Active'; // Default to Active
    const sql = `
        SELECT cp.*, u.first_name, u.last_name 
        FROM community_posts cp
        JOIN users u ON cp.userID = u.userID
        WHERE cp.post_status = ?
        ORDER BY cp.post_created_at DESC
    `;
    db.query(sql, [status], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving posts');
        }
        res.json(results);
    });
});

// UC27: Get Post Details & Comments
app.get('/posts/:id', (req, res) => {
    const postId = req.params.id;
    const postSql = `
        SELECT cp.*, u.first_name, u.last_name 
        FROM community_posts cp
        JOIN users u ON cp.userID = u.userID
        WHERE cp.postID = ?
    `;
    const commentSql = `
        SELECT pc.*, u.first_name, u.last_name 
        FROM post_comments pc
        JOIN users u ON pc.userID = u.userID
        WHERE pc.postID = ?
        ORDER BY pc.comment_date ASC
    `;

    db.query(postSql, [postId], (err, postResults) => {
        if (err) return res.status(500).send(err);
        if (postResults.length === 0) return res.status(404).send('Post not found');

        db.query(commentSql, [postId], (err, commentResults) => {
            if (err) return res.status(500).send(err);
            res.json({ post: postResults[0], comments: commentResults });
        });
    });
});

// UC29: Create Post
app.post('/posts', (req, res) => {
    const { userID, content_text, content_image } = req.body;
    const sql = 'INSERT INTO community_posts (userID, content_text, content_image, post_status, post_created_at) VALUES (?, ?, ?, "Active", NOW())';

    db.query(sql, [userID, content_text, content_image], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error creating post');
        }
        res.status(201).json({ message: 'Post created successfully', postID: result.insertId });
    });
});

// UC29: Edit Post
app.put('/posts/:id', (req, res) => {
    const postId = req.params.id;
    const { content_text, content_image } = req.body;
    console.log(`[DEBUG] PUT /posts/${postId} | body:`, req.body);
    const sql = 'UPDATE community_posts SET content_text = ?, content_image = ? WHERE postID = ?';

    db.query(sql, [content_text, content_image, postId], (err, result) => {
        if (err) {
            console.error('[ERROR] SQL failure in PUT /posts:', err);
            return res.status(500).send(`Error updating post: ${err.message}`);
        }
        console.log(`[DEBUG] Post ${postId} updated successfully`);
        res.json({ message: 'Post updated successfully' });
    });
});

// UC30: Delete Post (Soft Delete)
app.delete('/posts/:id', (req, res) => {
    const postId = req.params.id;
    const sql = 'UPDATE community_posts SET post_status = "Deleted" WHERE postID = ?';

    db.query(sql, [postId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting post');
        }
        res.json({ message: 'Post deleted successfully' });
    });
});

// UC27: Add Comment
app.post('/comments', (req, res) => {
    const { postID, userID, comment_text } = req.body;
    const sql = 'INSERT INTO post_comments (postID, userID, comment_text, comment_date) VALUES (?, ?, ?, NOW())';

    db.query(sql, [postID, userID, comment_text], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding comment');
        }
        res.status(201).json({ message: 'Comment added successfully', commentID: result.insertId });
    });
});

// UC28: Consult AI (Gemini Integration)
app.post('/ai-chat', async (req, res) => {
    const { userID, user_query } = req.body;

    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            console.error('API Key Missing or Placeholder');
            throw new Error('Gemini API Key not configured');
        }

        console.log('Using API Key starting with:', process.env.GEMINI_API_KEY.substring(0, 5));

        // List of models to try (New SDK prefers gemini-2.5-flash)
        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro"
        ];
        let aiResponseText = "";
        let success = false;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting with model: ${modelName}...`);
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: user_query
                });

                aiResponseText = response.text;
                success = true;
                console.log(`Success with model: ${modelName}`);
                break;
            } catch (err) {
                console.warn(`Model ${modelName} failed:`, err.message);
                lastError = err;
                // If it's a 404 or model not found, try next
                if (!err.message.includes("not found") && err.status !== 404) {
                    break;
                }
            }
        }

        if (!success) {
            throw lastError || new Error("All models failed to respond.");
        }

        const sql = 'INSERT INTO ai_chats (userID, user_query, ai_response, chat_timestamp) VALUES (?, ?, ?, NOW())';
        db.query(sql, [userID, user_query, aiResponseText], (err, result) => {
            if (err) {
                console.error('Database insertion error:', err);
                return res.status(500).send('Error saving chat');
            }
            res.json({ response: aiResponseText });
        });
    } catch (error) {
        console.error('Gemini API Error (Final):', error);
        res.status(500).json({
            response: "Oops! I encountered an error. If the server logs show 404, the model names might be different for your region or API key.",
            error: error.message
        });
    }
});

// UC28: Get ALL AI Chat History (Modal)
app.get('/ai-history/all/:userId', (req, res) => {
    const userId = req.params.userId;
    console.log(`Server: Received request for ALL history for user ${userId}`);
    const sql = 'SELECT user_query, ai_response, chat_timestamp FROM ai_chats WHERE userID = ? ORDER BY chat_timestamp DESC';

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Server: Error fetching ALL AI history:', err.message);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        console.log(`Server: Found ${results.length} total chat records for user ${userId}`);
        res.json(results);
    });
});

// UC28: Clear AI Chat Session
app.post('/ai-history/clear/:userId', (req, res) => {
    const userId = req.params.userId;
    console.log(`Server: Clearing active session for user ${userId}`);
    const sql = 'UPDATE ai_chats SET is_active = 0 WHERE userID = ?';

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Server: Error clearing session:', err.message);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        res.json({ message: 'Session cleared', affectedRows: result.affectedRows });
    });
});

// UC28: Get Active AI Chat History (Main Feed)
app.get('/ai-history/:userId', (req, res) => {
    const userId = req.params.userId;
    console.log(`Server: Received request for ACTIVE AI history for user ${userId}`);
    const sql = 'SELECT user_query, ai_response, chat_timestamp FROM ai_chats WHERE userID = ? AND is_active = 1 ORDER BY chat_timestamp ASC';

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Server: Error fetching AI history:', err.message);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        console.log(`Server: Found ${results.length} active chat records for user ${userId}`);
        res.json(results);
    });
});

// UC27: Delete Comment
app.delete('/comments/:id', (req, res) => {
    const commentId = req.params.id;
    console.log(`Server: Received request to delete comment ${commentId}`);
    const sql = 'DELETE FROM post_comments WHERE commentID = ?';

    db.query(sql, [commentId], (err, result) => {
        if (err) {
            console.error('Server: Error deleting comment:', err);
            return res.status(500).send('Error deleting comment');
        }
        if (result.affectedRows === 0) {
            console.warn(`Server: Comment ${commentId} not found for deletion`);
            return res.status(404).send('Comment not found');
        }
        console.log(`Server: Comment ${commentId} deleted successfully`);
        res.json({ message: 'Comment deleted successfully' });
    });
});

// UC30: Delete Post (Soft Delete - Change Status to 'Deleted')
app.delete('/posts/:id', (req, res) => {
    const postId = req.params.id;
    console.log(`Server: Received request to delete post ${postId}`);
    const sql = "UPDATE community_posts SET post_status = 'Deleted' WHERE postID = ?";

    db.query(sql, [postId], (err, result) => {
        if (err) {
            console.error('Server: Error deleting post:', err);
            return res.status(500).send('Error deleting post');
        }
        if (result.affectedRows === 0) {
            console.warn(`Server: Post ${postId} not found for deletion`);
            return res.status(404).send('Post not found');
        }
        console.log(`Server: Post ${postId} deleted successfully`);
        res.json({ message: 'Post deleted successfully' });
    });
});

// UC30: Restore Post (Change Status from 'Deleted' to 'Active')
app.post('/posts/:id/restore', (req, res) => {
    const postId = req.params.id;
    console.log(`Server: Received request to restore post ${postId}`);
    const sql = "UPDATE community_posts SET post_status = 'Active' WHERE postID = ?";

    db.query(sql, [postId], (err, result) => {
        if (err) {
            console.error('Server: Error restoring post:', err);
            return res.status(500).send('Error restoring post');
        }
        if (result.affectedRows === 0) {
            console.warn(`Server: Post ${postId} not found for restoration`);
            return res.status(404).send('Post not found');
        }
        console.log(`Server: Post ${postId} restored successfully`);
        res.json({ message: 'Post restored successfully' });
    });
});

// --- Volunteer Module Endpoints ---

// VC01: Get Available Volunteer Events
app.get('/events', (req, res) => {
    // Providing NULL fallbacks for columns missing in user's database
    // Map new schema fields to old frontend expectations
    // start_date -> event_date
    // eventLocation -> location
    const sql = `
        SELECT 
            eventID, title, description, 
            eventLocation AS location, 
            start_date AS event_date, 
            end_date, max_volunteers, hours,
            image_url, NULL AS time_range, NULL AS tag_text, NULL AS tag_color 
        FROM volunteer_events 
        WHERE start_date >= CURDATE()
        ORDER BY start_date ASC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('SQL Error in /events:', err);
            return res.status(500).send('Error retrieving events');
        }
        res.json(results);
    });
});

// VC04: Get Specific Event Details
app.get('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = `
        SELECT 
            eventID, title, description, 
            eventLocation AS location, 
            start_date AS event_date, 
            end_date, max_volunteers, hours,
            image_url, NULL AS time_range, NULL AS tag_text, NULL AS tag_color 
        FROM volunteer_events 
        WHERE eventID = ?
    `;
    db.query(sql, [eventId], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send('Event not found');
        res.json(results[0]);
    });
});

// VC02: Register for an Event
app.post('/events/register', (req, res) => {
    const { userID, eventID } = req.body;

    // Check if already registered in Event_Records
    const checkSql = 'SELECT * FROM event_records WHERE userID = ? AND eventID = ?';
    db.query(checkSql, [userID, eventID], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) return res.status(400).send('Already registered');

        // Insert into Event_Records
        const insertSql = 'INSERT INTO event_records (userID, eventID, register_date, status) VALUES (?, ?, NOW(), "Registered")';
        db.query(insertSql, [userID, eventID], (err, result) => {
            if (err) return res.status(500).send('Error registering');
            res.status(201).json({ message: 'Registered successfully' });
        });
    });
});

// VC03: Get User's Registered Events (for Contribution Page)
app.get('/events/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT er.recordID, ve.eventID, ve.title, ve.description,
               ve.eventLocation AS location,
               ve.start_date AS event_date,
               ve.image_url, ve.hours, NULL AS time_range, NULL AS tag_text, NULL AS tag_color,
               er.register_date
        FROM event_records er
        JOIN volunteer_events ve ON er.eventID = ve.eventID
        WHERE er.userID = ?
        ORDER BY ve.start_date ASC
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('SQL Error in /events/user:', err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// UC19: Create Event
app.post('/admin/events', (req, res) => {
    const { title, description, location, start_date, end_date, max_volunteers, hours, image_url } = req.body;
    const adminID = 1; // Default admin for now
    const sql = 'INSERT INTO volunteer_events (title, description, eventLocation, start_date, end_date, max_volunteers, hours, image_url, adminID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [title, description, location, start_date, end_date, max_volunteers, hours, image_url, adminID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error creating event');
        }
        res.status(201).json({ message: 'Event created successfully', eventID: result.insertId });
    });
});

// UC19: Update Event
app.put('/admin/events/:id', (req, res) => {
    const eventId = req.params.id;
    const { title, description, location, start_date, end_date, max_volunteers, hours, image_url } = req.body;
    const sql = 'UPDATE volunteer_events SET title = ?, description = ?, eventLocation = ?, start_date = ?, end_date = ?, max_volunteers = ?, hours = ?, image_url = ? WHERE eventID = ?';

    db.query(sql, [title, description, location, start_date, end_date, max_volunteers, hours, image_url, eventId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating event');
        }
        res.json({ message: 'Event updated successfully' });
    });
});

// UC19: Delete Event
app.delete('/admin/events/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = 'DELETE FROM volunteer_events WHERE eventID = ?';

    db.query(sql, [eventId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting event');
        }
        res.json({ message: 'Event deleted successfully' });
    });
});

// UC09: Get All Volunteer Registration Requests
app.get('/admin/registrations', (req, res) => {
    const sql = `
        SELECT vr.*, u.first_name, u.last_name 
        FROM volunteer_registration vr
        JOIN users u ON vr.userID = u.userID
        ORDER BY vr.submition_date DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving registrations');
        }
        res.json(results);
    });
});

// UC09: Approve Volunteer Registration
app.post('/admin/registrations/:id/approve', (req, res) => {
    const registrationID = req.params.id;
    const adminID = req.body.adminID || 1;

    // 1. Get the userID from the registration
    const getUserIdSql = 'SELECT userID FROM volunteer_registration WHERE registrationID = ?';
    db.query(getUserIdSql, [registrationID], (err, results) => {
        if (err || results.length === 0) return res.status(500).send('Registration not found');
        const userID = results[0].userID;

        // 2. Update registration status
        const updateRegSql = 'UPDATE volunteer_registration SET registration_status = "Approved", adminID = ?, reviewed_date = NOW() WHERE registrationID = ?';
        db.query(updateRegSql, [adminID, registrationID], (err) => {
            if (err) return res.status(500).send('Error updating registration status');

            // 3. Update user profile with VOLUNTEER badge
            const updateUserSql = 'UPDATE users SET is_volunteer = 1, volunteer_badge = "VOLUNTEER", volunteer_approval_date = NOW() WHERE userID = ?';
            db.query(updateUserSql, [userID], (err) => {
                if (err) return res.status(500).send('Error updating user status');
                res.json({ message: 'Registration approved and user profile updated' });
            });
        });
    });
});

// UC09: Reject Volunteer Registration
app.post('/admin/registrations/:id/reject', (req, res) => {
    const registrationID = req.params.id;
    const { adminID, reason } = req.body;
    const sql = 'UPDATE volunteer_registration SET registration_status = "Rejected", adminID = ?, reviewed_date = NOW(), rejection_reason = ? WHERE registrationID = ?';

    db.query(sql, [adminID || 1, reason, registrationID], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error rejecting registration');
        }
        res.json({ message: 'Registration rejected successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.warn('WARNING: GEMINI_API_KEY is not configured in .env file!');
    } else {
        console.log('Gemini AI system initialized.');
    }
});
