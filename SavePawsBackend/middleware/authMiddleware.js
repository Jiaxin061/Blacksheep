const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user info to request
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.userType = decoded.type;
      req.userRole = decoded.role; // For admins

      next();
    } catch (jwtError) {
      // If JWT verification fails, check for fallback mechanism (x-user-id) regarding MyDigitalID demo
      const userID = req.headers["x-user-id"];

      if (userID) {
        // Verify user exists in database
        const user = await User.getById(parseInt(userID));

        if (user) {
          // Check if user is active
          if (user.is_active === false || user.is_active === 0) {
            return res.status(401).json({
              success: false,
              message: "Account is deactivated.",
            });
          }

          // Successful fallback
          req.userId = user.id;
          req.userType = 'user';
          req.user = user;
          return next();
        }
      }

      // If no fallback or fallback failed, return original error
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};


// Middleware to verify user authentication
const authenticateUser = async (req, res, next) => {
  try {
    verifyToken(req, res, async () => {
      if (req.userType !== 'user') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. User authentication required.'
        });
      }

      // Get full user data
      const user = await User.getById(req.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found.'
        });
      }

      // Check if user is banned (Module 3)
      // Note: status can be 'active', 'banned', or NULL (which means active)
      if (user.status === 'banned') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been banned. Please contact support.',
          is_banned: true
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Middleware to verify admin authentication
const authenticateAdmin = async (req, res, next) => {
  try {
    verifyToken(req, res, async () => {
      if (req.userType !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin authentication required.'
        });
      }

      // Get full admin data
      const admin = await Admin.getById(req.userId);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found.'
        });
      }

      // Check if admin is active (default to true if NULL)
      if (admin.is_active === false || admin.is_active === 0) {
        return res.status(401).json({
          success: false,
          message: 'Admin account is deactivated.'
        });
      }

      req.admin = admin;
      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Middleware to check admin role (super_admin only)
const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }
  next();
};

// Middleware to check admin role (admin or super_admin)
const requireAdminOrAbove = (req, res, next) => {
  if (!['admin', 'super_admin'].includes(req.admin.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userType = decoded.type;

    if (decoded.type === 'user') {
      req.user = await User.getById(decoded.id);
    } else if (decoded.type === 'admin') {
      req.admin = await Admin.getById(decoded.id);
    }

    next();
  } catch (error) {
    // Continue without authentication even if token is invalid
    next();
  }
};

module.exports = {
  verifyToken,
  authenticateUser,
  authenticateAdmin,
  requireSuperAdmin,
  requireAdminOrAbove,
  optionalAuth
};