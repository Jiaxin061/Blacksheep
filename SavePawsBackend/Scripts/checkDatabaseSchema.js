/**
 * Database Schema Checker
 * This script checks if the donation portal tables exist and match expected structure
 */

const { query } = require('../config/database');

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...\n');

  try {
    // Check if user/users table exists
    const userTables = await query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('user', 'users')
    `);

    console.log('📊 User Tables Found:');
    if (Array.isArray(userTables) && userTables.length > 0) {
      userTables.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    } else {
      console.log('  ⚠️  No user/users tables found');
    }

    // Check donation portal tables
    const donationTables = [
      'animal_profile',
      'donation_transaction',
      'fund_allocation',
      'reward_item',
      'reward_point_ledger',
      'redemption_record',
      'animal_progress_update'
    ];

    console.log('\n📊 Donation Portal Tables:');
    for (const tableName of donationTables) {
      const exists = await query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ?
      `, [tableName]);
      
      if (Array.isArray(exists) && exists.length > 0 && exists[0].count > 0) {
        // Get columns
        const columns = await query(`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `, [tableName]);
        
        console.log(`\n  ✅ ${tableName}:`);
        if (Array.isArray(columns)) {
          columns.forEach(col => {
            console.log(`     - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
          });
        }
      } else {
        console.log(`  ❌ ${tableName}: NOT FOUND`);
      }
    }

    // Check if donation_transaction has userID or user_id
    console.log('\n🔍 Checking donation_transaction foreign keys:');
    const fkInfo = await query(`
      SELECT 
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'donation_transaction'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (Array.isArray(fkInfo) && fkInfo.length > 0) {
      fkInfo.forEach(fk => {
        console.log(`  - ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('  ⚠️  No foreign keys found (table might not exist)');
    }

    console.log('\n✅ Schema check complete!');
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  const { testConnection } = require('../config/database');
  testConnection().then(() => {
    checkDatabaseSchema().then(() => {
      process.exit(0);
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
  });
}

module.exports = { checkDatabaseSchema };

