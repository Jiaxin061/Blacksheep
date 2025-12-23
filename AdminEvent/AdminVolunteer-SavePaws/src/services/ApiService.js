
// MOCK DATA STORE
let mockEvents = [
    {
        id: 101,
        title: 'Beach Cleanup',
        description: 'Join us to clear plastics and debris from the Coastal Reserve. Gloves and bags provided.',
        location: 'Coastal Reserve',
        start_date: '2024-12-20T09:00:00.000Z',
        end_date: '2024-12-20T12:00:00.000Z',
        max_volunteers: 50
    },
    {
        id: 102,
        title: 'Tree Planting',
        description: 'Help reforestation effort in the city. We aim to plant 500 saplings.',
        location: 'City Park',
        start_date: '2024-12-25T10:00:00.000Z',
        end_date: '2024-12-25T16:00:00.000Z',
        max_volunteers: 30
    },
    {
        id: 103,
        title: 'Animal Shelter Support',
        description: 'Assist in feeding and cleaning for the newly rescued animals.',
        location: 'SavePaws Shelter HQ',
        start_date: '2024-12-28T08:00:00.000Z',
        end_date: '2024-12-28T14:00:00.000Z',
        max_volunteers: 10
    },
    {
        id: 104,
        title: 'Fundraising Gala',
        description: 'Volunteers needed for ushering and ticket checking.',
        location: 'Grand Hall',
        start_date: '2025-01-05T18:00:00.000Z',
        end_date: '2025-01-05T22:00:00.000Z',
        max_volunteers: 15
    },
    {
        id: 105,
        title: 'Community Awareness Drive',
        description: 'Distribute flyers and educate the public about pet adoption.',
        location: 'Downtown Mall',
        start_date: '2025-01-10T11:00:00.000Z',
        end_date: '2025-01-10T17:00:00.000Z',
        max_volunteers: 20
    }
];

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class ApiService {
    static async get(endpoint) {
        console.log(`[MOCK] GET ${endpoint}`);
        await delay(500); // Simulate network latency

        if (endpoint === '/events') {
            return [...mockEvents]; // Return copy
        }

        // Add other mock endpoints here if needed
        return [];
    }

    static async post(endpoint, data) {
        console.log(`[MOCK] POST ${endpoint}`, data);
        await delay(500);

        if (endpoint === '/admin/events') {
            const newEvent = {
                ...data,
                id: Math.floor(Math.random() * 10000) + 1000 // Generate random ID
            };
            mockEvents.push(newEvent);
            return newEvent;
        }

        return data;
    }

    static async put(endpoint, data) {
        console.log(`[MOCK] PUT ${endpoint}`, data);
        await delay(500);

        if (endpoint.startsWith('/admin/events/')) {
            const id = parseInt(endpoint.split('/').pop(), 10);
            const index = mockEvents.findIndex(e => e.id === id);

            if (index !== -1) {
                mockEvents[index] = { ...mockEvents[index], ...data, id }; // Ensure ID persists
                return mockEvents[index];
            }
        }

        return data;
    }

    static async delete(endpoint) {
        console.log(`[MOCK] DELETE ${endpoint}`);
        await delay(500);

        if (endpoint.startsWith('/admin/events/')) {
            const id = parseInt(endpoint.split('/').pop(), 10);
            mockEvents = mockEvents.filter(e => e.id !== id);
            return true;
        }

        return true;
    }
}
