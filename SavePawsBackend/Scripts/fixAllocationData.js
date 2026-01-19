/**
 * Script to fix data for allocation ID 1
 */
require('dotenv').config();
const { testConnection, getPool } = require('../config/database');

const fixData = async () => {
    try {
        await testConnection();
        const pool = getPool();

        console.log("🛠 Updates existing allocation ID 1...");

        // Check if allocation 1 exists
        const [rows] = await pool.query("SELECT allocationID FROM fund_allocation WHERE allocationID = 1");
        if (rows.length === 0) {
            console.log("ℹ️ Allocation ID 1 does not exist. Skipping update.");
            process.exit(0);
        }

        // Run the update
        await pool.query(`
            UPDATE fund_allocation
            SET
              allocationType = 'Vet Visit',
              serviceProvider = 'Happy Paws Vet Clinic'
            WHERE allocationID = 1;
        `);

        console.log("✅ Fixed allocation ID 1 data.");

        process.exit(0);
    } catch (e) {
        console.error("❌ Failed:", e);
        process.exit(1);
    }
};

fixData();
