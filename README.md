# E-Commerce API

A comprehensive RESTful API for e-commerce applications built with Node.js, Express.js, and MongoDB. This API provides complete functionality for managing products, categories, orders, users, and authentication with multi-language support (English/Arabic).


it depoloyed to render backend url is :
https://e-commerce-gdmg.onrender.com/api/v1/



## 🚀 Features

### Core Features
- **Multi-language Support**: Full bilingual support (English/Arabic) for all content
- **JWT Authentication**: Secure token-based authentication system
- **Email Verification**: OTP-based email verification using Brevo/Sendinblue
- **Role-based Access Control**: Admin and user roles with different permissions
- **Product Management**: Complete CRUD operations with advanced filtering
- **Category Management**: Hierarchical category system with localization
- **Order Management**: Full order lifecycle management
- **User Management**: Comprehensive user administration
- **Security**: Rate limiting, CORS, Helmet security headers
- **Data Validation**: Comprehensive input validation and sanitization

### Advanced Features
- **Product Expiry Management**: Track production and expiry dates
- **Stock Management**: Real-time inventory tracking
- **Search & Filtering**: Advanced product search with multiple filters
- **Pagination**: Efficient data pagination for all list endpoints
- **Soft Delete**: Safe deletion with recovery options
- **Transaction Support**: Database transactions for critical operations
- **Localized Responses**: Dynamic language detection and response localization

## 📋 Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Authentication APIs](#authentication-apis)
  - [Product APIs](#product-apis)
  - [Category APIs](#category-apis)
  - [Order APIs](#order-apis)
  - [User Management APIs](#user-management-apis)
- [Database Models](#database-models)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Localization](#localization)
- [Security Features](#security-features)

## 🛠 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd e-commerce
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔧 Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# OTP Configuration
OTP_EXPIRES_IN=10

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Email Service (Brevo/Sendinblue)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Your App Name
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication APIs

#### Public Endpoints

**POST /auth/register**
- **Description**: Register a new user
- **Access**: Public
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**: Registration success message with OTP sent to email

**POST /auth/verify-email**
- **Description**: Verify email with OTP
- **Access**: Public
- **Body**:
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**POST /auth/login**
- **Description**: User login
- **Access**: Public
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**: JWT token and user information

**POST /auth/forgot-password**
- **Description**: Request password reset OTP
- **Access**: Public
- **Body**:
```json
{
  "email": "john@example.com"
}
```

**POST /auth/reset-password**
- **Description**: Reset password with OTP
- **Access**: Public
- **Body**:
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

#### Protected Endpoints (Require Authentication)

**GET /auth/profile**
- **Description**: Get user profile
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`

**PATCH /auth/profile**
- **Description**: Update user profile
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`

**POST /auth/change-password**
- **Description**: Change password
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`

**POST /auth/logout**
- **Description**: Logout user
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`

### Product APIs

#### Public Endpoints

**GET /products**
- **Description**: Get all active products with filtering and pagination
- **Access**: Public
- **Query Parameters**:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 10)
  - `category` (ObjectId): Filter by category
  - `minPrice` (number): Minimum price filter
  - `maxPrice` (number): Maximum price filter
  - `search` (string): Search in name/description
  - `sortBy` (string): Sort field
  - `sortOrder` (asc/desc): Sort direction
  - `inStock` (boolean): Filter by stock availability

**GET /products/search**
- **Description**: Search products by name or description
- **Access**: Public
- **Query Parameters**: `q` (search query), `page`, `limit`

**GET /products/categories**
- **Description**: Get all product categories
- **Access**: Public

**GET /products/category/:categoryId**
- **Description**: Get products by category
- **Access**: Public
- **Parameters**: `categoryId` (ObjectId)

**GET /products/:id**
- **Description**: Get product by ID
- **Access**: Public
- **Parameters**: `id` (ObjectId)

#### Admin-Only Endpoints

**POST /products**
- **Description**: Create a new product
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**:
```json
{
  "name": {
    "en": "Gaming Laptop",
    "ar": "لابتوب ألعاب"
  },
  "description": {
    "en": "High-performance gaming laptop",
    "ar": "لابتوب ألعاب عالي الأداء"
  },
  "price": 1299.99,
  "stock": 50,
  "category": "categoryObjectId",
  "sku": "LAPTOP-001",
  "brand": {
    "en": "TechBrand",
    "ar": "تك براند"
  }
}
```

**PATCH /products/:id**
- **Description**: Update product
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

**DELETE /products/:id**
- **Description**: Soft delete product
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

**PATCH /products/:id/stock**
- **Description**: Update product stock
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

**GET /products/admin/all**
- **Description**: Get all products including inactive ones
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

**GET /products/admin/stats**
- **Description**: Get product statistics
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

**GET /products/admin/expired**
- **Description**: Get expired products
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

**GET /products/admin/near-expiry**
- **Description**: Get products near expiry
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

### Category APIs

#### Public Endpoints

**GET /categories/public**
- **Description**: Get all active categories (limited fields)
- **Access**: Public
- **Returns**: Only `_id`, `name`, `description`, `slug` fields

**GET /categories/public/:id**
- **Description**: Get category by ID (limited fields)
- **Access**: Public
- **Returns**: Only `_id`, `name`, `description`, `slug` fields

**GET /categories/public/stats**
- **Description**: Get categories with product count (limited fields)
- **Access**: Public
- **Returns**: Only `_id`, `name`, `description`, `slug`, `productCount` fields

#### Protected Endpoints

**GET /categories**
- **Description**: Get all categories with full details
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`

**GET /categories/:id**
- **Description**: Get category by ID with full details
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`

#### Admin-Only Endpoints

**POST /categories**
- **Description**: Create a new category
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**:
```json
{
  "name": {
    "en": "Electronics",
    "ar": "إلكترونيات"
  },
  "description": {
    "en": "Electronic devices and gadgets",
    "ar": "الأجهزة الإلكترونية والأدوات"
  },
  "sortOrder": 1
}
```

**PATCH /categories/:id**
- **Description**: Update category
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

**DELETE /categories/:id**
- **Description**: Soft delete category
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

### Order APIs

#### User Endpoints (Require Authentication)

**POST /orders**
- **Description**: Create a new order
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "items": [
    {
      "product": "productObjectId",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card",
  "notes": "Please deliver after 6 PM"
}
```

**GET /orders**
- **Description**: Get user's orders
- **Access**: Authenticated users
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `page`, `limit`, `status`, `sortBy`, `sortOrder`

**GET /orders/:id**
- **Description**: Get order by ID (owner or admin)
- **Access**: Authenticated users (owner) or Admin
- **Headers**: `Authorization: Bearer <token>`

**POST /orders/:id/cancel**
- **Description**: Cancel order
- **Access**: Authenticated users (owner) or Admin
- **Headers**: `Authorization: Bearer <token>`

#### Admin-Only Endpoints

**GET /orders/admin/all**
- **Description**: Get all orders
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`
- **Query Parameters**: `page`, `limit`, `status`, `userId`, `sortBy`, `sortOrder`

**PATCH /orders/:id/status**
- **Description**: Update order status
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**:
```json
{
  "status": "confirmed"
}
```
- **Valid statuses**: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

**GET /orders/admin/stats**
- **Description**: Get order statistics
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

### User Management APIs

#### Admin-Only Endpoints

**GET /users**
- **Description**: Get all users with pagination and filtering
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`
- **Query Parameters**: `page`, `limit`, `role`, `isVerified`, `search`, `sortBy`, `sortOrder`

**GET /users/statistics**
- **Description**: Get user statistics
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

**GET /users/:id**
- **Description**: Get user by ID
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

**PATCH /users/:id/role**
- **Description**: Update user role
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**:
```json
{
  "role": "admin"
}
```

**PATCH /users/:id/status**
- **Description**: Update user status (activate/deactivate)
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**:
```json
{
  "isActive": false
}
```

**DELETE /users/:id**
- **Description**: Delete user (soft delete)
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

## 🗄 Database Models

### User Model
- **Fields**: name, email, password, isVerified, role, isActive, otp, otpExpires
- **Roles**: `user`, `admin`
- **Features**: Password hashing, OTP generation, email verification

### Product Model
- **Fields**: name (multilingual), description (multilingual), price, stock, sku, category, brand (multilingual), unitWeight, productionDate, expiryDate
- **Features**: Multilingual support, stock management, expiry tracking, search indexing

### Category Model
- **Fields**: name (multilingual), description (multilingual), slug, isActive, sortOrder
- **Features**: Multilingual support, automatic slug generation, hierarchical sorting

### Order Model
- **Fields**: user, items, totalAmount, status, shippingAddress, paymentMethod, paymentStatus, orderNumber
- **Features**: Automatic order number generation, transaction support, status tracking

## 🔒 Middleware

### Authentication Middleware
- **authenticate**: Verifies JWT token and user verification status
- **requireAdmin**: Ensures user has admin role
- **requireOwnershipOrAdmin**: Checks resource ownership or admin access
- **optionalAuth**: Optional authentication for public endpoints

### Validation Middleware
- **Input validation**: Comprehensive validation using express-validator
- **Object ID validation**: MongoDB ObjectId validation
- **Pagination validation**: Page and limit parameter validation
- **Custom validators**: Business logic validation

### Security Middleware
- **Rate limiting**: Prevents abuse with configurable limits
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers for protection
- **Language detection**: Automatic language detection from headers

## 🌐 Localization

### Supported Languages
- **English (en)**: Default language
- **Arabic (ar)**: Full RTL support

### Features
- **Automatic detection**: Language detection from Accept-Language header
- **Dynamic responses**: All API responses are localized
- **Multilingual content**: Products and categories support both languages
- **Fallback mechanism**: Falls back to English if Arabic translation is missing

### Language Files
- `locales/en.json`: English translations
- `locales/ar.json`: Arabic translations

## 🛡 Security Features

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- Role-based access control (RBAC)
- Email verification with OTP
- Password reset with secure OTP

### Data Protection
- Password hashing with bcrypt (cost factor 12)
- Input validation and sanitization
- SQL injection prevention through Mongoose
- XSS protection through input validation

### Rate Limiting
- Global rate limiting for all endpoints
- Stricter limits for authentication endpoints
- OTP request limiting to prevent abuse

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Content Security Policy

## 🚀 Deployment

### Production Considerations
1. **Environment Variables**: Ensure all production environment variables are set
2. **Database**: Use MongoDB Atlas or a production MongoDB instance
3. **Email Service**: Configure Brevo/Sendinblue for email delivery
4. **Security**: Enable HTTPS and configure proper CORS settings
5. **Monitoring**: Implement logging and monitoring solutions

### Health Check
- **GET /health**: Returns server status and timestamp
- **GET /api/v1/status**: Always returns true for load balancer checks

## 📝 Error Handling

### Error Response Format
```json
{
  "status": "error",
  "error": "error.message.key",
  "message": "Localized error message",
  "details": "Additional error details (development only)"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **429**: Too Many Requests
- **500**: Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using Node.js, Express.js, and MongoDB**
