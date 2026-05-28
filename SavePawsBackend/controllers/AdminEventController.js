const { query } = require('../config/database');

class AdminEventController {
    static async getEvents(req, res) {
        console.log('🎯 AdminEventController.getEvents called');
        try {
            console.log('📊 Executing query: SELECT * FROM volunteer_events');
            const results = await query('SELECT * FROM volunteer_events ORDER BY start_date DESC');
            console.log(`✅ Query successful, found ${results.length} events`);
            res.json(results);
        } catch (error) {
            console.error('❌ Error in getEvents:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
        }
    }

    static async createEvent(req, res) {
        try {
            const { title, description, start_date, end_date, location, max_volunteers, hours, image_url } = req.body;
            // Date validation
            if (new Date(end_date) < new Date(start_date)) {
                return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
            }
            // Schema columns: title, description, eventLocation, start_date, end_date, max_volunteers, adminID, image_url, hours
            await query(
                'INSERT INTO volunteer_events (title, description, eventLocation, start_date, end_date, max_volunteers, adminID, image_url, hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [title, description, location, start_date, end_date, max_volunteers, 1, image_url, hours] // Default adminID to 1
            );
            res.json({ success: true });
        } catch (error) {
            console.error('Error in createEvent:', error);
            res.status(500).json({ success: false, message: 'Failed to create event' });
        }
    }

    static async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const { title, description, start_date, end_date, location, max_volunteers, hours, image_url } = req.body;
            // Date validation
            if (new Date(end_date) < new Date(start_date)) {
                return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
            }
            await query(
                'UPDATE volunteer_events SET title=?, description=?, eventLocation=?, start_date=?, end_date=?, max_volunteers=?, image_url=?, hours=? WHERE eventID=?',
                [title, description, location, start_date, end_date, max_volunteers, image_url, hours, id]
            );
            res.json({ success: true });
        } catch (error) {
            console.error('Error in updateEvent:', error);
            res.status(500).json({ success: false, message: 'Failed to update event' });
        }
    }

    static async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            await query('DELETE FROM volunteer_events WHERE eventID=?', [id]);
            res.json({ success: true });
        } catch (error) {
            console.error('Error in deleteEvent:', error);
            res.status(500).json({ success: false, message: 'Failed to delete event' });
        }
    }
}

module.exports = AdminEventController;
