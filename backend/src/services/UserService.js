import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import logger from '../config/logger.js';

/**
 * UserService - Business logic for user operations
 */
class UserService {
  /**
   * Register a new user
   * @throws {Error} if email already exists or validation fails
   */
  static async register(email, password) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password length
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create(email, passwordHash, 'admin');

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`New user registered: ${user.email}`);

    return {
      user: User.formatForResponse(user),
      token,
    };
  }

  /**
   * Login user
   * @throws {Error} if credentials are invalid
   */
  static async login(email, password) {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: User.formatForResponse(user),
      token,
    };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password) {
    const errors = [];

    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      // Optional: add more strength requirements
      // if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
      // if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
      // if (!/[0-9]/.test(password)) errors.push('Must contain number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default UserService;
