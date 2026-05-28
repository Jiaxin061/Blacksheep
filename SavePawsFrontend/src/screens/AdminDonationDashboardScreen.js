import React from 'react';

// Import the actual TypeScript component directly
// Metro config will alias expo-router to our mock
const DashboardComponent = require('../app/admin/dashboard').default;

/**
 * Wrapper screen that uses the existing TypeScript component
 * The mockExpoRouter.js will handle expo-router hooks
 */
const AdminDonationDashboardScreen = (props) => {
  return <DashboardComponent {...props} />;
};

export default AdminDonationDashboardScreen;

