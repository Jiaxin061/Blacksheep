import React from 'react';
const RewardsDetailComponent = require('../app/rewards/[rewardID]').default;

const RewardsDetailScreen = (props) => <RewardsDetailComponent {...props} />;
export default RewardsDetailScreen;