import jwt from 'jsonwebtoken';

const isAuthEnabled = String(process.env.ENABLE_AUTH || '').toLowerCase() === 'true';

const getDevUser = () => ({
  userId: Number(process.env.DEV_USER_ID) || 0,
  id: Number(process.env.DEV_USER_ID) || 0,
  role: process.env.DEV_USER_ROLE || 'admin',
  email: process.env.DEV_USER_EMAIL || 'dev@savepaws.local',
  name: process.env.DEV_USER_NAME || 'SavePaws Developer'
});

let loggedBypassWarning = false;

const ensureDevUser = (req) => {
  if (!loggedBypassWarning) {
    console.warn('⚠️  ENABLE_AUTH is not set to true. Authentication & role checks are bypassed for development.');
    console.warn('    Set ENABLE_AUTH=true (and configure JWT_SECRET) before deploying to production.');
    loggedBypassWarning = true;
  }

  if (!req.user) {
    req.user = getDevUser();
  }
};

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  if (!isAuthEnabled) {
    ensureDevUser(req);
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token.' 
    });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (!isAuthEnabled) {
    ensureDevUser(req);
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }

  next();
};

