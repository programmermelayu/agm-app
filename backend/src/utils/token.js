import crypto from 'crypto';

/**
 * Generate a secure RSVP token
 * Uses SHA256 hash of random bytes + timestamp + agm_id + email
 * @param {string} agmId - AGM ID
 * @param {string} email - Attendee email
 * @returns {string} - RSVP token
 */
export function generateRSVPToken(agmId, email) {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const data = `${randomBytes}:${timestamp}:${agmId}:${email}`;

  const token = crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');

  return token;
}

/**
 * Generate a secure random token
 * @param {number} length - Token length (default 32)
 * @returns {string} - Random token
 */
export function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

export default {
  generateRSVPToken,
  generateRandomToken,
};
