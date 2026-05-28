const { testConnection, query } = require('./config/database');

async function check() {
    const connected = await testConnection();
    if (!connected) return;

    try {
        console.log('--- Animals Table Structure ---');
        const columns = await query('SHOW COLUMNS FROM animals');
        console.table(columns);

        console.log('--- Animals Table Data (First 10) ---');
        const data = await query('SELECT id, name, status FROM animals LIMIT 10');
        console.table(data);

        process.exit(0);
    } catch (error) {
        console.error('Error checking DB:', error);
        process.exit(1);
    }
}

check();
