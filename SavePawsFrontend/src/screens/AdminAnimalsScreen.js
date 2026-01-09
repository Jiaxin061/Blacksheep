import React from 'react';

// Import the actual TypeScript component directly
const AdminAnimalsComponent = require('../app/admin/animals').default;

/**
 * Wrapper screen that uses the existing TypeScript component
 */
const AdminAnimalsScreen = (props) => {
  return <AdminAnimalsComponent {...props} />;
};

export default AdminAnimalsScreen;

