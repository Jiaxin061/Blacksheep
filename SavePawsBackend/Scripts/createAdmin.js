require('dotenv').config();
const bcrypt = require('bcrypt');
const { testConnection, query } = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const createAdmin = async () => {
  try {
    console.log('\n🔐 SavePaws - Create Admin Account\n');
    console.log('================================\n');

    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    // Get admin details
    const username = await question('Admin Username: ');
    const email = await question('Admin Email: ');
    const fullName = await question('Full Name: ');
    const password = await question('Password (min 6 characters): ');
    const confirmPassword = await question('Confirm Password: ');

    // Validation
    if (!username || !email || !fullName || !password) {
      console.error('\n❌ All fields are required');
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('\n❌ Password must be at least 6 characters');
      rl.close();
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('\n❌ Passwords do not match');
      rl.close();
      process.exit(1);
    }

    // Check if admin already exists
    const checkEmail = 'SELECT COUNT(*) as count FROM admins WHERE email = ?';
    const emailResult = await query(checkEmail, [email]);
    
    if (emailResult[0].count > 0) {
      console.error('\n❌ Email already exists');
      rl.close();
      process.exit(1);
    }

    const checkUsername = 'SELECT COUNT(*) as count FROM admins WHERE username = ?';
    const usernameResult = await query(checkUsername, [username]);
    
    if (usernameResult[0].count > 0) {
      console.error('\n❌ Username already exists');
      rl.close();
      process.exit(1);
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert admin
    const sql = `
      INSERT INTO admins (username, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, 'super_admin')
    `;
    
    await query(sql, [username, email, password_hash, fullName]);

    console.log('\n✅ Admin account created successfully!');
    console.log('\n📝 Admin Details:');
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: Super Admin`);
    console.log('\n💡 You can now login with these credentials\n');

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    rl.close();
    process.exit(1);
  }
};

// Run the script
createAdmin();