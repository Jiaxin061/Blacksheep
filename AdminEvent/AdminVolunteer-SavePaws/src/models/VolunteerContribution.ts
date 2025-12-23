export interface VolunteerContribution {
    contribution_id: number;
    user_id: number;
    event_id: number;
    title: string;
    description: string;
    hours_spent: number;
    contribution_date: string;
    // Joined fields from API
    eventTitle?: string;
    start_datetime?: string;
}
