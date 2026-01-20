-- =====================================================
-- SavePaws Unified Seed Data
-- Run this AFTER schema_complete.sql
-- =====================================================

USE savepaws_db;

-- =====================================================
-- PART 2: SEED ADMINS (MUST BE DONE FIRST)
-- =====================================================
-- Using the demo hash: (Password: 'password')
INSERT INTO admins (id, username, email, password_hash, full_name, role) VALUES
(1, 'admin_demo', 'admin@savepaws.com', '$2b$10$AsgEKk9oxjZt1s2VsuKzG.kosGqW06z1TxbejzyU8U8Zj75j6nJZO', 'Demo Administrator', 'super_admin')
ON DUPLICATE KEY UPDATE username=username;

-- =====================================================
-- PART 2.1: SEED USERS (For User 1 reference)
-- =====================================================
INSERT INTO users (id, ic_number, first_name, last_name, email, phone_number, password_hash) VALUES
(1, '01234567890', 'Jia Xin', 'Yap', 'jiaxin@gmail.com', '0182310116', '$2b$10$AsgEKk9oxjZt1s2VsuKzG.kosGqW06z1TxbejzyU8U8Zj75j6nJZO'),
(2, '990101011234', 'Demo', 'User2', 'demo.user2@savepaws.com', '0198765432', '$2b$10$AsgEKk9oxjZt1s2VsuKzG.kosGqW06z1TxbejzyU8U8Zj75j6nJZO'),
(3, '012345678901', 'Qing Qing', '', 'tan@gmail.com', '0192345678', '$2b$10$AsgEKk9oxjZt1s2VsuKzG.kosGqW06z1TxbejzyU8U8Zj75j6nJZO')
ON DUPLICATE KEY UPDATE email=email;

-- 3. SEED ANIMALS (For Adoption)
INSERT INTO animals (name, species, breed, age, gender, status, description, image_url, weight, color, location) VALUES
('Luna', 'Cat', 'Tabby', 2, 'female', 'available', 'Friendly tabby cat found abandoned in a parking lot.', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', 3.5, 'Orange/White', 'Shelter A'),
('Max', 'Dog', 'Golden Retriever', 3, 'male', 'available', 'Well-trained and friendly with children.', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', 25.0, 'Golden', 'Shelter B'),
('Daisy', 'Dog', 'Beagle', 3, 'female', 'available', 'House-trained and knows basic commands.', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', 12.0, 'Tri-color', 'Shelter A')
ON DUPLICATE KEY UPDATE name=name;

-- 4. SEED ANIMAL PROFILES (For Donations)
INSERT INTO animal_profile (name, type, story, fundingGoal, amountRaised, status, photoURL, adminID) VALUES
('Luna', 'Cat', 'Luna was found abandoned in a parking lot. She is a friendly 2-year-old tabby cat who loves cuddles and playtime. She needs medical treatment for a minor skin condition and vaccinations.', 150.00, 150.00, 'Archived', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', 1),
('Max', 'Dog', 'Max is a 3-year-old Golden Retriever who was surrendered by his previous owner. He is well-trained, friendly, and great with children. He needs neutering and routine vaccinations.', 800.00, 320.00, 'Active', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', 1),
('Bella', 'Rabbit', 'Bella is a sweet 1-year-old rabbit who was found in a park. She is gentle and loves fresh vegetables. She needs spaying and a proper habitat setup.', 300.00, 75.00, 'Active', 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400', 1),
('Charlie', 'Dog', 'Charlie is a 4-year-old mixed breed who was rescued from a hoarding situation. Despite his past, he is very friendly and eager to please. He needs dental work and vaccinations.', 600.00, 450.00, 'Active', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400', 1),
('Mittens', 'Cat', 'Mittens is a 5-year-old Persian cat who was found as a stray. She is calm and affectionate, perfect for a quiet home. She needs grooming and medical checkup.', 400.00, 400.00, 'Funded', 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400', 1)
ON DUPLICATE KEY UPDATE name=name;

-- 5. SEED REWARD ITEMS
INSERT INTO reward_item (rewardID, title, partnerName, category, description, imageURL, pointsRequired, validityMonths, terms, quantity) VALUES
('rew_001', 'Free Vaccination', 'City Vet Clinic', 'Medical', 'One free core vaccination (Distemper/Parvo or Rabies) for your pet. Valid at City Vet Clinic main branch.', 'https://plus.unsplash.com/premium_photo-1702599034826-083f01bafb22?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0', 150, 6, 'Valid for one pet only. Appointment required. Subject to availability.', NULL),
('rew_002', 'Vet Consultation Voucher', 'Paws & Claws Hospital', 'Medical', 'Free general consultation for one pet. Includes basic health check-up and weight assessment.', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 100, 3, 'Does not include medications or surgeries. Valid Mon-Fri only.', NULL),
('rew_003', 'Pet Grooming Discount', 'Happy Tails Grooming', 'Grooming', 'RM50 off on any full grooming session. Treat your pet to a spa day!', 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 80, 3, 'Valid for full grooming packages only. One voucher per visit.', NULL),
('rew_004', 'Premium Pet Food Pack', 'SavePaws Shelter Store', 'Food', 'A bundle of premium wet and dry food (Dog or Cat options available).', 'https://images.unsplash.com/photo-1571873735645-1ae72b963024?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0', 250, 12, 'Pickup at SavePaws HQ only. While stocks last.', 50),
('rew_005', 'Tick & Flea Prevention', 'City Vet Clinic', 'Medical', 'One month supply of tick and flea prevention spot-on.', 'https://images.unsplash.com/photo-1615266895738-11f1371cd7e5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 120, 6, 'Must provide pet weight for correct dosage.', NULL)
ON DUPLICATE KEY UPDATE rewardID=rewardID;

-- 6. SEED DONATIONS & LEDGER
-- Assigning to User 1 (Demo User1)
INSERT INTO donation_transaction (userID, animalID, donation_amount, type, payment_processor_id, payment_status, donor_name, donor_email, createdAt) VALUES
(1, 1, 50.00, 'One-time', 'PAYPAL_TEST_001', 'Success', 'Demo User 1', 'demo.user1@savepaws.com', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 1, 100.00, 'One-time', 'PAYPAL_TEST_002', 'Success', 'Demo User 1', 'demo.user1@savepaws.com', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 2, 200.00, 'One-time', 'PAYPAL_TEST_003', 'Success', 'Demo User 1', 'demo.user1@savepaws.com', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 2, 120.00, 'One-time', 'PAYPAL_TEST_004', 'Success', 'Demo User 2', 'demo.user2@savepaws.com', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 3, 50.00, 'One-time', 'PAYPAL_TEST_005', 'Success', 'Demo User 2', 'demo.user2@savepaws.com', DATE_SUB(NOW(), INTERVAL 15 DAY));

-- Populate Points automatically for User 1 based on donation
INSERT IGNORE INTO reward_point_ledger (userID, points, type, source, referenceID, expiryDate)
SELECT 
  userID,
  FLOOR(donation_amount),
  'EARN',
  'DONATION',
  CAST(transactionID AS CHAR),
  DATE_ADD(NOW(), INTERVAL 12 MONTH)
FROM donation_transaction
WHERE payment_status = 'Success';

-- 7. SEED SAMPLE REPORTS
INSERT INTO reports (id, user_id, animal_type, description, location, latitude, longitude, reporter_name, reporter_contact, photo_url, status, created_at, updated_at) VALUES (1, 1, 'dog', 'Dog hit by car - bleeding heavily', 'UTM Main Gate', 1.5535, 103.638, 'Ali Hassan', '012-3456789', NULL, 'pending', '2025-12-15 13:51:19', '2026-01-06 11:40:26'),
(2, 1, 'cat', 'Stray cat with eye infection', 'Taman Universiti', 1.5521, 103.6351, 'Ali Hassan', '012-3456789', NULL, 'closed', '2025-12-15 13:51:19', '2025-12-15 22:44:26'),
(3, 1, 'dog', 'Friendly lost dog', 'Skudai Town', 1.5423, 103.6445, 'Ali Hassan', '012-3456789', NULL, 'pending', '2025-12-15 13:51:19', '2025-12-15 21:40:40'),
(4, 2, 'cat', 'Cat stuck in tree', 'Taman Molek', 1.5234, 103.6201, 'Siti Nurhaliza', '013-9876543', NULL, 'active', '2025-12-15 13:51:19', '2026-01-06 10:46:04'),
(5, 2, 'dog', 'Dog with broken leg', 'KSL Mall', 1.5456, 103.6389, 'Siti Nurhaliza', '013-9876543', NULL, 'pending', '2025-12-15 13:51:19', '2025-12-15 21:40:40'),
(6, 2, 'other', 'Injured bird', 'Austin Heights', 1.5789, 103.6678, 'Siti Nurhaliza', '013-9876543', NULL, 'pending', '2025-12-15 13:51:19', '2025-12-15 13:51:19'),
(7, 3, 'cat', 'Pregnant cat needs help', 'Mount Austin', 1.5456, 103.6234, 'Kumar Raj', '014-5554444', NULL, 'closed', '2025-12-15 13:51:19', '2025-12-30 11:02:58'),
(8, 3, 'dog', 'Abandoned puppies', 'JB City Square', 1.4556, 103.7619, 'Kumar Raj', '014-5554444', NULL, 'approved', '2025-12-15 13:51:19', '2025-12-16 12:11:59'),
(9, 3, 'cat', 'Cat colony needs feeding', 'Bukit Indah', 1.4756, 103.6234, 'Mary Tan', '015-1112222', NULL, 'pending', '2025-12-15 13:51:19', '2025-12-15 13:51:19');


-- Dumping data for table `ai_chats`
INSERT INTO ai_chats (chatID, userID, user_query, ai_response, chat_timestamp, is_active) VALUES
(1, 1, 'What to do if I find a stray with a collar?', 'Check for an ID tag. If none, take it to a vet to scan for a microchip.', '2025-12-29 21:25:51', 0),
(3, 3, 'How to calm a scared cat?', 'Provide a small, dark hiding spot and avoid eye contact. Use low tones.', '2025-12-29 21:25:51', 1),
(27, 2, 'can the animals drink what human eat?', 'It is generally not safe for animals to consume what humans eat or drink...', '2026-01-02 02:08:20', 0),
(28, 3, 'can the dogs be feeded with coffee?', 'No, dogs should not be given coffee...', '2026-01-02 02:08:49', 0);
-- (Truncated for brevity, normally would include all)

-- Dumping data for table `community_posts`
INSERT INTO community_posts (postID, userID, content_text, content_image, post_status, post_created_at) VALUES
(1, 1, 'Spotted a stray husky near Mount Austin. It looks friendly but lost.', 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800&auto=format&fit=crop', 'Active', '2025-12-29 13:25:51'),
(2, 3, 'Just finished our weekly feeding at the local shelter!', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop', 'Active', '2025-12-29 13:25:51'),
(3, 2, 'ADVERTISEMENT: BUY FAKE MEDS HERE', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1', 'Deleted', '2025-12-29 13:25:51'),
(4, 1, 'About 10 animals rescued this month!', 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=800&auto=format&fit=crop', 'Active', '2025-12-29 15:19:10');

-- Dumping data for table `volunteer_events`
INSERT INTO volunteer_events (eventID, title, description, eventLocation, start_date, end_date, max_volunteers, adminID, image_url, hours) VALUES
(1, 'Weekend Shelter Cleanup', 'General cleaning and disinfection of the dog kennels.', 'SavePaws Shelter HQ', '2025-01-10 09:00:00', '2025-01-10 13:00:00', 10, 1, 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4', 3.00),
(2, 'Stray Vaccination Drive', 'Helping vets administer vaccines to neighborhood strays.', 'Community Hall A', '2026-05-24 10:00:00', '2025-05-24 17:00:00', 5, 1, 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4', 4.00)
ON DUPLICATE KEY UPDATE eventID=eventID;


-- Dumping data for table `event_records`
INSERT INTO event_records (recordID, userID, eventID, register_date, status) VALUES
(1, 1, 1, '2025-01-01 13:25:51', 'Registered'),
(2, 3, 1, '2025-01-02 13:25:51', 'Registered'),
(3, 3, 2, '2026-01-19 08:14:17', 'Registered')
ON DUPLICATE KEY UPDATE recordID=recordID;


-- Dumping data for table `post_comments`
INSERT INTO post_comments (commentID, postID, userID, comment_text, comment_date) VALUES
(1, 1, 2, 'I saw that husky too! I called the local council.', '2025-12-29 13:25:51');

-- Dumping data for table `volunteer_contribution`
INSERT INTO volunteer_contribution (contributionID, userID, eventID, hours_contributed, participation_status) VALUES
(1, 3, 1, 4.00, 'Attended')
ON DUPLICATE KEY UPDATE contributionID=contributionID;


-- Dumping data for table `volunteer_registration`
INSERT INTO volunteer_registration (registrationID, userID, userName, location, experience, capability, registration_status, submition_date, adminID, reviewed_date, rejection_reason) VALUES
(2, 3, 'Qing Qing', '117, Taman Universiti, Skudai, 81300, Johor Darul Ta''zim', 'I joined an animal rescue event in 2018.', 'First Aid', 'Rejected', '2026-01-19 07:35:47', NULL, NULL, NULL),
(3, 3, 'Qing', '38, Taman Universiti, Skudai, 81300, Johor Darul Ta''zim', 'Test', 'Test', 'Approved', '2026-01-19 07:40:04', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE registrationID=registrationID;

