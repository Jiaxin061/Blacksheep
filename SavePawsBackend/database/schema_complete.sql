-- =====================================================
-- SavePaws Complete Database Schema
-- =====================================================
-- This script creates all tables needed for the SavePaws application
-- Run this script to set up the entire database from scratch
-- 
-- Tables included:
-- - users (authentication and user management)
-- - admins (admin authentication and management)
-- - reports (animal rescue reports)
-- - rescue_tasks (rescue task management)
-- - animals (animals available for adoption)
-- - adoption_requests (adoption request management)
-- - animal_profile (animals for donation funding)
-- - donation_transaction (donation records)
-- - fund_allocation (fund allocation tracking)
-- - animal_progress_update (animal recovery progress)
-- - admin_activity_log (admin activity tracking)
-- - reward_item (reward catalog)
-- - reward_point_ledger (reward points tracking)
-- - redemption_record (reward redemption records)
-- =====================================================

-- Database setup is handled by config/database.js and initDatabase.js
-- USE savepaws_db;

-- =====================================================
-- PART 1: USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ic_number VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  status ENUM('active', 'banned') DEFAULT 'active',
  is_volunteer BOOLEAN DEFAULT FALSE,
  volunteer_badge VARCHAR(50) DEFAULT NULL,
  volunteer_approval_date TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_is_active (is_active),
  INDEX idx_status (status),
  INDEX idx_is_volunteer (is_volunteer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 2: ADMINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) DEFAULT NULL,
  last_name VARCHAR(100) DEFAULT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  account_status ENUM('Active','Inactive') DEFAULT 'Active',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 3: REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  animal_type ENUM('dog', 'cat', 'other') NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(500) NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  photo_url VARCHAR(500) NULL,
  reporter_name VARCHAR(100) NULL,
  reporter_phone VARCHAR(20) NULL,
  reporter_contact VARCHAR(20) NULL,
  status ENUM('pending','active','approved','closed') DEFAULT 'pending',
  assigned_to INT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_animal_type (animal_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 4: RESCUE TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS rescue_tasks (
  id INT NOT NULL PRIMARY KEY,
  report_id INT NOT NULL,
  urgency_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  status ENUM('available', 'assigned', 'in_progress', 'completed') DEFAULT 'available',
  assigned_to_user_id INT NULL,
  assigned_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  update_text TEXT NULL,
  update_image VARCHAR(500) NULL,
  verification_status ENUM('Pending', 'Verified', 'Flagged') DEFAULT 'Pending',
  feedback_note TEXT NULL,
  created_by_admin_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_report_id (report_id),
  INDEX idx_status (status),
  INDEX idx_urgency_level (urgency_level),
  INDEX idx_assigned_to_user_id (assigned_to_user_id),
  INDEX idx_verification_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 5: ANIMALS TABLE (For Adoption)
-- =====================================================
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
  INDEX idx_name (name),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 6: ADOPTION REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS adoption_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  animal_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  adoption_reason TEXT,
  housing_type VARCHAR(100),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_animal_id (animal_id),
  INDEX idx_status (status),
  INDEX idx_request_date (request_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 7: ANIMAL PROFILE TABLE (For Donations)
-- =====================================================
CREATE TABLE IF NOT EXISTS animal_profile (
  animalID INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  story TEXT,
  fundingGoal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  amountRaised DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('Active', 'Funded', 'Adopted', 'Archived') NOT NULL DEFAULT 'Active',
  photoURL VARCHAR(500),
  adminID INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (adminID) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 8: DONATION TRANSACTION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS donation_transaction (
  transactionID INT PRIMARY KEY AUTO_INCREMENT,
  userID INT NULL,
  animalID INT NOT NULL,
  donation_amount DECIMAL(10, 2) NOT NULL,
  type ENUM('One-time', 'Monthly') NOT NULL DEFAULT 'One-time',
  payment_processor_id VARCHAR(255),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_status ENUM('Success', 'Failed', 'Pending') NOT NULL DEFAULT 'Pending',
  donor_name VARCHAR(255),
  donor_email VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animalID) REFERENCES animal_profile(animalID) ON DELETE CASCADE,
  FOREIGN KEY (userID) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_animalID (animalID),
  INDEX idx_userID (userID),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 9: FUND ALLOCATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS fund_allocation (
  allocationID INT PRIMARY KEY AUTO_INCREMENT,
  transactionID INT NULL,
  animalID INT NOT NULL,
  category ENUM('Vet', 'Medication', 'Food', 'Shelter', 'Other') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  allocationType VARCHAR(100) NULL,
  serviceProvider VARCHAR(255) NULL,
  publicDescription TEXT NULL,
  internalNotes TEXT NULL,
  conditionUpdate TEXT NULL,
  status ENUM('Draft', 'Verified', 'Published') DEFAULT 'Draft',
  donationCoveredAmount DECIMAL(10, 2) DEFAULT 0,
  externalCoveredAmount DECIMAL(10, 2) DEFAULT 0,
  externalFundingSource VARCHAR(255) NULL,
  externalFundingNotes TEXT NULL,
  fundingStatus ENUM('Fully Funded', 'Partially Funded') DEFAULT 'Fully Funded',
  allocationDate DATE NOT NULL,
  receiptImage VARCHAR(500) NULL,
  treatmentPhoto VARCHAR(500) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (transactionID) REFERENCES donation_transaction(transactionID) ON DELETE CASCADE,
  FOREIGN KEY (animalID) REFERENCES animal_profile(animalID) ON DELETE CASCADE,
  INDEX idx_transactionID (transactionID),
  INDEX idx_animalID (animalID),
  INDEX idx_category (category),
  INDEX idx_allocationDate (allocationDate),
  INDEX idx_status (status),
  CONSTRAINT chk_positive_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 10: ANIMAL PROGRESS UPDATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS animal_progress_update (
  updateID INT PRIMARY KEY AUTO_INCREMENT,
  animalID INT NOT NULL,
  allocationID INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  medicalCondition VARCHAR(500),
  recoveryStatus ENUM('Under Treatment', 'Recovering', 'Fully Recovered', 'Adopted', 'Other') NOT NULL,
  updateDate DATE NOT NULL,
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (animalID) REFERENCES animal_profile(animalID) ON DELETE CASCADE,
  FOREIGN KEY (allocationID) REFERENCES fund_allocation(allocationID) ON DELETE SET NULL,
  FOREIGN KEY (createdBy) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_animalID (animalID),
  INDEX idx_allocationID (allocationID),
  INDEX idx_recoveryStatus (recoveryStatus),
  INDEX idx_updateDate (updateDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 11: ADMIN ACTIVITY LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  logID INT PRIMARY KEY AUTO_INCREMENT,
  adminID INT NOT NULL,
  actionType ENUM('CREATE_ALLOCATION', 'UPDATE_ALLOCATION', 'DELETE_ALLOCATION', 'UPDATE_PROGRESS', 'UPDATE_ANIMAL') NOT NULL,
  entityType ENUM('fund_allocation', 'animal_progress', 'animal_profile') NOT NULL,
  entityID INT NOT NULL,
  description TEXT,
  oldValues JSON,
  newValues JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (adminID) REFERENCES admins(id) ON DELETE CASCADE,
  INDEX idx_adminID (adminID),
  INDEX idx_actionType (actionType),
  INDEX idx_entityType (entityType),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 12: REWARD SYSTEM
-- =====================================================

-- 12.1 Reward Items Table
CREATE TABLE IF NOT EXISTS reward_item (
  rewardID VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  partnerName VARCHAR(100) NOT NULL,
  category ENUM('Medical','Food','Grooming','Utility') NOT NULL,
  description TEXT,
  imageURL VARCHAR(255),
  pointsRequired INT NOT NULL,
  validityMonths INT NOT NULL,
  terms TEXT,
  quantity INT DEFAULT NULL,
  status ENUM('Active', 'Archived') DEFAULT 'Active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12.2 Reward Point Ledger (Earn/Spend/Expire)
CREATE TABLE IF NOT EXISTS reward_point_ledger (
  ledgerID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  points INT NOT NULL,
  type ENUM('EARN', 'SPEND', 'EXPIRE', 'ADJUST') NOT NULL,
  source ENUM('DONATION', 'REWARD_REDEMPTION', 'SYSTEM') NOT NULL,
  referenceID VARCHAR(100) NULL,
  expiryDate DATETIME NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_donation_earn (referenceID, type, source),
  INDEX idx_userID (userID),
  INDEX idx_type (type),
  INDEX idx_expiryDate (expiryDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12.3 Redemption Record
CREATE TABLE IF NOT EXISTS redemption_record (
  redemptionID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  rewardID VARCHAR(50) NOT NULL,
  rewardTitle VARCHAR(100) NOT NULL,
  partnerName VARCHAR(100),
  pointsSpent INT NOT NULL,
  qrCodeData VARCHAR(255) NOT NULL,
  status ENUM('Active', 'Used', 'Expired') DEFAULT 'Active',
  redeemedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiryDate DATETIME,
  FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (rewardID) REFERENCES reward_item(rewardID) ON DELETE RESTRICT,
  UNIQUE KEY unique_qr (qrCodeData),
  INDEX idx_userID (userID),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 13: VIEWS FOR DATA INTEGRITY
-- =====================================================

CREATE OR REPLACE VIEW v_donation_allocation_summary AS
SELECT 
  dt.transactionID,
  dt.userID,
  dt.animalID,
  dt.donation_amount,
  COALESCE(SUM(fa.amount), 0) AS total_allocated,
  (dt.donation_amount - COALESCE(SUM(fa.amount), 0)) AS remaining_unallocated,
  CASE 
    WHEN COALESCE(SUM(fa.amount), 0) > dt.donation_amount THEN 'OVER_ALLOCATED'
    WHEN COALESCE(SUM(fa.amount), 0) = dt.donation_amount THEN 'FULLY_ALLOCATED'
    ELSE 'PARTIALLY_ALLOCATED'
  END AS allocation_status
FROM donation_transaction dt
LEFT JOIN fund_allocation fa ON dt.transactionID = fa.transactionID
WHERE dt.payment_status = 'Success'
GROUP BY dt.transactionID, dt.userID, dt.animalID, dt.donation_amount;

CREATE OR REPLACE VIEW v_user_donation_impact AS
SELECT 
  u.id AS userID,
  CONCAT(u.first_name, ' ', u.last_name) AS user_name,
  u.email AS user_email,
  dt.transactionID,
  dt.donation_amount,
  dt.transaction_date,
  ap.animalID,
  ap.name AS animal_name,
  ap.type AS animal_type,
  ap.photoURL,
  COALESCE(SUM(fa.amount), 0) AS total_allocated,
  COUNT(DISTINCT fa.allocationID) AS allocation_count
FROM users u
INNER JOIN donation_transaction dt ON u.id = dt.userID
INNER JOIN animal_profile ap ON dt.animalID = ap.animalID
LEFT JOIN fund_allocation fa ON dt.transactionID = fa.transactionID
WHERE dt.payment_status = 'Success'
GROUP BY u.id, u.first_name, u.last_name, u.email, dt.transactionID, dt.donation_amount, 
         dt.transaction_date, ap.animalID, ap.name, ap.type, ap.photoURL;

-- =====================================================
-- PART 14: STORED PROCEDURES
-- =====================================================

DROP PROCEDURE IF EXISTS sp_validate_allocation;

CREATE PROCEDURE sp_validate_allocation(
  IN p_transactionID INT,
  IN p_amount DECIMAL(10, 2),
  OUT p_is_valid BOOLEAN,
  OUT p_message VARCHAR(500)
)
BEGIN
  DECLARE v_donation_amount DECIMAL(10, 2);
  DECLARE v_total_allocated DECIMAL(10, 2);
  DECLARE v_remaining DECIMAL(10, 2);
  
  SELECT donation_amount INTO v_donation_amount
  FROM donation_transaction
  WHERE transactionID = p_transactionID AND payment_status = 'Success';
  
  IF v_donation_amount IS NULL THEN
    SET p_is_valid = FALSE;
    SET p_message = 'Transaction not found or payment not successful';
  ELSE
    SELECT COALESCE(SUM(amount), 0) INTO v_total_allocated
    FROM fund_allocation
    WHERE transactionID = p_transactionID;
    
    SET v_remaining = v_donation_amount - v_total_allocated;
    
    IF p_amount > v_remaining THEN
      SET p_is_valid = FALSE;
      SET p_message = CONCAT('Allocation amount exceeds remaining donation. Remaining: $', v_remaining);
    ELSE
      SET p_is_valid = TRUE;
      SET p_message = 'Allocation is valid';
    END IF;
  END IF;
END;

-- =====================================================
-- PART 15: TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS trg_check_allocation_before_insert;

CREATE TRIGGER trg_check_allocation_before_insert
BEFORE INSERT ON fund_allocation
FOR EACH ROW
BEGIN
  DECLARE v_donation_amount DECIMAL(10, 2);
  DECLARE v_total_allocated DECIMAL(10, 2);
  DECLARE v_remaining DECIMAL(10, 2);
  DECLARE v_msg VARCHAR(255);

  SELECT donation_amount INTO v_donation_amount
  FROM donation_transaction
  WHERE transactionID = NEW.transactionID AND payment_status = 'Success';

  IF v_donation_amount IS NOT NULL THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_total_allocated
    FROM fund_allocation
    WHERE transactionID = NEW.transactionID;

    SET v_remaining = v_donation_amount - v_total_allocated;

    IF NEW.amount > v_remaining THEN
      SET v_msg = CONCAT('Cannot allocate more than remaining donation amount. Remaining: $', v_remaining);
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    END IF;
  END IF;
END;

DROP TRIGGER IF EXISTS trg_check_allocation_before_update;

CREATE TRIGGER trg_check_allocation_before_update
BEFORE UPDATE ON fund_allocation
FOR EACH ROW
BEGIN
  DECLARE v_donation_amount DECIMAL(10, 2);
  DECLARE v_total_allocated DECIMAL(10, 2);
  DECLARE v_remaining DECIMAL(10, 2);
  DECLARE v_msg VARCHAR(255);

  SELECT donation_amount INTO v_donation_amount
  FROM donation_transaction
  WHERE transactionID = NEW.transactionID AND payment_status = 'Success';

  IF v_donation_amount IS NOT NULL THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_total_allocated
    FROM fund_allocation
    WHERE transactionID = NEW.transactionID AND allocationID != NEW.allocationID;

    SET v_total_allocated = v_total_allocated + NEW.amount;
    SET v_remaining = v_donation_amount - v_total_allocated;

    IF v_total_allocated > v_donation_amount THEN
      SET v_msg = CONCAT('Cannot allocate more than donation amount. Remaining: $', v_remaining);
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    END IF;
  END IF;
END;
-- =====================================================
-- END OF SCHEMA
-- =====================================================


-- =====================================================
-- PART 16: INTEGRATED LEGACY SCHEMA
-- =====================================================

-- 16.3 AI Chats Table
CREATE TABLE IF NOT EXISTS ai_chats (
  chatID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  user_query TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  chat_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16.4 Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
  postID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  content_text TEXT DEFAULT NULL,
  content_image VARCHAR(255) DEFAULT NULL,
  post_status ENUM('Active','Deleted') DEFAULT 'Active',
  post_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16.5 Volunteer Events Table
CREATE TABLE IF NOT EXISTS volunteer_events (
  eventID INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  eventLocation VARCHAR(255) DEFAULT NULL,
  start_date DATETIME DEFAULT NULL,
  end_date DATETIME DEFAULT NULL,
  max_volunteers INT DEFAULT NULL,
  adminID INT NOT NULL,
  image_url TEXT DEFAULT NULL,
  hours DECIMAL(5,2) DEFAULT 0.00,
  FOREIGN KEY (adminID) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16.6 Event Records Table
CREATE TABLE IF NOT EXISTS event_records (
  recordID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  eventID INT NOT NULL,
  register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Registered','No-show') DEFAULT 'Registered',
  FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (eventID) REFERENCES volunteer_events(eventID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16.7 Post Comments Table
CREATE TABLE IF NOT EXISTS post_comments (
  commentID INT AUTO_INCREMENT PRIMARY KEY,
  postID INT NOT NULL,
  userID INT NOT NULL,
  comment_text TEXT NOT NULL,
  comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postID) REFERENCES community_posts(postID) ON DELETE CASCADE,
  FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16.8 Volunteer Contribution Table
CREATE TABLE IF NOT EXISTS volunteer_contribution (
  contributionID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  eventID INT NOT NULL,
  hours_contributed DECIMAL(5,2) DEFAULT NULL,
  participation_status ENUM('Registered','Attended','No-show') DEFAULT 'Registered',
  FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (eventID) REFERENCES volunteer_events(eventID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16.9 Volunteer Registration Table
CREATE TABLE IF NOT EXISTS volunteer_registration (
  registrationID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  userName VARCHAR(255) DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  experience TEXT DEFAULT NULL,
  capability TEXT DEFAULT NULL,
  registration_status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  submition_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  adminID INT DEFAULT NULL,
  reviewed_date TIMESTAMP NULL DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL,
  FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (adminID) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
