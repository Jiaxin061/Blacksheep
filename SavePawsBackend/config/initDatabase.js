<<<<<<< HEAD
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
    status ENUM('active', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_is_active (is_active),
    INDEX idx_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Helper function to check if column exists
const columnExists = async (pool, tableName, columnName) => {
  try {
    const [results] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ? 
      AND COLUMN_NAME = ?
    `, [tableName, columnName]);
    return results[0].count > 0;
  } catch (error) {
    return false;
  }
};

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

    // Add status column to users table if it doesn't exist (Module 3)
    try {
      const statusExists = await columnExists(pool, 'users', 'status');
      if (!statusExists) {
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN status ENUM('active', 'banned') DEFAULT 'active' AFTER is_active
        `);
        await pool.query(`CREATE INDEX idx_status ON users(status)`);
        console.log('✅ Users table status column added (Module 3)');
      } else {
        console.log('✅ Users table status column already exists');
      }
    } catch (error) {
      console.log('⚠️  Note: Could not add status column:', error.message);
    }

    // Add verification columns to rescue_tasks table if it exists (Module 3)
    try {
      // Check if rescue_tasks table exists
      const [tables] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'rescue_tasks'
      `);
      
      if (tables[0].count > 0) {
        // Table exists, add columns if they don't exist
        const verificationStatusExists = await columnExists(pool, 'rescue_tasks', 'verification_status');
        const feedbackNoteExists = await columnExists(pool, 'rescue_tasks', 'feedback_note');
        
        if (!verificationStatusExists) {
          await pool.query(`
            ALTER TABLE rescue_tasks 
            ADD COLUMN verification_status ENUM('Pending', 'Verified', 'Flagged') DEFAULT 'Pending'
          `);
          console.log('✅ Added verification_status to rescue_tasks (Module 3)');
        }
        
        if (!feedbackNoteExists) {
          await pool.query(`
            ALTER TABLE rescue_tasks 
            ADD COLUMN feedback_note TEXT NULL
          `);
          console.log('✅ Added feedback_note to rescue_tasks (Module 3)');
        }
      } else {
        console.log('⚠️  rescue_tasks table does not exist yet. Columns will be added when table is created.');
      }
    } catch (error) {
      console.log('⚠️  Note: Could not add verification columns:', error.message);
    }

    // Note: Sample data insertion with hashed passwords should be done separately
    // using the auth service to properly hash passwords
    
    console.log('🎉 Sprint 2 + Module 3 database initialization complete!');
    console.log('⚠️  Remember to create admin and user accounts using the signup/register endpoints');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };
=======
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'); // Add this line

// Helper function to generate hash
async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function initDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'karen',          // change if needed
      database: 'savepaws_db',  // your DB name
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    const schemaPath = path.join(__dirname, '..', 'database', 'schema_complete.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schemaSql);

    console.log('✅ Database tables created / verified');
    const [rows] = await connection.query(
      'SELECT COUNT(*) AS count FROM users' // choose a core table
    );

    if (rows[0].count === 0) {
      console.log('🌱 No seed data found. Inserting sample data...');

      const seedPath = path.join(__dirname, '..', 'database', 'seed_core.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf8');

      await connection.query(seedSql);

      console.log('🌱 Sample data inserted successfully');

      const passwordHash = await generateHash('password');
    console.log('🔐 Demo password hash generated');

    // 4️⃣ Insert / update demo users
    await connection.execute(
      `
      INSERT INTO users (ic_number, first_name, last_name, email, phone_number, password_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
      `,
      ['000101014321', 'Demo', 'User1', 'demo.user1@savepaws.com', '0123456789', passwordHash, 'active']
    );

    // 5️⃣ Insert / update admins
    await connection.execute(
      `
      INSERT INTO admins (username, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
      `,
      ['admin_core', 'admin@savepaws.com', passwordHash, 'System Administrator', 'super_admin']
    );

    console.log('✅ Demo users & admins seeded with backend-generated hash');

    } else {
      console.log('ℹ️ Seed data already exists. Skipping seeding.');
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1); // STOP server if DB init fails
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = initDatabase;
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
