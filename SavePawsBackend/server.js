require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { testConnection } = require('./config/database');
const { initializeDatabase } = require('./config/initDatabase');
const requestLogger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const rescueTaskRoutes = require('./routes/rescueTasks');

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
    fileSize: 5 * 1024 * 1024 // 5MB max file size
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

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message
    });
  }
});

// ==================== API ROUTES ====================

// Health check
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

// ==================== ERROR HANDLING ====================

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

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

    // Create uploads directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
      console.log('📁 Created uploads directory');
    }

    // Start server
    app.listen(PORT, () => {
      console.log('✅ Server started successfully!');
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
      console.log(`📊 Reports endpoint: http://localhost:${PORT}/api/reports`);
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