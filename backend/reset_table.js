import pool from './src/config/database.js';

async function resetTable() {
    try {
        console.log("Dropping adoption_updates table...");
        await pool.query("DROP TABLE IF EXISTS adoption_updates");
        console.log("Table dropped.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

resetTable();
