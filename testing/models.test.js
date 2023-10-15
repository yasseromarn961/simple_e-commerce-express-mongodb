// Import setup first to ensure mocks are in place
require('./setup');

const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

describe('Models Unit Tests', () => {
  describe('User Model', () => {
    test('should create a valid user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.isVerified).toBe(false);
      expect(savedUser.role).toBe('user');
      expect(savedUser.isActive).toBe(true);
    });
    
    test('should hash password before saving', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      };
      
      const user = new User(userData);
      await user.save();
      
      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(20); // Hashed password should be longer
    });
    
    test('should validate email format', async () => {
      const userData = {
        name: 'Invalid User',
        email: 'invalid-email',
        password: 'password123'
      };
      
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });
    
    test('should require name, email, and password', async () => {
      const user = new User({});
      
      await expect(user.save()).rejects.toThrow();
    });
    
    test('should generate and verify OTP', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      const otp = user.generateOTP();
      
      expect(otp).toBeDefined();
      expect(otp.length).toBe(6);
      expect(user.otp).toBeDefined();
      expect(user.otpExpires).toBeDefined();
      expect(user.otpExpires).toBeInstanceOf(Date);
      expect(user.otpExpires.getTime()).toBeGreaterThan(Date.now());
      expect(user.verifyOTP(otp)).toBe(true);
      expect(user.verifyOTP('wrong')).toBe(false);
    });
    
    test('should compare passwords correctly', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const user = new User(userData);
      await user.save();
      
      const isMatch = await user.comparePassword('password123');
      const isNotMatch = await user.comparePassword('wrongpassword');
      
      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });
  
  describe('Category Model', () => {
    test('should create a valid category', async () => {
      const categoryData = {
        name: {
          en: 'Electronics',
          ar: 'إلكترونيات'
        },
        description: {
          en: 'Electronic devices and gadgets',
          ar: 'الأجهزة الإلكترونية والأدوات'
        },
        createdBy: '507f1f77bcf86cd799439011'
      };
      
      const category = new Category(categoryData);
      const savedCategory = await category.save();
      
      expect(savedCategory._id).toBeDefined();
      expect(savedCategory.name.en).toBe(categoryData.name.en);
      expect(savedCategory.name.ar).toBe(categoryData.name.ar);
      expect(savedCategory.isActive).toBe(true);
      expect(savedCategory.sortOrder).toBe(0);
      expect(savedCategory.slug).toBeDefined();
    });
    
    test('should generate slug automatically', async () => {
      const categoryData = {
        name: {
          en: 'Home & Garden',
          ar: 'المنزل والحديقة'
        },
        createdBy: '507f1f77bcf86cd799439011'
      };
      
      const category = new Category(categoryData);
      await category.save();
      
      expect(category.slug).toBe('home-garden');
    });
    
    test('should require English and Arabic names', async () => {
      const category = new Category({
        name: {
          en: 'Test Category'
          // Missing Arabic name
        },
        createdBy: new mongoose.Types.ObjectId()
      });
      
      await expect(category.save()).rejects.toThrow();
    });
  });
  
  describe('Product Model', () => {
    let categoryId;
    let userId;
    
    beforeEach(async () => {
      // Use mock IDs for testing
      categoryId = '507f1f77bcf86cd799439011';
      userId = '507f1f77bcf86cd799439011';
    });
    
    test('should create a valid product', async () => {
      const productData = {
        name: {
          en: 'Test Product',
          ar: 'منتج اختبار'
        },
        description: {
          en: 'A test product description',
          ar: 'وصف منتج اختبار'
        },
        price: 99.99,
        stock: 10,
        category: categoryId,
        createdBy: userId
      };
      
      const product = new Product(productData);
      const savedProduct = await product.save();
      
      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.name.en).toBe(productData.name.en);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.stock).toBe(productData.stock);
      expect(savedProduct.isActive).toBe(true);
      expect(savedProduct.sku).toBeDefined();
    });
    
    test('should validate price is not negative', async () => {
      const productData = {
        name: {
          en: 'Invalid Product'
        },
        price: -10, // Invalid negative price
        stock: 5,
        category: categoryId,
        createdBy: userId
      };
      
      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow();
    });
    
    test('should validate stock is not negative', async () => {
      const productData = {
        name: {
          en: 'Invalid Product'
        },
        price: 10,
        stock: -5, // Invalid negative stock
        category: categoryId,
        createdBy: userId
      };
      
      const product = new Product(productData);
      
      await expect(product.save()).rejects.toThrow();
    });
    
    test('should check if product is in stock', async () => {
      const product = new Product({
        name: {
          en: 'Stock Test Product'
        },
        price: 50,
        stock: 5,
        category: categoryId,
        createdBy: userId
      });
      
      expect(product.inStock).toBe(true);
      
      product.stock = 0;
      expect(product.inStock).toBe(false);
    });
    
    test('should reduce and increase stock correctly', async () => {
      const product = new Product({
        name: {
          en: 'Stock Management Product'
        },
        price: 30,
        stock: 10,
        category: categoryId,
        createdBy: userId
      });
      
      await product.save();
      
      // Test reduce stock
      await product.reduceStock(3);
      expect(product.stock).toBe(7);
      
      // Test increase stock
      await product.increaseStock(2);
      expect(product.stock).toBe(9);
      
      // Test reduce stock beyond available
      await expect(product.reduceStock(15)).rejects.toThrow();
    });
  });
  
  describe('Order Model', () => {
    let userId;
    let productId;
    
    beforeEach(async () => {
      // Use mock IDs for testing
      userId = '507f1f77bcf86cd799439011';
      productId = '507f1f77bcf86cd799439011';
    });
    
    test('should create a valid order', async () => {
      const orderData = {
        user: userId,
        items: [{
          product: productId,
          quantity: 2,
          price: 25.99,
          subtotal: 51.98
        }],
        totalAmount: 51.98,
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        }
      };
      
      const order = new Order(orderData);
      const savedOrder = await order.save();
      
      expect(savedOrder._id).toBeDefined();
      expect(savedOrder.user.toString()).toBe(userId.toString());
      expect(savedOrder.items).toHaveLength(1);
      expect(savedOrder.totalAmount).toBe(orderData.totalAmount);
      expect(savedOrder.status).toBe('pending');
      expect(savedOrder.paymentStatus).toBe('pending');
      expect(savedOrder.orderNumber).toBeDefined();
    });
    
    test('should validate order has at least one item', async () => {
      const orderData = {
        user: userId,
        items: [], // Empty items array
        totalAmount: 0
      };
      
      const order = new Order(orderData);
      
      await expect(order.save()).rejects.toThrow();
    });
    
    test('should calculate items count and total quantity', async () => {
      const order = new Order({
        user: userId,
        items: [
          {
            product: productId,
            quantity: 2,
            price: 25.99,
            subtotal: 51.98
          },
          {
            product: productId,
            quantity: 3,
            price: 25.99,
            subtotal: 77.97
          }
        ],
        totalAmount: 129.95
      });
      
      expect(order.itemsCount).toBe(2);
      expect(order.totalQuantity).toBe(5);
    });
    
    test('should validate quantity is positive integer', async () => {
      const orderData = {
        user: userId,
        items: [{
          product: productId,
          quantity: -1, // Invalid negative quantity
          price: 25.99,
          subtotal: -25.99
        }],
        totalAmount: -25.99
      };
      
      const order = new Order(orderData);
      
      await expect(order.save()).rejects.toThrow();
    });
  });
});