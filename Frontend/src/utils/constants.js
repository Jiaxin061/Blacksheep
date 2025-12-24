// ============================================
// SMART API CONFIGURATION
// Works for: Emulator, Simulator, Physical Device, Production
// ============================================

import { Platform } from 'react-native';

// 🌐 AUTO-DETECT CORRECT API URL
const getApiUrl = () => {
  if (__DEV__) {
    // DEVELOPMENT MODE
    if (Platform.OS === 'android') {
      // Android Emulator
      return 'http://10.0.2.2:3000/api';
    } else if (Platform.OS === 'ios') {
      // iOS Simulator
      return 'http://localhost:3000/api';
    } else {
      // Physical Device - TODO: Update this with your IP when needed
      return 'http://192.168.1.100:3000/api';
    }
  } else {
    // PRODUCTION MODE - TODO: Deploy backend and update this URL
    return 'https://api.savepaws.com/api';
  }
};

export const API_BASE_URL = getApiUrl();

// Log for debugging
console.log('🌐 API URL:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);

// API Endpoints
export const API_ENDPOINTS = {
  REPORTS: '/reports',
  RESCUE_TASKS: '/rescue-tasks',
  REPORT_BY_ID: (id) => `/reports/${id}`,
  RESCUE_TASK_BY_ID: (id) => `/rescue-tasks/${id}`,
  UPDATE_STATUS: (id) => `/reports/${id}/status`,
  DELETE_REPORT: (id) => `/reports/${id}`,
  APPROVE_RESCUE: (id) => `/reports/${id}/approve-rescue`,
  ACCEPT_TASK: (id) => `/rescue-tasks/${id}/accept`,
  STATS: '/reports/stats',
  UPLOAD: '/upload',
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  MYDIGITALID: '/auth/mydigitalid',
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
  ACTIVE: 'active',
  APPROVED: 'approved',
  CLOSED: 'closed', // closed = rejected
};

export const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending', color: '#FFA500' },
  { label: 'Active', value: 'active', color: '#4169E1' },
  { label: 'Approved', value: 'approved', color: '#14b8a6' },
  { label: 'Closed', value: 'closed', color: '#808080' }, // closed = rejected
];

// Urgency Levels
export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const URGENCY_OPTIONS = [
  { label: 'Low', value: 'low', color: '#10b981' },
  { label: 'Medium', value: 'medium', color: '#f2994a' },
  { label: 'High', value: 'high', color: '#f25f5c' },
  { label: 'Critical', value: 'critical', color: '#991b1b' },
];

// Colors (TEAL THEME)
export const COLORS = {
  primary: '#14b8a6',
  primaryHover: '#0d9488',
  primaryPressed: '#0f766e',
  primaryLight: '#f0fdfa',
  secondary: '#50C878',
  danger: '#E74C3C',
  warning: '#F39C12',
  success: '#27AE60',
  info: '#3b82f6',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#777777',
  textMuted: '#5b6b7c',
  border: '#DDDDDD',
  gray50: '#f9fafb',
  gray100: '#f1f5f9',
  gray200: '#e2e8ef',
  gray300: '#c2ceda',
};

// Screen Names
export const SCREENS = {
  HOME: 'Home',
  USER_LOGIN: 'UserLogin',
  ADMIN_LOGIN: 'AdminLogin',
  SIGNUP: 'Signup',
  USER_HOME: 'UserHome',
  REPORT_ANIMAL: 'ReportAnimal',
  VIEW_REPORTS: 'ViewReports',
  ACCEPT_RESCUE_TASK: 'AcceptRescueTask',
  ADMIN_DASHBOARD: 'AdminDashboard',
  ADMIN_MANAGE: 'AdminManage',
};