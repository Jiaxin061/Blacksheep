const { query } = require('../config/database');

class User {
  // Get all users
  static async getAll() {
    const sql = `
      SELECT id, first_name, last_name, email, phone_number, status, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `;
    return await query(sql);
  }

  // Get user by ID
  static async getById(id) {
    const sql = `
      SELECT id, first_name, last_name, email, phone_number, status, created_at, updated_at
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
    // Use password column (supports both password and password_hash field names)
    const passwordField = userData.password || userData.password_hash;
    const sql = `
      INSERT INTO users 
      (ic_number, first_name, last_name, email, phone_number, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userData.ic_number,
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.phone_number || null,
      passwordField
    ];
    const result = await query(sql, params);
    return result.insertId;
  }

  // Update user
  static async update(id, userData) {
    const updates = [];
    const params = [];

    if (userData.first_name !== undefined) {
      updates.push('first_name = ?');
      params.push(userData.first_name);
    }
    if (userData.last_name !== undefined) {
      updates.push('last_name = ?');
      params.push(userData.last_name);
    }
    if (userData.email !== undefined) {
      updates.push('email = ?');
      params.push(userData.email);
    }
    if (userData.phone_number !== undefined) {
      updates.push('phone_number = ?');
      params.push(userData.phone_number || null);
    }
    if (userData.status !== undefined) {
      updates.push('status = ?');
      params.push(userData.status);
    }

    if (updates.length === 0) {
      return false;
    }

    const sql = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    params.push(id);

    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // Update user status (for blacklisting/banning)
  static async updateStatus(id, status) {
    const sql = 'UPDATE users SET status = ? WHERE id = ?';
    const result = await query(sql, [status, id]);
    return result.affectedRows > 0;
  }

  // Update password
  static async updatePassword(id, password_hash) {
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    const result = await query(sql, [password_hash, id]);
    return result.affectedRows > 0;
  }

  // Deactivate user (soft delete) - using status instead of is_active
  static async deactivate(id) {
    const sql = 'UPDATE users SET status = ? WHERE id = ?';
    const result = await query(sql, ['banned', id]);
    return result.affectedRows > 0;
  }

  // Activate user - using status instead of is_active
  static async activate(id) {
    const sql = 'UPDATE users SET status = ? WHERE id = ?';
    const result = await query(sql, ['active', id]);
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
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) as inactive_users
      FROM users
    `;
    const results = await query(sql);
    return results[0];
  }

  // Get all blacklisted users
  static async getBlacklisted() {
    const sql = `
      SELECT id, first_name, last_name, email, phone_number, status, created_at, updated_at
      FROM users 
      WHERE status = 'banned'
      ORDER BY updated_at DESC
    `;
    return await query(sql);
  }
}

module.exports = User;