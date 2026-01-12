-- SavePaws Animals Seed Data
-- Run this AFTER schema.sql (which creates animals and adoption_requests tables)
-- Make sure users table exists (from initDatabase.js)

USE savepaws;

-- Sample Animals for Adoption
-- Note: created_by should reference an existing admin user ID from users table
-- If you don't have an admin user yet, set created_by to NULL or create one first

INSERT INTO animals (name, species, breed, age, gender, status, description, image_url, weight, color, location, medical_notes, created_by) VALUES
('Luna', 'Cat', 'Tabby', 2, 'female', 'available', 
 'Luna was found abandoned in a parking lot. She is a friendly 2-year-old tabby cat who loves cuddles and playtime. She needs medical treatment for a minor skin condition and vaccinations.', 
 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', 3.5, 'Orange and White', 'SavePaws Shelter', 
 'Minor skin condition, needs vaccinations', NULL),

('Max', 'Dog', 'Golden Retriever', 3, 'male', 'available', 
 'Max is a 3-year-old Golden Retriever who was surrendered by his previous owner. He is well-trained, friendly, and great with children. He needs neutering and routine vaccinations.', 
 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', 25.0, 'Golden', 'SavePaws Shelter', 
 'Needs neutering and vaccinations', NULL),

('Bella', 'Rabbit', 'Mixed', 1, 'female', 'available', 
 'Bella is a sweet 1-year-old rabbit who was found in a park. She is gentle and loves fresh vegetables. She needs spaying and a proper habitat setup.', 
 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400', 2.0, 'White and Brown', 'SavePaws Shelter', 
 'Needs spaying', NULL),

('Charlie', 'Dog', 'Mixed Breed', 4, 'male', 'available', 
 'Charlie is a 4-year-old mixed breed who was rescued from a hoarding situation. Despite his past, he is very friendly and eager to please. He needs dental work and vaccinations.', 
 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400', 18.0, 'Brown and Black', 'SavePaws Shelter', 
 'Needs dental work and vaccinations', NULL),

('Mittens', 'Cat', 'Persian', 5, 'female', 'available', 
 'Mittens is a 5-year-old Persian cat who was found as a stray. She is calm and affectionate, perfect for a quiet home. She needs grooming and medical checkup.', 
 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400', 4.0, 'White', 'SavePaws Shelter', 
 'Needs grooming and checkup', NULL),

('Rocky', 'Dog', 'German Shepherd', 2, 'male', 'available', 
 'Rocky is a 2-year-old German Shepherd who was rescued from an abusive situation. He is now healthy, energetic, and loves outdoor activities. Great for active families.', 
 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400', 30.0, 'Black and Tan', 'SavePaws Shelter', 
 'Fully recovered, healthy', NULL),

('Whiskers', 'Cat', 'Siamese', 1, 'male', 'available', 
 'Whiskers is a playful 1-year-old Siamese cat. He is very social and loves attention. Perfect for families with children.', 
 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 3.0, 'Cream and Brown', 'SavePaws Shelter', 
 'Healthy, fully vaccinated', NULL),

('Daisy', 'Dog', 'Beagle', 3, 'female', 'available', 
 'Daisy is a friendly 3-year-old Beagle. She loves to play and is great with other dogs. She is house-trained and knows basic commands.', 
 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', 12.0, 'Tri-color', 'SavePaws Shelter', 
 'Healthy, house-trained', NULL)

ON DUPLICATE KEY UPDATE name=name;


