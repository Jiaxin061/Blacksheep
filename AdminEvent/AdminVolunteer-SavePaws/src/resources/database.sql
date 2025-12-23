-- Database Schema for Volunteer Management Application

-- 1. Volunteer Registration Table (UC07)
-- NOTE: In a real system, 'user_id' would be a foreign key to a main 'users' table.
CREATE TABLE Volunteer_Registration (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE, 
    user_name VARCHAR(255) NOT NULL,
    address TEXT,
    experience TEXT,
    capability TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Volunteer Events Table (UC18: View Events)
CREATE TABLE Volunteer_Event (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    max_volunteers INT
);

-- 3. Volunteer Contribution/Hours Tracking Table (UC: View Contribution)
CREATE TABLE Volunteer_Contribution (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_title VARCHAR(255) NOT NULL, -- Simplified: Could be FK to Volunteer_Event table
    hours_spent DECIMAL(5, 2) NOT NULL,
    completion_date DATE,
    status VARCHAR(50) NOT NULL, -- e.g., 'Completed', 'Ongoing', 'Verified'
    FOREIGN KEY (user_id) REFERENCES Volunteer_Registration(user_id)
);

-- 4. Event Signup Table (UC: Register for Event - User Side)
-- This table links Users to the Events they are attending.
CREATE TABLE Event_Signup (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Confirmed', -- 'Confirmed', 'Cancelled', 'Attended'
    FOREIGN KEY (user_id) REFERENCES Volunteer_Registration(user_id),
    FOREIGN KEY (event_id) REFERENCES Volunteer_Event(id)
);

-- Example Mock Data (Optional, for testing)
INSERT INTO Volunteer_Registration (user_id, user_name, status, address, experience, capability) VALUES
(1, 'Tan Qing Qing', 'Approved', '123 Volunteer Lane', 'Teaching, Coordination', 'Fluent in three languages');

INSERT INTO Volunteer_Event (id, title, description, location, start_date, end_date, max_volunteers) VALUES
(101, 'Beach Cleanup', 'Join us to clear plastics and debris from the Coastal Reserve. Gloves and bags provided.', 'Coastal Reserve', '2024-12-20 09:00:00', '2024-12-20 12:00:00', 50),
(102, 'Tree Planting', 'Help reforestation effort in the city. We aim to plant 500 saplings.', 'City Park', '2024-12-25 10:00:00', '2024-12-25 16:00:00', 30),
(103, 'Animal Shelter Support', 'Assist in feeding and cleaning for the newly rescued animals.', 'SavePaws Shelter HQ', '2024-12-28 08:00:00', '2024-12-28 14:00:00', 10),
(104, 'Fundraising Gala', 'Volunteers needed for ushering and ticket checking.', 'Grand Hall', '2025-01-05 18:00:00', '2025-01-05 22:00:00', 15),
(105, 'Community Awareness Drive', 'Distribute flyers and educate the public about pet adoption.', 'Downtown Mall', '2025-01-10 11:00:00', '2025-01-10 17:00:00', 20);

INSERT INTO Volunteer_Contribution (user_id, event_title, hours_spent, completion_date, status) VALUES
(1, 'Past Event A', 8, '2024-11-01', 'Completed'),
(1, 'Ongoing Project B', 4, '2024-12-10', 'Ongoing');