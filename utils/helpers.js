// Mock helpers for testing
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const generateSlug = (text) => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

const formatPrice = (price, currency = 'USD') => {
  return `${currency} ${price.toFixed(2)}`;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/<script[^>]*>.*?<\/script>/gi, '');
};

const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
};

const calculateTax = (amount, taxRate = 0.1) => {
  return amount * taxRate;
};

const formatDate = (date, locale = 'en-US') => {
  return new Date(date).toLocaleDateString(locale);
};

const isValidObjectId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) return true;
  if (id instanceof mongoose.Types.ObjectId) return true;
  return false;
};

const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Invalid hash format');
  }
};

module.exports = {
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
};