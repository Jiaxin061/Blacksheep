/**
 * Script to add location_latitude and location_longitude columns to reports table
 * Run: node scripts/addLocationColumns.js
 */

require('dotenv').config();
const { testConnection, getPool } = require('../config/database');

const addLocationColumns = async () => {
  try {
    console.log('🔨 Checking location columns in reports table...');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    const pool = getPool();

    // Check if columns exist
    const [latColumn] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'reports' 
<<<<<<< HEAD
      AND COLUMN_NAME = 'location_latitude'
=======
      AND COLUMN_NAME = 'latitude'
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    `);

    const [lngColumn] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'reports' 
<<<<<<< HEAD
      AND COLUMN_NAME = 'location_longitude'
=======
      AND COLUMN_NAME = 'longitude'
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    `);

    if (latColumn[0].count > 0 && lngColumn[0].count > 0) {
      console.log('✅ Location columns already exist in reports table');
    } else {
      // Add location_latitude if it doesn't exist
      if (latColumn[0].count === 0) {
        await pool.query(`
          ALTER TABLE reports 
<<<<<<< HEAD
          ADD COLUMN location_latitude DECIMAL(10, 8) NULL
        `);
        console.log('✅ location_latitude column added to reports table');
=======
          ADD COLUMN latitude DECIMAL(10, 8) NULL
        `);
        console.log('✅ latitude column added to reports table');
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
      }

      // Add location_longitude if it doesn't exist
      if (lngColumn[0].count === 0) {
        await pool.query(`
          ALTER TABLE reports 
          ADD COLUMN location_longitude DECIMAL(11, 8) NULL
        `);
<<<<<<< HEAD
        console.log('✅ location_longitude column added to reports table');
=======
        console.log('✅ longitude column added to reports table');
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
      }
    }

    // Verify the columns were added
    const [verifyColumns] = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'reports' 
<<<<<<< HEAD
      AND COLUMN_NAME IN ('location_latitude', 'location_longitude')
=======
      AND COLUMN_NAME IN ('latitude', 'longitude')
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
      ORDER BY COLUMN_NAME
    `);

    if (verifyColumns.length > 0) {
      console.log('\n📊 Location columns in reports table:');
      verifyColumns.forEach(col => {
        console.log(`   ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

    console.log('\n🎉 Location columns migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding location columns:', error.message);
    console.error(error);
    process.exit(1);
  }
};

addLocationColumns();

