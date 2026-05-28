const { VolunteerService } = require('../services/VolunteerService');

// This controller handles business logic for Volunteer Registration (UC07)
const VolunteerController = {

    // Validate registration form data
    validateRegistration: (formData) => {
        if (!formData.userName || formData.userName.trim() === '') {
            return { isValid: false, message: 'Full Name is required.' };
        }
        if (!formData.address || formData.address.trim() === '') {
            return { isValid: false, message: 'Address is required.' };
        }
        if (!formData.experience || formData.experience.trim() === '') {
            return { isValid: false, message: 'Experience details are required.' };
        }
        if (!formData.capability || formData.capability.trim() === '') {
            return { isValid: false, message: 'Skills/Capabilities are required.' };
        }
        return { isValid: true };
    },

    // Submit registration
    submitRegistration: async (req, res) => {
        try {
            const formData = req.body;
            // Assuming auth middleware attached user to req.user
            // Or passed in body if no auth middleware yet (simplification)
            const userId = req.body.userID || (req.user ? req.user.id : null);

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' });
            }

            // 1. Validate Input
            const validation = VolunteerController.validateRegistration(formData);
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            // 2. Prepare payload
            const payload = {
                userID: userId,
                userName: formData.userName,
                address: formData.address,
                experience: formData.experience,
                capability: formData.capability
            };

            // 3. Call Service
            const result = await VolunteerService.submitVolunteerRegistration(payload);

            if (!result.success) {
                return res.status(result.status || 500).json(result);
            }
            return res.status(201).json(result);

        } catch (error) {
            console.error('Controller Error:', error);
            return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
        }
    },

    // Check status
    checkVolunteerStatus: async (req, res) => {
        try {
            const userId = req.params.userId;
            const result = await VolunteerService.getVolunteerStatus(userId);
            return res.json(result);
        } catch (error) {
            console.error('Controller Status Check Error:', error);
            return res.status(500).json({ hasRegistration: false, status: null, error: true });
        }
    },

    // Get registration details
    getRegistrationDetails: async (req, res) => {
        try {
            const userId = req.params.userId;
            const result = await VolunteerService.getRegistrationDetails(userId);
            if (!result) return res.status(404).json({ message: 'Registration not found' });
            return res.json(result);
        } catch (error) {
            console.error('Controller Details Error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    },

    // Get contributions
    getContributions: async (req, res) => {
        try {
            const userId = req.params.userId;
            const result = await VolunteerService.getContributions(userId);
            return res.json(result);
        } catch (error) {
            console.error('Controller Contributions Error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    },

    // Get available events
    getAvailableEvents: async (req, res) => {
        try {
            const result = await VolunteerService.getAvailableEvents();
            return res.json(result);
        } catch (error) {
            console.error('Controller Events Error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    },

    // Get event details
    getEventDetails: async (req, res) => {
        try {
            const eventId = req.params.eventId;
            const result = await VolunteerService.getEventDetails(eventId);
            if (!result) return res.status(404).json({ message: 'Event not found' });
            return res.json(result);
        } catch (error) {
            console.error('Controller Event Detail Error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    },

    // Register for event
    registerForEvent: async (req, res) => {
        try {
            const { userID, eventID } = req.body;
            if (!userID || !eventID) {
                return res.status(400).json({ success: false, message: 'Missing userID or eventID' });
            }

            const result = await VolunteerService.registerForEvent(userID, eventID);

            if (!result.success) {
                return res.status(result.status || 500).json(result);
            }
            return res.json(result);
        } catch (error) {
            console.error('Controller Event Reg Error:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // Get user events
    getUserEvents: async (req, res) => {
        try {
            const userId = req.params.userId;
            const result = await VolunteerService.getUserEvents(userId);
            return res.json(result);
        } catch (error) {
            console.error('Controller User Events Error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = { VolunteerController };
