const mysql = require('mysql2/promise');
const dbConfig = require('../../AdminCommunity-SavePaws/src/resources/db_config');

async function updateImages() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
        });
        console.log('Connected to MySQL Database');

        const images = [
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1444212477490-ca40a9250ef9?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1520038410233-7141f77e47aa?q=80&w=800&auto=format&fit=crop'
        ];

        // Fetch all active posts
        const [posts] = await connection.query('SELECT postID FROM community_posts WHERE post_status = "Active"');
        console.log(`Found ${posts.length} active posts to update.`);

        for (let i = 0; i < posts.length; i++) {
            const imageUrl = images[i % images.length];
            await connection.query('UPDATE community_posts SET content_image = ? WHERE postID = ?', [imageUrl, posts[i].postID]);
            console.log(`Updated post ${posts[i].postID} with image: ${imageUrl}`);
        }

        console.log('Successfully updated all post images!');

    } catch (err) {
        console.error('Error updating images:', err);
    } finally {
        if (connection) await connection.end();
    }
}

updateImages();
