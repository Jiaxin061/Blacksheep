<<<<<<< HEAD
const db = require("../config/database");
=======
const { getPool, query } = require("../config/database");

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0

/**
 * Log admin activity
 */
const logActivity = async (adminID, actionType, entityType, entityID, description, oldValues, newValues) => {
  try {
<<<<<<< HEAD
    await db.query(
=======
    // Use the helper 'query' for single non-transactional logging
    await query(
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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
<<<<<<< HEAD
    // Don't fail the request if logging fails
=======
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  }
};

/**
 * Validate allocation doesn't exceed donation amount
 */
const validateAllocation = async (connection, transactionID, amount, excludeAllocationID = null) => {
<<<<<<< HEAD
  // Get donation amount
=======
  // Use the active transaction 'connection'
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
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

<<<<<<< HEAD
  // Get current total allocated (excluding the one being updated if applicable)
  let query = "SELECT COALESCE(SUM(amount), 0) AS total FROM fund_allocation WHERE transactionID = ?";
  const params = [transactionID];

  if (excludeAllocationID) {
    query += " AND allocationID != ?";
    params.push(excludeAllocationID);
  }

  const [totals] = await connection.query(query, params);
=======
  let sqlQuery = "SELECT COALESCE(SUM(amount), 0) AS total FROM fund_allocation WHERE transactionID = ?";
  const params = [transactionID];

  if (excludeAllocationID) {
    sqlQuery += " AND allocationID != ?";
    params.push(excludeAllocationID);
  }

  const [totals] = await connection.query(sqlQuery, params);
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  const currentTotal = parseFloat(totals[0].total || 0);
  const remaining = donationAmount - currentTotal;

  if (amount > remaining) {
    return {
      valid: false,
      message: `Allocation amount exceeds remaining donation. Remaining: $${remaining.toFixed(2)}`,
      remaining: remaining,
    };
  }

<<<<<<< HEAD
  return {
    valid: true,
    remaining: remaining,
  };
};

/**
 * Get all allocations with filters (UC11)
=======
  return { valid: true, remaining: remaining };
};

/**
 * Get all allocations with filters
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
 */
exports.getAllocations = async (req, res, next) => {
  try {
    const { animalID, transactionID, category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

<<<<<<< HEAD
    let query = `
      SELECT 
        fa.allocationID,
        fa.transactionID,
        fa.animalID,
        fa.category,
        fa.amount,
        fa.description,
        fa.allocationDate,
        fa.createdAt,
        fa.updatedAt,
        ap.name AS animalName,
        dt.donation_amount,
        u.name AS donorName
      FROM fund_allocation fa
      INNER JOIN donation_transaction dt ON fa.transactionID = dt.transactionID
      INNER JOIN animal_profile ap ON fa.animalID = ap.animalID
      LEFT JOIN user u ON dt.userID = u.userID
=======
    let sql = `
      SELECT 
        fa.allocationID, fa.transactionID, fa.animalID, fa.category, fa.amount,
        fa.description, fa.allocationDate, fa.createdAt, fa.updatedAt,
        ap.name AS animalName, dt.donation_amount, u.first_name AS donorName
      FROM fund_allocation fa
      INNER JOIN donation_transaction dt ON fa.transactionID = dt.transactionID
      INNER JOIN animal_profile ap ON fa.animalID = ap.animalID
      LEFT JOIN users u ON dt.userID = u.id
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
      WHERE 1=1
    `;
    const params = [];

<<<<<<< HEAD
    if (animalID) {
      query += " AND fa.animalID = ?";
      params.push(animalID);
    }

    if (transactionID) {
      query += " AND fa.transactionID = ?";
      params.push(transactionID);
    }

    if (category) {
      query += " AND fa.category = ?";
      params.push(category);
    }

    query += " ORDER BY fa.allocationDate DESC, fa.createdAt DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [allocations] = await db.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) AS total FROM fund_allocation fa WHERE 1=1";
    const countParams = [];

    if (animalID) {
      countQuery += " AND fa.animalID = ?";
      countParams.push(animalID);
    }

    if (transactionID) {
      countQuery += " AND fa.transactionID = ?";
      countParams.push(transactionID);
    }

    if (category) {
      countQuery += " AND fa.category = ?";
      countParams.push(category);
    }

    const [counts] = await db.query(countQuery, countParams);
    const total = counts[0].total;

    // Get summary
    let summaryQuery = `
      SELECT 
        COALESCE(SUM(fa.amount), 0) AS totalAllocated,
        COUNT(DISTINCT dt.transactionID) AS totalDonations,
        COALESCE(SUM(dt.donation_amount), 0) AS totalDonationsAmount
      FROM fund_allocation fa
      INNER JOIN donation_transaction dt ON fa.transactionID = dt.transactionID
      WHERE 1=1
    `;
    const summaryParams = [];

    if (animalID) {
      summaryQuery += " AND fa.animalID = ?";
      summaryParams.push(animalID);
    }

    if (transactionID) {
      summaryQuery += " AND fa.transactionID = ?";
      summaryParams.push(transactionID);
    }

    const [summaries] = await db.query(summaryQuery, summaryParams);
    const summary = summaries[0];

    res.json({
      success: true,
      data: {
        allocations: allocations.map((a) => ({
          allocationID: a.allocationID,
          transactionID: a.transactionID,
          animalID: a.animalID,
          animalName: a.animalName,
          donorName: a.donorName,
          donationAmount: parseFloat(a.donation_amount),
          category: a.category,
          amount: parseFloat(a.amount),
          description: a.description,
          allocationDate: a.allocationDate,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
        summary: {
          totalAllocated: parseFloat(summary.totalAllocated),
          totalDonations: summary.totalDonations,
          totalDonationsAmount: parseFloat(summary.totalDonationsAmount),
          unallocatedAmount:
            parseFloat(summary.totalDonationsAmount) -
            parseFloat(summary.totalAllocated),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching allocations:", error);
    next({
      status: 500,
      message: "Failed to fetch allocations",
    });
=======
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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  }
};

/**
<<<<<<< HEAD
 * Create fund allocation (UC11)
 */
exports.createAllocation = async (req, res, next) => {
  const connection = await db.getConnection();
=======
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

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  try {
    await connection.beginTransaction();

    const { transactionID, animalID, category, amount, description, allocationDate } = req.body;
    const adminID = req.userID;

<<<<<<< HEAD
    // Validate required fields
    if (!transactionID || !animalID || !category || !amount || !allocationDate) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Missing required fields: transactionID, animalID, category, amount, allocationDate",
      });
    }

    // Validate category
    const validCategories = ["Vet", "Medication", "Food", "Shelter", "Other"];
    if (!validCategories.includes(category)) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
      });
    }

    // Validate amount
    const allocationAmount = parseFloat(amount);
    if (isNaN(allocationAmount) || allocationAmount <= 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Check animal status - MUST be Archived
=======
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    const [animalCheck] = await connection.query(
      "SELECT status FROM animal_profile WHERE animalID = ?",
      [animalID]
    );

<<<<<<< HEAD
    if (animalCheck.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    if (animalCheck[0].status !== "Archived") {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Fund allocation is only allowed for archived animals.",
      });
    }

    // Validate allocation doesn't exceed donation
    const validation = await validateAllocation(connection, transactionID, allocationAmount);
    if (!validation.valid) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({
        success: false,
        message: validation.message,
        remaining: validation.remaining,
      });
    }

    // Insert allocation
    const [result] = await connection.query(
      `INSERT INTO fund_allocation 
        (transactionID, animalID, category, amount, description, allocationDate)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [transactionID, animalID, category, allocationAmount, description || null, allocationDate]
    );

    const allocationID = result.insertId;

    // Log activity
    await logActivity(
      adminID,
      "CREATE_ALLOCATION",
      "fund_allocation",
      allocationID,
      `Created allocation of $${allocationAmount} for category ${category}`,
      null,
      { transactionID, animalID, category, amount: allocationAmount, description, allocationDate }
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      success: true,
      message: "Fund allocation created successfully",
      data: {
        allocationID: allocationID,
        transactionID: transactionID,
        animalID: animalID,
        category: category,
        amount: allocationAmount,
        description: description,
        allocationDate: allocationDate,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error creating allocation:", error);
    next({
      status: 500,
      message: "Failed to create fund allocation",
    });
=======
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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  }
};

/**
<<<<<<< HEAD
 * Update fund allocation (UC11)
 */
exports.updateAllocation = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { allocationID } = req.params;
    // Extract text fields
    const {
      transactionID,
      animalID,
      category,
      amount,
      description,
      allocationDate,
      // Enhanced fields
      allocationType,
      serviceProvider,
      status,
      totalCost,
=======
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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
      donationCoveredAmount,
      externalCoveredAmount,
      externalFundingSource,
      externalFundingNotes,
      fundingStatus,
<<<<<<< HEAD
      publicDescription,
      internalNotes,
      conditionUpdate
    } = req.body;

    const adminID = req.userID;

    // Get existing allocation
    const [existing] = await connection.query(
      "SELECT * FROM fund_allocation WHERE allocationID = ?",
      [allocationID]
    );

    if (existing.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Allocation not found",
      });
    }

    // Check animal status - MUST be Archived to update
    const [animalCheck] = await connection.query(
      "SELECT status FROM animal_profile WHERE animalID = ?",
      [existing[0].animalID]
    );

    if (animalCheck.length > 0 && animalCheck[0].status !== "Archived") {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Fund allocation can only be modified for archived animals.",
      });
    }

    const oldValues = { ...existing[0] };

    // --- 1. Handle Metadata Logic (Same as Create) ---
    // If we are updating simple fields, we need to preserve or update the metadata JSON
    let currentDescription = description || existing[0].description;
    let metadata = {};

    // Extract existing metadata if it exists
    if (currentDescription && currentDescription.includes('[METADATA:')) {
      try {
        const match = currentDescription.match(/\[METADATA:(.+?)\]/);
        if (match) metadata = JSON.parse(match[1]);
      } catch (e) { }
    }

    // Update metadata fields if provided
    if (totalCost) metadata.totalCost = parseFloat(totalCost);
    if (donationCoveredAmount) metadata.donationCovered = parseFloat(donationCoveredAmount);
    if (externalCoveredAmount) metadata.externalCovered = parseFloat(externalCoveredAmount);
    if (externalFundingSource !== undefined) metadata.externalFundingSource = externalFundingSource;
    if (externalFundingNotes !== undefined) metadata.externalFundingNotes = externalFundingNotes;
    if (fundingStatus) metadata.fundingStatus = fundingStatus;
    if (allocationType) metadata.allocationType = allocationType;
    if (serviceProvider) metadata.serviceProvider = serviceProvider;
    if (status) metadata.status = status;
    if (publicDescription !== undefined) metadata.publicDescription = publicDescription;
    if (internalNotes !== undefined) metadata.internalNotes = internalNotes;
    if (conditionUpdate !== undefined) metadata.conditionUpdate = conditionUpdate;

    // Reconstruct description string
    let cleanDesc = publicDescription || metadata.publicDescription || "";
    // If 'description' was passed explicitly (legacy), use it as base, otherwise keep existing
    if (description) cleanDesc = description;

    const metadataStr = `[METADATA:${JSON.stringify(metadata)}]`;
    const newDescriptionValue = `${cleanDesc}\n${metadataStr}`;

    // --- 2. Build SQL Update ---
    const updateFields = [];
    const updateValues = [];

    // Helper to push updates
    const addUpdate = (field, value) => {
      if (value !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(value);
      }
    };

    addUpdate("transactionID", transactionID);
    addUpdate("animalID", animalID);
    addUpdate("category", category);

    // 'amount' column stores the donation deduction portion
    if (donationCoveredAmount) {
      addUpdate("amount", parseFloat(donationCoveredAmount));
    } else if (amount) {
      addUpdate("amount", parseFloat(amount));
    }

    addUpdate("description", newDescriptionValue);
    addUpdate("allocationDate", allocationDate);

    // --- 3. Handle Image Updates ---
    if (req.files?.receipt_image) {
      const receiptPath = `/uploads/${req.files.receipt_image[0].filename}`;
      updateFields.push("receiptImage = ?");
      updateValues.push(receiptPath);
    }

    if (req.files?.treatment_photo) {
      const treatmentPath = `/uploads/${req.files.treatment_photo[0].filename}`;
      updateFields.push("treatmentPhoto = ?");
      updateValues.push(treatmentPath);
    }

    if (updateFields.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    updateValues.push(allocationID);

    await connection.query(
      `UPDATE fund_allocation SET ${updateFields.join(", ")} WHERE allocationID = ?`,
      updateValues
    );

    // Get updated values
    const [updated] = await connection.query(
      "SELECT * FROM fund_allocation WHERE allocationID = ?",
      [allocationID]
    );

    await logActivity(
      adminID,
      "UPDATE_ALLOCATION",
      "fund_allocation",
      allocationID,
      `Updated allocation ${allocationID}`,
      oldValues,
      updated[0]
    );

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: "Fund allocation updated successfully",
      data: updated[0],
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error updating allocation:", error);
    next({
      status: 500,
      message: "Failed to update fund allocation",
    });
  }
};

/**
 * Delete fund allocation (UC11)
 */
exports.deleteAllocation = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { allocationID } = req.params;
    const adminID = req.userID;

    // Get existing allocation
    const [existing] = await connection.query(
      "SELECT * FROM fund_allocation WHERE allocationID = ?",
      [allocationID]
    );

    if (existing.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Allocation not found",
      });
    }

    const oldValues = { ...existing[0] };

    // Delete allocation
    await connection.query("DELETE FROM fund_allocation WHERE allocationID = ?", [allocationID]);

    // Log activity
    await logActivity(
      adminID,
      "DELETE_ALLOCATION",
      "fund_allocation",
      allocationID,
      `Deleted allocation ${allocationID}`,
      oldValues,
      null
    );

    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: "Fund allocation deleted successfully",
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error deleting allocation:", error);
    next({
      status: 500,
      message: "Failed to delete fund allocation",
    });
  }
};

/**
 * Get animals with active donations (for fund allocation landing)
 */
exports.getAllocationAnimals = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        ap.animalID,
        ap.name,
        ap.type,
        ap.photoURL,
        ap.fundingGoal,
        ap.amountRaised,
        ap.status,
        COALESCE(SUM(fa.amount), 0) AS totalAllocated
      FROM animal_profile ap
      LEFT JOIN fund_allocation fa ON fa.animalID = ap.animalID
      WHERE ap.status = 'Archived' AND ap.amountRaised > 0
      GROUP BY ap.animalID
      ORDER BY ap.updatedAt DESC, ap.name ASC
      `,
    );

    const data = rows.map((row) => {
      const amountRaised = parseFloat(row.amountRaised || 0);
      const totalAllocated = parseFloat(row.totalAllocated || 0);
      return {
        animalID: row.animalID,
        name: row.name,
        type: row.type,
        photoURL: row.photoURL,
        fundingGoal: parseFloat(row.fundingGoal || 0),
        amountRaised,
        totalAllocated,
        remaining: amountRaised - totalAllocated,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching allocation animals:", error);
    next({ status: 500, message: "Failed to load allocation animals" });
=======
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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  }
};

/**
 * Get details of a single allocation
 */
exports.getAllocationDetail = async (req, res, next) => {
  try {
    const { allocationID } = req.params;

<<<<<<< HEAD
    const [allocations] = await db.query(
      `
      SELECT 
        fa.*,
        ap.name AS animalName,
        ap.type AS animalType,
        ap.status AS animalStatus,
        u.name AS donorName
      FROM fund_allocation fa
      INNER JOIN animal_profile ap ON fa.animalID = ap.animalID
      LEFT JOIN donation_transaction dt ON fa.transactionID = dt.transactionID
      LEFT JOIN user u ON dt.userID = u.userID
      WHERE fa.allocationID = ?
      `,
      [allocationID]
    );

    if (allocations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Allocation not found",
      });
    }

    const a = allocations[0];

    // Parse metadata
    let metadata = {};
    let cleanDescription = a.description;

    if (a.description && a.description.includes('[METADATA:')) {
      try {
        const parts = a.description.split('[METADATA:');
        if (parts.length > 1) {
          const lastBracketIndex = parts[1].lastIndexOf(']');
          const validJsonStr = parts[1].substring(0, lastBracketIndex);
          metadata = JSON.parse(validJsonStr);
          cleanDescription = parts[0].trim();
        }
      } catch (e) {
        console.error('Error parsing allocation metadata', e);
      }
    }

    // Combine db fields with metadata
    const enhancedAllocation = {
      allocationID: a.allocationID,
      animalID: a.animalID,
      animal: {
        name: a.animalName,
        type: a.animalType,
        status: a.animalStatus
      },
      category: a.category,
      amount: parseFloat(a.amount), // Donation deduction
      transactionID: a.transactionID,
      allocationDate: a.allocationDate,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      donorName: a.donorName,
      // Metadata fields
      totalCost: metadata.totalCost ? parseFloat(metadata.totalCost) : parseFloat(a.amount),
      donationCoveredAmount: metadata.donationCovered ? parseFloat(metadata.donationCovered) : parseFloat(a.amount),
      externalCoveredAmount: metadata.externalCovered ? parseFloat(metadata.externalCovered) : 0,
      externalFundingSource: metadata.externalFundingSource,
      externalFundingNotes: metadata.externalFundingNotes,
      fundingStatus: metadata.fundingStatus,
      allocationType: metadata.allocationType,
      serviceProvider: metadata.serviceProvider,
      status: metadata.status || 'Draft',
      publicDescription: metadata.publicDescription,
      internalNotes: metadata.internalNotes,
      conditionUpdate: metadata.conditionUpdate,
      conditionUpdate: metadata.conditionUpdate,
      description: cleanDescription,
      receiptImage: a.receiptImage,
      treatmentPhoto: a.treatmentPhoto,
    };

    res.json({
      success: true,
      data: enhancedAllocation,
    });

  } catch (error) {
    console.error("Error fetching allocation detail:", error);
    next({ status: 500, message: "Failed to fetch allocation detail" });
  }
};

=======
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


>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
/**
 * Get allocation details for a specific animal
 */
exports.getAnimalAllocationDetails = async (req, res, next) => {
  try {
    const { animalID } = req.params;

<<<<<<< HEAD
    const [animals] = await db.query(
      `SELECT animalID, name, type, photoURL, fundingGoal, amountRaised, status 
       FROM animal_profile WHERE animalID = ?`,
      [animalID],
    );

    if (animals.length === 0) {
      return next({ status: 404, message: "Animal not found" });
    }

    const animal = animals[0];

    const [summaryRows] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalAllocated 
       FROM fund_allocation WHERE animalID = ?`,
      [animalID],
    );
    const totalAllocated = parseFloat(summaryRows[0].totalAllocated || 0);
    const amountRaised = parseFloat(animal.amountRaised || 0);
    const remaining = amountRaised - totalAllocated;

    const [allocations] = await db.query(
      `
      SELECT 
        fa.allocationID,
        fa.category,
        fa.amount,
        fa.description,
        fa.allocationDate,
        fa.transactionID,
        u.name AS donorName
      FROM fund_allocation fa
      LEFT JOIN donation_transaction dt ON dt.transactionID = fa.transactionID
      LEFT JOIN user u ON dt.userID = u.userID
      WHERE fa.animalID = ?
      ORDER BY fa.allocationDate DESC, fa.createdAt DESC
      `,
      [animalID],
    );

    res.json({
      success: true,
      data: {
        animal: {
          ...animal,
          fundingGoal: parseFloat(animal.fundingGoal || 0),
          amountRaised,
        },
        summary: {
          fundingGoal: parseFloat(animal.fundingGoal || 0),
          amountRaised,
          totalAllocated,
          remaining,
        },
        allocations: allocations.map((a) => {
          // Parse metadata from description if present
          let metadata = {};
          let cleanDescription = a.description;

          if (a.description && a.description.includes('[METADATA:')) {
            try {
              const parts = a.description.split('[METADATA:');
              if (parts.length > 1) {
                const jsonStr = parts[1].replace(']', ''); // Simple extraction
                // Better extraction if nested brackets exist:
                const lastBracketIndex = parts[1].lastIndexOf(']');
                const validJsonStr = parts[1].substring(0, lastBracketIndex);

                metadata = JSON.parse(validJsonStr);
                cleanDescription = parts[0].trim();
              }
            } catch (e) {
              console.error('Error parsing allocation metadata', e);
            }
          }

          return {
            allocationID: a.allocationID,
            category: a.category,
            amount: parseFloat(a.amount), // This is the donation deduction
            totalCost: metadata.totalCost ? parseFloat(metadata.totalCost) : parseFloat(a.amount),
            donationCoveredAmount: metadata.donationCovered ? parseFloat(metadata.donationCovered) : parseFloat(a.amount),
            externalCoveredAmount: metadata.externalCovered ? parseFloat(metadata.externalCovered) : 0,
            externalFundingSource: metadata.externalFundingSource,
            fundingStatus: metadata.fundingStatus,
            allocationType: metadata.allocationType,
            status: metadata.status,
            hasEvidence: false, // Placeholder since we don't have this column yet
            description: cleanDescription, // Show clean description to user
            publicDescription: metadata.publicDescription,
            allocationDate: a.allocationDate,
            donorName: a.donorName,
            transactionID: a.transactionID,
          }
        }),
      },
    });
  } catch (error) {
    console.error("Error fetching animal allocation details:", error);
    next({ status: 500, message: "Failed to load allocation details" });
=======
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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  }
};

/**
<<<<<<< HEAD
 * Create allocation for a specific animal (auto-selects a donation with remaining funds)
 */
exports.createAnimalAllocation = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { animalID } = req.params;

    // Debug: Log what we receive
    console.log("Received body:", req.body);
    console.log("Received files:", req.files);

    // Accept both camelCase and snake_case formats (frontend sends snake_case in FormData)
    const {
      category,
      amount,
      totalCost, // camelCase
      total_cost, // snake_case (from FormData)
      donationCoveredAmount, // camelCase
      donation_covered_amount, // snake_case
      externalCoveredAmount, // camelCase
      external_covered_amount, // snake_case
      externalFundingSource, // camelCase
      external_funding_source, // snake_case
      externalFundingNotes, // camelCase
      external_funding_notes, // snake_case
      fundingStatus, // camelCase
      funding_status, // snake_case
      allocationType, // camelCase
      allocation_type, // snake_case
      serviceProvider, // camelCase
      service_provider, // snake_case
      allocationDate, // camelCase
      allocation_date, // snake_case
      status,
      publicDescription, // camelCase
      public_description, // snake_case
      internalNotes, // camelCase
      internal_notes, // snake_case
      conditionUpdate, // camelCase
      condition_update, // snake_case
      description, // Legacy field
    } = req.body;

    // Normalize to camelCase (use snake_case if camelCase not provided)
    // Handle empty strings by converting to null/undefined
    const normalizeValue = (val) => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === 'string' && val.trim() === '') return undefined;
      return val;
    };

    const normalized = {
      category: normalizeValue(category),
      amount: normalizeValue(amount) || normalizeValue(totalCost) || normalizeValue(total_cost),
      totalCost: normalizeValue(totalCost) || normalizeValue(total_cost) || normalizeValue(amount),
      donationCoveredAmount: normalizeValue(donationCoveredAmount) || normalizeValue(donation_covered_amount),
      externalCoveredAmount: normalizeValue(externalCoveredAmount) || normalizeValue(external_covered_amount),
      externalFundingSource: normalizeValue(externalFundingSource) || normalizeValue(external_funding_source),
      externalFundingNotes: normalizeValue(externalFundingNotes) || normalizeValue(external_funding_notes),
      fundingStatus: normalizeValue(fundingStatus) || normalizeValue(funding_status),
      allocationType: normalizeValue(allocationType) || normalizeValue(allocation_type),
      serviceProvider: normalizeValue(serviceProvider) || normalizeValue(service_provider),
      allocationDate: normalizeValue(allocationDate) || normalizeValue(allocation_date),
      status: normalizeValue(status),
      publicDescription: normalizeValue(publicDescription) || normalizeValue(public_description),
      internalNotes: normalizeValue(internalNotes) || normalizeValue(internal_notes),
      conditionUpdate: normalizeValue(conditionUpdate) || normalizeValue(condition_update),
      description: normalizeValue(description),
    };
    const adminID = req.userID;

    // Debug: Log normalized values
    console.log("Normalized values:", normalized);

    if (!normalized.category || !normalized.amount) {
      await connection.rollback();
      connection.release();
      console.error("Validation failed - category:", normalized.category, "amount:", normalized.amount);
      return res.status(400).json({
        success: false,
        message: `Category and amount/totalCost are required. Received: category=${normalized.category || 'undefined'}, amount=${normalized.amount || 'undefined'}`,
      });
    }

    // Use totalCost if provided, otherwise fall back to amount
    const allocationAmount = parseFloat(normalized.totalCost || normalized.amount);
    if (isNaN(allocationAmount) || allocationAmount <= 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const validCategories = ["Vet", "Medication", "Food", "Shelter", "Other"];
    if (!validCategories.includes(normalized.category)) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
      });
    }

    // Lock animal row
    const [animalRows] = await connection.query(
      `SELECT animalID, amountRaised, fundingGoal, status 
       FROM animal_profile WHERE animalID = ? FOR UPDATE`,
      [animalID],
    );
    if (animalRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: "Animal not found" });
    }
    const animal = animalRows[0];

    // Current allocation totals
    const [allocationTotals] = await connection.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalAllocated 
       FROM fund_allocation WHERE animalID = ? FOR UPDATE`,
      [animalID],
    );
    const totalAllocated = parseFloat(allocationTotals[0].totalAllocated || 0);
    const amountRaised = parseFloat(animal.amountRaised || 0);
    const remaining = amountRaised - totalAllocated;

    // Calculate funding breakdown
    // If totalCost exceeds remaining, calculate how much is covered by donations
    const donationCovered = normalized.donationCoveredAmount !== undefined && normalized.donationCoveredAmount !== null
      ? parseFloat(normalized.donationCoveredAmount)
      : Math.min(allocationAmount, Math.max(0, remaining));

    const externalCovered = normalized.externalCoveredAmount !== undefined && normalized.externalCoveredAmount !== null
      ? parseFloat(normalized.externalCoveredAmount)
      : Math.max(0, allocationAmount - donationCovered);

    // Verify aggregate limit
    if (donationCovered > remaining + 0.01) { // 0.01 tolerance for float math
      await connection.rollback();
      connection.release();
      return res.status(409).json({
        success: false,
        message: `Donation portion (RM${donationCovered.toFixed(2)}) exceeds remaining funds (RM${remaining.toFixed(2)}).`,
      });
    }

    // Find a transaction to link (Best Effort)
    let selected = null;
    let transactions = [];

    if (donationCovered > 0) {
      const [rows] = await connection.query(
        `
        SELECT 
          dt.transactionID,
          dt.donation_amount,
          COALESCE(SUM(fa.amount), 0) AS allocated
        FROM donation_transaction dt
        LEFT JOIN fund_allocation fa ON fa.transactionID = dt.transactionID
        WHERE dt.animalID = ? AND dt.payment_status = 'Success'
        GROUP BY dt.transactionID
        ORDER BY dt.transaction_date ASC
        `,
        [animalID],
      );

      transactions = rows.map((d) => ({
        transactionID: d.transactionID,
        remaining: parseFloat(d.donation_amount || 0) - parseFloat(d.allocated || 0),
      }));

      // Strategy 1: Find one that covers it entirely
      selected = transactions.find((d) => d.remaining >= donationCovered);

      // Strategy 2: If distinct transaction shortage, pick the one with largest remaining
      if (!selected && transactions.length > 0) {
        transactions.sort((a, b) => b.remaining - a.remaining);
        selected = transactions[0];
      }
    } else {
      // Purely external, just pick first for linkage (or leave null if permissible, but we'll link to first)
      const [rows] = await connection.query(
        `SELECT transactionID FROM donation_transaction 
         WHERE animalID = ? AND payment_status = 'Success' 
         ORDER BY transaction_date ASC LIMIT 1`,
        [animalID],
      );
      if (rows.length > 0) {
        selected = { transactionID: rows[0].transactionID };
      }
    }

    // If still no transaction and we need donation coverage
    if (!selected && donationCovered > 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({
        success: false,
        message: "No valid donation transactions found to link this allocation.",
      });
    }

    const allocationDateValue = normalized.allocationDate || new Date().toISOString().split('T')[0];

    // Build description with metadata
    let descriptionValue = normalized.publicDescription || normalized.description || null;

    const metadata = {
      totalCost: allocationAmount,
      donationCovered,
      externalCovered,
      externalFundingSource: normalized.externalFundingSource || null,
      externalFundingNotes: normalized.externalFundingNotes || null,
      fundingStatus: normalized.fundingStatus || (externalCovered > 0 ? 'Partially Funded' : 'Fully Funded'),
      allocationType: normalized.allocationType || null,
      serviceProvider: normalized.serviceProvider || null,
      status: normalized.status || 'Draft',
      publicDescription: normalized.publicDescription || null,
      internalNotes: normalized.internalNotes || null,
      conditionUpdate: normalized.conditionUpdate || null,
    };

    const metadataStr = `[METADATA:${JSON.stringify(metadata)}]`;
    descriptionValue = descriptionValue
      ? `${descriptionValue}\n${metadataStr}`
      : metadataStr;

    // 1. EXTRACT FILE PATHS
    // Multer puts files in req.files['fieldname'][0]
    const receiptPath = req.files?.receipt_image
      ? `/uploads/${req.files.receipt_image[0].filename}`
      : null;

    const treatmentPath = req.files?.treatment_photo
      ? `/uploads/${req.files.treatment_photo[0].filename}`
      : null;

    // 2. UPDATE INSERT QUERY
    // Added receiptImage and treatmentPhoto columns
    let insertQuery = `INSERT INTO fund_allocation 
      (animalID, category, amount, description, allocationDate, receiptImage, treatmentPhoto`;

    let insertValues = [
      animalID,
      normalized.category,
      donationCovered,
      descriptionValue,
      allocationDateValue,
      receiptPath,   // Save receipt path
      treatmentPath, // Save treatment photo path
    ];

    if (selected?.transactionID) {
      insertQuery += `, transactionID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      // Push transactionID to the END to match SQL order
      insertValues.push(selected.transactionID);
    } else {
      insertQuery += `) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    }

    const [result] = await connection.query(insertQuery, insertValues);
    const allocationID = result.insertId;

    // Check if fully funded (based on donations)
    // Optional: mark animal funded if fully allocated (only donation portion)
    // USER REQUEST CHANGE: prevent auto-archiving. Animals remain Active for management.
    /*
    if (newRemaining <= 0.01 && animal.status === "Active") {
      await connection.query(
        "UPDATE animal_profile SET status = 'Funded', updatedAt = NOW() WHERE animalID = ?",
        [animalID],
      );
    }
    */

    await logActivity(
      adminID,
      "CREATE_ALLOCATION",
      "fund_allocation",
      allocationID,
      `Created allocation of RM${allocationAmount} for ${category}${externalCovered > 0 ? ` (RM${externalCovered.toFixed(2)} external)` : ''}`,
      null,
      {
        animalID,
        category: normalized.category,
        amount: allocationAmount,
        totalCost: allocationAmount,
        donationCovered,
        externalCovered,
        externalFundingSource: normalized.externalFundingSource,
        fundingStatus: normalized.fundingStatus,
        description: descriptionValue,
      },
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      success: true,
      message: "Allocation created",
      data: {
        allocationID,
        animalID: parseInt(animalID, 10),
        transactionID: selected?.transactionID || null,
        category: normalized.category,
        amount: allocationAmount,
        totalCost: allocationAmount,
        donationCoveredAmount: donationCovered,
        externalCoveredAmount: externalCovered,
        externalFundingSource: normalized.externalFundingSource || null,
        fundingStatus: normalized.fundingStatus || (externalCovered > 0 ? 'Partially Funded' : 'Fully Funded'),
        description: descriptionValue,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error creating animal allocation:", error);
    next({ status: 500, message: "Failed to create allocation" });
  }
};

=======
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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
