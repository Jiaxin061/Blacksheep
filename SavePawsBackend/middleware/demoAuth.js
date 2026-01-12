const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

/**
 * User Authentication Middleware
 * Validates JWT token and checks users table
 */
exports.requireAuth = async (req, res, next) => {
  try {
    // Try JWT token first (Bearer token)
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if it's a user token
        if (decoded.type === 'user') {
          const user = await User.getById(decoded.id);
          
          if (!user) {
            return res.status(401).json({
              success: false,
              message: "User not found.",
            });
          }

          // Check if user is active
          if (user.is_active === false || user.is_active === 0) {
            return res.status(401).json({
              success: false,
              message: "Account is deactivated.",
            });
          }

          req.userID = user.id;
          req.user = user;
          req.userType = 'user';
          return next();
        }
      } catch (jwtError) {
        // If JWT fails, fall through to x-user-id header check
      }
    }

    // Fallback: Get userID from header (for backward compatibility)
    const userID = req.headers["x-user-id"] || req.body.userID || req.query.userID;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide JWT token or userID in x-user-id header.",
      });
    }

    // Validate user exists in users table
    const user = await User.getById(parseInt(userID));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid userID. User not found.",
      });
    }

    // Check if user is active
    if (user.is_active === false || user.is_active === 0) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated.",
      });
    }

    // Attach user info to request
    req.userID = user.id;
    req.user = user;
    req.userType = 'user';

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
 * Admin Authentication Middleware
 * Validates JWT token and checks admins table
 */
exports.requireAdmin = async (req, res, next) => {
  try {
    // Try JWT token first (Bearer token)
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if it's an admin token
        if (decoded.type === 'admin') {
          const admin = await Admin.getById(decoded.id);
          
          if (!admin) {
            return res.status(401).json({
              success: false,
              message: "Admin not found.",
            });
          }

          // Check if admin is active
          if (admin.is_active === false || admin.is_active === 0) {
            return res.status(401).json({
              success: false,
              message: "Admin account is deactivated.",
            });
          }

          req.userID = admin.id; // Keep userID for compatibility
          req.adminID = admin.id;
          req.admin = admin;
          req.userType = 'admin';
          return next();
        }
      } catch (jwtError) {
        // If JWT fails, fall through to x-user-id header check
      }
    }

    // Fallback: Get userID from header (for backward compatibility)
    const userID = req.headers["x-user-id"] || req.body.userID || req.query.userID;

    if (!userID) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required. Please provide JWT token or userID in x-user-id header.",
      });
    }

    // Check admins table (not users table)
    const admin = await Admin.getById(parseInt(userID));

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required. User not found in admins table.",
      });
    }

    // Check if admin is active
    if (admin.is_active === false || admin.is_active === 0) {
      return res.status(401).json({
        success: false,
        message: "Admin account is deactivated.",
      });
    }

    // Attach admin info to request
    req.userID = admin.id; // Keep userID for compatibility
    req.adminID = admin.id;
    req.admin = admin;
    req.userType = 'admin';

    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

