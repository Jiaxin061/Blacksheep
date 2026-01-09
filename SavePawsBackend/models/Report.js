const { query } = require('../config/database');

class Report {
  // Get all reports with optional filters
  static async getAll(filters = {}) {
    let sql = `
      SELECT r.*, 
             u.first_name as user_first_name, 
             u.last_name as user_last_name,
             a.full_name as assigned_admin_name
      FROM reports r
     LEFT JOIN users u ON r.user_id = u.id  // ASSUMES reports.user_id exists
     LEFT JOIN admins a ON r.assigned_to = a.id // ASSUMES reports.assigned_to exists
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
    if (filters.status) {
      sql += ' AND r.status = ?';
      params.push(filters.status);
    }
    if (filters.urgency) {
      sql += ' AND r.urgency_level = ?';
      params.push(filters.urgency);
    }
    if (filters.animal_type) {
      sql += ' AND r.animal_type = ?';
      params.push(filters.animal_type);
    }
    if (filters.user_id) {
      sql += ' AND r.user_id = ?';
      params.push(filters.user_id);
    }

    sql += ' ORDER BY r.created_at DESC';

    return await query(sql, params);
  }

  // Get report by ID
  static async getById(id) {
    const sql = `
      SELECT r.*, 
             u.first_name as user_first_name, 
             u.last_name as user_last_name,
             u.email as user_email,
             u.phone_number as user_phone,
             a.full_name as assigned_admin_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN admins a ON r.assigned_to = a.id
      WHERE r.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0];
  }

  // Get reports by user ID
  static async getByUserId(userId) {
    const sql = `
      SELECT * FROM reports 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    return await query(sql, [userId]);
  }

  // Get reports by status
  static async getByStatus(status) {
    const sql = `
      SELECT r.*, 
             u.first_name as user_first_name, 
             u.last_name as user_last_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.status = ? 
      ORDER BY r.created_at DESC
    `;
    return await query(sql, [status]);
  }

  // Create new report
  static async create(reportData) {
    const sql = `
      INSERT INTO reports 
      (user_id, animal_type, urgency_level, animal_condition, description, 
       location_latitude, location_longitude, location_address, photo_url,
       reporter_name, reporter_phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      reportData.user_id || null,
      reportData.animal_type,
      reportData.urgency_level || 'medium',
      reportData.animal_condition || null,
      reportData.description,
      reportData.location_latitude || null,
      reportData.location_longitude || null,
      reportData.location_address || null,
      reportData.photo_url || null,
      reportData.reporter_name || null,
      reportData.reporter_phone || null,
      reportData.status || 'pending'
    ];
    const result = await query(sql, params);
    return result.insertId;
  }

  static async update(id, reportData) {
    // This function is used for general updates, including the first 'rescue task' assignment
    const updates = [];
    const params = [];

    // --- 1. Admin Review Fields ---
    if (reportData.status !== undefined) {
      updates.push('status = ?');
      params.push(reportData.status);
    }

    if (reportData.urgency_level !== undefined) {
      updates.push('urgency_level = ?');
      params.push(reportData.urgency_level);
    }

    // NOTE: Assuming 'location_address' is the column for the admin-defined rescue area
    if (reportData.rescue_area !== undefined) {
      // Use the existing column 'location_address' to store the designated rescue area
      updates.push('location_address = ?'); 
      params.push(reportData.rescue_area);
    }

    // --- 2. Optional Fields ---
    if (reportData.animal_condition !== undefined) {
      updates.push('animal_condition = ?');
      params.push(reportData.animal_condition || null);
    }
    // NOTE: Assuming 'notes' column exists for admin comments
    if (reportData.notes !== undefined) {
      updates.push('notes = ?');
      params.push(reportData.notes || null);
    }
    if (reportData.assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(reportData.assigned_to || null);
    }

    if (updates.length === 0) {
      // Nothing to update
      return true; 
    }

    const sql = `
      UPDATE reports 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    params.push(id);

    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // Update report status only (Used for simple status changes like 'rescued' or 'closed')
  static async updateStatus(id, status) {
    const sql = 'UPDATE reports SET status = ? WHERE id = ?';
    const result = await query(sql, [status, id]);
    return result.affectedRows > 0;
  }

  // Assign report to admin
  static async assignToAdmin(id, adminId) {
    const sql = 'UPDATE reports SET assigned_to = ?, status = ? WHERE id = ?';
    const result = await query(sql, [adminId, 'assigned', id]);
    return result.affectedRows > 0;
  }

  // Delete report
  static async delete(id) {
    const sql = 'DELETE FROM reports WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Get statistics
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'rescued' THEN 1 ELSE 0 END) as rescued,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        SUM(CASE WHEN urgency_level = 'critical' THEN 1 ELSE 0 END) as critical_urgency
      FROM reports
    `;
    const results = await query(sql);
    return results[0];
  }

  // Get animal type distribution
  static async getAnimalDistribution() {
    const sql = `
      SELECT 
        animal_type,
        COUNT(*) as count
      FROM reports
      GROUP BY animal_type
      ORDER BY count DESC
    `;
    return await query(sql);
  }

  // Search reports
  static async search(searchTerm) {
    const sql = `
      SELECT r.*, 
             u.first_name as user_first_name, 
             u.last_name as user_last_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.animal_type LIKE ? 
         OR r.description LIKE ? 
         OR r.location_address LIKE ?
         OR r.reporter_name LIKE ?
      ORDER BY r.created_at DESC
    `;
    const term = `%${searchTerm}%`;
    return await query(sql, [term, term, term, term, term]);
  }

  // Get urgent reports (high or critical)
  static async getUrgentReports() {
    const sql = `
      SELECT r.*, 
             u.first_name as user_first_name, 
             u.last_name as user_last_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.urgency_level IN ('high', 'critical')
        AND r.status IN ('pending', 'assigned')
      ORDER BY 
        CASE r.urgency_level
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
        END,
        r.created_at ASC
    `;
    return await query(sql);
  }
}

module.exports = Report;