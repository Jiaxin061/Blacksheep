const db = require("../config/database");
const paypalService = require("../services/paypalService");

exports.processDonation = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Get userID from auth middleware (required now)
    // authenticateUser middleware sets req.userId
    const userID = req.userId || req.userID || req.body.userID;

    if (!userID) {
      await connection.rollback();
      connection.release();
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide userID.",
      });
    }

    const { animalID, donation_amount, type, donor_name, donor_email } =
      req.body;

    // Validate required fields
    if (
      !animalID ||
      !donation_amount ||
      !type ||
      !donor_name ||
      !donor_email
    ) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate donation amount
    const requestedAmount = parseFloat(donation_amount);
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Invalid donation amount",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donor_email)) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if animal exists and is active
    // Use SELECT FOR UPDATE to lock the row for concurrent donation safety
    const [animals] = await connection.query(
      `SELECT animalID, name, status, fundingGoal, amountRaised 
       FROM animal_profile 
       WHERE animalID = ? 
       FOR UPDATE`,
      [animalID]
    );

    if (animals.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    const animal = animals[0];

    if (animal.status !== "Active") {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Donations for this animal are closed.",
      });
    }

    // Calculate remaining funding amount
    const fundingGoal = parseFloat(animal.fundingGoal) || 0;
    const amountRaised = parseFloat(animal.amountRaised) || 0;
    const remainingAmount = fundingGoal - amountRaised;

    // Check if funding goal is already reached
    if (remainingAmount <= 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "This animal has already reached its funding goal",
      });
    }

    // Cap donation amount to remaining amount if it exceeds
    let acceptedAmount = requestedAmount;
    let amountAdjusted = false;
    let adjustmentMessage = null;

    if (requestedAmount > remainingAmount) {
      acceptedAmount = remainingAmount;
      amountAdjusted = true;
      adjustmentMessage = `Donation capped to remaining required amount of $${remainingAmount.toFixed(2)}`;
    }

    // Process PayPal payment with the accepted (possibly capped) amount
    const paymentResult = await paypalService.createPayment(
      acceptedAmount,
      `Donation for ${animal.name || "Animal"}`,
      donor_email
    );

    if (!paymentResult.success) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: paymentResult.message || "Payment processing failed",
      });
    }

    // Insert donation transaction with the accepted amount
    // userID is now required (from authentication)
    const [result] = await connection.query(
      `INSERT INTO donation_transaction 
        (userID, animalID, donation_amount, type, payment_processor_id, payment_status, donor_name, donor_email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userID, // Now required from authentication
        animalID,
        acceptedAmount, // Use accepted amount, not requested
        type,
        paymentResult.transactionId,
        "Success",
        donor_name.trim(),
        donor_email.trim(),
      ]
    );

    const transactionID = result.insertId;

    // [NEW] Reward Point Ledger Entry (Earn Points)
    // Only for registered users (userID is not null)
    if (userID) {
      const pointsEarned = Math.floor(acceptedAmount * 1); // 1 Point per RM1
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 12); // 12 Months Validity

      await connection.query(
        `INSERT INTO reward_point_ledger 
         (userID, points, type, source, referenceID, expiryDate) 
         VALUES (?, ?, 'EARN', 'DONATION', ?, ?)`,
        [userID, pointsEarned, transactionID, expiryDate]
      );
    }

    // Update animal's amountRaised with the accepted amount
    await connection.query(
      `UPDATE animal_profile 
       SET amountRaised = amountRaised + ? 
       WHERE animalID = ?`,
      [acceptedAmount, animalID]
    );

    // Check if funding goal is reached after this donation
    const newAmountRaised = amountRaised + acceptedAmount;
    let statusUpdated = false;

    if (newAmountRaised >= fundingGoal) {
      await connection.query(
        "UPDATE animal_profile SET status = 'Funded' WHERE animalID = ?",
        [animalID]
      );
      statusUpdated = true;
    }

    await connection.commit();
    connection.release();

    // Build response message
    let successMessage = "Donation processed successfully";
    if (amountAdjusted) {
      successMessage += `. ${adjustmentMessage}`;
    }
    if (statusUpdated) {
      successMessage += " The funding goal has been reached!";
    }

    res.json({
      success: true,
      message: successMessage,
      transactionID: transactionID,
      paymentID: paymentResult.transactionId,
      donationAmount: acceptedAmount,
      requestedAmount: requestedAmount,
      amountAdjusted: amountAdjusted,
      adjustmentMessage: adjustmentMessage,
      fundingGoalReached: statusUpdated,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error processing donation:", error);
    next({
      status: 500,
      message: "Failed to process donation",
    });
  }
};

