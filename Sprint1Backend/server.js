// SavePaws Backend Server
// Node.js + Express + MySQL

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { initializeDatabase } = require('./config/initDatabase');
const requestLogger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const reportRoutes = require('./routes/reports');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger
app.use(requestLogger); // Custom request logger

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🐾 SavePaws API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/reports', reportRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'SavePaws API v1.0.0',
    endpoints: {
      reports: {
        'GET /api/reports': 'Get all reports',
        'GET /api/reports/:id': 'Get report by ID',
        'GET /api/reports/status/:status': 'Get reports by status',
        'GET /api/reports/stats': 'Get statistics',
        'GET /api/reports/search?q=term': 'Search reports',
        'POST /api/reports': 'Create new report',
        'PATCH /api/reports/:id/status': 'Update report status',
        'PUT /api/reports/:id': 'Update report',
        'DELETE /api/reports/:id': 'Delete report'
      }
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Cannot start server without database connection');
      console.error('💡 Please make sure XAMPP MySQL is running');
      process.exit(1);
    }
    
    // Initialize database (create tables, insert sample data)
    console.log('🔨 Initializing database...');
    await initializeDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🐾 SavePaws Backend Server Started Successfully! 🐾');
      console.log('='.repeat(60));
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
      console.log(`📊 Database: ${process.env.DB_NAME}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60));
      console.log('\n📚 Available Endpoints:');
      console.log(`   GET    http://localhost:${PORT}/api/reports`);
      console.log(`   POST   http://localhost:${PORT}/api/reports`);
      console.log(`   PATCH  http://localhost:${PORT}/api/reports/:id/status`);
      console.log(`   DELETE http://localhost:${PORT}/api/reports/:id`);
      console.log(`   GET    http://localhost:${PORT}/api/reports/stats`);
      console.log('\n💡 Tips:');
      console.log('   - Test API at: http://localhost:3000/api');
      console.log('   - View all reports: http://localhost:3000/api/reports');
      console.log('   - Press Ctrl+C to stop the server');
      console.log('='.repeat(60) + '\n');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down server...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;