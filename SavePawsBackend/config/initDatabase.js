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
      password: 'weilam0815',          // change if needed
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
