import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'savepaws',
        });

        console.log('🗑️  Dropping tables...');

        // Order matters due to foreign keys
        await connection.query('DROP TABLE IF EXISTS adoption_requests');
        await connection.query('DROP TABLE IF EXISTS animals');
        await connection.query('DROP TABLE IF EXISTS user');
        await connection.query('DROP TABLE IF EXISTS users'); // Clean up zombie table

        console.log('✅ Tables dropped.');

    } catch (error) {
        console.log('❌ Error: ' + error.message);
    } finally {
        if (connection) await connection.end();
    }
}

resetDatabase();
