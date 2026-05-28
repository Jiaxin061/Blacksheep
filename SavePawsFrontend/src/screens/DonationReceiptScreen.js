import React from 'react';
const DonationReceiptComponent = require('../app/donation-impact/receipt/[transactionID]').default;

const DonationReceiptScreen = (props) => {
  return <DonationReceiptComponent {...props} />;
};

export default DonationReceiptScreen;