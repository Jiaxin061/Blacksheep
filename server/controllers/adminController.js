const db = require("../config/database");

const formatAnimalResponse = (animal) => ({
  animalID: animal.animalID,
  name: animal.name,
  type: animal.type,
  story: animal.story,
  fundingGoal: Number(animal.fundingGoal),
  amountRaised: Number(animal.amountRaised),
  status: animal.status,
  photoURL: animal.photoURL,
  adminID: animal.adminID,
  createdAt: animal.createdAt,
  updatedAt: animal.updatedAt,
});

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
  const { name, type, story, fundingGoal, photoURL, status, adminID } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO animal_profile
        (name, type, story, fundingGoal, photoURL, status, adminID)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, type, story, fundingGoal, photoURL, status, adminID]
    );

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

    res.status(201).json({
      success: true,
      message: "Animal profile created successfully",
      data: formatAnimalResponse(rows[0]),
    });
  } catch (error) {
    console.error("Admin: error creating animal", error);
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
    photoURL,
  } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT animalID FROM animal_profile WHERE animalID = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Animal profile not found",
      });
    }

    await db.query(
      `UPDATE animal_profile
       SET name = ?, type = ?, story = ?, fundingGoal = ?, amountRaised = ?, status = ?, photoURL = ?
       WHERE animalID = ?`,
      [name, type, story, fundingGoal, amountRaised, status, photoURL, id]
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

    await db.query("DELETE FROM animal_profile WHERE animalID = ?", [id]);

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


