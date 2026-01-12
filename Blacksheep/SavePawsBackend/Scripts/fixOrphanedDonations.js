/**
 * Fix orphaned donations - update userID to match valid users.id
 */

const { query } = require('../config/database');

async function fixOrphanedDonations() {
  console.log('🔧 Fixing orphaned donations...\n');

  try {
    // Get first valid user ID
    const users = await query('SELECT id FROM users ORDER BY id LIMIT 1');
    
    if (users.length === 0) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }

    const defaultUserID = users[0].id;
    console.log(`📌 Using default user ID: ${defaultUserID}`);

    // Find orphaned donations
    const orphaned = await query(`
      SELECT dt.transactionID, dt.userID
      FROM donation_transaction dt
      LEFT JOIN users u ON dt.userID = u.id
      WHERE dt.userID IS NOT NULL AND u.id IS NULL
    `);

    if (orphaned.length === 0) {
      console.log('✅ No orphaned donations found!');
      return;
    }

    console.log(`\n🔍 Found ${orphaned.length} orphaned donation(s):`);
    orphaned.forEach(d => {
      console.log(`  - Transaction ${d.transactionID}: userID ${d.userID} -> will update to ${defaultUserID}`);
    });

    // Update orphaned donations
    for (const donation of orphaned) {
      await query(
        'UPDATE donation_transaction SET userID = ? WHERE transactionID = ?',
        [defaultUserID, donation.transactionID]
      );
      console.log(`  ✅ Updated transaction ${donation.transactionID}`);
    }

    console.log('\n✅ All orphaned donations fixed!');

    // Optionally add foreign key constraint
    console.log('\n💡 Adding foreign key constraint...');
    try {
      await query(`
        ALTER TABLE donation_transaction
        ADD CONSTRAINT fk_donation_user
        FOREIGN KEY (userID) REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✅ Foreign key constraint added successfully!');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('ℹ️  Foreign key constraint already exists');
      } else {
        console.log(`⚠️  Could not add foreign key: ${error.message}`);
        console.log('   You can add it manually later if needed');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  const { testConnection } = require('../config/database');
  testConnection().then(() => {
    fixOrphanedDonations().then(() => {
      process.exit(0);
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
  });
}

module.exports = { fixOrphanedDonations };

