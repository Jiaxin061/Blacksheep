# Database Configuration

## Setup Instructions

1. Create a `.env` file in the `backend` directory with the following variables:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=savepaws
JWT_SECRET=your_jwt_secret_key_here
```

2. Make sure MySQL is running on your system
3. Create the database (if it doesn't exist):
   ```sql
   CREATE DATABASE savepaws;
   ```

## Using the Database Connection

Import the pool in your route files:

```javascript
import pool from '../config/database.js';

// Example query
const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
```

The connection pool will automatically manage connections for you.

