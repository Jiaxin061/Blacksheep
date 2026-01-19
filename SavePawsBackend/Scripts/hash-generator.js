const bcrypt = require('bcrypt');

async function generateHash(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Plaintext Password:', password);
  console.log('New Hash to use:', hash);
}

// Choose a simple, new password (e.g., 'TestAdmin123')
generateHash('password');