const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// ==================== USER AUTHENTICATION ====================

// User Signup
exports.userSignup = async (req, res) => {
  try {
    const { ic_number, first_name, last_name, email, phone_number, password } = req.body;

    // Validation
    if (!ic_number || !first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate IC number format (12 digits)
    if (ic_number.length !== 12 || !/^\d+$/.test(ic_number)) {
      return res.status(400).json({
        success: false,
        message: 'IC number must be exactly 12 digits'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if email already exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if IC number already exists
    const icExists = await User.getByIcNumber(ic_number);
    if (icExists) {
      return res.status(400).json({
        success: false,
        message: 'IC number already registered'
      });
    }

    // Hash password (store in password column, but as hash for security)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user (store hashed password in password column)
    const userId = await User.create({
      ic_number,
      first_name,
      last_name,
      email,
      phone_number,
      password: password_hash  // Store hashed password in password column
    });

    // Get created user (without password)
    const newUser = await User.getById(userId);

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, type: 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser,
      token
    });
  } catch (error) {
    console.error('User signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// User Login
exports.userLogin = async (req, res) => {
  try {
    const { ic_number, password } = req.body;

    // Validation
    if (!ic_number || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide IC number and password'
      });
    }

    // Get user by IC number
    const user = await User.getByIcNumber(ic_number); // You need to implement this in your User model
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid IC number or password'
      });
    }

    // Check if user is banned first (Module 3) - more specific error
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned. Please contact support.',
        is_banned: true
      });
    }

    // Check if user is active (default to true if NULL)
    if (user.is_active === false || user.is_active === 0) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    // Check if password is stored in password_hash or password column
    const storedPassword = user.password_hash || user.password;

    if (!storedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid IC number or password'
      });
    }

    // Check if password is hashed (starts with $2b$) or plain text
    let isPasswordValid = false;
    if (storedPassword.startsWith('$2b$')) {
      // Password is hashed, use bcrypt
      isPasswordValid = await bcrypt.compare(password, storedPassword);
    } else {
      // Password is plain text, compare directly
      isPasswordValid = password === storedPassword;
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid IC number or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, ic_number: user.ic_number, type: 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response (handle both column names)
    delete user.password_hash;
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('User login error:', error);
    // Provide more specific error messages
    if (error.message.includes('password') || error.message.includes('bcrypt')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid IC number or password'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};


// ==================== ADMIN AUTHENTICATION ====================

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get admin by email
    const admin = await Admin.getByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active (default to true if NULL)
    if (admin.is_active === false || admin.is_active === 0) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact super admin.'
      });
    }

    // Verify password
    // Check if password is hashed (starts with $2b$) or plain text
    // Note: Model returns password_hash, not password
    const storedPassword = admin.password_hash || admin.password;

    let isPasswordValid = false;
    if (storedPassword && storedPassword.startsWith('$2b$')) {
      // Password is hashed, use bcrypt
      isPasswordValid = await bcrypt.compare(password, storedPassword);
    } else {
      // Password is plain text, compare directly
      isPasswordValid = password === storedPassword;
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    //await Admin.updateLastLogin(admin.id);

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role || 'admin', type: 'admin' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Prepare admin response (remove password, ensure all fields)
    // Extract name from email if needed (e.g., "karen@savepaws.com" -> "karen")
    const emailName = admin.email ? admin.email.split('@')[0] : 'Admin';

    const adminResponse = {
      id: admin.id,
      email: admin.email,
      role: admin.role || 'admin',
      is_active: admin.is_active !== false && admin.is_active !== 0,
      first_name: emailName.charAt(0).toUpperCase() + emailName.slice(1),
      last_name: '',
      full_name: emailName.charAt(0).toUpperCase() + emailName.slice(1),
      username: emailName
    };

    res.json({
      success: true,
      message: 'Admin login successful',
      admin: adminResponse,
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// ==================== FORGOT PASSWORD ====================

// Forgot Password Request
exports.forgotPasswordRequest = async (req, res) => {
  try {
    const { ic_number, email } = req.body;

    // Validation
    if (!ic_number && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either IC number or email'
      });
    }

    let user;
    if (ic_number) {
      user = await User.getByIcNumber(ic_number);
    } else if (email) {
      user = await User.getByEmail(email);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with the provided information'
      });
    }

    // Return user info (without password) for verification
    const userInfo = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      ic_number: user.ic_number
    };

    res.json({
      success: true,
      message: 'User verified successfully',
      user: userInfo
    });
  } catch (error) {
    console.error('Forgot password request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: error.message
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { user_id, new_password } = req.body;

    // Validation
    if (!user_id || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID and new password'
      });
    }

    // Validate password length
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user exists
    const user = await User.getById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    const updated = await User.updatePassword(user_id, password_hash);
    if (!updated) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// Admin Registration (for creating new admins - should be protected)
exports.adminRegister = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    // Validation
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate role
    const validRoles = ['super_admin', 'admin', 'moderator'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Check if email already exists
    const emailExists = await Admin.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if username already exists
    const usernameExists = await Admin.usernameExists(username);
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create admin
    const adminId = await Admin.create({
      username,
      email,
      password_hash,
      full_name,
      role: role || 'admin'
    });

    // Get created admin (without password)
    const newAdmin = await Admin.getById(adminId);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: newAdmin
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// ==================== TOKEN VERIFICATION ====================

// Verify Token (for protected routes)
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user/admin data
    let userData;
    if (decoded.type === 'user') {
      userData = await User.getById(decoded.id);
    } else if (decoded.type === 'admin') {
      userData = await Admin.getById(decoded.id);
    }

    if (!userData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      valid: true,
      data: userData,
      type: decoded.type
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

// Get Current User/Admin
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is set by auth middleware
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
};