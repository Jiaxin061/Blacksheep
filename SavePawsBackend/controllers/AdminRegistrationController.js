const { query } = require('../config/database');

class AdminRegistrationController {
    static async getPendingRegistrations(req, res) {
        console.log('🎯 AdminRegistrationController.getPendingRegistrations called');
        try {
            console.log('📊 Executing query: SELECT * FROM volunteer_registration');
            const results = await query('SELECT * FROM volunteer_registration ORDER BY submition_date DESC');
            console.log(`✅ Query successful, found ${results.length} registrations`);
            res.json(results);
        } catch (error) {
            console.error('❌ Error in getPendingRegistrations:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch registrations', error: error.message });
        }
    }

    static async approveRegistration(req, res) {
        try {
            const { id } = req.params;
            const { adminID } = req.body;
            // Schema uses adminID and reviewed_date
            await query(
                "UPDATE volunteer_registration SET registration_status = 'Approved', adminID = ?, reviewed_date = NOW() WHERE registrationID = ?",
                [adminID || 1, id]
            );
            res.json({ success: true });
        } catch (error) {
            console.error('Error in approveRegistration:', error);
            res.status(500).json({ success: false, message: 'Failed to approve registration' });
        }
    }

    static async rejectRegistration(req, res) {
        try {
            const { id } = req.params;
            const { adminID, reason } = req.body;
            // Schema uses adminID and reviewed_date
            await query(
                "UPDATE volunteer_registration SET registration_status = 'Rejected', adminID = ?, reviewed_date = NOW(), rejection_reason = ? WHERE registrationID = ?",
                [adminID || 1, reason, id]
            );
            res.json({ success: true });
        } catch (error) {
            console.error('Error in rejectRegistration:', error);
            res.status(500).json({ success: false, message: 'Failed to reject registration' });
        }
    }
}

module.exports = AdminRegistrationController;
