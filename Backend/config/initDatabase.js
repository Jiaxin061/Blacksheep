const { getPool } = require('./database');

// SQL to create the users table
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL to create the admins table
const createAdminsTable = `
  CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL to create the reports table (UPDATED with user_id)
const createReportsTable = `
  CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    animal_type ENUM('dog', 'cat', 'other') NOT NULL,
    urgency_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    animal_condition VARCHAR(255) NULL,
    description TEXT NOT NULL,
    location_latitude DECIMAL(10, 8) NULL,
    location_longitude DECIMAL(11, 8) NULL,
    location_address VARCHAR(500) NULL,
    photo_url VARCHAR(500) NULL,
    reporter_name VARCHAR(100) NULL,
    reporter_phone VARCHAR(20) NULL,
    status ENUM('pending', 'assigned', 'in_progress', 'rescued', 'closed') DEFAULT 'pending',
    assigned_to INT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_urgency_level (urgency_level),
    INDEX idx_animal_type (animal_type),
    INDEX idx_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL to insert sample admin (password: admin123)
const insertSampleAdmin = `
  INSERT INTO admins (username, email, password_hash, full_name, role)
  VALUES 
    ('admin', 'admin@savepaws.org', '$2b$10$YourHashedPasswordHere', 'System Administrator', 'super_admin')
  ON DUPLICATE KEY UPDATE email=email;
`;

// SQL to insert sample user (password: user123)
const insertSampleUser = `
  INSERT INTO users (first_name, last_name, email, phone_number, password_hash)
  VALUES 
    ('John', 'Doe', 'john.doe@example.com', '+60123456789', '$2b$10$YourHashedPasswordHere')
  ON DUPLICATE KEY UPDATE email=email;
`;

// Initialize database
const initializeDatabase = async () => {
  try {
    console.log('🔨 Initializing Sprint 2 database...');
    
    const pool = getPool();

    // Create users table
    await pool.query(createUsersTable);
    console.log('✅ Users table created/verified');

    // Create admins table
    await pool.query(createAdminsTable);
    console.log('✅ Admins table created/verified');

    // Create/update reports table
    await pool.query(createReportsTable);
    console.log('✅ Reports table created/verified');

    // Note: Sample data insertion with hashed passwords should be done separately
    // using the auth service to properly hash passwords
    
    console.log('🎉 Sprint 2 database initialization complete!');
    console.log('⚠️  Remember to create admin and user accounts using the signup/register endpoints');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };