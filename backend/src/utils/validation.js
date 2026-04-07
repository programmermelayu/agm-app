/**
 * Validation utilities for common patterns
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Minimum 8 characters (can add more rules later)
 */
export const isValidPassword = (password) => {
  if (!password || password.length < 8) {
    return false;
  }
  return true;
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate date format and that it's not in the past
 */
export const isValidFutureDate = (date) => {
  try {
    const dateObj = new Date(date);
    const now = new Date();
    // Set both to midnight for date comparison
    dateObj.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return dateObj >= now;
  } catch {
    return false;
  }
};

/**
 * Validate time format (HH:MM:SS)
 */
export const isValidTime = (time) => {
  const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
  return timeRegex.test(time);
};

/**
 * Get password validation errors
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    // Optional strength requirements (commented out for MVP)
    // if (!/[A-Z]/.test(password)) {
    //   errors.push('Password must contain at least one uppercase letter');
    // }
    // if (!/[a-z]/.test(password)) {
    //   errors.push('Password must contain at least one lowercase letter');
    // }
    // if (!/[0-9]/.test(password)) {
    //   errors.push('Password must contain at least one number');
    // }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  isValidEmail,
  isValidPassword,
  isValidUUID,
  isValidFutureDate,
  isValidTime,
  validatePassword,
};
