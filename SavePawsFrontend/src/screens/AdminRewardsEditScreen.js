import React from 'react';

// Import the actual TypeScript component directly
const AdminRewardsEditComponent = require('../app/admin/rewards/edit/[rewardID]').default;

/**
 * Wrapper screen that uses the existing TypeScript component for editing rewards
 */
const AdminRewardsEditScreen = (props) => {
    return <AdminRewardsEditComponent {...props} />;
};

export default AdminRewardsEditScreen;
