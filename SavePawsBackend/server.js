require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { testConnection } = require('./config/database');
<<<<<<< HEAD
const { initializeDatabase } = require('./config/initDatabase');
=======
const initializeDatabase = require('./config/initDatabase');
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
const requestLogger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const rescueTaskRoutes = require('./routes/rescueTasks');
const userManagementRoutes = require('./routes/userManagement');
<<<<<<< HEAD
=======
const communityRoutes = require('./routes/community');
const aiRoutes = require('./routes/ai'); // Import AI routes
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0

// Donation Portal routes
const animalsRoutes = require('./routes/animals');
const adminAnimalsRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const adminFundsRoutes = require('./routes/adminFunds');
const adminRewardsRoutes = require('./routes/adminRewards');
const rewardsRoutes = require('./routes/rewards');
const donationsRoutes = require('./routes/donations');
<<<<<<< HEAD

// Adoption routes (ES6 module - will be loaded asynchronously)
let adoptionRoutes = null;
=======
const donationAnimalsRoutes = require('./routes/donationAnimals');

// Adoption routes
const adoptionRoutes = require('./routes/adoption/adoptionRoutes');
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

// CORS
app.use(cors({
  origin: '*', // Configure this for production
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Static files (for uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== FILE UPLOAD CONFIGURATION ====================

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
<<<<<<< HEAD
    fileSize: 5 * 1024 * 1024 // 5MB max file size
=======
    fileSize: 20 * 1024 * 1024 // 20MB max file size
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
  }
});

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Use the host from request, but allow override via X-Forwarded-Host for emulator
    const host = req.get('X-Forwarded-Host') || req.get('host');
    // For Android emulator, use 10.0.2.2 if the request came from emulator
    const protocol = req.protocol;
    let imageHost = host;
<<<<<<< HEAD
    
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    // Check if request is from Android emulator (common pattern)
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      // For emulator access, use 10.0.2.2
      imageHost = `10.0.2.2:${PORT}`;
    }
<<<<<<< HEAD
    
=======

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    const imageUrl = `${protocol}://${imageHost}/uploads/${req.file.filename}`;

    console.log('📤 Image uploaded:', req.file.filename);
    console.log('📤 Image URL:', imageUrl);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message
    });
  }
});

// ==================== API ROUTES ====================

<<<<<<< HEAD
// Health check
=======
// Health check (root level for emulator/connectivity tests)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is reachable' });
});

// API Health check
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SavePaws API Sprint 2 is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Report routes
app.use('/api/reports', reportRoutes);

// Rescue task routes
app.use('/api/rescue-tasks', rescueTaskRoutes);

// User management routes (Module 3)
app.use('/api/users', userManagementRoutes);

<<<<<<< HEAD
=======
// Community routes
app.use('/api/community', communityRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// Adoption routes
app.use('/api/adoption', adoptionRoutes);

// Volunteer routes (Moved up to avoid conflict with /api/admin mount)
const volunteerRoutes = require('./routes/volunteer');
app.use('/api', volunteerRoutes);

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
// Donation Portal routes
app.use('/api/animals', animalsRoutes);
app.use('/api/admin/animals', adminAnimalsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminFundsRoutes);
app.use('/api/admin/rewards', adminRewardsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/donations', donationsRoutes);
<<<<<<< HEAD

// Adoption routes (loaded asynchronously)
// Note: Adoption routes use ES6 modules, so we load them dynamically
=======
app.use('/api/donation-animals', donationAnimalsRoutes);
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0



// ==================== START SERVER ====================

const startServer = async () => {
  try {
    console.log('🚀 Starting SavePaws Sprint 2 Server...');
    console.log('📋 Environment:', process.env.NODE_ENV || 'development');

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Load adoption routes (ES6 module)
<<<<<<< HEAD
    try {
      const adoptionRoutesModule = await import('./routes/adoptionRoutes.js');
      adoptionRoutes = adoptionRoutesModule.default;
      app.use('/api/adoption', adoptionRoutes);
      console.log('✅ Adoption routes loaded');
    } catch (error) {
      console.warn('⚠️  Adoption routes not available:', error.message);
    }
// ==================== ERROR HANDLING ====================
=======
    // Adoption routes loaded via standard require
    console.log('✅ Adoption routes loaded');
    // ==================== ERROR HANDLING ====================
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0

    // 404 handler
    app.use(notFound);

    // Error handler
    app.use(errorHandler);

    // Create uploads directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
      console.log('📁 Created uploads directory');
    }

    // Start server - listen on all interfaces (0.0.0.0) so Android emulator can access
    app.listen(PORT, '0.0.0.0', () => {
      console.log('✅ Server started successfully!');
      console.log(`🌐 Server running on: http://0.0.0.0:${PORT}`);
      console.log(`📡 Local access: http://localhost:${PORT}/api`);
      console.log(`📱 Android emulator: http://10.0.2.2:${PORT}/api`);
      console.log(`🔐 Auth endpoint: http://0.0.0.0:${PORT}/api/auth`);
      console.log(`📊 Reports endpoint: http://0.0.0.0:${PORT}/api/reports`);
      console.log(`🚑 Rescue tasks: http://0.0.0.0:${PORT}/api/rescue-tasks`);
      console.log('\n💡 Ready to accept requests!\n');
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;