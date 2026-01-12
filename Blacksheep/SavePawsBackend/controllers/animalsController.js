const { query } = require("../config/database");
const path = require("path");

const formatPhotoUrl = (photoURL) => {
  if (!photoURL) return null;
  // If it's already a full URL, return as is
  if (photoURL.startsWith("http://") || photoURL.startsWith("https://")) {
    return photoURL;
  }
  // If it's a local path, return as is (frontend will construct full URL)
  return photoURL;
};

exports.getAllAnimals = async (req, res, next) => {
  try {
    const animals = await query(
      `SELECT 
        animalID,
        name,
        type,
        story,
        fundingGoal,
        amountRaised,
        status,
        photoURL,
        createdAt
      FROM animal_profile
      WHERE status = 'Active'
      ORDER BY createdAt DESC`
    );

    // Ensure animals is an array
    if (!Array.isArray(animals)) {
      console.error("Animals query did not return an array:", animals);
      return res.json([]);
    }

    const formattedAnimals = animals.map((animal) => ({
      ...animal,
      fundingGoal: Number(animal.fundingGoal),
      amountRaised: Number(animal.amountRaised),
      photoURL: formatPhotoUrl(animal.photoURL),
    }));

    res.json(formattedAnimals);
  } catch (error) {
    console.error("Error fetching animals:", error);
    next({
      status: 500,
      message: "Failed to fetch animals from database",
    });
  }
};

exports.getAnimalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const animals = await query(
      `SELECT 
        animalID,
        name,
        type,
        story,
        fundingGoal,
        amountRaised,
        status,
        photoURL,
        createdAt
      FROM animal_profile
      WHERE animalID = ?`,
      [id]
    );

    if (animals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Animal not found",
      });
    }

    const formattedAnimal = {
      ...animals[0],
      fundingGoal: Number(animals[0].fundingGoal),
      amountRaised: Number(animals[0].amountRaised),
      photoURL: formatPhotoUrl(animals[0].photoURL),
    };

    res.json(formattedAnimal);
  } catch (error) {
    console.error("Error fetching animal:", error);
    next({
      status: 500,
      message: "Failed to fetch animal from database",
    });
  }
};

