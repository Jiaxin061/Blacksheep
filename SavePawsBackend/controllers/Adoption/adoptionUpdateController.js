const { getPool } = require('../../config/database');

// UC025: Submit adoption follow-up update
const createUpdate = async (req, res) => {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { adoption_request_id, health_status, description } = req.body;
        // Handle different user ID locations (auth middleware variations)
        const user_id = req.userId || req.user?.userId || req.user?.id;

        // Get photo URL from uploaded file if present
        const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

        // Validation
        if (!adoption_request_id || !health_status || !description) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Adoption request ID, health status, and description are required'
            });
        }

        // specific validation: check if request belongs to user and is approved
        const [requests] = await connection.execute(
            'SELECT id, status FROM adoption_requests WHERE id = ? AND user_id = ?',
            [adoption_request_id, user_id]
        );

        if (requests.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Adoption request not found or does not belong to you'
            });
        }

        if (requests[0].status !== 'approved') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'You can only submit updates for approved adoptions'
            });
        }

        // Insert update
        const [result] = await connection.execute(
            `INSERT INTO adoption_updates (adoption_request_id, user_id, health_status, description, photo_url, review_status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
            [adoption_request_id, user_id, health_status, description, photo_url]
        );

        await connection.commit();

        // Fetch created update
        const [updates] = await connection.execute(
            `SELECT au.*, 
              a.name as animal_name
       FROM adoption_updates au
       JOIN adoption_requests ar ON au.adoption_request_id = ar.id
       JOIN animals a ON ar.animal_id = a.id
       WHERE au.review_id = ?`,
            [result.insertId]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Adoption update submitted successfully',
            data: updates[0]
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Error creating adoption update:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating adoption update',
            error: error.message
        });
    }
};

// UC025 / UC026: Get adoption updates
const getUpdates = async (req, res) => {
    try {
        const user_id = req.userId || req.user?.userId || req.user?.id;
        const { status, adoption_request_id } = req.query;

        // Check for admin role if applicable. For now, we'll just filter.
        // Ideally, we check req.user.role === 'admin' 

        let query = `
      SELECT au.review_id, au.adoption_request_id, au.update_date, au.health_status, 
             au.description, au.photo_url, au.review_status, au.admin_notes,
             u.first_name, u.last_name, u.email,
             a.name as animal_name, a.species, a.breed
      FROM adoption_updates au
      JOIN users u ON au.user_id = u.id
      JOIN adoption_requests ar ON au.adoption_request_id = ar.id
      JOIN animals a ON ar.animal_id = a.id
    `;

        const params = [];
        const conditions = [];

        if (adoption_request_id) {
            conditions.push('au.adoption_request_id = ?');
            params.push(adoption_request_id);
        }

        if (status) {
            conditions.push('au.review_status = ?');
            params.push(status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY au.update_date DESC';

        const pool = getPool();
        const [updates] = await pool.execute(query, params);

        res.json({
            success: true,
            data: updates,
            count: updates.length
        });

    } catch (error) {
        console.error('Error fetching adoption updates:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving adoption updates',
            error: error.message
        });
    }
};

// Helper for users fetching their own updates
const getMyUpdates = async (req, res) => {
    try {
        const user_id = req.userId || req.user?.userId || req.user?.id;

        if (!user_id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const query = `
      SELECT au.review_id, au.adoption_request_id, au.update_date, au.health_status, 
             au.description, au.photo_url, au.review_status, au.admin_notes,
             a.name as animal_name, a.image_url as animal_image
      FROM adoption_updates au
      JOIN adoption_requests ar ON au.adoption_request_id = ar.id
      JOIN animals a ON ar.animal_id = a.id
      WHERE au.user_id = ?
      ORDER BY au.update_date DESC
    `;

        const pool = getPool();
        const [updates] = await pool.execute(query, [user_id]);

        res.json({
            success: true,
            data: updates,
            count: updates.length
        });
    } catch (error) {
        console.error('Error fetching user updates:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving your adoption updates',
            error: error.message
        });
    }
};

// UC026: Admin review update
const reviewUpdate = async (req, res) => {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params; // review_id
        const { review_status, admin_notes } = req.body;

        // Validation
        if (!review_status || !['satisfactory', 'needs_visit'].includes(review_status)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Review status must be either "satisfactory" or "needs_visit"'
            });
        }

        // Check if update exists
        const [updates] = await connection.execute(
            'SELECT review_id FROM adoption_updates WHERE review_id = ?',
            [id]
        );

        if (updates.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Adoption update not found'
            });
        }

        // Update status and notes
        await connection.execute(
            'UPDATE adoption_updates SET review_status = ?, admin_notes = ? WHERE review_id = ?',
            [review_status, admin_notes || null, id]
        );

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: 'Adoption update reviewed successfully',
            data: { review_id: id, review_status, admin_notes }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Error reviewing adoption update:', error);
        res.status(500).json({
            success: false,
            message: 'Error reviewing adoption update',
            error: error.message
        });
    }
};

module.exports = {
    createUpdate,
    getUpdates,
    getMyUpdates,
    reviewUpdate
};
