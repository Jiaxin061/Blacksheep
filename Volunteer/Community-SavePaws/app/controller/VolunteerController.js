// File: app/controller/VolunteerController.js
import { VolunteerService } from '../services/VolunteerService';

// This controller handles business logic for Volunteer Registration (UC07)
export const VolunteerController = {

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
    submitRegistration: async (userId, formData) => {
        // 1. Validate Input
        const validation = VolunteerController.validateRegistration(formData);
        if (!validation.isValid) {
            return { success: false, message: validation.message };
        }

        // 2. Prepare payload
        const payload = {
            userID: userId,
            userName: formData.userName,
            address: formData.address, // Maps to 'location' in DB
            experience: formData.experience,
            capability: formData.capability
        };

        // 3. Call Service
        try {
            return await VolunteerService.submitVolunteerRegistration(payload);
        } catch (error) {
            console.error('Controller Error:', error);
            return { success: false, message: 'An unexpected error occurred.' };
        }
    },

    // Check status for navigation logic
    checkVolunteerStatus: async (userId) => {
        try {
            const result = await VolunteerService.getVolunteerStatus(userId);
            // Result: { hasRegistration: boolean, status: 'Pending'|'Approved'|'Rejected', rejectionReason: string }
            return result;
        } catch (error) {
            console.error('Controller Status Check Error:', error);
            // Default to no registration on error to be safe, or handle UI error
            return { hasRegistration: false, status: null, error: true };
        }
    }
};
