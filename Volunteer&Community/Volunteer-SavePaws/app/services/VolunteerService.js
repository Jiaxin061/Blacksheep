// File: app/services/VolunteerService.js

// Using the same API_URL logic as CommunityService
// Android Emulator: 10.0.2.2
// iOS/Physical: Update manually
const API_URL = 'http://10.0.2.2:3000';

const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 15000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
};

export const VolunteerService = {

    // Fetch all available volunteer events
    getAvailableEvents: async () => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/events`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    // Get specific event details
    getEventDetails: async (eventId) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/events/${eventId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching event details:', error);
            throw error;
        }
    },

    // Register current user for an event
    registerForEvent: async (userId, eventId) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/events/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: userId, eventID: eventId })
            });

            if (response.status === 400) {
                // Already registered is a specific case we might want to handle gracefully
                return { success: false, message: 'Already registered' };
            }

            if (!response.ok) throw new Error('Failed to register');
            return { success: true, message: 'Registered successfully' };
        } catch (error) {
            console.error('Error registering for event:', error);
            throw error;
        }
    },

    // Get events the user has registered for (My Contributions)
    getUserEvents: async (userId) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/events/user/${userId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching user events:', error);
            throw error;
        }
    },

    // --- Volunteer Registration (UC07) ---

    // Submit new registration
    submitVolunteerRegistration: async (registrationData) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/volunteer/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData)
            });
            const data = await response.json();

            if (!response.ok) {
                // Return failure object instead of throwing for easier handling in controller
                return { success: false, message: data.message || 'Submission failed', status: data.status };
            }
            return { success: true, message: data.message, registrationID: data.registrationID };
        } catch (error) {
            console.error('Error submitting registration:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    },

    // Check status
    getVolunteerStatus: async (userId) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/volunteer/status/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch status');
            return await response.json();
        } catch (error) {
            console.error('Error fetching volunteer status:', error);
            throw error;
        }
    },

    // Get details
    getRegistrationDetails: async (userId) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/volunteer/registration/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch details');
            return await response.json();
        } catch (error) {
            console.error('Error fetching registration details:', error);
            throw error;
        }
    },

    // Get contributions history
    getContributions: async (userId) => {
        try {
            const response = await fetchWithTimeout(`${API_URL}/volunteer/contributions/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch contributions');
            return await response.json();
        } catch (error) {
            console.error('Error fetching contributions:', error);
            throw error;
        }
    }
};
