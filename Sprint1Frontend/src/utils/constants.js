// API Configuration
export const API_BASE_URL = 'http://10.0.2.2:3000/api';
export const API_ENDPOINTS = {
  REPORTS: '/reports',
  REPORT_BY_ID: (id) => `/reports/${id}`,
  UPDATE_STATUS: (id) => `/reports/${id}/status`,
  DELETE_REPORT: (id) => `/reports/${id}`,
  STATS: '/reports/stats',
};

// Animal Types
export const ANIMAL_TYPES = [
  { label: 'Dog', value: 'dog' },
  { label: 'Cat', value: 'cat' },
  { label: 'Bird', value: 'bird' },
  { label: 'Rabbit', value: 'rabbit' },
  { label: 'Other', value: 'other' },
];

// Report Status
export const REPORT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending', color: '#FFA500' },
  { label: 'In Progress', value: 'in_progress', color: '#4169E1' },
  { label: 'Resolved', value: 'resolved', color: '#32CD32' },
  { label: 'Closed', value: 'closed', color: '#808080' },
];

// Colors
export const COLORS = {
  primary: '#4A90E2',
  secondary: '#50C878',
  danger: '#E74C3C',
  warning: '#F39C12',
  success: '#27AE60',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#777777',
  border: '#DDDDDD',
};

// Screen Names
export const SCREENS = {
  HOME: 'Home',
  REPORT_ANIMAL: 'ReportAnimal',
  VIEW_REPORTS: 'ViewReports',
  ADMIN_DASHBOARD: 'AdminDashboard',
  ADMIN_MANAGE: 'AdminManage',
};