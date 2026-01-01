const db = require("../config/database");

/**
 * Demo Authentication Middleware
 * Extracts userID from request header
 * In production, this would validate JWT tokens
 */
exports.requireAuth = async (req, res, next) => {
  try {
    // Get userID from header or body (for flexibility)
    const userID = req.headers["x-user-id"] || req.body.userID || req.query.userID;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide userID in x-user-id header.",
      });
    }

    // Validate user exists
    const [users] = await db.query("SELECT userID, name, email, role FROM user WHERE userID = ?", [
      parseInt(userID),
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid userID. User not found.",
      });
    }

    // Attach user info to request
    req.userID = parseInt(userID);
    req.user = users[0];

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

/**
 * Require Admin Role Middleware
 * Must be used after requireAuth
 */
exports.requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

