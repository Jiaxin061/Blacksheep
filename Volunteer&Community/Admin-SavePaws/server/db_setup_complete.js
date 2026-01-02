const mysql = require('mysql2/promise');
const dbConfig = require('../src/resources/db_config');

async function setupDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true
    });
    console.log('Connected to MySQL Database');

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const dropTables = [
      'volunteer_registration',
      'volunteer_events',
      'volunteer_contribution',
      'users',
      'post_comments',
      'event_records',
      'community_posts',
      'ai_chats',
      'admins'
    ];
    for (const table of dropTables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }
    console.log('Cleaned up existing tables');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. admins
    await connection.query(`
            CREATE TABLE admins (
              adminID int(11) NOT NULL AUTO_INCREMENT,
              email varchar(255) NOT NULL,
              password_hash varchar(255) NOT NULL,
              first_name varchar(100) DEFAULT NULL,
              last_name varchar(100) DEFAULT NULL,
              phone_number varchar(20) DEFAULT NULL,
              account_status enum('Active','Inactive') DEFAULT 'Active',
              registration_date timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (adminID),
              UNIQUE KEY email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

    // 2. users
    await connection.query(`
            CREATE TABLE users (
              userID int(11) NOT NULL AUTO_INCREMENT,
              email varchar(255) NOT NULL,
              password_hash varchar(255) NOT NULL,
              first_name varchar(100) DEFAULT NULL,
              last_name varchar(100) DEFAULT NULL,
              phone_number varchar(20) DEFAULT NULL,
              account_status enum('Active','Pending Verification','Locked') DEFAULT 'Pending Verification',
              registration_date timestamp NOT NULL DEFAULT current_timestamp(),
              is_volunteer tinyint(1) DEFAULT 0,
              volunteer_badge varchar(50) DEFAULT NULL,
              volunteer_approval_date timestamp NULL DEFAULT NULL,
              PRIMARY KEY (userID),
              UNIQUE KEY email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

    // 3. volunteer_events
    await connection.query(`
            CREATE TABLE volunteer_events (
              eventID int(11) NOT NULL AUTO_INCREMENT,
              title varchar(255) NOT NULL,
              description text DEFAULT NULL,
              eventLocation varchar(255) DEFAULT NULL,
              start_date datetime DEFAULT NULL,
              end_date datetime DEFAULT NULL,
              max_volunteers int(11) DEFAULT NULL,
              adminID int(11) NOT NULL,
              image_url text DEFAULT NULL,
              time_range varchar(100) DEFAULT NULL,
              tag_text varchar(50) DEFAULT NULL,
              tag_color varchar(20) DEFAULT NULL,
              PRIMARY KEY (eventID),
              KEY adminID (adminID)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

    // 4. event_records
    await connection.query(`
            CREATE TABLE event_records (
              recordID int(11) NOT NULL AUTO_INCREMENT,
              userID int(11) NOT NULL,
              eventID int(11) NOT NULL,
              register_date timestamp NOT NULL DEFAULT current_timestamp(),
              status enum('Registered','No-show') DEFAULT 'Registered',
              PRIMARY KEY (recordID),
              KEY userID (userID),
              KEY eventID (eventID)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

    // 5. community_posts
    await connection.query(`
            CREATE TABLE community_posts (
              postID int(11) NOT NULL AUTO_INCREMENT,
              userID int(11) NOT NULL,
              content_text text DEFAULT NULL,
              content_image varchar(255) DEFAULT NULL,
              post_status enum('Active','Deleted') DEFAULT 'Active',
              post_created_at timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (postID),
              KEY userID (userID)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

    // 6. post_comments
    await connection.query(`
            CREATE TABLE post_comments (
              commentID int(11) NOT NULL AUTO_INCREMENT,
              postID int(11) NOT NULL,
              userID int(11) NOT NULL,
              comment_text text NOT NULL,
              comment_date timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (commentID),
              KEY postID (postID),
              KEY userID (userID)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

    // 7. ai_chats
    await connection.query(`
            CREATE TABLE ai_chats (
              chatID int(11) NOT NULL AUTO_INCREMENT,
              userID int(11) NOT NULL,
              user_query text NOT NULL,
              ai_response text NOT NULL,
              chat_timestamp timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (chatID),
              KEY userID (userID)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

    // 8. volunteer_contribution
    await connection.query(`
            CREATE TABLE volunteer_contribution (
              contributionID int(11) NOT NULL AUTO_INCREMENT,
              userID int(11) NOT NULL,
              eventID int(11) NOT NULL,
              hours_contributed decimal(5,2) DEFAULT NULL,
              participation_status enum('Registered','Attended','No-show') DEFAULT 'Registered',
              PRIMARY KEY (contributionID),
              KEY userID (userID),
              KEY eventID (eventID)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

    // 9. volunteer_registration
    await connection.query(`
            CREATE TABLE volunteer_registration (
              registrationID int(11) NOT NULL AUTO_INCREMENT,
              userID int(11) NOT NULL,
              userName varchar(255) DEFAULT NULL,
              location varchar(255) DEFAULT NULL,
              experience text DEFAULT NULL,
              capability text DEFAULT NULL,
              registration_status enum('Pending','Approved','Rejected') DEFAULT 'Pending',
              submition_date timestamp NOT NULL DEFAULT current_timestamp(),
              adminID int(11) DEFAULT NULL,
              reviewed_date timestamp NULL DEFAULT NULL,
              rejection_reason text DEFAULT NULL,
              PRIMARY KEY (registrationID),
              KEY userID (userID),
              KEY adminID (adminID)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

    console.log('Tables created successfully');

    // Adding FKs
    await connection.query(`ALTER TABLE ai_chats ADD CONSTRAINT ai_chats_ibfk_1 FOREIGN KEY (userID) REFERENCES users (userID) ON DELETE CASCADE;`);
    await connection.query(`ALTER TABLE community_posts ADD CONSTRAINT community_posts_ibfk_1 FOREIGN KEY (userID) REFERENCES users (userID) ON DELETE CASCADE;`);
    await connection.query(`ALTER TABLE event_records ADD CONSTRAINT event_records_ibfk_1 FOREIGN KEY (userID) REFERENCES users (userID) ON DELETE CASCADE;`);
    await connection.query(`ALTER TABLE event_records ADD CONSTRAINT event_records_ibfk_2 FOREIGN KEY (eventID) REFERENCES volunteer_events (eventID) ON DELETE CASCADE;`);
    await connection.query(`ALTER TABLE post_comments ADD CONSTRAINT post_comments_ibfk_1 FOREIGN KEY (postID) REFERENCES community_posts (postID) ON DELETE CASCADE;`);
    await connection.query(`ALTER TABLE post_comments ADD CONSTRAINT post_comments_ibfk_2 FOREIGN KEY (userID) REFERENCES users (userID) ON DELETE CASCADE;`);
    await connection.query(`ALTER TABLE volunteer_contribution ADD CONSTRAINT volunteer_contribution_ibfk_1 FOREIGN KEY (userID) REFERENCES users (userID) ON DELETE CASCADE;`);
    await connection.query(`ALTER TABLE volunteer_contribution ADD CONSTRAINT volunteer_contribution_ibfk_2 FOREIGN KEY (eventID) REFERENCES volunteer_events (eventID) ON DELETE CASCADE;`);
    await connection.query(`ALTER TABLE volunteer_events ADD CONSTRAINT volunteer_events_ibfk_1 FOREIGN KEY (adminID) REFERENCES admins (adminID) ON DELETE CASCADE;`);
    await connection.query(`ALTER TABLE volunteer_registration ADD CONSTRAINT volunteer_registration_ibfk_1 FOREIGN KEY (userID) REFERENCES users (userID) ON DELETE CASCADE;`);
    await connection.query(`ALTER TABLE volunteer_registration ADD CONSTRAINT volunteer_registration_ibfk_2 FOREIGN KEY (adminID) REFERENCES admins (adminID) ON DELETE SET NULL;`);

    console.log('Foreign keys added');

    // Sample Data from Dump
    await connection.query("INSERT INTO admins (adminID, email, password_hash, first_name, last_name, account_status) VALUES (1, 'admin@example.com', 'hash', 'System', 'Admin', 'Active')");
    await connection.query("INSERT INTO users (userID, email, password_hash, first_name, last_name, account_status, is_volunteer) VALUES (1, 'user@example.com', 'hash', 'Test', 'User', 'Active', 1)");
    await connection.query(`INSERT INTO volunteer_events (eventID, title, description, eventLocation, start_date, end_date, max_volunteers, adminID, image_url, time_range, tag_text, tag_color) VALUES 
            (1, 'Beach Cleanup Drive', 'Join us to clean up the local beach and save marine life.', 'Sunny Beach, CA', '2026-01-01 08:00:00', '2026-01-01 12:00:00', 50, 1, 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4', '08:00 AM - 12:00 PM', 'Urgent', '#ef4444')`);
    await connection.query("INSERT INTO event_records (recordID, userID, eventID, status) VALUES (1, 1, 1, 'Registered'), (2, 1, 1, 'Registered')");
    await connection.query("INSERT INTO community_posts (postID, userID, content_text, content_image, post_status) VALUES (1, 1, 'Just joined the SavePaws community! Look at this cute visitor I found today.', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop', 'Active')");

    console.log('Sample data inserted successfully');

  } catch (err) {
    console.error('Fatal Error:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
