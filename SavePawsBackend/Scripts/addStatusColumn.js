/**
 * Script to add status column to users table
 * Run: node scripts/addStatusColumn.js
 */

require('dotenv').config();
const { testConnection, getPool } = require('../config/database');

const addStatusColumn = async () => {
  try {
    console.log('🔨 Adding status column to users table...');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    const pool = getPool();

    // Check if column exists
    const [columns] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'status'
    `);

    if (columns[0].count > 0) {
      console.log('✅ Status column already exists in users table');
    } else {
      // Check if is_active column exists to determine where to place status column
      const [isActiveCheck] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'is_active'
      `);

      let alterSql;
      if (isActiveCheck[0].count > 0) {
        // Add after is_active if it exists
        alterSql = `ALTER TABLE users ADD COLUMN status ENUM('active', 'banned') DEFAULT 'active' AFTER is_active`;
      } else {
        // Add at the end if is_active doesn't exist
        alterSql = `ALTER TABLE users ADD COLUMN status ENUM('active', 'banned') DEFAULT 'active'`;
      }

      await pool.query(alterSql);
      console.log('✅ Status column added to users table');

      // Add index
      await pool.query(`CREATE INDEX idx_status ON users(status)`);
      console.log('✅ Index created on status column');

      // Update existing users to 'active' if needed
      await pool.query(`UPDATE users SET status = 'active' WHERE status IS NULL`);
      console.log('✅ Existing users set to active status');
    }

    // Verify the column was added
    const [verifyColumns] = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'status'
    `);

    if (verifyColumns.length > 0) {
      console.log('\n📊 Status column details:');
      console.log('   Column Name:', verifyColumns[0].COLUMN_NAME);
      console.log('   Column Type:', verifyColumns[0].COLUMN_TYPE);
      console.log('   Default Value:', verifyColumns[0].COLUMN_DEFAULT);
    }

    console.log('\n🎉 Status column migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding status column:', error.message);
    console.error(error);
    process.exit(1);
  }
};

addStatusColumn();

