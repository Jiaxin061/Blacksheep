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
    volunteer_approval_date TIMESTAMP NULL
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
    FOREIGN KEY (created_by) REFERENCES user(userID) ON DELETE SET NULL,
    INDEX idx_species (species),
    INDEX idx_status (status),
    INDEX idx_name (name)
);

-- Create adoption_requests table
CREATE TABLE IF NOT EXISTS adoption_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    animal_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    adoption_reason TEXT,
    housing_type VARCHAR(100),
    rejection_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES user(userID) ON DELETE CASCADE,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_animal_id (animal_id),
    INDEX idx_status (status),
    INDEX idx_request_date (request_date)
);


-- Create adoption_updates table
CREATE TABLE IF NOT EXISTS adoption_updates (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    adoption_request_id INT NOT NULL,
    user_id INT NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    health_status VARCHAR(100) NOT NULL,
    description TEXT,
    photo_url VARCHAR(500),
    review_status ENUM('pending', 'satisfactory', 'needs_visit') DEFAULT 'pending',
    admin_notes TEXT,
    FOREIGN KEY (adoption_request_id) REFERENCES adoption_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(userID) ON DELETE CASCADE,
    INDEX idx_adoption_request (adoption_request_id),
    INDEX idx_user (user_id),
    INDEX idx_review_status (review_status)
);
