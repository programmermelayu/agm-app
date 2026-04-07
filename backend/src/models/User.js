import db from '../config/database.js';

/**
 * User Model - Database access layer for users
 */
class User {
  /**
   * Create a new user
   */
  static async create(email, passwordHash, role = 'admin') {
    const [user] = await db('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role,
      })
      .returning('*');

    return user;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const user = await db('users')
      .where({ email: email.toLowerCase() })
      .first();

    return user;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const user = await db('users')
      .where({ id })
      .first();

    return user;
  }

  /**
   * Update user (for future use - password reset, profile updates, etc.)
   */
  static async update(id, updates) {
    const [user] = await db('users')
      .where({ id })
      .update({
        ...updates,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return user;
  }

  /**
   * Delete user
   */
  static async delete(id) {
    const result = await db('users')
      .where({ id })
      .del();

    return result > 0;
  }

  /**
   * Get user count (for analytics)
   */
  static async count() {
    const result = await db('users').count('* as count').first();
    return result.count;
  }

  /**
   * Format user for response (remove password hash)
   */
  static formatForResponse(user) {
    if (!user) return null;

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}

export default User;
