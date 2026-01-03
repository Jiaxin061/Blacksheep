const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const multer = require('multer');
const fs = require('fs');
const { GoogleGenAI } = require("@google/genai");

// Import database config
const dbConfig = require('../src/resources/db_config');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini AI (Latest SDK)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve static files from uploads folder
app.use('/uploads', express.static(uploadDir));

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

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
app.get('/posts', (req, res) => {
    const sql = `
        SELECT cp.*, u.first_name, u.last_name 
        FROM community_posts cp
        JOIN users u ON cp.userID = u.userID
        WHERE cp.post_status = 'Active'
        ORDER BY cp.post_created_at DESC
    `;
    db.query(sql, (err, results) => {
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

// UC29: Create Post (Updated to handle upload)
app.post('/posts', upload.single('content_image'), (req, res) => {
    let { userID, content_text, content_image } = req.body;

    // If a file was uploaded, use its path
    if (req.file) {
        content_image = `uploads/${req.file.filename}`;
    }

    const sql = 'INSERT INTO community_posts (userID, content_text, content_image, post_status, post_created_at) VALUES (?, ?, ?, "Active", NOW())';

    db.query(sql, [userID, content_text, content_image], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error creating post');
        }
        res.status(201).json({ message: 'Post created successfully', postID: result.insertId, imagePath: content_image });
    });
});

app.put('/posts/:id', upload.single('content_image'), (req, res) => {
    const postId = req.params.id;
    let { userID, content_text, content_image } = req.body;

    console.log(`[DEBUG] PUT /posts/${postId} | body:`, req.body);
    console.log(`[DEBUG] PUT /posts/${postId} | file:`, req.file);

    // If a file was uploaded, use its path
    if (req.file) {
        content_image = `uploads/${req.file.filename}`;
    }

    const sql = 'UPDATE community_posts SET content_text = ?, content_image = ? WHERE postID = ? AND userID = ?';

    db.query(sql, [content_text, content_image, postId, userID], (err, result) => {
        if (err) {
            console.error('[ERROR] SQL failure in PUT /posts:', err);
            return res.status(500).send(`Error updating post: ${err.message}`);
        }

        if (result.affectedRows === 0) {
            return res.status(403).send('Unauthorized or post not found');
        }

        res.json({ message: 'Post updated successfully', imagePath: content_image });
    });
});

// UC29: Delete Post (Physical deletion for user)
app.delete('/posts/:id', (req, res) => {
    const postId = req.params.id;
    console.log(`[DEBUG] Attempting to delete post ${postId}`);

    // First delete comments for this post to avoid FK constraint error
    const deleteCommentsSql = 'DELETE FROM post_comments WHERE postID = ?';
    db.query(deleteCommentsSql, [postId], (err) => {
        if (err) {
            console.error('[ERROR] Failed to delete comments:', err);
            return res.status(500).send('Error deleting post comments');
        }

        const deletePostSql = 'DELETE FROM community_posts WHERE postID = ?';
        db.query(deletePostSql, [postId], (err, result) => {
            if (err) {
                console.error('[ERROR] Failed to delete post:', err);
                return res.status(500).send(`Error deleting post: ${err.message}`);
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Post not found');
            }
            console.log(`[DEBUG] Post ${postId} and its comments deleted successfully`);
            res.json({ message: 'Post deleted successfully' });
        });
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

        // List of models to try (Using a wider range to avoid 404)
        // List of models to try (Based on successful Model Discovery list)
        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-3-flash-preview",
            "gemini-1.5-flash"
        ];
        const triedModels = [];
        let aiResponseText = "";
        let success = false;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                triedModels.push(modelName);
                console.log(`[DEBUG] AI Attempt ${triedModels.length}: Model=${modelName}...`);

                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: `SYSTEM_INSTRUCTION: You are "Pawlo", the dedicated AI assistant for "SavePaws", a mobile application for animal welfare. 
                                LICENSE: You are ONLY allowed to discuss: Animal Rescue, Pet Adoption, Volunteering, Donations, Animal Care, Pet First Aid, and GREETINGS.
                                
                                RULES:
                                1. You ARE allowed to respond to greetings (e.g., "Hi", "Hello", "How are you?") politely before guiding the user toward animal welfare topics.
                                2. If the user asks about coffee, weather, math, coding, personal life, or ANY topic not related to animals or SavePaws, you must REFUSE.
                                3. ALWAYS refer to SavePaws as an "app" or "application", NEVER a "website".
                                4. REFUSAL MESSAGE: "I apologize, but I am designed solely to assist with animal welfare and SavePaws-related inquiries."
                                
                                User Query: "${user_query}"
                                
                                Answer:` }
                            ]
                        }
                    ]
                });

                // Extract text safely from the response
                aiResponseText = response.text;
                if (typeof aiResponseText === 'function') aiResponseText = await aiResponseText();
                if (!aiResponseText && response.candidates && response.candidates[0].content) {
                    aiResponseText = response.candidates[0].content.parts[0].text;
                }

                if (!aiResponseText) {
                    throw new Error("Empty response from AI");
                }

                success = true;
                console.log(`[DEBUG] AI Success: Model=${modelName}`);
                break;
            } catch (err) {
                console.warn(`[DEBUG] AI Failure: Model=${modelName} | Error=${err.message}`);
                lastError = err;
                continue;
            }
        }

        if (!success) {
            console.error('[ERROR] All AI models failed. Models tried:', triedModels.join(', '));
            throw lastError || new Error(`All models failed: ${triedModels.join(', ')}`);
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

// --- Volunteer Module Endpoints ---

// VC01: Get Available Volunteer Events
app.get('/events', (req, res) => {
    // start_date -> event_date
    // eventLocation -> location
    // Now including 'hours' column
    const sql = `
        SELECT
            eventID, title, description,
            eventLocation AS location,
            start_date AS event_date,
            end_date, max_volunteers,
            image_url, hours,
            NULL AS time_range, NULL AS tag_text, NULL AS tag_color
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
            end_date, max_volunteers,
            image_url, hours,
            NULL AS time_range, NULL AS tag_text, NULL AS tag_color
        FROM volunteer_events
        WHERE eventID = ?
    `;
    db.query(sql, [eventId], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send('Event not found');
        res.json(results[0]);
    });
});

// VC04: Update Event (New Endpoint for Automation)
app.put('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const { title, description, start_date } = req.body; // Add fields as needed

    // 1. Update the Event
    const updateSql = `UPDATE volunteer_events SET title = COALESCE(?, title), description = COALESCE(?, description), start_date = COALESCE(?, start_date) WHERE eventID = ?`;

    db.query(updateSql, [title, description, start_date, eventId], (err, result) => {
        if (err) return res.status(500).send(err);

        // 2. Auto-Cleanup / Auto-Fill Logic based on new Date
        if (start_date) {
            const checkFutureSql = "SELECT start_date FROM volunteer_events WHERE eventID = ?";
            db.query(checkFutureSql, [eventId], (err, results) => {
                if (results.length > 0) {
                    const newDate = new Date(results[0].start_date);
                    const now = new Date();

                    if (newDate > now) {
                        // Case A: Moved to FUTURE -> Remove 'Attended' status
                        console.log(`Event ${eventId} moved to FUTURE. Limiting 'Attended' status...`);
                        const deleteContribSql = "DELETE FROM volunteer_contribution WHERE eventID = ? AND participation_status = 'Attended'";
                        db.query(deleteContribSql, [eventId], (err, delResult) => {
                            if (err) console.error("Error cleaning up contributions:", err);
                            else console.log(`Removed ${delResult.affectedRows} contribution records.`);
                        });
                    } else {
                        // Case B: Moved to PAST -> Grant 'Attended' status to Registered users
                        console.log(`Event ${eventId} moved to PAST. Auto-marking attendance...`);
                        const insertContribSql = `
                            INSERT INTO volunteer_contribution (userID, eventID, hours_contributed, participation_status)
                            SELECT er.userID, er.eventID, ve.hours, 'Attended'
                            FROM event_records er
                            JOIN volunteer_events ve ON er.eventID = ve.eventID
                            WHERE er.eventID = ? 
                              AND er.status = 'Registered'
                              AND NOT EXISTS (
                                  SELECT 1 FROM volunteer_contribution vc 
                                  WHERE vc.userID = er.userID AND vc.eventID = er.eventID
                              );
                        `;
                        db.query(insertContribSql, [eventId], (err, insertResult) => {
                            if (err) console.error("Error syncing attendance:", err);
                            else console.log(`Added ${insertResult.affectedRows} new contribution records.`);
                        });
                    }
                }
            });
        }
        res.json({ message: 'Event updated successfully' });
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
               ve.image_url, ve.hours,
               NULL AS time_range, NULL AS tag_text, NULL AS tag_color,
               er.register_date
        FROM event_records er
        JOIN volunteer_events ve ON er.eventID = ve.eventID
        WHERE er.userID = ? AND ve.start_date >= NOW()
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

// --- Volunteer Registration Endpoints (UC07) ---

// UC07: Submit Volunteer Registration
app.post('/volunteer/register', (req, res) => {
    const { userID, userName, address, experience, capability } = req.body;

    // Basic validation
    if (!userID || !userName || !address || !experience || !capability) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for existing pending or approved registration
    const checkSql = 'SELECT * FROM volunteer_registration WHERE userID = ? AND (registration_status = "Pending" OR registration_status = "Approved")';
    db.query(checkSql, [userID], (err, results) => {
        if (err) {
            console.error('Error checking existing registration:', err);
            return res.status(500).json({ message: 'Database error checking registration' });
        }

        if (results.length > 0) {
            const status = results[0].registration_status;
            return res.status(409).json({ message: `You already have a registration that is ${status}.`, status: status });
        }

        // Insert new registration
        // Note: Mapping 'address' from frontend to 'location' in DB
        const insertSql = `
            INSERT INTO volunteer_registration
            (userID, userName, location, experience, capability, registration_status, submition_date)
            VALUES (?, ?, ?, ?, ?, 'Pending', NOW())
        `;

        db.query(insertSql, [userID, userName, address, experience, capability], (err, result) => {
            if (err) {
                console.error('Error submitting volunteer registration:', err);
                return res.status(500).json({ message: 'Error submitting registration' });
            }
            res.status(201).json({ message: 'Registration submitted successfully', registrationID: result.insertId });
        });
    });
});

// UC07: Get Volunteer Status (For Homepage Logic)
app.get('/volunteer/status/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = 'SELECT registrationID, registration_status, rejection_reason FROM volunteer_registration WHERE userID = ? ORDER BY submition_date DESC LIMIT 1';

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching volunteer status:', err);
            // DEBUG: Sending error details to client for easier debugging
            return res.status(500).json({ message: 'Error checking status', details: err.message, sqlMessage: err.sqlMessage });
        }

        if (results.length === 0) {
            return res.json({ hasRegistration: false, status: null });
        }

        const data = results[0];
        res.json({
            hasRegistration: true,
            status: data.registration_status,
            rejectionReason: data.rejection_reason
        });
    });
});

// UC07: Get Registration Details (For viewing application)
app.get('/volunteer/registration/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT * FROM volunteer_registration WHERE userID = ? ORDER BY submition_date DESC LIMIT 1';
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send('No registration found');
        res.json(results[0]);
    });
});

// UC07: Get Volunteer Contributions (History)
app.get('/volunteer/contributions/:userId', (req, res) => {
    const userId = req.params.userId;
    // Updated Logic: Join with volunteer_contribution to see status, but pull 'hours' from EVENT primarily (or as backup)
    // The user said: "when user registered and attended, their 'my contribution' will displays the event they attend and event hours"
    // So if they are in 'volunteer_contribution' with status 'Attended', we show the event's hours.
    const sql = `
        SELECT
            vc.contributionID,
            ve.hours AS hours_contributed, -- Use event hours
            vc.participation_status,
            ve.title,
            ve.description,
            ve.start_date AS event_date
        FROM volunteer_contribution vc
        JOIN volunteer_events ve ON vc.eventID = ve.eventID
        WHERE vc.userID = ? AND (vc.participation_status = 'Attended' OR vc.participation_status = 'Registered')
        ORDER BY ve.start_date DESC
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching contributions:', err);
            return res.status(500).send(err);
        }
        res.json(results);
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
