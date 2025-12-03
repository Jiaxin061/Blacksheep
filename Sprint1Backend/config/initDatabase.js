const { getPool } = require('./database');

// SQL to create the reports table
const createReportsTable = `
  CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    reporter_name VARCHAR(100) NOT NULL,
    reporter_contact VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NULL,
    status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_animal_type (animal_type),
    INDEX idx_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// SQL to insert sample data
const insertSampleData = `
  INSERT INTO reports (animal_type, description, location, latitude, longitude, reporter_name, reporter_contact, status)
  VALUES 
    ('dog', 'Friendly stray dog near the park, appears healthy and well-fed. Brown color with white patches.', 'Central Park, 5th Avenue', 40.785091, -73.968285, 'John Doe', 'john.doe@email.com', 'pending'),
    ('cat', 'Injured cat with hurt paw, limping badly. Needs immediate veterinary attention.', '123 Main Street, near coffee shop', 40.730610, -73.935242, 'Jane Smith', '+1-555-0123', 'in_progress'),
    ('dog', 'Large dog found wandering, no collar. Very friendly but seems lost.', 'Downtown Shopping District', 40.758896, -73.985130, 'Mike Johnson', 'mike.j@example.com', 'pending'),
    ('cat', 'Mother cat with kittens under abandoned building. Need rescue.', 'Old Factory Road, Building 5', 40.748817, -73.985428, 'Sarah Williams', '+1-555-0456', 'pending'),
    ('bird', 'Injured pigeon unable to fly. Wing appears broken.', 'City Square Garden', 40.741895, -73.989308, 'Robert Brown', 'r.brown@email.com', 'resolved'),
    ('rabbit', 'Domestic rabbit found in park, clearly not wild. White with black spots.', 'Riverside Park West', 40.782865, -73.977184, 'Emily Davis', '+1-555-0789', 'closed');
`;

// Initialize database
const initializeDatabase = async () => {
  try {
    console.log('🔨 Initializing database...');
    
    const pool = getPool();

    // Create reports table
    await pool.query(createReportsTable);
    console.log('✅ Reports table created/verified');

    // Check if table is empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM reports');
    if (rows[0].count === 0) {
      console.log('📝 Inserting sample data...');
      await pool.query(insertSampleData);
      console.log('✅ Sample data inserted successfully');
    } else {
      console.log(`📊 Table already has ${rows[0].count} reports`);
    }

    console.log('🎉 Database initialization complete!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };