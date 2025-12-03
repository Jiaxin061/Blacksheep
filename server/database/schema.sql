-- SavePaws Database Schema
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS savepaws;
USE savepaws;

-- Animal Profile Table
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

-- Donation Transaction Table
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
  INDEX idx_animalID (animalID),
  INDEX idx_userID (userID),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

