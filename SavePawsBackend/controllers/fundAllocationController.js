const { getPool, query } = require("../config/database");


/**
 * Log admin activity
 */
const logActivity = async (adminID, actionType, entityType, entityID, description, oldValues, newValues) => {
  try {
    // Use the helper 'query' for single non-transactional logging
    await query(
      `INSERT INTO admin_activity_log 
        (adminID, actionType, entityType, entityID, description, oldValues, newValues)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        adminID,
        actionType,
        entityType,
        entityID,
        description,
        JSON.stringify(oldValues || {}),
        JSON.stringify(newValues || {}),
      ]
    );
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

/**
 * Validate allocation doesn't exceed donation amount
 */
const validateAllocation = async (connection, transactionID, amount, excludeAllocationID = null) => {
  // Use the active transaction 'connection'
  const [donations] = await connection.query(
    "SELECT donation_amount FROM donation_transaction WHERE transactionID = ? AND payment_status = 'Success' FOR UPDATE",
    [transactionID]
  );

  if (donations.length === 0) {
    return {
      valid: false,
      message: "Transaction not found or payment not successful",
    };
  }

  const donationAmount = parseFloat(donations[0].donation_amount);

  let sqlQuery = "SELECT COALESCE(SUM(amount), 0) AS total FROM fund_allocation WHERE transactionID = ?";
  const params = [transactionID];

  if (excludeAllocationID) {
    sqlQuery += " AND allocationID != ?";
    params.push(excludeAllocationID);
  }

  const [totals] = await connection.query(sqlQuery, params);
  const currentTotal = parseFloat(totals[0].total || 0);
  const remaining = donationAmount - currentTotal;

  if (amount > remaining) {
    return {
      valid: false,
      message: `Allocation amount exceeds remaining donation. Remaining: $${remaining.toFixed(2)}`,
      remaining: remaining,
    };
  }

  return { valid: true, remaining: remaining };
};

/**
 * Get all allocations with filters
 */
exports.getAllocations = async (req, res, next) => {
  try {
    const { animalID, transactionID, category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `
      SELECT 
        fa.allocationID, fa.transactionID, fa.animalID, fa.category, fa.amount,
        fa.description, fa.allocationDate, fa.createdAt, fa.updatedAt,
        ap.name AS animalName, dt.donation_amount, u.first_name AS donorName
      FROM fund_allocation fa
      INNER JOIN donation_transaction dt ON fa.transactionID = dt.transactionID
      INNER JOIN animal_profile ap ON fa.animalID = ap.animalID
      LEFT JOIN users u ON dt.userID = u.id
      WHERE 1=1
    `;
    const params = [];

    if (animalID) { sql += " AND fa.animalID = ?"; params.push(animalID); }
    if (transactionID) { sql += " AND fa.transactionID = ?"; params.push(transactionID); }
    if (category) { sql += " AND fa.category = ?"; params.push(category); }

    sql += " ORDER BY fa.allocationDate DESC, fa.createdAt DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const allocations = await query(sql, params);

    res.json({ success: true, data: { allocations } });
  } catch (error) {
    console.error("Error fetching allocations:", error);
    next({ status: 500, message: "Failed to fetch allocations" });
  }
};

/**
 * Get animals with active donations for allocation
 */
exports.getAllocationAnimals = async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT 
        ap.animalID, ap.name, ap.type, ap.photoURL, ap.fundingGoal, ap.amountRaised, ap.status,
        COALESCE(SUM(fa.amount), 0) AS totalAllocated
      FROM animal_profile ap
      LEFT JOIN fund_allocation fa ON fa.animalID = ap.animalID
      WHERE ap.status = 'Archived' AND ap.amountRaised > 0
      GROUP BY ap.animalID
      ORDER BY ap.updatedAt DESC`,
    );

    const data = rows.map((row) => ({
      ...row,
      fundingGoal: parseFloat(row.fundingGoal),
      amountRaised: parseFloat(row.amountRaised),
      totalAllocated: parseFloat(row.totalAllocated),
      remaining: parseFloat(row.amountRaised) - parseFloat(row.totalAllocated),
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching allocation animals:", error);
    next({ status: 500, message: "Failed to load allocation animals" });
  }
};

/**
 * Create fund allocation
 */
exports.createAllocation = async (req, res, next) => {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const { transactionID, animalID, category, amount, description, allocationDate } = req.body;
    const adminID = req.userID;

    const [animalCheck] = await connection.query(
      "SELECT status FROM animal_profile WHERE animalID = ?",
      [animalID]
    );

    if (!animalCheck.length || animalCheck[0].status !== "Archived") {
      throw { status: 400, message: "Fund allocation is only allowed for archived animals." };
    }

    const validation = await validateAllocation(connection, transactionID, amount);
    if (!validation.valid) throw { status: 409, message: validation.message };

    const [result] = await connection.query(
      `INSERT INTO fund_allocation
(animalID, category, amount, description, allocationDate, receiptImage, treatmentPhoto)
VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [animalID, category, amount, description || null, allocationDate, receiptPath, treatmentPath]
    );

    await logActivity(adminID, "CREATE_ALLOCATION", "fund_allocation", result.insertId, `Created allocation`, null, req.body);

    await connection.commit();
    res.status(201).json({ success: true, message: "Fund allocation created successfully" });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Create animal allocation with file upload
 */
exports.createAnimalAllocation = async (req, res, next) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const { animalID } = req.params;
    const { category, amount } = req.body;

    // Extract new fields from req.body with fallbacks
    const publicDescription = req.body.publicDescription || req.body.public_description || "";
    const internalNotes = req.body.internalNotes || req.body.internal_notes || "";
    const conditionUpdate = req.body.conditionUpdate || req.body.condition_update || "";
    const allocationType = req.body.allocation_type || req.body.allocationType || null;
    const serviceProvider = req.body.service_provider || req.body.serviceProvider || null;
    const status = req.body.status || 'Draft';

    // Financials - Support both snake_case (from FormData) and camelCase
    // FormData sends everything as strings, so we need to parse to numbers
    const donationCoveredAmount = parseFloat(req.body.donation_covered_amount || req.body.donationCoveredAmount) || 0;
    const externalCoveredAmount = parseFloat(req.body.external_covered_amount || req.body.externalCoveredAmount) || 0;
    const externalFundingSource = req.body.external_funding_source || req.body.externalFundingSource || null;
    const externalFundingNotes = req.body.external_funding_notes || req.body.externalFundingNotes || null;
    const fundingStatus = req.body.funding_status || req.body.fundingStatus || 'Fully Funded';

    // Debug logging
    console.log('💰 Funding Breakdown Fields:', {
      donationCoveredAmount,
      externalCoveredAmount,
      externalFundingSource,
      externalFundingNotes,
      fundingStatus,
      rawBody: {
        donation_covered_amount: req.body.donation_covered_amount,
        external_covered_amount: req.body.external_covered_amount,
        funding_status: req.body.funding_status
      }
    });

    // Use publicDescription as main description if not explicitly provided
    // (This keeps backward compatibility for 'description' column if needed)
    const description = req.body.description || publicDescription;

    // Optional transactionID if one is provided (default to NULL)
    const transactionID = req.body.transactionID ? parseInt(req.body.transactionID) : null;

    // 🔥 Multer-safe date extraction
    let allocationDate = req.body.allocationDate || req.body.allocation_date;

    if (!allocationDate) {
      allocationDate = new Date().toISOString().split("T")[0]; // fallback = today
    }

    const adminID = req.userID;

    const receiptPath = req.files?.receipt_image ? `/uploads/${req.files.receipt_image[0].filename}` : null;
    const treatmentPath = req.files?.treatment_photo ? `/uploads/${req.files.treatment_photo[0].filename}` : null;

    const [result] = await connection.query(
      `INSERT INTO fund_allocation 
        (transactionID, animalID, category, amount, description, allocationDate, receiptImage, treatmentPhoto,
         allocationType, serviceProvider, publicDescription, internalNotes, conditionUpdate, status,
         donationCoveredAmount, externalCoveredAmount, externalFundingSource, externalFundingNotes, fundingStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionID, animalID, category, amount, description, allocationDate, receiptPath, treatmentPath,
        allocationType, serviceProvider, publicDescription, internalNotes, conditionUpdate, status,
        donationCoveredAmount, externalCoveredAmount, externalFundingSource, externalFundingNotes, fundingStatus
      ]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: "Allocation created", data: { allocationID: result.insertId } });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get details of a single allocation
 */
exports.getAllocationDetail = async (req, res, next) => {
  try {
    const { allocationID } = req.params;

    const allocations = await query(
      `SELECT 
         fa.*, 
         ap.name AS animalName,
         ap.type AS animalType,
         ap.status AS animalStatus,
         ap.photoURL,
         u.first_name AS donorName
       FROM fund_allocation fa
       INNER JOIN animal_profile ap ON fa.animalID = ap.animalID
       LEFT JOIN donation_transaction dt ON fa.transactionID = dt.transactionID
       LEFT JOIN users u ON dt.userID = u.id
       WHERE fa.allocationID = ?`,
      [allocationID]
    );

    if (!allocations.length) {
      return res.status(404).json({ success: false, message: "Allocation not found" });
    }

    res.json({
      success: true,
      data: allocations[0],   // ✅ SEND THE RECORD
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Get allocation details for a specific animal
 */
exports.getAnimalAllocationDetails = async (req, res, next) => {
  try {
    const { animalID } = req.params;

    // 1️⃣ Get animal profile
    const animalRows = await query(
      `SELECT animalID, name, type, photoURL, fundingGoal, amountRaised, status
      FROM animal_profile
      WHERE animalID = ?`,
      [animalID]
    );

    if (!animalRows.length) {
      return res.status(404).json({ success: false, message: "Animal not found" });
    }

    const animal = {
      ...animalRows[0],
      fundingGoal: parseFloat(animalRows[0].fundingGoal),
      amountRaised: parseFloat(animalRows[0].amountRaised),
    };

    // 2️⃣ Get allocations
    const allocations = await query(
      `SELECT fa.*, u.first_name AS donorName
       FROM fund_allocation fa
       LEFT JOIN donation_transaction dt ON dt.transactionID = fa.transactionID
       LEFT JOIN users u ON dt.userID = u.id
       WHERE fa.animalID = ?
       ORDER BY fa.allocationDate DESC`,
      [animalID]
    );

    // 3️⃣ Calculate summary
    // Use donationCoveredAmount (not total amount) to calculate how much donation funds are allocated
    const totalDonationAllocated = allocations.reduce(
      (sum, a) => sum + parseFloat(a.donationCoveredAmount || 0),
      0
    );

    // Total cost allocated (for display purposes)
    const totalAllocated = allocations.reduce(
      (sum, a) => sum + parseFloat(a.amount || 0),
      0
    );

    const fundingGoal = parseFloat(animal.fundingGoal);
    const amountRaised = parseFloat(animal.amountRaised);
    // Remaining = donation funds raised - donation funds already allocated
    const remaining = amountRaised - totalDonationAllocated;

    res.json({
      success: true,
      data: {
        animal,
        summary: {
          totalAllocated,
          remaining,
          fundingGoal,
          amountRaised
        },
        allocations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update fund allocation
 */
exports.updateAllocation = async (req, res, next) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const { allocationID } = req.params;

    // Extract all fields - Support both snake_case (FormData) and camelCase (JSON)
    const amount = parseFloat(req.body.amount) || 0;
    const category = req.body.category;
    const allocationType = req.body.allocation_type || req.body.allocationType;
    const serviceProvider = req.body.service_provider || req.body.serviceProvider;
    const allocationDate = req.body.allocation_date || req.body.allocationDate;
    const status = req.body.status;
    const publicDescription = req.body.public_description || req.body.publicDescription;
    const internalNotes = req.body.internal_notes || req.body.internalNotes;
    const conditionUpdate = req.body.condition_update || req.body.conditionUpdate;
    const donationCoveredAmount = parseFloat(req.body.donation_covered_amount || req.body.donationCoveredAmount) || 0;
    const externalCoveredAmount = parseFloat(req.body.external_covered_amount || req.body.externalCoveredAmount) || 0;
    const externalFundingSource = req.body.external_funding_source || req.body.externalFundingSource;
    const externalFundingNotes = req.body.external_funding_notes || req.body.externalFundingNotes;
    const fundingStatus = req.body.funding_status || req.body.fundingStatus;

    // Also support 'description' map to publicDescription if not explicitly sent?
    const description = req.body.description || publicDescription;

    const adminID = req.userID;

    // Handle images if uploaded (req.files comes from multer)
    const receiptPath = req.files?.receipt_image ? `/uploads/${req.files.receipt_image[0].filename}` : null;
    const treatmentPath = req.files?.treatment_photo ? `/uploads/${req.files.treatment_photo[0].filename}` : null;

    const [existing] = await connection.query("SELECT * FROM fund_allocation WHERE allocationID = ?", [allocationID]);
    if (!existing.length) throw { status: 404, message: "Allocation not found" };

    // Construct Update Query
    let updateSql = `UPDATE fund_allocation SET 
        amount = ?, category = ?, allocationDate = ?, description = ?,
        allocationType = ?, serviceProvider = ?, status = ?,
        publicDescription = ?, internalNotes = ?, conditionUpdate = ?,
        donationCoveredAmount = ?, externalCoveredAmount = ?, 
        externalFundingSource = ?, externalFundingNotes = ?, fundingStatus = ?`;

    const params = [
      amount, category, allocationDate, description,
      allocationType, serviceProvider, status,
      publicDescription, internalNotes, conditionUpdate,
      donationCoveredAmount, externalCoveredAmount,
      externalFundingSource, externalFundingNotes, fundingStatus
    ];

    if (receiptPath) {
      updateSql += `, receiptImage = ?`;
      params.push(receiptPath);
    }
    if (treatmentPath) {
      updateSql += `, treatmentPhoto = ?`;
      params.push(treatmentPath);
    }

    updateSql += ` WHERE allocationID = ?`;
    params.push(allocationID);

    await connection.query(updateSql, params);

    await logActivity(adminID, "UPDATE_ALLOCATION", "fund_allocation", allocationID, `Updated allocation`, existing[0], req.body);
    await connection.commit();
    res.json({ success: true, message: "Fund allocation updated successfully" });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Delete fund allocation
 */
exports.deleteAllocation = async (req, res, next) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const { allocationID } = req.params;
    const adminID = req.userID;

    // 1. Get the record BEFORE deleting so we can log it
    const [existing] = await connection.query(
      "SELECT * FROM fund_allocation WHERE allocationID = ?",
      [allocationID]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Allocation not found" });
    }

    // 2. Perform the deletion
    await connection.query("DELETE FROM fund_allocation WHERE allocationID = ?", [allocationID]);

    // 3. Log the activity (Ensure JSON values are handled)
    await logActivity(
      adminID,
      "DELETE_ALLOCATION",
      "fund_allocation",
      allocationID,
      `Deleted RM${existing[0].amount} allocation`,
      existing[0], // Pass the old record as oldValues
      null         // newValues is null for delete
    );

    await connection.commit();
    res.json({ success: true, message: "Fund allocation deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Delete error details:", error); // Check terminal for the specific SQL error
    next(error);
  } finally {
    connection.release();
  }
};