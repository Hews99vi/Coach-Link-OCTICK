const { validateStatus } = require('../utils/validators');

describe('validateStatus', () => {
  describe('when status is valid', () => {
    it('should return true for "pending"', () => {
      expect(validateStatus('pending')).toBe(true);
    });

    it('should return true for "approved"', () => {
      expect(validateStatus('approved')).toBe(true);
    });

    it('should return true for "rejected"', () => {
      expect(validateStatus('rejected')).toBe(true);
    });

    it('should return true for "scheduled"', () => {
      expect(validateStatus('scheduled')).toBe(true);
    });
  });

  describe('when status is invalid', () => {
    it('should return false for empty string', () => {
      expect(validateStatus('')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(validateStatus(undefined)).toBe(false);
    });

    it('should return false for null', () => {
      expect(validateStatus(null)).toBe(false);
    });

    it('should return false for invalid status "completed"', () => {
      expect(validateStatus('completed')).toBe(false);
    });

    it('should return false for invalid status "cancelled"', () => {
      expect(validateStatus('cancelled')).toBe(false);
    });

    it('should return false for uppercase "PENDING"', () => {
      expect(validateStatus('PENDING')).toBe(false);
    });

    it('should return false for number', () => {
      expect(validateStatus(123)).toBe(false);
    });
  });
});
