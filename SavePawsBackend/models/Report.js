const { query } = require('../config/database');

class Report {
  // Get all reports
  static async getAll() {
    const sql = `
      SELECT * FROM reports 
      ORDER BY created_at DESC
    `;
    return await query(sql);
  }

  // Get report by ID
  static async getById(id) {
    const sql = 'SELECT * FROM reports WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0];
  }

  // Get reports by status
  static async getByStatus(status) {
    const sql = `
      SELECT * FROM reports 
      WHERE status = ? 
      ORDER BY created_at DESC
    `;
    return await query(sql, [status]);
  }

  // Create new report
  static async create(reportData) {
    const sql = `
      INSERT INTO reports 
      (animal_type, description, location, latitude, longitude, 
       reporter_name, reporter_contact, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      reportData.animal_type,
      reportData.description,
      reportData.location,
      reportData.latitude || null,
      reportData.longitude || null,
      reportData.reporter_name,
      reportData.reporter_contact,
      reportData.image_url || null,
      reportData.status || 'pending'
    ];
    const result = await query(sql, params);
    return result.insertId;
  }

  // Update report status
  static async updateStatus(id, status) {
    const sql = 'UPDATE reports SET status = ? WHERE id = ?';
    const result = await query(sql, [status, id]);
    return result.affectedRows > 0;
  }

  // Update entire report
  static async update(id, reportData) {
    const sql = `
      UPDATE reports 
      SET animal_type = ?, description = ?, location = ?, 
          latitude = ?, longitude = ?, reporter_name = ?, 
          reporter_contact = ?, image_url = ?, status = ?
      WHERE id = ?
    `;
    const params = [
      reportData.animal_type,
      reportData.description,
      reportData.location,
      reportData.latitude || null,
      reportData.longitude || null,
      reportData.reporter_name,
      reportData.reporter_contact,
      reportData.image_url || null,
      reportData.status,
      id
    ];
    const result = await query(sql, params);
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
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
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
      SELECT * FROM reports 
      WHERE animal_type LIKE ? 
         OR description LIKE ? 
         OR location LIKE ?
         OR reporter_name LIKE ?
      ORDER BY created_at DESC
    `;
    const term = `%${searchTerm}%`;
    return await query(sql, [term, term, term, term]);
  }
}

module.exports = Report;