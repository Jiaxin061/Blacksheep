const bcrypt = require('bcrypt');

async function generateHash(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Plaintext Password:', password);
  console.log('New Hash to use:', hash);
}

// Choose a simple, new password (e.g., 'TestAdmin123')
<<<<<<< HEAD
generateHash('admin123');
=======
generateHash('password');
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
