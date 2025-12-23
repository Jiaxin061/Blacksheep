export interface User {
    userID: number;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    account_status: 'Active' | 'Pending Verification' | 'Locked';
    registration_date: string; // ISO 8601
    is_volunteer: number; // 0 or 1 for SQLite boolean
    volunteer_badge?: string;
    volunteer_approval_date?: string;
}
