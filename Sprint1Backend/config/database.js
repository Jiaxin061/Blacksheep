const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration WITHOUT database name (to create it first)
const dbConfigWithoutDB = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
};

// Database configuration WITH database name
const dbConfig = {
  ...dbConfigWithoutDB,
  database: process.env.DB_NAME || 'savepaws_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
let pool;

// Test database connection and create database if it doesn't exist
const testConnection = async () => {
  try {
    // First, connect without database name
    const tempConnection = await mysql.createConnection(dbConfigWithoutDB);
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'savepaws_db';
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' ready!`);
    
    await tempConnection.end();
    
    // Now create pool with database name
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    console.log(`📊 Database: ${dbName}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Make sure XAMPP MySQL is running!');
    return false;
  }
};

// Execute query helper function
const query = async (sql, params) => {
  try {
    if (!pool) {
      throw new Error('Database pool not initialized. Call testConnection() first.');
    }
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get pool (for initDatabase.js)
const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call testConnection() first.');
  }
  return pool;
};

module.exports = {
  pool,
  getPool,
  testConnection,
  query
};