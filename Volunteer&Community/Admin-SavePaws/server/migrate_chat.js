const mysql = require('mysql2/promise');
const dbConfig = require('../src/resources/db_config');

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
        });
        console.log('Connected to MySQL Database');

        console.log('Adding is_active column to ai_chats...');
        await connection.query('ALTER TABLE ai_chats ADD COLUMN is_active TINYINT(1) DEFAULT 1');

        console.log('Successfully updated database schema!');

    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column is_active already exists.');
        } else {
            console.error('Migration error:', err);
        }
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
