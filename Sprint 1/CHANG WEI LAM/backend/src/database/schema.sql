-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS user (
    userID INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    account_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_volunteer BOOLEAN DEFAULT FALSE,
    volunteer_badge VARCHAR(100),
    volunteer_approval_date TIMESTAMP
);


-- Create animals table
CREATE TABLE IF NOT EXISTS animals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(100) NOT NULL,
    breed VARCHAR(100),
    age INT,
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
    status ENUM('available', 'adopted', 'fostered', 'medical', 'pending') DEFAULT 'available',
    description TEXT,
    image_url VARCHAR(500),
    weight DECIMAL(5,2),
    color VARCHAR(50),
    location VARCHAR(255),
    medical_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_species (species),
    INDEX idx_status (status),
    INDEX idx_name (name)
);

