import React from 'react';

// Import the actual TypeScript component directly
const DonationImpactComponent = require('../app/donation-impact').default;

/**
 * Wrapper screen that uses the existing TypeScript component
 */
const DonationImpactScreen = (props) => {
  return <DonationImpactComponent {...props} />;
};

export default DonationImpactScreen;

