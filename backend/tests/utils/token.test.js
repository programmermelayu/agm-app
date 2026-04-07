import { generateRSVPToken, generateRandomToken } from '../../src/utils/token.js';

describe('Token Utilities', () => {
  describe('generateRSVPToken', () => {
    it('should generate a valid token', () => {
      const token = generateRSVPToken('agm-123', 'test@example.com');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // SHA256 hex is 64 chars
    });

    it('should generate different tokens for different inputs', () => {
      const token1 = generateRSVPToken('agm-123', 'test1@example.com');
      const token2 = generateRSVPToken('agm-123', 'test2@example.com');
      expect(token1).not.toBe(token2);
    });

    it('should generate different tokens for same inputs (due to random bytes)', () => {
      const token1 = generateRSVPToken('agm-123', 'test@example.com');
      const token2 = generateRSVPToken('agm-123', 'test@example.com');
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRandomToken', () => {
    it('should generate a random token with default length', () => {
      const token = generateRandomToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes * 2 for hex
    });

    it('should generate a random token with custom length', () => {
      const token = generateRandomToken(16);
      expect(token.length).toBe(32); // 16 bytes * 2 for hex
    });

    it('should generate different tokens', () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();
      expect(token1).not.toBe(token2);
    });
  });
});
