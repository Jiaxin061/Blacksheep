const { query } = require('../config/database');

const VolunteerService = {

    // --- Events Section ---

    // Fetch all available volunteer events
    getAvailableEvents: async () => {
        try {
            const sql = `
                SELECT * FROM volunteer_events 
                WHERE COALESCE(end_date, start_date) >= NOW()
                ORDER BY start_date ASC
            `;
            const results = await query(sql);
            return results;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    // Get specific event details
    getEventDetails: async (eventId) => {
        try {
            const sql = 'SELECT * FROM volunteer_events WHERE eventID = ?';
            const results = await query(sql, [eventId]);
            if (results.length === 0) return null;
            return results[0];
        } catch (error) {
            console.error('Error fetching event details:', error);
            throw error;
        }
    },

    // Register current user for an event
    registerForEvent: async (userId, eventId) => {
        try {
            // Check if already registered
            const checkSql = 'SELECT * FROM event_records WHERE userID = ? AND eventID = ?';
            const existing = await query(checkSql, [userId, eventId]);

            if (existing.length > 0) {
                return { success: false, message: 'Already registered', status: 400 };
            }

            // Register
            const insertSql = `
                INSERT INTO event_records (userID, eventID, status)
                VALUES (?, ?, 'Registered')
            `;
            await query(insertSql, [userId, eventId]);
            return { success: true, message: 'Registered successfully' };
        } catch (error) {
            console.error('Error registering for event:', error);
            throw error;
        }
    },

    // Get events the user has registered for (My Contributions / Upcoming)
    getUserEvents: async (userId) => {
        try {
            const sql = `
                SELECT er.recordID, er.status as registration_status, ve.* 
                FROM event_records er
                JOIN volunteer_events ve ON er.eventID = ve.eventID
                WHERE er.userID = ?
                ORDER BY ve.start_date ASC
            `;
            const results = await query(sql, [userId]);
            return results;
        } catch (error) {
            console.error('Error fetching user events:', error);
            throw error;
        }
    },

    // --- Volunteer Registration (UC07) ---

    // Submit new registration
    submitVolunteerRegistration: async (registrationData) => {
        try {
            // Check if already pending or approved
            const checkSql = `
                SELECT * FROM volunteer_registration 
                WHERE userID = ? AND registration_status IN ('Pending', 'Approved')
            `;
            const existing = await query(checkSql, [registrationData.userID]);

            if (existing.length > 0) {
                return {
                    success: false,
                    message: `You already have a ${existing[0].registration_status} registration.`,
                    status: 400
                };
            }

            const sql = `
                INSERT INTO volunteer_registration (userID, userName, location, experience, capability, registration_status)
                VALUES (?, ?, ?, ?, ?, 'Pending')
            `;
            const result = await query(sql, [
                registrationData.userID,
                registrationData.userName,
                registrationData.address, // Maps to 'location' in DB
                registrationData.experience,
                registrationData.capability
            ]);

            return { success: true, message: 'Registration submitted successfully', registrationID: result.insertId };
        } catch (error) {
            console.error('Error submitting registration:', error);
            throw error;
        }
    },

    // Check status
    getVolunteerStatus: async (userId) => {
        try {
            // Get latest registration
            const sql = `
                SELECT * FROM volunteer_registration 
                WHERE userID = ? 
                ORDER BY submition_date DESC 
                LIMIT 1
            `;
            const results = await query(sql, [userId]);

            if (results.length === 0) {
                return { hasRegistration: false, status: null };
            }

            const reg = results[0];
            return {
                hasRegistration: true,
                status: reg.registration_status,
                rejectionReason: reg.rejection_reason
            };
        } catch (error) {
            console.error('Error fetching volunteer status:', error);
            throw error;
        }
    },

    // Get details
    getRegistrationDetails: async (userId) => {
        try {
            const sql = `
                SELECT * FROM volunteer_registration 
                WHERE userID = ? 
                ORDER BY submition_date DESC 
                LIMIT 1
            `;
            const results = await query(sql, [userId]);
            if (results.length === 0) return null;
            return results[0];
        } catch (error) {
            console.error('Error fetching registration details:', error);
            throw error;
        }
    },

    // Get contributions history (Confirmed attendance)
    getContributions: async (userId) => {
        try {
            const sql = `
                SELECT 
                    er.recordID as contributionID, 
                    er.userID, 
                    er.eventID, 
                    ve.hours as hours_contributed, 
                    'Attended' as participation_status,
                    ve.title, 
                    ve.start_date as event_date, 
                    ve.description
                FROM event_records er
                JOIN volunteer_events ve ON er.eventID = ve.eventID
                WHERE er.userID = ? 
                AND COALESCE(ve.end_date, ve.start_date) < NOW() 
                AND er.status != 'No-show'
                ORDER BY ve.start_date DESC
            `;
            const results = await query(sql, [userId]);
            return results;
        } catch (error) {
            console.error('Error fetching contributions:', error);
            throw error;
        }
    }
};

module.exports = { VolunteerService };
