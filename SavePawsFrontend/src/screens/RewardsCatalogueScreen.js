import React from 'react';

// Import the actual TypeScript component directly
const RewardsCatalogueComponent = require('../app/rewards/catalogue').default;

/**
 * Wrapper screen that uses the existing TypeScript component
 */
const RewardsCatalogueScreen = (props) => {
  return <RewardsCatalogueComponent {...props} />;
};

export default RewardsCatalogueScreen;

