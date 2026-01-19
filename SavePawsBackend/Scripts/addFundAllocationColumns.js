/**
 * Script to add missing columns to fund_allocation table
 * Run: node Scripts/addFundAllocationColumns.js
 */

require('dotenv').config();
const { testConnection, getPool } = require('../config/database');

const addFundAllocationColumns = async () => {
    try {
        console.log('🔨 Adding missing columns to fund_allocation table...');

        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        const pool = getPool();

        const columnsToAdd = [
            { name: 'allocationType', type: "VARCHAR(100) NULL" },
            { name: 'serviceProvider', type: "VARCHAR(255) NULL" },
            { name: 'publicDescription', type: "TEXT NULL" },
            { name: 'internalNotes', type: "TEXT NULL" },
            { name: 'conditionUpdate', type: "TEXT NULL" },
            { name: 'status', type: "ENUM('Draft', 'Verified', 'Published') DEFAULT 'Draft'" },
            { name: 'donationCoveredAmount', type: "DECIMAL(10, 2) DEFAULT 0" },
            { name: 'externalCoveredAmount', type: "DECIMAL(10, 2) DEFAULT 0" },
            { name: 'externalFundingSource', type: "VARCHAR(255) NULL" },
            { name: 'externalFundingNotes', type: "TEXT NULL" },
            { name: 'fundingStatus', type: "ENUM('Fully Funded', 'Partially Funded') DEFAULT 'Fully Funded'" }
        ];

        for (const col of columnsToAdd) {
            // Check if column exists
            const [columns] = await pool.query(`
          SELECT COUNT(*) as count 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'fund_allocation' 
          AND COLUMN_NAME = ?
        `, [col.name]);

            if (columns[0].count > 0) {
                console.log(`✅ ${col.name} already exists`);
            } else {
                try {
                    const alterSql = `ALTER TABLE fund_allocation ADD COLUMN ${col.name} ${col.type}`;
                    await pool.query(alterSql);
                    console.log(`✅ Added ${col.name}`);
                } catch (e) {
                    console.error(`❌ Error adding ${col.name}: ${e.message}`);
                }
            }
        }

        // Create new index on status if not exists
        try {
            await pool.query(`CREATE INDEX idx_allocation_status ON fund_allocation(status)`);
            console.log('✅ Index created on status column');
        } catch (e) {
            // Index might exist
            if (!e.message.includes("Duplicate key name")) {
                console.log(`Note checking index: ${e.message}`);
            }
        }

        console.log('\n🎉 Fund allocation schema update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating schema:', error.message);
        console.error(error);
        process.exit(1);
    }
};

addFundAllocationColumns();
