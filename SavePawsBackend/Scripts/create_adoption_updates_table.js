const { testConnection, getPool } = require('../config/database');

const createTable = async () => {
    try {
        console.log('Initializing database connection...');
        const connected = await testConnection();
        if (!connected) {
            console.error('Failed to connect to database.');
            process.exit(1);
        }

        const pool = getPool();
        console.log('Creating adoption_updates table...');

        const query = `
            CREATE TABLE IF NOT EXISTS adoption_updates (
                review_id INT AUTO_INCREMENT PRIMARY KEY,
                adoption_request_id INT NOT NULL,
                user_id INT NOT NULL,
                health_status VARCHAR(255),
                description TEXT,
                photo_url VARCHAR(500),
                review_status ENUM('pending', 'satisfactory', 'needs_visit') DEFAULT 'pending',
                admin_notes TEXT,
                update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (adoption_request_id) REFERENCES adoption_requests(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_adoption_request (adoption_request_id),
                INDEX idx_user (user_id),
                INDEX idx_status (review_status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await pool.execute(query);
        console.log('✅ adoption_updates table created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating table:', error);
        process.exit(1);
    }
};

createTable();
