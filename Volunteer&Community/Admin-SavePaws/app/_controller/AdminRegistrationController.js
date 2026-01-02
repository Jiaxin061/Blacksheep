import { useState, useCallback } from 'react';
import { ApiService } from '../_services/ApiService';

export const useAdminRegistrationController = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getPendingRegistrations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Updated to relative path
            const results = await ApiService.get('/admin/registrations');
            return results;
        } catch (err) {
            console.error(err);
            setError('Failed to fetch registrations');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const approveRegistration = useCallback(async (id) => {
        setLoading(true);
        try {
            await ApiService.post(`/admin/registrations/${id}/approve`, { adminID: 1 });
            return true;
        } catch (err) {
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const rejectRegistration = useCallback(async (id, reason) => {
        setLoading(true);
        try {
            await ApiService.post(`/admin/registrations/${id}/reject`, { adminID: 1, reason });
            return true;
        } catch (err) {
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getPendingRegistrations,
        approveRegistration,
        rejectRegistration,
        loading,
        error,
    };
};
