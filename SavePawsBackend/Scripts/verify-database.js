import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function verifyDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'savepaws',
    });

    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📊 Tables in database:');
    if (tables.length === 0) {
      console.log('   ⚠️  No tables found!');
    } else {
      tables.forEach(table => {
        console.log(`   ✅ ${Object.values(table)[0]}`);
      });
    }

    // Check table structures
    if (tables.length > 0) {
      console.log('\n📋 Table structures:');
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        const [columns] = await connection.query(`DESCRIBE ${tableName}`);
        console.log(`\n   Table: ${tableName}`);
        columns.forEach(col => {
          console.log(`     - ${col.Field} (${col.Type})`);
        });
      }
    }

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

verifyDatabase();








