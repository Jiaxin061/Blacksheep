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

        // Increase content_image column length to avoid truncation errors
        await connection.query('ALTER TABLE community_posts MODIFY COLUMN content_image TEXT');
        console.log('Successfully modified community_posts.content_image to TEXT');

    } catch (err) {
        console.error('Migration Error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
