/**
 * Fix donation_transaction.userID to link to users.id = 1
 */

const { query } = require('../config/database');

async function fixDonationUserID() {
  console.log('🔧 Fixing donation userID to link to users.id = 1...\n');

  try {
    // Check if user with id=1 exists
    const [user] = await query('SELECT id, first_name, last_name, email FROM users WHERE id = 1');
    
    if (!user || user.length === 0) {
      console.log('❌ User with id=1 not found!');
      return;
    }

    console.log(`✅ Found user: ${user.first_name} ${user.last_name} (${user.email})`);

    // Find orphaned donations
    const orphaned = await query(`
      SELECT dt.transactionID, dt.userID, dt.donation_amount
      FROM donation_transaction dt
      LEFT JOIN users u ON dt.userID = u.id
      WHERE dt.userID IS NOT NULL AND u.id IS NULL
    `);

    if (orphaned.length === 0) {
      console.log('✅ No orphaned donations found!');
    } else {
      console.log(`\n🔍 Found ${orphaned.length} orphaned donation(s):`);
      orphaned.forEach(d => {
        console.log(`  - Transaction ${d.transactionID}: userID ${d.userID} -> updating to 1`);
      });

      // Update all orphaned donations to userID = 1
      for (const donation of orphaned) {
        await query(
          'UPDATE donation_transaction SET userID = 1 WHERE transactionID = ?',
          [donation.transactionID]
        );
        console.log(`  ✅ Updated transaction ${donation.transactionID} to userID = 1`);
      }
    }

    // Verify the fix
    const [verify] = await query(`
      SELECT COUNT(*) as count
      FROM donation_transaction dt
      LEFT JOIN users u ON dt.userID = u.id
      WHERE dt.userID IS NOT NULL AND u.id IS NULL
    `);

    if (verify.count === 0) {
      console.log('\n✅ All donations are now linked to valid users!');
    } else {
      console.log(`\n⚠️  Still found ${verify.count} orphaned donations`);
    }

    console.log('\n✅ Fix complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

if (require.main === module) {
  const { testConnection } = require('../config/database');
  testConnection().then(() => {
    fixDonationUserID().then(() => {
      process.exit(0);
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
  });
}

module.exports = { fixDonationUserID };

