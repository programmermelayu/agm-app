import {
  isValidEmail,
  isValidPassword,
  isValidUUID,
  isValidFutureDate,
  isValidTime,
} from '../../src/utils/validation.js';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      expect(isValidPassword('ValidPass123!')).toBe(true);
      expect(isValidPassword('VeryLongPassword1234567890')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isValidPassword('short')).toBe(false); // Too short
      expect(isValidPassword('nouppercase1!')).toBe(false);
      expect(isValidPassword('NOLOWERCASE1!')).toBe(false);
      expect(isValidPassword('NoNumbers!')).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('should validate valid UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('isValidFutureDate', () => {
    it('should validate future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isValidFutureDate(futureDate.toISOString().split('T')[0])).toBe(true);
    });

    it('should reject past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isValidFutureDate(pastDate.toISOString().split('T')[0])).toBe(false);
    });

    it('should handle today as past', () => {
      const today = new Date().toISOString().split('T')[0];
      // Today should be invalid (not in future)
      const result = isValidFutureDate(today);
      expect(result).toBe(false);
    });
  });

  describe('isValidTime', () => {
    it('should validate correct time formats', () => {
      expect(isValidTime('09:00')).toBe(true);
      expect(isValidTime('23:59')).toBe(true);
      expect(isValidTime('00:00')).toBe(true);
    });

    it('should reject invalid time formats', () => {
      expect(isValidTime('25:00')).toBe(false);
      expect(isValidTime('12:60')).toBe(false);
      expect(isValidTime('1200')).toBe(false);
      expect(isValidTime('invalid')).toBe(false);
    });
  });
});
