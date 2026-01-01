const db = require("../config/database");

/**
 * Helper function to check if user has donated to an animal
 * Used for access control - animal-based visibility
 */
const hasUserDonatedToAnimal = async (userID, animalID) => {
  try {
    const [donations] = await db.query(
      `SELECT COUNT(*) AS count 
       FROM donation_transaction 
       WHERE userID = ? AND animalID = ? AND payment_status = 'Success'`,
      [userID, animalID]
    );
    return donations[0].count > 0;
  } catch (error) {
    console.error("Error checking user donation:", error);
    return false;
  }
};

/**
 * Helper function to parse allocation metadata and check if status is Published
 */
const isAllocationPublished = (description) => {
  if (!description) return true; // Backward compatibility: assume published if no metadata

  // Check for metadata
  const metadataMatch = description.match(/\[METADATA:(.+?)\]/);
  if (metadataMatch) {
    try {
      const metadata = JSON.parse(metadataMatch[1]);
      return metadata.status === "Published";
    } catch (e) {
      console.error("Error parsing allocation metadata:", e);
      return true; // Default to published if parsing fails
    }
  }

  // No metadata = backward compatibility = assume published
  return true;
};

/**
 * Get all users for the demo login screen
 * (Public endpoint - No Auth required)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      "SELECT userID, name, email, role FROM user ORDER BY name ASC"
    );

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    next({
      status: 500,
      message: "Failed to fetch users",
    });
  }
};

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const userID = req.userID;

    const [users] = await db.query(
      "SELECT userID, name, email, role, createdAt FROM user WHERE userID = ?",
      [userID]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    next({
      status: 500,
      message: "Failed to fetch user profile",
    });
  }
};

/**
 * Get donation impact summary for user (UC10)
 * 
 * VISIBILITY MODEL: Animal-Based (Not Transaction-Based)
 * 
 * Changed from transaction-based to animal-based visibility for better transparency.
 * 
 * Rules:
 * - Any user who has donated to an animal can see ALL published allocations for that animal
 * - Allocations are grouped by animal, not by transaction
 * - Shows combined funding breakdown (donations + external sources)
 * - Only Published allocations are visible to donors
 * - Internal admin notes are NOT shown to donors
 * 
 * This provides donors with a complete view of how funds are used for animals they support,
 * regardless of which specific transaction funded each allocation.
 */
exports.getDonationImpact = async (req, res, next) => {
  try {
    const userID = req.userID;

    // Get all user's donations with animal info
    const [donations] = await db.query(
      `SELECT 
        dt.transactionID,
        dt.animalID,
        dt.donation_amount,
        dt.transaction_date,
        dt.type AS donation_type,
        ap.name AS animalName,
        ap.type AS animalType,
        ap.photoURL,
        ap.status AS animalStatus
      FROM donation_transaction dt
      INNER JOIN animal_profile ap ON dt.animalID = ap.animalID
      WHERE dt.userID = ? AND dt.payment_status = 'Success'
      ORDER BY dt.transaction_date DESC`,
      [userID]
    );

    /**
     * ANIMAL-BASED ALLOCATION VISIBILITY
     * 
     * Changed from transaction-based to animal-based visibility.
     * Any user who has donated to an animal can see ALL published allocations for that animal.
     * This provides better transparency and shows how combined funds are used.
     */
    // Get all unique animals the user has donated to
    const animalIDs = [...new Set(donations.map((d) => d.animalID))];
    let allocations = [];
    if (animalIDs.length > 0) {
      const placeholders = animalIDs.map(() => "?").join(",");
      // Query allocations by animal_id
      // We'll filter by Published status in JavaScript after parsing metadata
      const [allocs] = await db.query(
        `SELECT 
          fa.allocationID,
          fa.transactionID,
          fa.animalID,
          fa.category,
          fa.amount,
          fa.description,
          fa.allocationDate,
          ap.name AS animalName
        FROM fund_allocation fa
        INNER JOIN animal_profile ap ON fa.animalID = ap.animalID
        WHERE fa.animalID IN (${placeholders})
        ORDER BY fa.allocationDate DESC`,
        animalIDs
      );

      // Filter for Published allocations only
      allocations = allocs.filter(a => isAllocationPublished(a.description));
    }

    // Get progress updates for animals
    // Get progress updates for animals using already defined animalIDs
    let progressUpdates = [];
    if (animalIDs.length > 0) {
      const placeholders = animalIDs.map(() => "?").join(",");
      const [updates] = await db.query(
        `SELECT 
          updateID,
          animalID,
          allocationID,
          title,
          description,
          medicalCondition,
          recoveryStatus,
          updateDate
        FROM animal_progress_update
        WHERE animalID IN (${placeholders})
        ORDER BY updateDate DESC`,
        animalIDs
      );
      progressUpdates = updates;
    }

    /**
     * Group donations by animal to show combined allocation data
     * Each animal entry shows all published allocations for that animal
     */
    // Group donations by animal
    const animalsMap = new Map();
    donations.forEach((donation) => {
      const key = donation.animalID;
      if (!animalsMap.has(key)) {
        animalsMap.set(key, {
          animalID: donation.animalID,
          animalName: donation.animalName,
          animalType: donation.animalType,
          photoURL: donation.photoURL,
          animalStatus: donation.animalStatus,
          donations: [],
          totalDonated: 0,
        });
      }
      const animal = animalsMap.get(key);
      animal.donations.push({
        transactionID: donation.transactionID,
        donationAmount: parseFloat(donation.donation_amount),
        donationDate: donation.transaction_date,
        donationType: donation.donation_type,
      });
      animal.totalDonated += parseFloat(donation.donation_amount);
    });

    // Build response with animal-based allocations
    const donationsWithDetails = Array.from(animalsMap.values()).map((animal) => {
      // Get ALL published allocations for this animal (not transaction-specific)
      const animalAllocations = allocations.filter(
        (a) => a.animalID === animal.animalID
      );

      // Parse metadata from description to get enhanced fields
      const parsedAllocations = animalAllocations.map((a) => {
        let metadata = null;
        let cleanDescription = a.description || "";

        // Extract metadata if present
        const metadataMatch = cleanDescription.match(/\[METADATA:(.+?)\]/);
        if (metadataMatch) {
          try {
            metadata = JSON.parse(metadataMatch[1]);
            // Remove metadata from description for display
            cleanDescription = cleanDescription.replace(/\[METADATA:.+?\]/g, "").trim();
          } catch (e) {
            console.error("Error parsing metadata:", e);
          }
        }

        return {
          allocationID: a.allocationID,
          category: a.category,
          amount: parseFloat(a.amount),
          // Use totalCost from metadata if available, otherwise use amount
          totalCost: metadata?.totalCost ? parseFloat(metadata.totalCost) : parseFloat(a.amount),
          donationCoveredAmount: metadata?.donationCovered ? parseFloat(metadata.donationCovered) : parseFloat(a.amount),
          externalCoveredAmount: metadata?.externalCovered ? parseFloat(metadata.externalCovered) : 0,
          externalFundingSource: metadata?.externalFundingSource || null,
          fundingStatus: metadata?.fundingStatus || "Fully Funded",
          allocationType: metadata?.allocationType || null,
          publicDescription: metadata?.publicDescription || cleanDescription,
          description: cleanDescription, // Clean description without metadata
          allocationDate: a.allocationDate,
        };
      });

      // Calculate total allocated for this animal (sum of all published allocations)
      const totalAllocated = parsedAllocations.reduce(
        (sum, a) => sum + (a.totalCost || parseFloat(a.amount || 0)),
        0
      );

      // Calculate remaining (total donated - donation-covered portion of allocations)
      const donationCoveredTotal = parsedAllocations.reduce(
        (sum, a) => sum + (a.donationCoveredAmount || 0),
        0
      );
      const remainingUnallocated = animal.totalDonated - donationCoveredTotal;

      const animalUpdates = progressUpdates.filter(
        (u) => u.animalID === animal.animalID
      );

      // Allocation status based on donation coverage
      let allocationStatus = "PARTIALLY_ALLOCATED";
      if (donationCoveredTotal === 0) {
        allocationStatus = "NOT_ALLOCATED";
      } else if (donationCoveredTotal >= animal.totalDonated) {
        allocationStatus = "FULLY_ALLOCATED";
      }

      return {
        // Use first donation's transactionID for navigation (backward compatibility)
        transactionID: animal.donations[0].transactionID,
        animalID: animal.animalID,
        animalName: animal.animalName,
        animalType: animal.animalType,
        photoURL: animal.photoURL,
        animalStatus: animal.animalStatus,
        donationAmount: animal.totalDonated, // Total donated across all transactions
        donationDate: animal.donations[0].donationDate, // Most recent donation date
        donationType: animal.donations[0].donationType,
        totalAllocated: totalAllocated, // Total cost of all allocations
        donationCoveredAmount: donationCoveredTotal, // Portion covered by donations
        remainingUnallocated: remainingUnallocated,
        allocationStatus: allocationStatus,

        // --- FIX: Include the individual donation history ---
        donationHistory: animal.donations,
        // ----------------------------------------------------

        // Show ALL published allocations for this animal
        allocations: parsedAllocations,
        progressUpdates: animalUpdates.map((u) => ({
          updateID: u.updateID,
          title: u.title,
          description: u.description,
          medicalCondition: u.medicalCondition,
          recoveryStatus: u.recoveryStatus,
          updateDate: u.updateDate,
        })),
      };
    });

    // Calculate totals
    const totalDonated = donations.reduce(
      (sum, d) => sum + parseFloat(d.donation_amount || 0),
      0
    );

    res.json({
      success: true,
      data: {
        totalDonated: totalDonated,
        donationCount: donations.length,
        donations: donationsWithDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching donation impact:", error);
    next({
      status: 500,
      message: "Failed to fetch donation impact",
    });
  }
};

/**
 * Get detailed donation impact for specific transaction (UC10)
 * 
 * VISIBILITY MODEL: Animal-Based (Not Transaction-Based)
 * 
 * Access Control:
 * - Verifies user has donated to the animal (via the transaction)
 * - Then shows ALL published allocations for that animal (not just for the transaction)
 * 
 * This allows donors to see the complete picture of how funds are used for animals
 * they've supported, providing transparency on combined fund usage.
 */
exports.getDonationImpactDetail = async (req, res, next) => {
  try {
    const userID = req.userID;
    const { transactionID } = req.params;

    // Get donation details
    const [donations] = await db.query(
      `SELECT 
        dt.*,
        u.name AS userName,
        u.email AS userEmail,
        ap.name AS animalName,
        ap.type AS animalType,
        ap.photoURL AS animalPhotoURL,
        ap.story AS animalStory
      FROM donation_transaction dt
      INNER JOIN user u ON dt.userID = u.userID
      INNER JOIN animal_profile ap ON dt.animalID = ap.animalID
      WHERE dt.transactionID = ? AND dt.userID = ? AND dt.payment_status = 'Success'`,
      [transactionID, userID]
    );

    if (donations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Donation not found or access denied",
      });
    }

    const donation = donations[0];

    /**
     * ANIMAL-BASED ALLOCATION VISIBILITY
     * 
     * Changed from transaction-based to animal-based.
     * User can see ALL published allocations for the animal they donated to,
     * not just allocations linked to their specific transaction.
     * This provides transparency on how combined funds are used.
     */
    // Verify user has donated to this animal (access control)
    const hasAccess = await hasUserDonatedToAnimal(userID, donation.animalID);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You have not donated to this animal.",
      });
    }

    // Get ALL published allocations for this animal (not transaction-specific)
    const [allAllocations] = await db.query(
      `SELECT 
        fa.*,
        apu.updateID AS linkedUpdateID,
        apu.title AS linkedUpdateTitle,
        apu.updateDate AS linkedUpdateDate
      FROM fund_allocation fa
      LEFT JOIN animal_progress_update apu ON fa.allocationID = apu.allocationID
      WHERE fa.animalID = ?
      ORDER BY fa.allocationDate DESC`,
      [donation.animalID]
    );

    // Filter for Published allocations only
    const allocations = allAllocations.filter(a => isAllocationPublished(a.description));

    // Get progress updates for this animal
    const [progressUpdates] = await db.query(
      `SELECT 
        updateID,
        allocationID,
        title,
        description,
        medicalCondition,
        recoveryStatus,
        updateDate
      FROM animal_progress_update
      WHERE animalID = ?
      ORDER BY updateDate DESC`,
      [donation.animalID]
    );

    // Parse allocations to extract metadata and calculate totals
    const parsedAllocations = allocations.map((a) => {
      let metadata = null;
      let cleanDescription = a.description || "";

      // Extract metadata if present
      const metadataMatch = cleanDescription.match(/\[METADATA:(.+?)\]/);
      if (metadataMatch) {
        try {
          metadata = JSON.parse(metadataMatch[1]);
          cleanDescription = cleanDescription.replace(/\[METADATA:.+?\]/g, "").trim();
        } catch (e) {
          console.error("Error parsing metadata:", e);
        }
      }

      return {
        allocationID: a.allocationID,
        category: a.category,
        amount: parseFloat(a.amount || 0),
        totalCost: metadata?.totalCost ? parseFloat(metadata.totalCost) : parseFloat(a.amount || 0),
        donationCoveredAmount: metadata?.donationCovered ? parseFloat(metadata.donationCovered) : parseFloat(a.amount || 0),
        externalCoveredAmount: metadata?.externalCovered ? parseFloat(metadata.externalCovered) : 0,
        externalFundingSource: metadata?.externalFundingSource || null,
        fundingStatus: metadata?.fundingStatus || "Fully Funded",
        allocationType: metadata?.allocationType || null,
        publicDescription: metadata?.publicDescription || cleanDescription,
        description: cleanDescription,
        allocationDate: a.allocationDate,
        linkedProgressUpdates: a.linkedUpdateID
          ? [
            {
              updateID: a.linkedUpdateID,
              title: a.linkedUpdateTitle,
              updateDate: a.linkedUpdateDate,
            },
          ]
          : [],
      };
    });

    // Calculate totals - use totalCost for total allocated
    const totalAllocated = parsedAllocations.reduce(
      (sum, a) => sum + (a.totalCost || 0),
      0
    );

    // Calculate donation-covered portion
    const donationCoveredTotal = parsedAllocations.reduce(
      (sum, a) => sum + (a.donationCoveredAmount || 0),
      0
    );

    // Remaining is based on user's donation amount minus their portion of allocations
    // Note: This is an approximation since allocations combine funds from multiple donors
    const remainingUnallocated = Math.max(0, parseFloat(donation.donation_amount) - donationCoveredTotal);

    let allocationStatus = "PARTIALLY_ALLOCATED";
    if (donationCoveredTotal === 0) {
      allocationStatus = "NOT_ALLOCATED";
    } else if (donationCoveredTotal >= parseFloat(donation.donation_amount)) {
      allocationStatus = "FULLY_ALLOCATED";
    }

    res.json({
      success: true,
      data: {
        transactionID: donation.transactionID,
        userID: donation.userID,
        userName: donation.userName,
        userEmail: donation.userEmail,
        animalID: donation.animalID,
        animalName: donation.animalName,
        animalType: donation.animalType,
        animalPhotoURL: donation.animalPhotoURL,
        animalStory: donation.animalStory,
        donationAmount: parseFloat(donation.donation_amount),
        donationDate: donation.transaction_date,
        donationType: donation.type,
        paymentStatus: donation.payment_status,
        totalAllocated: totalAllocated,
        donationCoveredAmount: donationCoveredTotal,
        remainingUnallocated: remainingUnallocated,
        allocationStatus: allocationStatus,
        allocations: parsedAllocations,
        progressUpdates: progressUpdates.map((u) => ({
          updateID: u.updateID,
          allocationID: u.allocationID,
          title: u.title,
          description: u.description,
          medicalCondition: u.medicalCondition,
          recoveryStatus: u.recoveryStatus,
          updateDate: u.updateDate,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching donation impact detail:", error);
    next({
      status: 500,
      message: "Failed to fetch donation impact details",
    });
  }
};

