# E-Commerce Testing Suite - Instructions

## Quick Start Guide

### 1. Installation
```bash
cd testing
npm install
```

### 2. Run Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test simple.test.js

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Test Files Overview

### ✅ Working Tests
- **`simple.test.js`** - Basic environment and Jest functionality tests
- **`models.test.js`** - Database model tests (requires model files)
- **`controllers.test.js`** - API controller tests (requires controller files)
- **`middleware.test.js`** - Middleware function tests (requires middleware files)
- **`services.test.js`** - Service layer tests (requires service files)
- **`utils.test.js`** - Utility function tests (requires utility files)
- **`integration.test.js`** - End-to-end integration tests (requires full app)

## Current Status

### ✅ Successfully Created
- Testing environment setup
- Jest configuration
- Mock database setup
- Basic test verification
- Comprehensive test suites for all components

### ⚠️ Requirements for Full Testing
To run the complete test suite, ensure these files exist in your project:

#### Models (required for models.test.js)
- `../models/User.js`
- `../models/Product.js`
- `../models/Category.js`
- `../models/Order.js`

#### Controllers (required for controllers.test.js)
- `../controllers/authController.js`
- `../controllers/userController.js`
- `../controllers/productController.js`
- `../controllers/categoryController.js`
- `../controllers/orderController.js`

#### Middleware (required for middleware.test.js)
- `../middleware/auth.js`
- `../middleware/errorHandler.js`
- `../middleware/languageDetection.js`
- `../middleware/validation.js`

#### Services (required for services.test.js)
- `../services/emailService.js`
- `../services/otpService.js`

#### Utils (required for utils.test.js)
- `../utils/helpers.js`

#### App (required for integration.test.js)
- `../app.js` (Express app instance)

## Test Commands

```bash
# Basic Commands
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
npm run test:verbose       # Detailed output
npm run test:silent        # Minimal output

# Specific Test Suites
npm run test:models        # Model tests only
npm run test:controllers   # Controller tests only
npm run test:middleware    # Middleware tests only
npm run test:services      # Service tests only
npm run test:utils         # Utility tests only
npm run test:integration   # Integration tests only
npm run test:unit          # All unit tests (excludes integration)

# CI/CD
npm run test:ci            # For continuous integration
```

## Test Structure

```
testing/
├── setup.js              # Test environment configuration
├── package.json          # Dependencies and scripts
├── simple.test.js        # ✅ Basic verification tests
├── models.test.js        # Database model tests
├── controllers.test.js   # API endpoint tests
├── middleware.test.js    # Middleware function tests
├── services.test.js      # Service layer tests
├── utils.test.js         # Utility function tests
├── integration.test.js   # End-to-end tests
├── README.md             # Detailed documentation
└── INSTRUCTIONS.md       # This file
```

## Environment Variables

The tests use these environment variables (automatically set in setup.js):

```env
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key-for-testing
JWT_EXPIRE=7d
EMAIL_FROM=test@example.com
SMTP_HOST=smtp.test.com
SMTP_PORT=587
SMTP_USER=test@example.com
SMTP_PASS=testpassword
```

## Mocking Strategy

- **Database**: Mongoose is mocked to avoid requiring actual MongoDB
- **Email**: Nodemailer is mocked to prevent actual email sending
- **External APIs**: All external dependencies are mocked
- **File System**: File operations are mocked when needed

## Coverage Reports

After running `npm run test:coverage`, check:
- `coverage/lcov-report/index.html` - HTML report
- Terminal output for summary

## Troubleshooting

### Common Issues

1. **Module Not Found Errors**
   - Ensure the referenced files exist in your project
   - Update import paths if your project structure differs

2. **Timeout Errors**
   - Tests timeout after 60 seconds
   - Check for hanging promises or infinite loops

3. **Mock Issues**
   - Clear mocks between tests (done automatically)
   - Verify mock implementations match actual APIs

### Adapting Tests to Your Project

If your project structure differs:

1. Update file paths in test files
2. Modify mock implementations to match your APIs
3. Adjust test data to match your schemas
4. Update environment variables as needed

## Next Steps

1. **Verify Project Structure**: Ensure all referenced files exist
2. **Run Individual Tests**: Test each suite separately
3. **Fix Import Paths**: Update paths to match your project
4. **Customize Test Data**: Modify test data to match your schemas
5. **Add More Tests**: Extend test coverage as needed

## Example Usage

```bash
# Start with simple verification
npm test simple.test.js

# Test individual components
npm run test:models
npm run test:controllers

# Run full suite when ready
npm test

# Generate coverage report
npm run test:coverage
```

---

**Note**: This testing suite is designed to be comprehensive and adaptable. Modify the tests as needed to match your specific project structure and requirements.