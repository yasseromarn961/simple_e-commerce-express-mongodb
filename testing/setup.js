const mongoose = require('mongoose');

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_EXPIRE = '7d';
process.env.EMAIL_FROM = 'test@example.com';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'testpassword';
// Brevo configuration
process.env.BREVO_API_KEY = 'test-brevo-api-key';
process.env.BREVO_SENDER_EMAIL = 'test@example.com';
process.env.BREVO_SENDER_NAME = 'Test Sender';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.PORT = '3000';

// Increase Jest timeout
jest.setTimeout(60000);

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock mongoose completely for testing
const mockObjectId = '507f1f77bcf86cd799439011';

// Create a mock user instance
const createMockUser = (data = {}) => {
  const defaultUser = {
    _id: mockObjectId,
    name: data.name || (Object.keys(data).length === 0 ? undefined : 'Test User'),
    email: data.email || (Object.keys(data).length === 0 ? undefined : 'test@example.com'),
    password: data.password || (Object.keys(data).length === 0 ? undefined : '$2b$10$hashedpassword'),
    role: 'user',
    isActive: true,
    isVerified: false,
    otp: null,
    otpExpires: null,
    ...data
  };
  
  return {
    ...defaultUser,
    save: jest.fn().mockImplementation(function() {
      // Validate email
      if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        return Promise.reject(new Error('Please provide a valid email address'));
      }
      // Validate password
      if (!this.password || this.password.length < 6) {
        return Promise.reject(new Error('Password must be at least 6 characters'));
      }
      // Validate name
      if (!this.name || this.name.trim() === '') {
        return Promise.reject(new Error('Name is required'));
      }
      // Hash password if not already hashed
      if (this.password && !this.password.startsWith('$2b$')) {
        this.password = '$2b$10$' + 'a'.repeat(50); // Mock hashed password
      }
      return Promise.resolve(this);
    }),
    comparePassword: jest.fn((password) => Promise.resolve(password === 'password123')),
    generateOTP: jest.fn(function() {
      const otp = '123456';
      this.otp = otp;
      this.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      return otp;
    }),
    verifyOTP: jest.fn(function(inputOtp) {
      return inputOtp === this.otp;
    }),
    clearOTP: jest.fn(),
    remove: jest.fn().mockResolvedValue(defaultUser)
  };
};

// Create a mock category instance
const createMockCategory = (data = {}) => {
  const defaultCategory = {
    _id: mockObjectId,
    name: { en: 'Test Category', ar: 'فئة اختبار' },
    description: { en: 'Test Description', ar: 'وصف اختبار' },
    isActive: true,
    sortOrder: 0,
    createdBy: mockObjectId,
    ...data
  };
  
  return {
    ...defaultCategory,
    save: jest.fn().mockImplementation(function() {
      // Validate name
      if (!this.name || !this.name.en || this.name.en.trim() === '') {
        return Promise.reject(new Error('English category name is required'));
      }
      if (!this.name.ar || this.name.ar.trim() === '') {
        return Promise.reject(new Error('Arabic category name is required'));
      }
      // Generate slug if not provided
      if (!this.slug && this.name.en) {
        this.slug = this.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }
      return Promise.resolve(this);
    }),
    remove: jest.fn().mockResolvedValue(defaultCategory)
  };
};

// Create a mock product instance
const createMockProduct = (data = {}) => {
  const defaultProduct = {
    _id: mockObjectId,
    name: { en: 'Test Product', ar: 'منتج اختبار' },
    description: { en: 'Test Description', ar: 'وصف اختبار' },
    price: 100,
    stock: 10,
    sku: 'TEST-PRODUCT-001',
    category: mockObjectId,
    images: [],
    isActive: true,
    createdBy: mockObjectId,
    ...data
  };
  
  return {
    ...defaultProduct,
    save: jest.fn().mockImplementation(function() {
      // Validate name
      if (!this.name || !this.name.en || this.name.en.trim() === '') {
        return Promise.reject(new Error('Name is required'));
      }
      // Validate price
      if (this.price < 0) {
        return Promise.reject(new Error('Price cannot be negative'));
      }
      // Validate stock
      if (this.stock < 0) {
        return Promise.reject(new Error('Stock cannot be negative'));
      }
      return Promise.resolve(this);
    }),
    get inStock() {
      return this.stock > 0;
    },
    isInStock: jest.fn(() => defaultProduct.stock > 0),
    reduceStock: jest.fn(function(quantity) {
      if (this.stock < quantity) {
        return Promise.reject(new Error('Insufficient stock'));
      }
      this.stock -= quantity;
      return Promise.resolve(this);
    }),
    increaseStock: jest.fn(function(quantity) {
      this.stock += quantity;
      return Promise.resolve(this);
    })
  };
};

// Create a mock order instance
const createMockOrder = (data = {}) => {
  const defaultOrder = {
    _id: mockObjectId,
    user: mockObjectId,
    items: [{
      product: mockObjectId,
      quantity: 2,
      price: 25.99,
      subtotal: 51.98
    }],
    totalAmount: 51.98,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'cash_on_delivery',
    orderNumber: 'ORD-' + Date.now(),
    shippingAddress: {
      street: 'Test Street',
      city: 'Test City',
      zipCode: '12345',
      country: 'Test Country'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data
  };
  
  const mockOrder = {
    ...defaultOrder,
    save: jest.fn().mockImplementation(function() {
      // Validate items array is not empty
      if (!this.items || this.items.length === 0) {
        return Promise.reject(new Error('Order must contain at least one item'));
      }
      // Validate quantity
      if (this.items && this.items.some(item => item.quantity <= 0)) {
        return Promise.reject(new Error('Quantity must be a positive integer'));
      }
      // Validate totalAmount
      if (this.totalAmount < 0) {
        return Promise.reject(new Error('Total amount cannot be negative'));
      }
      return Promise.resolve(this);
    }),
    remove: jest.fn().mockResolvedValue(defaultOrder),
    populate: jest.fn().mockReturnThis(),
    // Add virtual properties
    get itemsCount() {
      return this.items.length;
    },
    get totalQuantity() {
      return this.items.reduce((total, item) => total + item.quantity, 0);
    }
  };
  
  return mockOrder;
};



// Mock AppError class
class MockAppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
  }
}

// Mock errorHandler middleware
jest.mock('../middleware/errorHandler', () => ({
  AppError: MockAppError,
  errorHandler: (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';
    
    res.status(statusCode).json({
      status,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  },
  catchAsync: (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  }
}));

// Mock mongoose
jest.mock('mongoose', () => {
  const mockSchema = {
    pre: jest.fn(),
    post: jest.fn(),
    methods: {},
    statics: {},
    virtual: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn()
    }))
  };

  return {
    connect: jest.fn(() => Promise.resolve()),
    connection: {
      readyState: 1,
      collections: {},
      db: {
        dropDatabase: jest.fn(() => Promise.resolve())
      },
      close: jest.fn(() => Promise.resolve())
    },
    Schema: jest.fn(() => mockSchema),
    model: jest.fn(() => ({})),
    Types: {
      ObjectId: jest.fn(() => mockObjectId)
    }
  };
});

// Create mock constructors
const MockUser = jest.fn().mockImplementation((data) => createMockUser(data));
MockUser.find = jest.fn(() => Promise.resolve([]));
MockUser.findOne = jest.fn(() => Promise.resolve(null));
MockUser.findById = jest.fn(() => Promise.resolve(null));
MockUser.create = jest.fn((data) => Promise.resolve(createMockUser(data)));
MockUser.findByIdAndUpdate = jest.fn(() => Promise.resolve({}));
MockUser.findByIdAndDelete = jest.fn(() => Promise.resolve({}));
MockUser.deleteMany = jest.fn(() => Promise.resolve({ deletedCount: 0 }));

const MockCategory = jest.fn().mockImplementation((data) => createMockCategory(data));
MockCategory.find = jest.fn(() => Promise.resolve([]));
MockCategory.findOne = jest.fn(() => Promise.resolve(null));
MockCategory.findById = jest.fn(() => Promise.resolve(null));
MockCategory.create = jest.fn((data) => Promise.resolve(createMockCategory(data)));
MockCategory.findByIdAndUpdate = jest.fn(() => Promise.resolve({}));
MockCategory.findByIdAndDelete = jest.fn(() => Promise.resolve({}));
MockCategory.deleteMany = jest.fn(() => Promise.resolve({ deletedCount: 0 }));

const MockProduct = jest.fn().mockImplementation((data) => createMockProduct(data));
MockProduct.find = jest.fn(() => Promise.resolve([]));
MockProduct.findOne = jest.fn(() => Promise.resolve(null));
MockProduct.findById = jest.fn(() => Promise.resolve(null));
MockProduct.create = jest.fn((data) => Promise.resolve(createMockProduct(data)));
MockProduct.findByIdAndUpdate = jest.fn(() => Promise.resolve({}));
MockProduct.findByIdAndDelete = jest.fn(() => Promise.resolve({}));
MockProduct.deleteMany = jest.fn(() => Promise.resolve({ deletedCount: 0 }));

const MockOrder = jest.fn().mockImplementation((data) => createMockOrder(data));
MockOrder.find = jest.fn(() => Promise.resolve([]));
MockOrder.findOne = jest.fn(() => Promise.resolve(null));
MockOrder.findById = jest.fn(() => Promise.resolve(null));
MockOrder.create = jest.fn((data) => Promise.resolve(createMockOrder(data)));
MockOrder.findByIdAndUpdate = jest.fn(() => Promise.resolve({}));
MockOrder.findByIdAndDelete = jest.fn(() => Promise.resolve({}));
MockOrder.deleteMany = jest.fn(() => Promise.resolve({ deletedCount: 0 }));

// Mock the model files
jest.mock('../models/User', () => MockUser);
jest.mock('../models/Category', () => MockCategory);
jest.mock('../models/Product', () => MockProduct);
jest.mock('../models/Order', () => MockOrder);

// Note: Individual test files will handle their own mocking as needed
// This avoids Jest module resolution issues with non-existent files

// Global setup before all tests
beforeAll(async () => {
  // Mock database connection - no actual connection needed
  console.log('Test environment initialized');
});

// Clean up after each test
afterEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();
});

// Global cleanup after all tests
afterAll(async () => {
  console.log('Test environment cleaned up');
});