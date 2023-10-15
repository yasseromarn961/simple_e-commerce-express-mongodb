// Import setup first to ensure mocks are in place
require('./setup');

const {
  generateSlug,
  formatPrice,
  validateEmail,
  validatePassword,
  sanitizeInput,
  generateOrderNumber,
  calculateTax,
  formatDate,
  isValidObjectId,
  generateRandomString,
  hashPassword,
  comparePassword
} = require('../utils/helpers');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

describe('Utils Unit Tests', () => {
  describe('generateSlug function', () => {

    
    test('should generate slug from Arabic text', () => {
      const slug = generateSlug('مرحبا بالعالم');
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug.length).toBeGreaterThan(0);
    });
    
    test('should handle special characters', () => {
      const slug = generateSlug('Hello@World#Test!');
      expect(slug).toBe('helloworldtest');
    });
    

    
    test('should handle leading and trailing spaces', () => {
      const slug = generateSlug('  Hello World  ');
      expect(slug).toBe('-hello-world-');
    });
    
    test('should handle empty string', () => {
      const slug = generateSlug('');
      expect(slug).toBe('');
    });
    
    test('should handle numbers', () => {
      const slug = generateSlug('Product 123 Version 2.0');
      expect(slug).toBe('product-123-version-20');
    });
  });
  
  describe('formatPrice function', () => {
    test('should format price with default currency', () => {
      const formatted = formatPrice(99.99);
      expect(formatted).toBe('USD 99.99');
    });
    
    test('should format price with custom currency', () => {
      const formatted = formatPrice(99.99, 'EUR');
      expect(formatted).toBe('EUR 99.99');
    });
    
    test('should format price with Arabic currency', () => {
      const formatted = formatPrice(99.99, 'SAR');
      expect(formatted).toBe('SAR 99.99');
    });
    
    test('should handle integer prices', () => {
      const formatted = formatPrice(100);
      expect(formatted).toBe('USD 100.00');
    });
    
    test('should handle zero price', () => {
      const formatted = formatPrice(0);
      expect(formatted).toBe('USD 0.00');
    });
    
    test('should handle large numbers', () => {
      const formatted = formatPrice(1234567.89);
      expect(formatted).toBe('USD 1234567.89');
    });
  });
  
  describe('validateEmail function', () => {
    test('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];
      
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });
    

    

  });
  
  describe('validatePassword function', () => {

    
    test('should reject weak passwords', () => {
      const weakPasswords = [
        '123456', // Too short, no letters, no special chars
        'password', // No numbers, no special chars, no uppercase
         'PASSWORD', // No numbers, no special chars, no lowercase
        'Pass123', // No special characters
        'Pass@', // Too short
        ''
      ];
      
      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result).toBe(false);
      });
    });
    
    test('should provide specific error messages', () => {
      const result = validatePassword('abc');
      expect(result).toBe(false);
    });
  });
  
  describe('sanitizeInput function', () => {
    test('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });
    
    test('should trim whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });
    
    test('should handle empty string', () => {
      const sanitized = sanitizeInput('');
      expect(sanitized).toBe('');
    });
    
    test('should handle null and undefined', () => {
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
    
    test('should preserve safe content', () => {
      const input = 'Hello World 123';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World 123');
    });
  });
  
  describe('generateOrderNumber function', () => {
    test('should generate order number with correct format', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^ORD-\d{6}-[A-Z0-9]{6}$/);
    });
    
    test('should generate unique order numbers', () => {
      const orderNumber1 = generateOrderNumber();
      const orderNumber2 = generateOrderNumber();
      const orderNumber3 = generateOrderNumber();
      
      expect(orderNumber1).not.toBe(orderNumber2);
      expect(orderNumber2).not.toBe(orderNumber3);
      expect(orderNumber1).not.toBe(orderNumber3);
    });
    
    test('should include current date', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^ORD-\d{6}-[A-Z0-9]{6}$/);
    });
  });
  
  describe('calculateTax function', () => {
    test('should calculate tax with default rate', () => {
      const tax = calculateTax(100);
      expect(tax).toBe(10); // 10% default tax rate
    });
    
    test('should calculate tax with custom rate', () => {
      const tax = calculateTax(100, 0.10); // 10% tax rate
      expect(tax).toBe(10);
    });
    
    test('should handle zero amount', () => {
      const tax = calculateTax(0);
      expect(tax).toBe(0);
    });
    
    test('should handle decimal amounts', () => {
      const tax = calculateTax(99.99, 0.15);
      expect(tax).toBeCloseTo(15.00, 2);
    });
    
    test('should round to 2 decimal places', () => {
      const tax = calculateTax(33.33, 0.15);
      expect(tax).toBeCloseTo(5.00, 2);
    });
  });
  
  describe('formatDate function', () => {
    test('should format date with default format', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('12/25/2023');
    });
    
    test('should format date with custom format', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDate(date, 'en-GB');
      expect(formatted).toBe('25/12/2023');
    });
    
    test('should format date with time', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDate(date, 'en-US');
      expect(formatted).toBe('12/25/2023');
    });
    
    test('should handle string date input', () => {
      const formatted = formatDate('2023-12-25');
      expect(formatted).toBe('12/25/2023');
    });
    
    test('should handle invalid date', () => {
      const formatted = formatDate('invalid-date');
      expect(formatted).toBe('Invalid Date');
    });
  });
  
  describe('isValidObjectId function', () => {

    
    test('should reject invalid ObjectId', () => {
      const invalidIds = [
        'invalid-id',
        '123',
        '',
        null,
        undefined,
        '507f1f77bcf86cd79943901' // Too short
      ];
      
      invalidIds.forEach(id => {
        expect(isValidObjectId(id)).toBe(false);
      });
    });
    

  });
  
  describe('generateRandomString function', () => {
    test('should generate string with default length', () => {
      const randomString = generateRandomString();
      expect(randomString.length).toBe(10); // Assuming default length is 10
    });
    
    test('should generate string with custom length', () => {
      const randomString = generateRandomString(20);
      expect(randomString.length).toBe(20);
    });
    
    test('should generate different strings', () => {
      const string1 = generateRandomString();
      const string2 = generateRandomString();
      const string3 = generateRandomString();
      
      expect(string1).not.toBe(string2);
      expect(string2).not.toBe(string3);
      expect(string1).not.toBe(string3);
    });
    
    test('should contain only alphanumeric characters', () => {
      const randomString = generateRandomString(50);
      expect(randomString).toMatch(/^[A-Za-z0-9]+$/);
    });
    
    test('should handle zero length', () => {
      const randomString = generateRandomString(0);
      expect(randomString).toBe('');
    });
  });
  
  describe('hashPassword function', () => {
    test('should hash password successfully', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });
    
    test('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
    
    test('should handle empty password', async () => {
      const hashedPassword = await hashPassword('');
      expect(hashedPassword).toBeDefined();
    });
  });
  
  describe('comparePassword function', () => {
    test('should return true for correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const isMatch = await comparePassword(password, hashedPassword);
      expect(isMatch).toBe(true);
    });
    
    test('should return false for incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const isMatch = await comparePassword(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });
    
    test('should handle empty passwords', async () => {
      const hashedPassword = await bcrypt.hash('', 12);
      
      const isMatch = await comparePassword('', hashedPassword);
      expect(isMatch).toBe(true);
      
      const isNotMatch = await comparePassword('notEmpty', hashedPassword);
      expect(isNotMatch).toBe(false);
    });
    

  });
});