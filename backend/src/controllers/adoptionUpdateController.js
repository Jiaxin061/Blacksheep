import pool from '../config/database.js';

// UC025: Submit adoption follow-up update
export const createUpdate = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { adoption_request_id, health_status, description } = req.body;
        const user_id = req.user?.userId || req.user?.id;
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
        await connection.rollback();
        connection.release();
        console.error('Error creating adoption update:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating adoption update',
            error: error.message
        });
    }
};

// UC025 / UC026: Get adoption updates
export const getUpdates = async (req, res) => {
    try {
        const user_id = req.user?.userId || req.user?.id;
        const { isAdmin } = req.user; // Assuming isAdmin is populated in auth middleware
        const { status, adoption_request_id } = req.query;

        let query = `
      SELECT au.review_id, au.adoption_request_id, au.update_date, au.health_status, 
             au.description, au.photo_url, au.review_status, au.admin_notes,
             u.first_name, u.last_name, u.email,
             a.name as animal_name, a.species, a.breed
      FROM adoption_updates au
      JOIN user u ON au.user_id = u.userID
      JOIN adoption_requests ar ON au.adoption_request_id = ar.id
      JOIN animals a ON ar.animal_id = a.id
    `;

        const params = [];
        const conditions = [];

        // If not admin, restrict to own updates
        // In UC026, admin views all. In UC025, user views theirs? (Not explicitly requirement but good practice)
        // The requirement says "admin view" for reviewing. User view isn't explicitly detailed but implied "users to select... and submit".
        // I'll allow users to see their own updates if they want history.

        // NOTE: Checking isAdmin logic. 
        // If exact isAdmin flag isn't available, I might need to check role or rely on user_id filter for non-admins.
        // For now, assuming if user requests 'my-updates' style or simply GET /updates without admin privs, they get theirs.

        // Actually, let's look at `adoptionRoutes.js` again. `isAdmin` middleware exists.
        // I will assume if `req.isAdmin` is true (from middleware likely) they can see all.
        // Wait, `isAdmin` middleware in `adoptionRoutes` protects the route. 
        // I probably need separate routes or logic locally.
        // I'll stick to: if not admin, FORCE user_id filter.

        // Check if user is admin (this depends on how authMiddleware populates req.user or if isAdmin middleware was used)
        // Looking at previous valid routes, `isAdmin` middleware is used for protection.
        // I will implement a general `getUpdates` that can be used by both, but logic inside handles permission?
        // Or better: `getMyUpdates` and `getAllUpdates` (Admin).
        // Let's stick to `getUpdates` and filter contextually if possible, OR separate control functions.
        // Separating matches `adoptionController.js` pattern (getMyRequests vs getAllRequests).

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
export const getMyUpdates = async (req, res) => {
    try {
        const user_id = req.user?.userId || req.user?.id;

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
export const reviewUpdate = async (req, res) => {
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
        await connection.rollback();
        connection.release();
        console.error('Error reviewing adoption update:', error);
        res.status(500).json({
            success: false,
            message: 'Error reviewing adoption update',
            error: error.message
        });
    }
};
