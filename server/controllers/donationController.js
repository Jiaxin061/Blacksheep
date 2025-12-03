const db = require("../config/database");
const paypalService = require("../services/paypalService");

exports.processDonation = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

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
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate donation amount
    const amount = parseFloat(donation_amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation amount",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donor_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if animal exists and is active
    const [animals] = await connection.query(
      "SELECT animalID, status, fundingGoal FROM animal_profile WHERE animalID = ?",
      [animalID]
    );

    if (animals.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    if (animals[0].status !== "Active") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Donations are not accepted for this animal",
      });
    }

    // Process PayPal payment
    const paymentResult = await paypalService.createPayment(
      amount,
      `Donation for ${animals[0].name || "Animal"}`,
      donor_email
    );

    if (!paymentResult.success) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: paymentResult.message || "Payment processing failed",
      });
    }

    // Insert donation transaction
    const [result] = await connection.query(
      `INSERT INTO donation_transaction 
        (userID, animalID, donation_amount, type, payment_processor_id, payment_status, donor_name, donor_email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        null, // userID is nullable for guest donations
        animalID,
        amount,
        type,
        paymentResult.transactionId,
        "Success",
        donor_name.trim(),
        donor_email.trim(),
      ]
    );

    const transactionID = result.insertId;

    // Update animal's amountRaised
    await connection.query(
      `UPDATE animal_profile 
       SET amountRaised = amountRaised + ? 
       WHERE animalID = ?`,
      [amount, animalID]
    );

    // Check if funding goal is reached
    const [updatedAnimal] = await connection.query(
      "SELECT amountRaised, fundingGoal FROM animal_profile WHERE animalID = ?",
      [animalID]
    );

    if (
      updatedAnimal[0].amountRaised >= updatedAnimal[0].fundingGoal
    ) {
      await connection.query(
        "UPDATE animal_profile SET status = 'Funded' WHERE animalID = ?",
        [animalID]
      );
    }

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: "Donation processed successfully",
      transactionID: transactionID,
      paymentID: paymentResult.transactionId,
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

