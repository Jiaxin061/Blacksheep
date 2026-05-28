const { query } = require('../config/database');

class Admin {
  // Get all admins
  static async getAll() {
    const sql = `
      SELECT id, username, email, full_name, role, is_active, last_login, created_at, updated_at
      FROM admins 
      ORDER BY created_at DESC
    `;
    return await query(sql);
  }

  // Get admin by ID
  static async getById(id) {
    const sql = `
        SELECT 
            id, 
            username,
            email, 
            full_name, 
            role, 
            is_active, 
            created_at, 
            updated_at
        FROM admins 
        WHERE id = ?
    `;
    const results = await query(sql, [id]);
    return results[0];
  }

  // Get admin by email (for login)
  static async getByEmail(email) {
    // We must explicitly select 'password_hash' here for the login process to work.
    // Only select columns that exist in the database
    const sql = 'SELECT id, email, password_hash, role, is_active FROM admins WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0];
  }

  // Get admin by username (for login)
  static async getByUsername(username) {
    const sql = 'SELECT * FROM admins WHERE username = ?';
    const results = await query(sql, [username]);
    return results[0];
  }

  // Create new admin
  static async create(adminData) {
    const sql = `
      INSERT INTO admins 
      (username, email, password_hash, full_name, role) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      adminData.username,
      adminData.email,
      adminData.password,
      adminData.full_name,
      adminData.role || 'admin'
    ];
    const result = await query(sql, params);
    return result.insertId;
  }

  // Update admin
  static async update(id, adminData) {
    const sql = `
      UPDATE admins 
      SET username = ?, email = ?, full_name = ?, role = ?
      WHERE id = ?
    `;
    const params = [
      adminData.username,
      adminData.email,
      adminData.full_name,
      adminData.role,
      id
    ];
    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // Update password
  static async updatePassword(id, password) {
    const sql = 'UPDATE admins SET password_hash = ? WHERE id = ?';
    const result = await query(sql, [password, id]);
    return result.affectedRows > 0;
  }

  // Update last login
  static async updateLastLogin(id) {
    const sql = 'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Deactivate admin
  static async deactivate(id) {
    const sql = 'UPDATE admins SET is_active = FALSE WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Activate admin
  static async activate(id) {
    const sql = 'UPDATE admins SET is_active = TRUE WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Delete admin
  static async delete(id) {
    const sql = 'DELETE FROM admins WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Check if email exists
  static async emailExists(email) {
    const sql = 'SELECT COUNT(*) as count FROM admins WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0].count > 0;
  }

  // Check if username exists
  static async usernameExists(username) {
    const sql = 'SELECT COUNT(*) as count FROM admins WHERE username = ?';
    const results = await query(sql, [username]);
    return results[0].count > 0;
  }

  // Get admin statistics
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_admins,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_admins,
        SUM(CASE WHEN role = 'super_admin' THEN 1 ELSE 0 END) as super_admins,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'moderator' THEN 1 ELSE 0 END) as moderators
      FROM admins
    `;
    const results = await query(sql);
    return results[0];
  }
}

module.exports = Admin;