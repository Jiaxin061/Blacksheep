-- SavePaws Consolidated Database Schema
-- Run this script to create the database and tables
-- Supersedes: schema.sql, schema_expansion.sql, migration_legacy_donations.sql

DROP DATABASE IF EXISTS savepaws;
CREATE DATABASE savepaws;
USE savepaws;

-- =====================================================
-- PART 1: USER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user (
  userID INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 2: ANIMAL PROFILE TABLE
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
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 3: DONATION TRANSACTION TABLE
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
  FOREIGN KEY (userID) REFERENCES user(userID) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_animalID (animalID),
  INDEX idx_userID (userID),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 4: FUND ALLOCATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS fund_allocation (
  allocationID INT PRIMARY KEY AUTO_INCREMENT,
  transactionID INT NOT NULL,
  animalID INT NOT NULL,
  category ENUM('Vet', 'Medication', 'Food', 'Shelter', 'Other') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  allocationDate DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (transactionID) REFERENCES donation_transaction(transactionID) ON DELETE CASCADE,
  FOREIGN KEY (animalID) REFERENCES animal_profile(animalID) ON DELETE CASCADE,
  INDEX idx_transactionID (transactionID),
  INDEX idx_animalID (animalID),
  INDEX idx_category (category),
  INDEX idx_allocationDate (allocationDate),
  CONSTRAINT chk_positive_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 5: ANIMAL PROGRESS UPDATES TABLE
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
  FOREIGN KEY (createdBy) REFERENCES user(userID) ON DELETE SET NULL,
  INDEX idx_animalID (animalID),
  INDEX idx_allocationID (allocationID),
  INDEX idx_recoveryStatus (recoveryStatus),
  INDEX idx_updateDate (updateDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 6: ADMIN ACTIVITY LOG
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
  FOREIGN KEY (adminID) REFERENCES user(userID) ON DELETE CASCADE,
  INDEX idx_adminID (adminID),
  INDEX idx_actionType (actionType),
  INDEX idx_entityType (entityType),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 7: REWARD SYSTEM (NEW)
-- =====================================================

-- 7.1 Reward Items Table
CREATE TABLE IF NOT EXISTS reward_item (
  rewardID VARCHAR(50) PRIMARY KEY, -- e.g. 'rew_001'
  title VARCHAR(100) NOT NULL,
  partnerName VARCHAR(100) NOT NULL,
  category ENUM('Medical','Food','Grooming','Utility') NOT NULL,
  description TEXT,
  imageURL VARCHAR(255),
  pointsRequired INT NOT NULL,
  validityMonths INT NOT NULL,
  terms TEXT,
  quantity INT DEFAULT NULL, -- NULL = Unlimited
  status ENUM('Active', 'Archived') DEFAULT 'Active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.2 Reward Point Ledger (Earn/Spend/Expire)
CREATE TABLE IF NOT EXISTS reward_point_ledger (
  ledgerID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  points INT NOT NULL, -- Can be positive (Earn) or negative (Spend)
  type ENUM('EARN', 'SPEND', 'EXPIRE', 'ADJUST') NOT NULL,
  source ENUM('DONATION', 'REWARD_REDEMPTION', 'SYSTEM') NOT NULL,
  referenceID VARCHAR(100) NULL, -- transactionID, redemptionID, or manual string
  expiryDate DATETIME NULL, -- NULL for Spend entries
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES user(userID) ON DELETE CASCADE,
  UNIQUE KEY uniq_donation_earn (referenceID, type, source),
  INDEX idx_userID (userID),
  INDEX idx_type (type),
  INDEX idx_expiryDate (expiryDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7.3 Redemption Record
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
  FOREIGN KEY (userID) REFERENCES user(userID) ON DELETE CASCADE,
  FOREIGN KEY (rewardID) REFERENCES reward_item(rewardID) ON DELETE RESTRICT,
  UNIQUE KEY unique_qr (qrCodeData),
  INDEX idx_userID (userID),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PART 8: VIEWS FOR DATA INTEGRITY
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
  u.userID,
  u.name AS user_name,
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
FROM user u
INNER JOIN donation_transaction dt ON u.userID = dt.userID
INNER JOIN animal_profile ap ON dt.animalID = ap.animalID
LEFT JOIN fund_allocation fa ON dt.transactionID = fa.transactionID
WHERE dt.payment_status = 'Success'
GROUP BY u.userID, u.name, u.email, dt.transactionID, dt.donation_amount, 
         dt.transaction_date, ap.animalID, ap.name, ap.type, ap.photoURL;

-- =====================================================
-- PART 9: STORED PROCEDURES
-- =====================================================

DELIMITER //

DROP PROCEDURE IF EXISTS sp_validate_allocation //

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
END //

DELIMITER ;

-- =====================================================
-- PART 10: TRIGGERS (FIXED)
-- =====================================================

DELIMITER //

DROP TRIGGER IF EXISTS trg_check_allocation_before_insert //

CREATE TRIGGER trg_check_allocation_before_insert
BEFORE INSERT ON fund_allocation
FOR EACH ROW
BEGIN
  DECLARE v_donation_amount DECIMAL(10, 2);
  DECLARE v_total_allocated DECIMAL(10, 2);
  DECLARE v_remaining DECIMAL(10, 2);
  DECLARE v_msg VARCHAR(255); -- Variable for the error message

  SELECT donation_amount INTO v_donation_amount
  FROM donation_transaction
  WHERE transactionID = NEW.transactionID AND payment_status = 'Success';

  IF v_donation_amount IS NOT NULL THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_total_allocated
    FROM fund_allocation
    WHERE transactionID = NEW.transactionID;

    SET v_remaining = v_donation_amount - v_total_allocated;

    IF NEW.amount > v_remaining THEN
      -- Fix: Calculate message first
      SET v_msg = CONCAT('Cannot allocate more than remaining donation amount. Remaining: $', v_remaining);
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    END IF;
  END IF;
END //

DROP TRIGGER IF EXISTS trg_check_allocation_before_update //

CREATE TRIGGER trg_check_allocation_before_update
BEFORE UPDATE ON fund_allocation
FOR EACH ROW
BEGIN
  DECLARE v_donation_amount DECIMAL(10, 2);
  DECLARE v_total_allocated DECIMAL(10, 2);
  DECLARE v_remaining DECIMAL(10, 2);
  DECLARE v_msg VARCHAR(255); -- Variable for the error message

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
      -- Fix: Calculate message first
      SET v_msg = CONCAT('Cannot allocate more than donation amount. Remaining: $', v_remaining);
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    END IF;
  END IF;
END //

DELIMITER ;