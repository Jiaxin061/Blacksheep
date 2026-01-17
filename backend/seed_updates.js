import pool from './src/config/database.js';

async function seedApp() {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        console.log("Seeding reviewed adoption updates...");

        // Update 1: Satisfactory
        await connection.execute(`
      INSERT INTO adoption_updates (
        adoption_request_id, user_id, health_status, description, 
        review_status, admin_notes, update_date
      ) VALUES (
        2, 1, 'Doing great!', 'Buddy has settled in perfectly. He loves playing fetch.',
        'satisfactory', 'Great to hear! Keep up the good work.', DATE_SUB(NOW(), INTERVAL 2 DAY)
      )
    `);

        // Update 2: Needs Visit
        await connection.execute(`
      INSERT INTO adoption_updates (
        adoption_request_id, user_id, health_status, description, 
        review_status, admin_notes, update_date
      ) VALUES (
        4, 1, 'Minor skin issue', 'He has been scratching a lot lately. Not sure if it is allergies.',
        'needs_visit', 'Please schedule a vet visit ASAP and send us the report.', DATE_SUB(NOW(), INTERVAL 5 DAY)
      )
    `);

        await connection.commit();
        console.log("Seeding completed successfully.");
        process.exit(0);

    } catch (error) {
        await connection.rollback();
        console.error("Seeding failed:", error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

seedApp();
