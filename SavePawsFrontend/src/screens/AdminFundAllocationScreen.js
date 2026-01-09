import React from 'react';

// Import the actual TypeScript component directly
const AdminFundAllocationComponent = require('../app/admin/fund-allocation/index').default;

/**
 * Wrapper screen that uses the existing TypeScript component
 */
const AdminFundAllocationScreen = (props) => {
  return <AdminFundAllocationComponent {...props} />;
};

export default AdminFundAllocationScreen;
