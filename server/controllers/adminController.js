const db = require("../config/database");
const path = require("path");
const fs = require("fs");

const formatAnimalResponse = (animal) => {
  // Construct full URL if it's a local path
  let photoURL = animal.photoURL;
  if (photoURL && !photoURL.startsWith("http")) {
    photoURL = `/uploads/animals/${path.basename(photoURL)}`;
  }
  
  return {
    animalID: animal.animalID,
    name: animal.name,
    type: animal.type,
    story: animal.story,
    fundingGoal: Number(animal.fundingGoal),
    amountRaised: Number(animal.amountRaised),
    status: animal.status,
    photoURL: photoURL,
    adminID: animal.adminID,
    createdAt: animal.createdAt,
    updatedAt: animal.updatedAt,
  };
};

// Helper function to delete image file
const deleteImageFile = (imagePath) => {
  if (!imagePath || imagePath.startsWith("http")) {
    return; // Skip external URLs
  }
  
  const filename = path.basename(imagePath);
  const filePath = path.join(__dirname, "../uploads/animals", filename);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted image file: ${filename}`);
    } catch (error) {
      console.error(`Error deleting image file ${filename}:`, error);
    }
  }
};

exports.getAllAnimals = async (req, res, next) => {
  try {
    const [animals] = await db.query(
      `SELECT 
        animalID,
        name,
        type,
        story,
        fundingGoal,
        amountRaised,
        status,
        photoURL,
        adminID,
        createdAt,
        updatedAt
      FROM animal_profile
      ORDER BY createdAt DESC`
    );

    res.json({
      success: true,
      data: animals.map(formatAnimalResponse),
    });
  } catch (error) {
    console.error("Admin: error fetching animals", error);
    next({
      status: 500,
      message: "Failed to fetch animal profiles",
    });
  }
};

exports.createAnimal = async (req, res, next) => {
  console.log('=== CREATE ANIMAL REQUEST ===');
  console.log('📥 Headers:', req.headers);
  console.log('📥 Body:', req.body);
  console.log('📥 File:', req.file);
  console.log('============================');

  const { name, type, story, fundingGoal, status, adminID } = req.body;
  
  // Handle file upload
  let photoPath = null;
  if (req.file) {
    photoPath = `/uploads/animals/${req.file.filename}`;
    console.log('✅ Photo uploaded:', photoPath);
  } else {
    console.log('❌ No file received');
    return res.status(400).json({
      success: false,
      message: "Photo is required. Please upload an image.",
    });
  }

  try {
    console.log('💾 Inserting into database...');
    const [result] = await db.query(
      `INSERT INTO animal_profile
        (name, type, story, fundingGoal, photoURL, status, adminID)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, type, story, fundingGoal, photoPath, status, adminID || 1]
    );

    console.log('✅ Database insert successful, ID:', result.insertId);

    const newId = result.insertId;
    const [rows] = await db.query(
      `SELECT 
        animalID,
        name,
        type,
        story,
        fundingGoal,
        amountRaised,
        status,
        photoURL,
        adminID,
        createdAt,
        updatedAt
      FROM animal_profile
      WHERE animalID = ?`,
      [newId]
    );

    console.log('✅ Sending success response');
    res.status(201).json({
      success: true,
      message: "Animal profile created successfully",
      data: formatAnimalResponse(rows[0]),
    });
  } catch (error) {
    console.error('❌ Database error:', error);
    next({
      status: 500,
      message: "Failed to create animal profile",
    });
  }
};

exports.updateAnimal = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    type,
    story,
    fundingGoal,
    amountRaised,
    status,
  } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT animalID, photoURL FROM animal_profile WHERE animalID = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Animal profile not found",
      });
    }

    // Handle file upload - if new file uploaded, use it; otherwise keep existing
    let photoPath = existing[0].photoURL;
    if (req.file) {
      // Delete old image file if it exists
      if (existing[0].photoURL && !existing[0].photoURL.startsWith("http")) {
        deleteImageFile(existing[0].photoURL);
      }
      // Store new relative path
      photoPath = `/uploads/animals/${req.file.filename}`;
    }

    await db.query(
      `UPDATE animal_profile
       SET name = ?, type = ?, story = ?, fundingGoal = ?, amountRaised = ?, status = ?, photoURL = ?
       WHERE animalID = ?`,
      [name, type, story, fundingGoal, amountRaised, status, photoPath, id]
    );

    res.json({
      success: true,
      message: "Animal profile updated successfully",
    });
  } catch (error) {
    console.error("Admin: error updating animal", error);
    next({
      status: 500,
      message: "Failed to update animal profile",
    });
  }
};

exports.deleteAnimal = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT amountRaised FROM animal_profile WHERE animalID = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Animal profile not found",
      });
    }

    const amountRaised = Number(rows[0].amountRaised || 0);
    if (amountRaised > 0) {
      return res.status(400).json({
        success: false,
        code: "ACTIVE_DONATIONS",
        message:
          "Cannot delete animal with active donations. Please archive instead.",
      });
    }

    // Get photoURL before deletion
    const [animalData] = await db.query(
      "SELECT photoURL FROM animal_profile WHERE animalID = ?",
      [id]
    );

    // Delete from database
    await db.query("DELETE FROM animal_profile WHERE animalID = ?", [id]);

    // Delete associated image file
    if (animalData.length > 0 && animalData[0].photoURL) {
      deleteImageFile(animalData[0].photoURL);
    }

    res.json({
      success: true,
      message: "Animal profile deleted successfully",
    });
  } catch (error) {
    console.error("Admin: error deleting animal", error);
    next({
      status: 500,
      message: "Failed to delete animal profile",
    });
  }
};

exports.archiveAnimal = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT status FROM animal_profile WHERE animalID = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Animal profile not found",
      });
    }

    if (rows[0].status === "Archived") {
      return res.json({
        success: true,
        message: "Animal profile is already archived",
      });
    }

    await db.query(
      `UPDATE animal_profile SET status = 'Archived' WHERE animalID = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "Animal profile archived successfully",
    });
  } catch (error) {
    console.error("Admin: error archiving animal", error);
    next({
      status: 500,
      message: "Failed to archive animal profile",
    });
  }
};


