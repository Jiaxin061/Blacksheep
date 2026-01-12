import React from 'react';

// Import the actual TypeScript component directly
const AdminRewardsComponent = require('../app/admin/rewards/index').default;

/**
 * Wrapper screen that uses the existing TypeScript component
 */
const AdminRewardsScreen = (props) => {
  return <AdminRewardsComponent {...props} />;
};

export default AdminRewardsScreen;
