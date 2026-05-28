import pool from '../config/database.js';

// UC05: Get all animal records (Public)
export const getAllAnimals = async (req, res) => {
    try {
        const [animals] = await pool.execute(
            'SELECT id, name, species, breed, age, gender, status, description, image_url, weight, color, location, created_at, updated_at FROM animals ORDER BY created_at DESC'
        );

        if (animals.length === 0) {
            return res.json({
                success: true,
                message: 'No animal records found',
                data: []
            });
        }

        res.json({
            success: true,
            data: animals,
            count: animals.length
        });
    } catch (error) {
        console.error('Error fetching animals:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving animal records',
            error: error.message
        });
    }
};

// UC05: Get single animal record by ID (Public)
export const getAnimalById = async (req, res) => {
    try {
        const { id } = req.params;

        const [animals] = await pool.execute(
            'SELECT * FROM animals WHERE id = ?',
            [id]
        );

        if (animals.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Animal record not found'
            });
        }

        res.json({
            success: true,
            data: animals[0]
        });
    } catch (error) {
        console.error('Error fetching animal:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving animal record',
            error: error.message
        });
    }
};

// UC06: Search and filter animal records (Public)
export const searchAnimals = async (req, res) => {
    try {
        const { keyword, species, status, gender, minAge, maxAge } = req.query;

        let query = 'SELECT id, name, species, breed, age, gender, status, description, image_url, weight, color, location, created_at, updated_at FROM animals WHERE 1=1';
        const params = [];

        // Search by keyword (name, breed, description)
        if (keyword) {
            query += ' AND (name LIKE ? OR breed LIKE ? OR description LIKE ?)';
            const searchTerm = `%${keyword}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Filter by species
        if (species) {
            query += ' AND species = ?';
            params.push(species);
        }

        // Filter by status
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        // Filter by gender
        if (gender) {
            query += ' AND gender = ?';
            params.push(gender);
        }

        // Filter by age range
        if (minAge) {
            query += ' AND age >= ?';
            params.push(minAge);
        }

        if (maxAge) {
            query += ' AND age <= ?';
            params.push(maxAge);
        }

        query += ' ORDER BY created_at DESC';

        const [animals] = await pool.execute(query, params);

        if (animals.length === 0) {
            return res.json({
                success: true,
                message: 'No matching animal records found',
                data: []
            });
        }

        res.json({
            success: true,
            data: animals,
            count: animals.length
        });
    } catch (error) {
        console.error('Error searching animals:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching animal records',
            error: error.message
        });
    }
};

// UC07: Create new animal record (Admin only)
export const createAnimal = async (req, res) => {
    try {
        const {
            name,
            species,
            breed,
            age,
            gender,
            status,
            description,
            image_url,
            weight,
            color,
            location,
            medical_notes
        } = req.body;

        // Validation
        if (!name || !species) {
            return res.status(400).json({
                success: false,
                message: 'Name and species are required fields'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO animals 
       (name, species, breed, age, gender, status, description, image_url, weight, color, location, medical_notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                species,
                breed || null,
                age || null,
                gender || 'unknown',
                status || 'available',
                description || null,
                image_url || null,
                weight || null,
                color || null,
                location || null,
                medical_notes || null,
                req.user.userId || null
            ]
        );

        // Fetch the created animal
        const [animals] = await pool.execute(
            'SELECT * FROM animals WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Animal record created successfully',
            data: animals[0]
        });
    } catch (error) {
        console.error('Error creating animal:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating animal record',
            error: error.message
        });
    }
};

// UC07: Update animal record (Admin only)
export const updateAnimal = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            species,
            breed,
            age,
            gender,
            status,
            description,
            image_url,
            weight,
            color,
            location,
            medical_notes
        } = req.body;

        // Check if animal exists
        const [existing] = await pool.execute(
            'SELECT id FROM animals WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Animal record not found'
            });
        }

        // Validation
        if (!name || !species) {
            return res.status(400).json({
                success: false,
                message: 'Name and species are required fields'
            });
        }

        await pool.execute(
            `UPDATE animals SET
       name = ?, species = ?, breed = ?, age = ?, gender = ?, status = ?,
       description = ?, image_url = ?, weight = ?, color = ?, location = ?, medical_notes = ?
       WHERE id = ?`,
            [
                name,
                species,
                breed || null,
                age || null,
                gender || 'unknown',
                status || 'available',
                description || null,
                image_url || null,
                weight || null,
                color || null,
                location || null,
                medical_notes || null,
                id
            ]
        );

        // Fetch updated animal
        const [animals] = await pool.execute(
            'SELECT * FROM animals WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Animal record updated successfully',
            data: animals[0]
        });
    } catch (error) {
        console.error('Error updating animal:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating animal record',
            error: error.message
        });
    }
};

// UC07: Delete animal record (Admin only)
export const deleteAnimal = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if animal exists
        const [existing] = await pool.execute(
            'SELECT id FROM animals WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Animal record not found'
            });
        }

        await pool.execute('DELETE FROM animals WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Animal record deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting animal:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting animal record',
            error: error.message
        });
    }
};
