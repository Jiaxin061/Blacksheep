// File: app/model/MockDataStore.js

// Initial Mock Data
const INITIAL_EVENTS = [
    {
        id: '1',
        title: 'Street Dog Feeding Drive',
        location: 'Skudai Town Area',
        time: '2:00 PM - 5:00 PM',
        description: 'Join us to feed stray dogs in the Skudai area. specific focus on industrial parks.',
        volunteers: 12,
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        tag: 'Tomorrow',
        tagColor: '#3B82F6', // Blue
        startDate: new Date(Date.now() + 86400000).toISOString(),
        isRegistered: true // Already registered mock
    },
    {
        id: '101', // From EventList
        title: 'Beach Cleanup',
        description: 'Clear plastics and debris from the Coastal Reserve. Lunch provided.',
        location: 'Coastal Reserve',
        time: 'Sat, 9:00 AM',
        volunteers: 20,
        image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        tag: 'This Weekend',
        tagColor: '#10B981',
        startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        isRegistered: false
    },
    {
        id: '102',
        title: 'Tree Planting',
        description: 'Help local reforestation effort at City Park. Bring your own gloves.',
        location: 'City Park',
        time: 'Sun, 8:00 AM',
        volunteers: 50,
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb77c35e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        tag: 'Next Week',
        tagColor: '#8B5CF6',
        startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
        isRegistered: false
    },
    {
        id: '2',
        title: 'Animal Shelter Cleanup',
        location: 'SavePaws Shelter, JB',
        time: 'Saturday, 9:00 AM - 1:00 PM',
        description: 'Weekly cleaning of the shelter cages and play areas.',
        volunteers: 8,
        image: 'https://images.unsplash.com/photo-1553545999-9742d48f6567?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        tag: 'This Week',
        tagColor: '#8B5CF6',
        startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        isRegistered: true
    }
];

// Simple in-memory store
let events = [...INITIAL_EVENTS];

export const MockDataStore = {
    getEvents: () => {
        return [...events];
    },

    getRegisteredEvents: () => {
        // Returns events where isRegistered is true
        return events.filter(e => e.isRegistered);
    },

    getEventById: (id) => {
        return events.find(e => e.id.toString() === id.toString());
    },

    registerForEvent: (id) => {
        const eventIndex = events.findIndex(e => e.id.toString() === id.toString());
        if (eventIndex !== -1) {
            events[eventIndex] = { ...events[eventIndex], isRegistered: true };
            return true;
        }
        return false;
    }
};
