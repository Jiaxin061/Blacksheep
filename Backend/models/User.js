const { query } = require('../config/database');

class User {
  // Get all users
  static async getAll() {
    const sql = `
      SELECT id, first_name, last_name, email, phone_number, is_active, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `;
    return await query(sql);
  }

  // Get user by ID
  static async getById(id) {
    const sql = `
      SELECT id, first_name, last_name, email, phone_number, is_active, created_at, updated_at
      FROM users 
      WHERE id = ?
    `;
    const results = await query(sql, [id]);
    return results[0];
  }

  // Get user by email (for login)
  static async getByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0];
  }

  // Get user by IC number (for login)
  static async getByIcNumber(ic_number) {
    const sql = 'SELECT * FROM users WHERE ic_number = ?';
    const results = await query(sql, [ic_number]);
    return results[0];
  }

  // Create new user
  static async create(userData) {
    const sql = `
      INSERT INTO users 
      (first_name, last_name, email, phone_number, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.phone_number || null,
      userData.password_hash
    ];
    const result = await query(sql, params);
    return result.insertId;
  }

  // Update user
  static async update(id, userData) {
    const sql = `
      UPDATE users 
      SET first_name = ?, last_name = ?, email = ?, phone_number = ?
      WHERE id = ?
    `;
    const params = [
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.phone_number || null,
      id
    ];
    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // Update password
  static async updatePassword(id, password_hash) {
    const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
    const result = await query(sql, [password_hash, id]);
    return result.affectedRows > 0;
  }

  // Deactivate user (soft delete)
  static async deactivate(id) {
    const sql = 'UPDATE users SET is_active = FALSE WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Activate user
  static async activate(id) {
    const sql = 'UPDATE users SET is_active = TRUE WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Delete user (hard delete)
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Check if email exists
  static async emailExists(email) {
    const sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0].count > 0;
  }

  // Get user statistics
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as inactive_users
      FROM users
    `;
    const results = await query(sql);
    return results[0];
  }
}

module.exports = User;