import React from 'react';
const DonationImpactDetailComponent = require('../app/donation-impact/[animalID]').default;

const DonationImpactDetailScreen = (props) => {
  return <DonationImpactDetailComponent {...props} />;
};

export default DonationImpactDetailScreen;