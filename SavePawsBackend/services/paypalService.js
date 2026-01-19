exports.createPayment = async (amount, description, donorEmail) => {
  try {
    console.log(`[SIMULATION] Processing PayPal payment of $${amount} for ${donorEmail}`);

    // Simulate a short network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return a mock success response that matches what donationController expects
    return {
      success: true,
      transactionId: `MOCK-PAYPAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      message: "Simulation successful"
    };
  } catch (error) {
    console.error("Simulation error:", error);
    return { success: false, message: "Payment simulation failed" };
  }
};
