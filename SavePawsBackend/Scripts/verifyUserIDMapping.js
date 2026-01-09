/**
 * Verify userID mapping between users table and donation_transaction
 * This checks if donation_transaction.userID values match users.id
 */

const { query } = require('../config/database');

async function verifyUserIDMapping() {
  console.log('🔍 Verifying userID mapping...\n');

  try {
    // Check if donation_transaction.userID values exist in users.id
    const orphanedDonations = await query(`
      SELECT dt.transactionID, dt.userID, dt.donation_amount
      FROM donation_transaction dt
      LEFT JOIN users u ON dt.userID = u.id
      WHERE dt.userID IS NOT NULL AND u.id IS NULL
      LIMIT 10
    `);

    if (orphanedDonations.length > 0) {
      console.log('⚠️  Found donations with userID that don\'t match users.id:');
      orphanedDonations.forEach(d => {
        console.log(`  - Transaction ${d.transactionID}: userID ${d.userID} (not found in users table)`);
      });
      console.log('\n💡 These donations need to be updated to match valid users.id values');
    } else {
      console.log('✅ All donation_transaction.userID values match users.id');
    }

    // Check total counts
    const [userCount] = await query('SELECT COUNT(*) as count FROM users');
    const [donationCount] = await query('SELECT COUNT(*) as count FROM donation_transaction WHERE userID IS NOT NULL');
    
    console.log(`\n📊 Statistics:`);
    console.log(`  - Total users: ${userCount.count}`);
    console.log(`  - Donations with userID: ${donationCount.count}`);

    // Check if we should add foreign key
    const [fkExists] = await query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'donation_transaction'
      AND COLUMN_NAME = 'userID'
      AND REFERENCED_TABLE_NAME = 'users'
    `);

    if (fkExists.count === 0) {
      console.log('\n💡 Recommendation: Add foreign key constraint');
      console.log('   Run this SQL to add the foreign key:');
      console.log(`
ALTER TABLE donation_transaction
ADD CONSTRAINT fk_donation_user
FOREIGN KEY (userID) REFERENCES users(id) ON DELETE SET NULL;
      `);
    } else {
      console.log('\n✅ Foreign key constraint exists');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  const { testConnection } = require('../config/database');
  testConnection().then(() => {
    verifyUserIDMapping().then(() => {
      process.exit(0);
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
  });
}

module.exports = { verifyUserIDMapping };

