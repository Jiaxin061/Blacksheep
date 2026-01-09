const db = require("../config/database");

/**
 * Log admin activity
 */
const logActivity = async (adminID, actionType, entityType, entityID, description, oldValues, newValues) => {
  try {
    await db.query(
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
 * Get progress updates for an animal
 */
exports.getProgressUpdates = async (req, res, next) => {
  try {
    const { animalID } = req.params;

    const [updates] = await db.query(
      `SELECT 
        apu.updateID,
        apu.animalID,
        apu.allocationID,
        apu.title,
        apu.description,
        apu.medicalCondition,
        apu.recoveryStatus,
        apu.updateDate,
        apu.createdBy,
        apu.createdAt,
        apu.updatedAt,
        u.name AS createdByName,
        fa.category AS allocationCategory,
        fa.amount AS allocationAmount
      FROM animal_progress_update apu
      LEFT JOIN user u ON apu.createdBy = u.userID
      LEFT JOIN fund_allocation fa ON apu.allocationID = fa.allocationID
      WHERE apu.animalID = ?
      ORDER BY apu.updateDate DESC, apu.createdAt DESC`,
      [animalID]
    );

    res.json({
      success: true,
      data: {
        animalID: parseInt(animalID),
        updates: updates.map((u) => ({
          updateID: u.updateID,
          animalID: u.animalID,
          allocationID: u.allocationID,
          allocationCategory: u.allocationCategory,
          allocationAmount: u.allocationAmount ? parseFloat(u.allocationAmount) : null,
          title: u.title,
          description: u.description,
          medicalCondition: u.medicalCondition,
          recoveryStatus: u.recoveryStatus,
          updateDate: u.updateDate,
          createdBy: u.createdBy,
          createdByName: u.createdByName,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching progress updates:", error);
    next({
      status: 500,
      message: "Failed to fetch progress updates",
    });
  }
};

/**
 * Create progress update
 */
exports.createProgressUpdate = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { animalID } = req.params;
    const { allocationID, title, description, medicalCondition, recoveryStatus, updateDate } = req.body;
    const adminID = req.userID;

    // Validate required fields
    if (!title || !description || !recoveryStatus || !updateDate) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, recoveryStatus, updateDate",
      });
    }

    // Validate recovery status
    const validStatuses = ["Under Treatment", "Recovering", "Fully Recovered", "Adopted", "Other"];
    if (!validStatuses.includes(recoveryStatus)) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: `Invalid recovery status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Verify animal exists
    const [animals] = await connection.query(
      "SELECT animalID FROM animal_profile WHERE animalID = ?",
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

    // Verify allocation exists if provided
    if (allocationID) {
      const [allocations] = await connection.query(
        "SELECT allocationID FROM fund_allocation WHERE allocationID = ?",
        [allocationID]
      );

      if (allocations.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({
          success: false,
          message: "Allocation not found",
        });
      }
    }

    // Insert progress update
    const [result] = await connection.query(
      `INSERT INTO animal_progress_update 
        (animalID, allocationID, title, description, medicalCondition, recoveryStatus, updateDate, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        animalID,
        allocationID || null,
        title,
        description,
        medicalCondition || null,
        recoveryStatus,
        updateDate,
        adminID,
      ]
    );

    const updateID = result.insertId;

    // Get created update
    const [updates] = await connection.query(
      `SELECT apu.*, u.name AS createdByName
       FROM animal_progress_update apu
       LEFT JOIN user u ON apu.createdBy = u.userID
       WHERE apu.updateID = ?`,
      [updateID]
    );

    // Log activity
    await logActivity(
      adminID,
      "UPDATE_PROGRESS",
      "animal_progress",
      updateID,
      `Created progress update for animal ${animalID}`,
      null,
      { animalID, allocationID, title, recoveryStatus }
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      success: true,
      message: "Progress update created successfully",
      data: {
        updateID: updateID,
        animalID: parseInt(animalID),
        allocationID: allocationID ? parseInt(allocationID) : null,
        title: title,
        description: description,
        medicalCondition: medicalCondition,
        recoveryStatus: recoveryStatus,
        updateDate: updateDate,
        createdBy: adminID,
        createdByName: updates[0].createdByName,
        createdAt: updates[0].createdAt,
      },
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error creating progress update:", error);
    next({
      status: 500,
      message: "Failed to create progress update",
    });
  }
};

