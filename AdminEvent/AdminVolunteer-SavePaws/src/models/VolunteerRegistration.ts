export interface VolunteerRegistration {
    registration_id: number;
    user_id: number;
    full_name: string;
    location: string;
    experience: string;
    capability: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_date: string;
}
