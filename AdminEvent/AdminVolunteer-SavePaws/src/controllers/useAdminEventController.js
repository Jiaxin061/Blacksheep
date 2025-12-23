import { useCallback, useState } from 'react';
import { ApiService } from '../services/ApiService';

export const useAdminEventController = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await ApiService.get('/events');
            return results;
        } catch (err) {
            console.error(err);
            setError('Failed to fetch events');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createEvent = useCallback(async (eventData) => {
        setLoading(true);
        try {
            await ApiService.post('/admin/events', eventData);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateEvent = useCallback(async (id, eventData) => {
        setLoading(true);
        try {
            await ApiService.put(`/admin/events/${id}`, eventData);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteEvent = useCallback(async (id) => {
        try {
            setLoading(true);
            await ApiService.delete(`/admin/events/${id}`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        loading,
        error,
    };
};
