import pool from './src/config/database.js';

async function checkData() {
    try {
        const [users] = await pool.query("SELECT userID, first_name FROM user LIMIT 5");
        const [requests] = await pool.query("SELECT id, user_id, status FROM adoption_requests WHERE status = 'approved' LIMIT 5");

        console.log("Users:", users);
        console.log("Approved Requests:", requests);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
