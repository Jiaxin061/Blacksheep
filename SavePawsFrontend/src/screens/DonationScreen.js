import React from 'react';
// This imports the TSX component from the app folder
const DonationComponent = require('../app/donation').default;

const DonationScreen = (props) => {
  return <DonationComponent {...props} />;
};

export default DonationScreen;