// File: app/services/VolunteerService.js

// Using the same API_URL logic as CommunityService
// Android Emulator: 10.0.2.2
// iOS/Physical: Update manually
const API_URL = 'http://10.212.99.246:3000';

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
    }
};
