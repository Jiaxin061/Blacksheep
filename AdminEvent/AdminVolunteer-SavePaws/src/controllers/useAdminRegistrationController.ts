import { useState, useCallback } from 'react';
import { ApiService } from '../services/ApiService';
import { VolunteerRegistration } from '../models/VolunteerRegistration';

export const useAdminRegistrationController = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getPendingRegistrations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await ApiService.get('/admin/registrations');
            return results as VolunteerRegistration[];
        } catch (err) {
            console.error(err);
            setError('Failed to fetch registrations');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const approveRegistration = useCallback(async (id: number) => {
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

    const rejectRegistration = useCallback(async (id: number, reason: string) => {
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
