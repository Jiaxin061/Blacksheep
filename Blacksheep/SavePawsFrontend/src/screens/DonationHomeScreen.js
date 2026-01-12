import React from 'react';

// Import the actual TypeScript component directly
// Metro config will alias expo-router to our mock
const UserHomeComponent = require('../app/user-home').default;

/**
 * Wrapper screen that uses the existing TypeScript component
 * The mockExpoRouter.js will handle expo-router hooks
 */
const DonationHomeScreen = (props) => {
  return <UserHomeComponent {...props} />;
};

export default DonationHomeScreen;

