import pool from './src/config/database.js';

async function checkSchema() {
    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM adoption_updates");
        console.log("Columns in adoption_updates:");
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
