const { query, getPool } = require('../../config/database');

// UC016: Create adoption request
const createRequest = async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { animal_id, adoption_reason, housing_type } = req.body;
    const user_id = req.userId || req.user?.userId || req.user?.id;

    // Validation
    if (!animal_id || !adoption_reason || !housing_type) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Animal ID, adoption reason, and housing type are required'
      });
    }

    // Check if animal exists and is available
    const [animals] = await connection.execute(
      'SELECT id, status FROM animals WHERE id = ?',
      [animal_id]
    );

    if (animals.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }

    if (animals[0].status !== 'available') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Animal is not available for adoption'
      });
    }

    // Check if user already has a pending request for this animal
    const [existingRequests] = await connection.execute(
      'SELECT id FROM adoption_requests WHERE user_id = ? AND animal_id = ? AND status = ?',
      [user_id, animal_id, 'pending']
    );

    if (existingRequests.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'You already have a pending adoption request for this animal'
      });
    }

    // Insert adoption request
    const [result] = await connection.execute(
      `INSERT INTO adoption_requests (user_id, animal_id, adoption_reason, housing_type, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [user_id, animal_id, adoption_reason, housing_type]
    );

    await connection.commit();

    // Fetch the created request with joined data
    const [requests] = await connection.execute(
      `SELECT ar.*, 
              u.first_name, u.last_name, u.email,
              a.name as animal_name, a.species, a.breed
       FROM adoption_requests ar
       LEFT JOIN users u ON ar.user_id = u.id
       LEFT JOIN animals a ON ar.animal_id = a.id
       WHERE ar.id = ?`,
      [result.insertId]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Adoption request submitted successfully',
      data: requests[0]
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error creating adoption request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating adoption request',
      error: error.message
    });
  }
};

// UC017: Get requests for the authenticated user
const getMyRequests = async (req, res) => {
  try {
    // Check all possible locations for the user ID
    const user_id = req.user?.userId || req.user?.id || req.userId;

    // Safety check: if user_id is still undefined, stop and return an error
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication failed: ID not found'
      });
    }

    const requests = await query(
      `SELECT ar.*,
              a.name as animal_name, a.species, a.breed, a.status as animal_status, a.image_url
      FROM adoption_requests ar
      LEFT JOIN animals a ON ar.animal_id = a.id
      WHERE ar.user_id = ?
      ORDER BY ar.request_date DESC`,
      [user_id]
    );

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving your adoption requests',
      error: error.message
    });
  }
};

// UC017: Get all adoption requests (with filtering)
const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT ar.*,
             u.id as user_obj_id, u.first_name, u.last_name, u.email, u.phone_number,
             a.id as animal_id, a.name as animal_name, a.species, a.breed, a.status as animal_status
      FROM adoption_requests ar
      LEFT JOIN users u ON ar.user_id = u.id
      LEFT JOIN animals a ON ar.animal_id = a.id
    `;

    const params = [];

    if (status) {
      query += ' WHERE ar.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ar.request_date DESC';

    const pool = getPool();
    const [requests] = await pool.execute(query, params);

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Error fetching adoption requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving adoption requests',
      error: error.message
    });
  }
};

// UC017: Update adoption request status
const updateStatus = async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    // Validation
    if (!status || !['approved', 'rejected'].includes(status)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    // Check if request exists
    const [requests] = await connection.execute(
      `SELECT ar.*, a.status as animal_status
       FROM adoption_requests ar
       LEFT JOIN animals a ON ar.animal_id = a.id
       WHERE ar.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found'
      });
    }

    const request = requests[0];

    // If status is already approved/rejected, don't allow change
    if (request.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot update status. Request is already ${request.status}`
      });
    }

    if (status === 'approved') {
      // Transaction: Update request status AND set animal status to 'adopted'
      await connection.execute(
        'UPDATE adoption_requests SET status = ? WHERE id = ?',
        ['approved', id]
      );

      await connection.execute(
        'UPDATE animals SET status = ? WHERE id = ?',
        ['adopted', request.animal_id]
      );

      // Reject any other pending requests for the same animal
      await connection.execute(
        `UPDATE adoption_requests 
         SET status = 'rejected', rejection_reason = 'Animal was approved to another applicant'
         WHERE animal_id = ? AND id != ? AND status = 'pending'`,
        [request.animal_id, id]
      );

      await connection.commit();
      connection.release();

      // Fetch updated request
      const pool = getPool();
      const [updated] = await pool.execute(
        `SELECT ar.*,
          u.first_name, u.last_name, u.email,
          a.name as animal_name, a.species, a.breed, a.status as animal_status
   FROM adoption_requests ar
   LEFT JOIN users u ON ar.user_id = u.id
   LEFT JOIN animals a ON ar.animal_id = a.id
   WHERE ar.id = ?`,
        [id]
      );

      res.json({
        success: true,
        message: 'Adoption request approved and animal status updated',
        data: updated[0]
      });
    } else if (status === 'rejected') {
      // Update request status with rejection reason
      await connection.execute(
        'UPDATE adoption_requests SET status = ?, rejection_reason = ? WHERE id = ?',
        ['rejected', rejection_reason || 'Request rejected by admin', id]
      );

      await connection.commit();
      connection.release();

      // Fetch updated request
      const [updated] = await pool.execute(
        `SELECT ar.*,
                u.first_name, u.last_name, u.email,
                a.name as animal_name, a.species, a.breed
         FROM adoption_requests ar
         LEFT JOIN users u ON ar.user_id = u.id
         LEFT JOIN animals a ON ar.animal_id = a.id
         WHERE ar.id = ?`,
        [id]
      );

      res.json({
        success: true,
        message: 'Adoption request rejected',
        data: updated[0]
      });
    }
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error updating adoption request status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating adoption request status',
      error: error.message
    });
  }
};

// Get single adoption request by ID
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Adoption] getRequestById called with ID: ${id}`);

    const pool = getPool();
    const [requests] = await pool.execute(
      `SELECT ar.*,
              u.id as user_obj_id, u.first_name, u.last_name, u.email, u.phone_number,
              a.id as animal_id, a.name as animal_name, a.species, a.breed, 
              a.age, a.gender, a.status as animal_status, a.description, a.image_url
       FROM adoption_requests ar
       LEFT JOIN users u ON ar.user_id = u.id
       LEFT JOIN animals a ON ar.animal_id = a.id
       WHERE ar.id = ?`,
      [id]
    );

    console.log(`[Adoption] getRequestById result count: ${requests.length}`);

    if (requests.length === 0) {
      console.log(`[Adoption] Request ${id} not found.`);
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found'
      });
    }

    res.json({
      success: true,
      data: requests[0]
    });
  } catch (error) {
    console.error('Error fetching adoption request:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving adoption request',
      error: error.message
    });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateStatus,
  getRequestById
};