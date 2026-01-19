import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

async function seedDatabase() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'savepaws',
        });

        console.log('🌱 Seeding database...');

        // 1. Create a dev user
        const dummyPassword = await bcrypt.hash('password123', 10);

        // Check if user exists
        const [users] = await connection.query('SELECT * FROM user WHERE email = ?', ['dev@savepaws.local']);

        let userId;
        if (users.length === 0) {
            const [result] = await connection.execute(
                `INSERT INTO user (first_name, last_name, email, password_hash, account_status, is_volunteer)
         VALUES (?, ?, ?, ?, 'active', 1)`,
                ['Dev', 'User', 'dev@savepaws.local', dummyPassword]
            );
            userId = result.insertId;
            console.log(`✅ Created dev user with ID: ${userId}`);
        } else {
            userId = users[0].userID;
            console.log(`ℹ️ Dev user already exists with ID: ${userId}`);
        }

        // 2. Create diverse animals
        const animalsData = [
            // DOGS
            {
                name: 'Buddy',
                species: 'Dog',
                breed: 'Golden Retriever',
                age: 3,
                gender: 'male',
                status: 'available',
                description: 'Friendly and energetic. Loves playing fetch and is great with kids.',
                image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=60'
            },
            {
                name: 'Max',
                species: 'Dog',
                breed: 'German Shepherd',
                age: 4,
                gender: 'male',
                status: 'adopted',
                description: 'Loyal and protective. Found his forever home!',
                image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=500&q=60'
            },
            {
                name: 'Bella',
                species: 'Dog',
                breed: 'Chihuahua',
                age: 2,
                gender: 'female',
                status: 'available',
                description: 'Tiny but mighty! Loves lap naps and scenic walks.',
                image_url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=500&q=60'
            },

            // CATS
            {
                name: 'Luna',
                species: 'Cat',
                breed: 'Siamese',
                age: 1,
                gender: 'female',
                status: 'available',
                description: 'Vocal and affectionate. loves to chat with her humans.',
                image_url: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=500&q=60'
            },
            {
                name: 'Oliver',
                species: 'Cat',
                breed: 'Tabby',
                age: 5,
                gender: 'male',
                status: 'pending',
                description: 'Chill and independent. Adoption application in progress.',
                image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=60'
            },
            {
                name: 'Mittens',
                species: 'Cat',
                breed: 'Maine Coon',
                age: 2,
                gender: 'female',
                status: 'available',
                description: 'Fluffy giant. Very gentle and loves grooming.',
                image_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=500&q=60'
            },

            // SMALL ANIMALS
            {
                name: 'Thumper',
                species: 'Rabbit',
                breed: 'Holland Lop',
                age: 1,
                gender: 'male',
                status: 'available',
                description: 'Loves carrots and cuddles. High jumper!',
                image_url: 'https://images.unsplash.com/photo-1585110396067-c396c5620e3f?auto=format&fit=crop&w=500&q=60'
            },
            {
                name: 'Cookie',
                species: 'Hamster',
                breed: 'Syrian',
                age: 0.5,
                gender: 'female',
                status: 'available',
                description: 'Night owl who loves running in her wheel.',
                image_url: 'https://images.unsplash.com/photo-1425082661705-1834bfd905bf?auto=format&fit=crop&w=500&q=60'
            },

            // BIRDS
            {
                name: 'Sunny',
                species: 'Bird',
                breed: 'Parakeet',
                age: 2,
                gender: 'male',
                status: 'available',
                description: 'Colorful singer looking for a spacious cage.',
                image_url: 'https://images.unsplash.com/photo-1552728089-57bdde30ebd1?auto=format&fit=crop&w=500&q=60'
            }
        ];

        for (const animal of animalsData) {
            // Check if animal exists by name
            const [existing] = await connection.query('SELECT id FROM animals WHERE name = ?', [animal.name]);

            if (existing.length === 0) {
                await connection.execute(
                    `INSERT INTO animals (name, species, breed, age, gender, status, description, image_url, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        animal.name,
                        animal.species,
                        animal.breed,
                        animal.age,
                        animal.gender,
                        animal.status,
                        animal.description,
                        animal.image_url,
                        userId
                    ]
                );
                console.log(`✅ Created animal: ${animal.name} (${animal.species})`);
            } else {
                console.log(`ℹ️ Animal already exists: ${animal.name}`);
            }
        }

        console.log('✨ Seeding complete!');

    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

seedDatabase();
