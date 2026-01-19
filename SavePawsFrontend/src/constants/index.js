// ==================== COLORS ====================
export const Colors = {
  // Primary Teal
  primary: '#14b8a6',
  primaryHover: '#0d9488',
  primaryPressed: '#0f766e',
  primaryLight: '#f0fdfa',
  primaryLighter: '#ccfbf1',
  primary50: '#f0fdfa',
  primary100: '#ccfbf1',
  primary600: '#0d9488',
  primary700: '#0f766e',

  // Accent Colors
  secondary: '#fbbf24',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // Grayscale
  text: '#111827',
  textMuted: '#5b6b7c',
  gray50: '#f9fafb',
  gray100: '#f1f5f9',
  gray200: '#e2e8ef',
  gray300: '#c2ceda',
  gray400: '#8ea0b4',
  gray500: '#6b7c8e',
  gray600: '#495a6b',
  gray700: '#2c3947',
  gray800: '#1c2530',
  gray900: '#0f1720',
  white: '#ffffff',
  black: '#000000',

  // Status Colors
  statusPending: '#f2994a',
  statusAssigned: '#0f766e',
  statusInProgress: '#0369a1',
  statusRescued: '#10b981',
  statusClosed: '#6b7c8e',

  // Urgency Colors
  urgencyLow: '#10b981',
  urgencyMedium: '#f2994a',
  urgencyHigh: '#f25f5c',
  urgencyCritical: '#991b1b',
};

// ==================== SPACING ====================
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ==================== FONT SIZES ====================
export const FontSizes = {
  xs: 12,
  sm: 13,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
};

// ==================== BORDER RADIUS ====================
export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  full: 999,
};

// ==================== SHADOWS ====================
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

// ==================== API CONFIG ====================
import { Platform } from 'react-native';

export const Config = {
  API_BASE_URL: Platform.select({
    android: 'http://10.0.2.2:3000/api',
    ios: 'http://localhost:3000/api',
    default: 'http://localhost:3000/api',
  }),

  API_TIMEOUT: 10000,
};

// ==================== STATUS OPTIONS ====================
export const ReportStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  APPROVED: 'approved',
  CLOSED: 'closed',
};

export const ReportStatusLabels = {
  pending: 'Pending',
  active: 'Active',
  approved: 'Approved',
  closed: 'Closed',
};

// ==================== URGENCY OPTIONS ====================
export const UrgencyLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const UrgencyLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

// ==================== ANIMAL TYPES ====================
export const AnimalTypes = {
  DOG: 'dog',
  CAT: 'cat',
  OTHER: 'other',
};

export const AnimalTypeLabels = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
};