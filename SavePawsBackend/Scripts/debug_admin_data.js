const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuration candidates
const configs = [
    {
        name: 'Configured Default (with admin123)',
        host: 'localhost',
        user: 'root',
        password: 'admin123',
        port: 3306,
        database: 'savepaws_db'
    },
    {
        name: 'XAMPP Default (Empty Password)',
        host: 'localhost',
        user: 'root',
        password: '',
        port: 3306,
        database: 'savepaws_db'
    }
];

async function run() {
    let connection = null;
    let validConfig = null;

    console.log('🔍 Starting Database Diagnosis...');

    // 1. Try to connect
    for (const config of configs) {
        console.log(`\nTesting connection: ${config.name}...`);
        try {
            connection = await mysql.createConnection(config);
            console.log('✅ Connection successful!');
            validConfig = config;
            break;
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
    }

    if (!connection) {
        console.error('\n❌ Could not connect to database with any common configuration.');
        console.error('Please check if XAMPP MySQL is running.');
        process.exit(1);
    }

    // 2. Check Data
    try {
        console.log('\n📊 Checking Admin Data...');

        try {
            // Check Events
            const [events] = await connection.execute('SELECT COUNT(*) as count FROM volunteer_events');
            console.log(`- Volunteer Events: ${events[0].count}`);

            // Check Registrations
            const [registrations] = await connection.execute('SELECT COUNT(*) as count FROM volunteer_registration');
            console.log(`- Volunteer Registrations: ${registrations[0].count}`);

            if (events[0].count === 0 && registrations[0].count === 0) {
                console.log('\n⚠️  Tables are empty! Attempting to seed data...');
                await seedData(connection);
            } else {
                console.log('\n✅ Data exists. If fetch is still failing, check API endpoint or Auth.');
            }

        } catch (err) {
            if (err.code === 'ER_NO_DB_ERROR') {
                console.log('❌ Database savepaws_db does not exist.');
            } else if (err.code === 'ER_NO_SUCH_TABLE') {
                console.log('❌ Tables do not exist. Please run schema_complete.sql first.');
            } else {
                console.error('❌ Error checking data:', err.message);
            }
        }


    } catch (error) {
        console.error('Unexpected error:', error);
    } finally {
        if (connection) await connection.end();
    }

    // 3. Recommendation for database.js
    if (validConfig.password !== 'admin123') {
        console.log('\n⚠️  ACTION REQUIRED:');
        console.log(`Your database password is "${validConfig.password}" (likely empty), but config/database.js probably has "admin123".`);
        console.log('Please update SavePawsBackend/config/database.js to match your local setup.');
    }
}

async function seedData(connection) {
    const seedPath = path.join(__dirname, '../database/seed_core.sql');
    try {
        const sql = fs.readFileSync(seedPath, 'utf8');

        // Very basic SQL splitter for this specific file structure
        // WARNING: This is a simple implementation. Complex SQL might need a better parser.
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} SQL statements to execute.`);

        for (const statement of statements) {
            // Skip comments only if they are the whole line (simplified)
            if (statement.startsWith('--')) continue;

            try {
                await connection.query(statement);
            } catch (err) {
                console.warn(`Warning executing statement: ${statement.substring(0, 50)}...`, err.message);
                // Continue despite errors (e.g. duplicates)
            }
        }
        console.log('✅ Seeding completed.');
    } catch (error) {
        console.error('❌ Failed to read or execute seed file:', error.message);
    }
}

run();
