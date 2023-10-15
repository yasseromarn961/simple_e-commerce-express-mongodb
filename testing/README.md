# E-Commerce Testing Suite

Comprehensive unit and integration tests for the e-commerce application.

## Overview

This testing suite provides complete coverage for all major components of the e-commerce application including:

- **Models**: Database models and their methods
- **Controllers**: API endpoint handlers
- **Middleware**: Authentication, validation, and error handling
- **Services**: Email and OTP services
- **Utils**: Helper functions and utilities
- **Integration**: End-to-end workflow testing

## Test Structure

```
testing/
├── setup.js                 # Test environment setup
├── jest.config.js           # Jest configuration
├── package.json             # Testing dependencies and scripts
├── models.test.js           # Model unit tests
├── controllers.test.js      # Controller unit tests
├── middleware.test.js       # Middleware unit tests
├── services.test.js         # Service unit tests
├── utils.test.js           # Utility function tests
├── integration.test.js     # Integration tests
└── README.md               # This file
```

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (running locally or connection string)
3. **Environment Variables** set up in parent directory

## Installation

1. Navigate to the testing directory:
   ```bash
   cd testing
   ```

2. Install testing dependencies:
   ```bash
   npm install
   ```

## Environment Setup

Ensure the following environment variables are set in your `.env` file (in the parent directory):

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce_test

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d

# Email (for testing)
EMAIL_FROM=test@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=test@example.com
SMTP_PASS=password

# Other
NODE_ENV=test
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# Model tests only
npm run test:models

# Controller tests only
npm run test:controllers

# Middleware tests only
npm run test:middleware

# Service tests only
npm run test:services

# Utility tests only
npm run test:utils

# Integration tests only
npm run test:integration

# Unit tests only (excludes integration)
npm run test:unit
```

### Test Options
```bash
# Watch mode (re-runs tests on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Verbose output
npm run test:verbose

# Silent mode
npm run test:silent

# CI mode (for continuous integration)
npm run test:ci
```

## Test Categories

### 1. Model Tests (`models.test.js`)
Tests for MongoDB models including:
- User model (password hashing, OTP generation, validation)
- Product model (stock management, search functionality)
- Category model (slug generation, active categories)
- Order model (order creation, status management)

### 2. Controller Tests (`controllers.test.js`)
Tests for API controllers including:
- Authentication (register, login, verify email)
- User management (profile updates, admin operations)
- Product management (CRUD operations, search)
- Category management (CRUD operations)
- Order management (creation, status updates, cancellation)

### 3. Middleware Tests (`middleware.test.js`)
Tests for middleware functions including:
- Authentication middleware (token validation)
- Authorization middleware (role-based access)
- Validation middleware (input validation)
- Language detection middleware
- Error handling middleware

### 4. Service Tests (`services.test.js`)
Tests for service modules including:
- Email service (sending various types of emails)
- OTP service (generation, verification, expiration)

### 5. Utility Tests (`utils.test.js`)
Tests for utility functions including:
- Slug generation
- Price formatting
- Email validation
- Password validation
- Input sanitization
- Date formatting
- Password hashing and comparison

### 6. Integration Tests (`integration.test.js`)
End-to-end workflow tests including:
- Complete authentication flow
- Product lifecycle management
- Order processing workflow
- User profile management
- Error handling scenarios
- Multi-language support

## Coverage Reports

After running tests with coverage, reports are generated in:
- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format
- `coverage/coverage-final.json` - JSON format

Coverage thresholds are set to 70% for:
- Branches
- Functions
- Lines
- Statements

## Test Database

Tests use a separate test database (`ecommerce_test`) to avoid affecting development data. The database is:
- Automatically connected before tests start
- Cleaned between test suites
- Disconnected after all tests complete

## Mocking

The test suite includes mocks for:
- Email service (nodemailer)
- External API calls
- File system operations

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Cleanup**: Database is cleaned between tests
3. **Realistic Data**: Tests use realistic test data
4. **Error Cases**: Both success and failure scenarios are tested
5. **Performance**: Tests are optimized for speed

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in environment variables

2. **JWT Secret Error**
   - Ensure JWT_SECRET is set in environment variables

3. **Timeout Errors**
   - Increase timeout in jest.config.js if needed
   - Check for hanging database connections

4. **Module Not Found**
   - Ensure all dependencies are installed
   - Check file paths in require statements

### Debug Mode

To run tests in debug mode:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Contributing

When adding new features to the main application:

1. Add corresponding unit tests
2. Update integration tests if needed
3. Ensure all tests pass
4. Maintain coverage thresholds
5. Update this README if necessary

## Test Data

Test data is generated dynamically and includes:
- Users with different roles (admin, user)
- Products with various categories
- Orders with different statuses
- Realistic email addresses and names

## Performance

The test suite is optimized for:
- Fast execution (typically under 30 seconds)
- Parallel test execution where possible
- Minimal database operations
- Efficient memory usage

## Security

Security considerations in tests:
- No real credentials in test files
- Secure password hashing tests
- Input validation tests
- Authentication and authorization tests

---

**Note**: This testing suite is designed to work with the existing e-commerce application structure. Ensure all paths and imports match your actual project structure.