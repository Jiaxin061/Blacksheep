-- Sample seed data for testing
USE savepaws;

-- Insert sample animals
INSERT INTO animal_profile (name, type, story, fundingGoal, amountRaised, status, photoURL, adminID) VALUES
('Luna', 'Cat', 'Luna was found abandoned in a parking lot. She is a friendly 2-year-old tabby cat who loves cuddles and playtime. She needs medical treatment for a minor skin condition and vaccinations.', 500.00, 150.00, 'Active', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', 1),
('Max', 'Dog', 'Max is a 3-year-old Golden Retriever who was surrendered by his previous owner. He is well-trained, friendly, and great with children. He needs neutering and routine vaccinations.', 800.00, 320.00, 'Active', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', 1),
('Bella', 'Rabbit', 'Bella is a sweet 1-year-old rabbit who was found in a park. She is gentle and loves fresh vegetables. She needs spaying and a proper habitat setup.', 300.00, 75.00, 'Active', 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400', 1),
('Charlie', 'Dog', 'Charlie is a 4-year-old mixed breed who was rescued from a hoarding situation. Despite his past, he is very friendly and eager to please. He needs dental work and vaccinations.', 600.00, 450.00, 'Active', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400', 1),
('Mittens', 'Cat', 'Mittens is a 5-year-old Persian cat who was found as a stray. She is calm and affectionate, perfect for a quiet home. She needs grooming and medical checkup.', 400.00, 400.00, 'Funded', 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400', 1);

-- Insert sample donation transactions
INSERT INTO donation_transaction (userID, animalID, donation_amount, type, payment_processor_id, payment_status, donor_name, donor_email) VALUES
(NULL, 1, 50.00, 'One-time', 'PAYPAL_TEST_001', 'Success', 'John Doe', 'john.doe@example.com'),
(NULL, 1, 100.00, 'One-time', 'PAYPAL_TEST_002', 'Success', 'Jane Smith', 'jane.smith@example.com'),
(NULL, 2, 200.00, 'One-time', 'PAYPAL_TEST_003', 'Success', 'Bob Johnson', 'bob.johnson@example.com'),
(NULL, 2, 120.00, 'One-time', 'PAYPAL_TEST_004', 'Success', 'Alice Brown', 'alice.brown@example.com'),
(NULL, 3, 50.00, 'One-time', 'PAYPAL_TEST_005', 'Success', 'Charlie Wilson', 'charlie.wilson@example.com'),
(NULL, 3, 25.00, 'One-time', 'PAYPAL_TEST_006', 'Success', 'Diana Lee', 'diana.lee@example.com'),
(NULL, 4, 300.00, 'One-time', 'PAYPAL_TEST_007', 'Success', 'Edward Davis', 'edward.davis@example.com'),
(NULL, 4, 150.00, 'One-time', 'PAYPAL_TEST_008', 'Success', 'Fiona Green', 'fiona.green@example.com'),
(NULL, 5, 200.00, 'One-time', 'PAYPAL_TEST_009', 'Success', 'George White', 'george.white@example.com'),
(NULL, 5, 200.00, 'One-time', 'PAYPAL_TEST_010', 'Success', 'Helen Black', 'helen.black@example.com');

