# Product Management APIs Guide

## Overview
This guide contains a detailed explanation of all APIs related to product management in the system. The system includes 12 different APIs covering general and administrative operations for products.

## Basic Requirements
- **For General Operations**: No login required
- **For Administrative Operations**: Must be logged in as admin and have JWT Token
- **Base URL**: `http://localhost:3000/api/v1/products`

## Language Settings
All APIs support language settings for multilingual fields (`name`, `description`, `brand`):

### Language Parameters
- `language=ar`: Return texts in Arabic only
- `language=en`: Return texts in English only
- Without specification: Return both languages as object

### Examples of Language Settings Usage
```
GET /api/v1/products?language=ar
GET /api/v1/products/search?q=laptop&language=en
POST /api/v1/products?language=ar
PATCH /api/v1/products/:id?language=en
```

### Response Behavior
- **With `language=ar`**: `{"name": "لابتوب ألعاب", "brand": "تك براند"}`
- **With `language=en`**: `{"name": "Gaming Laptop", "brand": "TechBrand"}`
- **Without specification**: `{"name": {"en": "Gaming Laptop", "ar": "لابتوب ألعاب"}, "brand": {"en": "TechBrand", "ar": "تك براند"}}`

---

## 1. Get All Products
**GET** `/api/v1/products`

### Purpose
Retrieve all active products with filtering, search, and pagination capabilities.

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of products per page (default: 10)
- `category` (optional): Product category (ObjectId or text)
- `brand` (optional): Brand name (searches in both English and Arabic versions)
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `search` (optional): Search in name, description, and brand
- `sortBy` (optional): Sort by (name, price, createdAt)
- `sortOrder` (optional): Sort direction (asc, desc)
- `inStock` (optional): In-stock products only (true/false)
- `language` (optional): Required language for multilingual fields (ar, en)

### Postman Example
```
GET http://localhost:3000/api/v1/products?page=1&limit=10&category=electronics&brand=TechBrand&minPrice=100&maxPrice=1000&search=laptop&sortBy=price&sortOrder=asc&inStock=true&language=en
```

### Expected Response (with language=en)
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "60d5ecb74b24a1234567890a",
        "name": "Gaming Laptop",
        "description": "High-performance gaming laptop",
        "brand": "TechBrand",
        "price": 1299.99,
        "stock": 50,
        "unitWeight": 2.5,
        "category": "Electronics",
        "sku": "GAMING-LAPTOP-001",
        "isActive": true,
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 2. Search Products
**GET** `/api/v1/products/search`

### Purpose
Search products based on name or description.

### Query Parameters
- `q` (required): Search text
- `page` (optional): Page number
- `limit` (optional): Number of results
- `language` (optional): Required language for multilingual fields (ar, en)

### Postman Example
```
GET http://localhost:3000/api/v1/products/search?q=laptop&page=1&limit=5&language=en
```

### Expected Response
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "products": [...],
    "searchQuery": "laptop",
    "totalResults": 15
  }
}
```

---

## 3. Get Categories
**GET** `/api/v1/products/categories`

### Purpose
Retrieve all available product categories.

### Postman Example
```
GET http://localhost:3000/api/v1/products/categories
```

### Expected Response
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      "electronics",
      "clothing",
      "books",
      "home",
      "sports"
    ]
  }
}
```

---

## 4. Get Products by Category
**GET** `/api/v1/products/category/:category`

### Purpose
Retrieve products belonging to a specific category.

### Parameters
- `category` (in path): Category ID (MongoDB ObjectId)
- Other pagination and filtering parameters:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `sortBy` (optional): Sort field (default: createdAt)
  - `sortOrder` (optional): Sort direction (desc/asc, default: desc)
  - `language` (optional): Required language for multilingual fields (ar, en)

### Postman Example
```
GET http://localhost:3000/api/v1/products/category/60d5ecb74b24a1234567890a?page=1&limit=10&language=en
```

---

## 5. Get Product by ID
**GET** `/api/v1/products/:id`

### Purpose
Retrieve details of a specific product by ID.

### Parameters
- `id` (in path): Product ID (MongoDB ObjectId)
- `language` (optional): Required language for multilingual fields (ar, en)

### Postman Example
```
GET http://localhost:3000/api/v1/products/60d5ecb74b24a1234567890a?language=en
```

### Expected Response (with language=en)
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "product": {
      "_id": "60d5ecb74b24a1234567890a",
      "name": "Gaming Laptop",
      "description": "High-performance gaming laptop",
      "brand": "TechBrand",
      "price": 1299.99,
      "stock": 50,
      "unitWeight": 2.5,
      "category": "Electronics",
      "sku": "GAMING-LAPTOP-001",
      "productionDate": "2024-01-15T00:00:00.000Z",
      "expiryDate": "2025-01-15T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Administrative Operations (Require Admin Permissions)

## 6. Create New Product
**POST** `/api/v1/products`

### Purpose
Create a new product in the system (admin only).

### Required Headers
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

### Required Data (Body)
```json
{
  "name": {
    "en": "Gaming Laptop",
    "ar": "لابتوب ألعاب"
  },
  "description": {
    "en": "High-performance gaming laptop with RTX graphics",
    "ar": "لابتوب ألعاب عالي الأداء مع كرت رسومات RTX"
  },
  "price": 1299.99,
  "stock": 50,
  "category": "64a1b2c3d4e5f6789012345", // Required - Category ID (ObjectId)
  "sku": "GAMING-LAPTOP-001", // Optional - will be auto-generated if not provided
  "unitWeight": 2.5, // Optional - unit weight in kilograms
  "brand": { // Optional - brand as object
    "en": "TechBrand",
    "ar": "تك براند"
  },
  "brandAr": "تك براند", // Optional - Arabic brand (separate field)
  "productionDate": "2024-01-15T00:00:00.000Z", // Optional - production date
  "expiryDate": "2025-01-15T00:00:00.000Z" // Optional - expiry date
}
```

### Language Settings
You can add `language` parameter in query parameters to specify the required language in response:
- `language=ar`: Return texts in Arabic
- `language=en`: Return texts in English
- Without specification: Return both languages

**Example:** `POST /api/v1/products?language=en`

**Note:** `productionDate` and `expiryDate` fields are optional and useful for perishable products or products with specific expiry dates.

### Important Note about SKU
- **SKU is optional**: If you don't provide SKU, it will be auto-generated from product name and current time
- **SKU format**: Should contain only uppercase letters, numbers, hyphens (-) and underscores (_)
- **Auto-generated SKU example**: `GAMI-123456` (from "Gaming Laptop")

### Important Note about Brand
- **Brand sending methods**: Brand can be sent in two ways:
  1. **As brand object**: `{"brand": {"en": "TechBrand", "ar": "تك براند"}}`
  2. **As separate fields**: `{"brand": "TechBrand", "brandAr": "تك براند"}`
- **Priority**: If brandAr is sent, it will be used as Arabic value instead of brand.ar

### Important Note about Category
- **Category ID required**: Must use category ID (ObjectId) instead of text
- **Getting categories**: Available categories can be retrieved from `/api/v1/categories/public`
- **Category ID example**: `64a1b2c3d4e5f6789012345`

### Postman Example
```
POST http://localhost:3000/api/v1/products
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body (raw JSON):
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
  "category": "64a1b2c3d4e5f6789012345",
  "unitWeight": 2.5,
  "brand": {
    "en": "TechBrand",
    "ar": "تك براند"
  },
  "brandAr": "تك براند"
  // Note: SKU is optional and will be auto-generated
  // Note: category must be category ID (ObjectId)
  // Note: unitWeight, brand, and brandAr are optional
  // Note: brandAr can be used instead of brand.ar
}
```

### Expected Response (with language=en)
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "60d5ecb74b24a1234567890a",
      "name": "Gaming Laptop",
      "description": "High-performance gaming laptop",
      "brand": "TechBrand",
      "price": 1299.99,
      "stock": 50,
      "unitWeight": 2.5,
      "category": "Electronics",
      "sku": "GAMI-123456",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 7. Update Product
**PATCH** `/api/v1/products/:id`

### Purpose
Update existing product data (admin only).

### Required Headers
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

### Data (Body) - All Optional
```json
{
  "name": {
    "en": "Updated Gaming Laptop",
    "ar": "لابتوب ألعاب محدث"
  },
  "description": {
    "en": "Updated description",
    "ar": "وصف محدث"
  },
  "price": 1199.99,
  "stock": 45,
  "category": "64a1b2c3d4e5f6789012345",
  "unitWeight": 2.3,
  "brand": {
    "en": "Updated TechBrand",
    "ar": "تك براند محدث"
  },
  "brandAr": "تك براند محدث", // Alternative to brand.ar
  "isActive": true,
  "productionDate": "2024-02-01T00:00:00.000Z",
  "expiryDate": "2025-02-01T00:00:00.000Z"
}
```

### Language Settings in Update
You can add `language` parameter in query parameters:
- `language=ar`: Return response in Arabic
- `language=en`: Return response in English
- Without specification: Return both languages

**Example:** `PATCH /api/v1/products/:id?language=en`

**Important Notes:**
- All fields are optional in update, including `productionDate` and `expiryDate`
- `name`, `description`, and `brand` can be updated as simple strings or multilingual objects
- If `brandAr` is sent, it will be used as Arabic value for brand
- `unitWeight` can be updated or removed (by sending null)

### Postman Example
```
PATCH http://localhost:3000/api/v1/products/60d5ecb74b24a1234567890a?language=en
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body (raw JSON):
{
  "name": {
    "en": "Updated Gaming Laptop",
    "ar": "لابتوب ألعاب محدث"
  },
  "price": 1199.99,
  "stock": 45,
  "unitWeight": 2.3,
  "brandAr": "تك براند محدث"
}
```

---

## 8. Delete Product (Soft Delete)
**DELETE** `/api/v1/products/:id`

### Purpose
Soft delete a product (set isActive to false) for admin only.

### Required Headers
```
Authorization: Bearer <admin_jwt_token>
```

### Postman Example
```
DELETE http://localhost:3000/api/v1/products/60d5ecb74b24a1234567890a
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expected Response
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "product": {
      "_id": "60d5ecb74b24a1234567890a",
      "isActive": false,
      "deletedAt": "2023-01-01T12:00:00.000Z"
    }
  }
}
```

---

## 9. Update Stock
**PATCH** `/api/v1/products/:id/stock`

### Purpose
Update stock quantity for a specific product (admin only).

### Required Headers
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

### Required Data (Body)
```json
{
  "stock": 10,
  "operation": "add"  // Optional: "add", "set", or "subtract"
}
```

### Operation Types
- **"add"**: Add specified quantity to current stock
- **"subtract"**: Subtract specified quantity from current stock
- **"set"**: Set stock to specified quantity
- **Without operation**: Modify stock according to new stock sent (like "set")

### Operation Examples
```json
// Add 5 pieces to current stock
{
  "stock": 5,
  "operation": "add"
}

// Subtract 3 pieces from current stock
{
  "stock": 3,
  "operation": "subtract"
}

// Set stock to 20 pieces
{
  "stock": 20,
  "operation": "set"
}

// Modify stock to 15 pieces (without operation)
{
  "stock": 15
}
```

### Postman Example
```
PATCH http://localhost:3000/api/v1/products/60d5ecb74b24a1234567890a/stock
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body (raw JSON):
{
  "stock": 10,
  "operation": "add"
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "product": {
      "_id": "60d5ecb74b24a1234567890a",
      "stock": 60,
      "previousStock": 50
    }
  }
}
```

---

## 10. Restore Deleted Product
**POST** `/api/v1/products/:id/restore`

### Purpose
Restore a soft-deleted product (admin only).

### Required Headers
```
Authorization: Bearer <admin_jwt_token>
```

### Postman Example
```
POST http://localhost:3000/api/v1/products/60d5ecb74b24a1234567890a/restore
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expected Response
```json
{
  "success": true,
  "message": "Product restored successfully",
  "data": {
    "product": {
      "_id": "60d5ecb74b24a1234567890a",
      "isActive": true,
      "deletedAt": null
    }
  }
}
```

---

## 11. Get All Products (Admin)
**GET** `/api/v1/products/admin/all`

### Purpose
Retrieve all products including deleted and inactive ones (admin only).

### Required Headers
```
Authorization: Bearer <admin_jwt_token>
```

### Query Parameters
Same parameters as get all products API + additional parameter:
- `isActive` (optional): Filter by status (true/false/all)

### Postman Example
```
GET http://localhost:3000/api/v1/products/admin/all?page=1&limit=10&isActive=false
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 12. Product Statistics
**GET** `/api/v1/products/admin/stats`

### Purpose
Get comprehensive statistics about products (admin only).

### Required Headers
```
Authorization: Bearer <admin_jwt_token>
```

### Postman Example
```
GET http://localhost:3000/api/v1/products/admin/stats
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expected Response
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalProducts": 150,
    "activeProducts": 140,
    "inactiveProducts": 10,
    "totalValue": 125000.50,
    "lowStockProducts": 5,
    "outOfStockProducts": 2,
    "categoriesCount": {
      "electronics": 50,
      "clothing": 40,
      "books": 30,
      "home": 20,
      "sports": 10
    },
    "averagePrice": 833.34,
    "totalStock": 2500
  }
}
```

---

## 13. Get Expired Products
**GET** `/api/v1/products/admin/expired`

### Purpose
Retrieve all expired products (admin only).

### Required Headers
```
Authorization: Bearer <admin_jwt_token>
```

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `lang` (optional): Language (ar/en, default: ar)

### Postman Example
```
GET http://localhost:3000/api/v1/products/admin/expired?page=1&limit=10&lang=en
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expected Response
```json
{
  "success": true,
  "message": "Expired products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "60d5ecb74b24a1234567890a",
        "name": "Expired Product",
        "price": 50.00,
        "stock": 10,
        "productionDate": "2023-01-01T00:00:00.000Z",
        "expiryDate": "2023-12-31T23:59:59.999Z",
        "isExpired": true,
        "category": {
          "_id": "60d5ecb74b24a1234567890b",
          "name": "Food"
        },
        "createdBy": {
          "_id": "60d5ecb74b24a1234567890c",
          "name": "Ahmed Mohamed"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

## 14. Get Near Expiry Products
**GET** `/api/v1/products/admin/near-expiry`

### Purpose
Retrieve products that will expire within a specified period (admin only).

### Required Headers
```
Authorization: Bearer <admin_jwt_token>
```

### Query Parameters
- `days` (optional): Number of days to check for expiry (default: 30)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `lang` (optional): Language (ar/en, default: ar)

### Postman Example
```
GET http://localhost:3000/api/v1/products/admin/near-expiry?days=7&page=1&limit=10&lang=en
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expected Response
```json
{
  "success": true,
  "message": "Near expiry products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "60d5ecb74b24a1234567890a",
        "name": "Near Expiry Product",
        "price": 75.00,
        "stock": 5,
        "productionDate": "2024-01-01T00:00:00.000Z",
        "expiryDate": "2024-12-31T23:59:59.999Z",
        "isNearExpiry": true,
        "daysUntilExpiry": 5,
        "category": {
          "_id": "60d5ecb74b24a1234567890b",
          "name": "Medicine"
        },
        "createdBy": {
          "_id": "60d5ecb74b24a1234567890c",
          "name": "Sara Ahmed"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

## 15. Search Products by Date Range
**GET** `/api/v1/products/admin/date-range`

### Purpose
Search products within a specific date range (admin only).

### Required Headers
```
Authorization: Bearer <admin_jwt_token>
```

### Query Parameters
- `dateField` (required): Date type to search (productionDate/expiryDate/createdAt/updatedAt)
- `startDate` (required): Start date (ISO format)
- `endDate` (required): End date (ISO format)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `lang` (optional): Language (ar/en, default: ar)

### Postman Example
```
GET http://localhost:3000/api/v1/products/admin/date-range?dateField=productionDate&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10&lang=en
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expected Response
```json
{
  "success": true,
  "message": "Products within date range retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "60d5ecb74b24a1234567890a",
        "name": "Product Within Range",
        "price": 100.00,
        "stock": 20,
        "productionDate": "2024-06-15T00:00:00.000Z",
        "expiryDate": "2025-06-15T00:00:00.000Z",
        "category": {
          "_id": "60d5ecb74b24a1234567890b",
          "name": "Cosmetics"
        },
        "createdBy": {
          "_id": "60d5ecb74b24a1234567890c",
          "name": "Mohamed Ali"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "hasNext": true,
      "hasPrev": false
    },
    "searchCriteria": {
      "dateField": "productionDate",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.999Z"
    }
  }
}
```

---

## Common Error Messages

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid data",
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin permissions required to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Postman Collection Setup

### 1. Create Environment
```
Variable Name: base_url
Initial Value: http://localhost:3000/api/v1
Current Value: http://localhost:3000/api/v1

Variable Name: admin_token
Initial Value: 
Current Value: (will be set after login)
```

### 2. Global Headers
```
Content-Type: application/json
Accept-Language: en
```

### 3. Pre-request Script for Admin Operations
```javascript
// For requests requiring admin permissions
if (pm.globals.get("admin_token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.globals.get("admin_token")
    });
}
```

### 4. Test Script to Save Token
```javascript
// After admin login
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.globals.set("admin_token", response.data.token);
    }
}
```

---

## Testing Scenarios

### 1. Test General Operations
1. Get all products
2. Search for specific product
3. Get categories
4. Get products by category
5. Get product details

### 2. Test Admin Operations
1. Admin login
2. Create new product
3. Update product
4. Update stock
5. Delete product
6. Restore product
7. View statistics

### 3. Test Validation
1. Create product with incomplete data
2. Update product with negative price
3. Access admin operations without token
4. Use invalid ID

---

## Important Notes

### Security
- All admin operations are protected with JWT Token
- Admin permissions must be verified before access
- IDs must be valid MongoDB ObjectId

### Performance
- Use pagination to avoid loading large amounts of data
- Use filtering and search to improve results
- Deleted products don't appear in general operations

### Language Support
- System supports Arabic and English
- Use Header `Accept-Language: ar` for Arabic
- Use Header `Accept-Language: en` for English

### Updates
- `updatedAt` is automatically updated on any modification
- Soft delete preserves data while setting `isActive: false`
- Stock operations support add, subtract, and direct set
- Support for production and expiry dates for perishable products

---

## New Updates - Product Date Management

### Overview
Comprehensive support for managing production and expiry dates has been added, making the system suitable for perishable products like food, medicine, and cosmetics.

### New Features

#### 1. New Date Fields
- **`productionDate`** (optional): Product production date
- **`expiryDate`** (optional): Product expiry date

#### 2. Data Validation
- Production date cannot be in the future
- Expiry date must be after production date
- Dates are automatically converted to Date objects

#### 3. New Virtual Properties
- **`isExpired`**: Checks if product has expired
- **`isNearExpiry`**: Checks if product is near expiry (within 30 days)

#### 4. Enhanced Indexes
- Index on `productionDate` for improved search
- Index on `expiryDate` for improved search
- Compound index on `productionDate` and `expiryDate` for range queries

#### 5. New Management APIs
- **Expired products**: `/api/v1/products/admin/expired`
- **Near expiry products**: `/api/v1/products/admin/near-expiry`
- **Date range search**: `/api/v1/products/admin/date-range`

#### 6. New Model Methods
- `findExpiredProducts()`: Find expired products
- `findNearExpiryProducts(days)`: Find near expiry products
- `findByDateRange(dateField, startDate, endDate)`: Search within date range

### Usage Examples

#### Create Product with Dates
```json
{
  "name": {
    "ar": "حليب طازج",
    "en": "Fresh Milk"
  },
  "price": 15.50,
  "stock": 100,
  "category": "64a1b2c3d4e5f6789012345",
  "productionDate": "2024-01-15T00:00:00.000Z",
  "expiryDate": "2024-02-15T00:00:00.000Z"
}
```

#### Search for Expired Products
```
GET /api/v1/products/admin/expired?page=1&limit=20
```

#### Search for Near Expiry Products (within 7 days)
```
GET /api/v1/products/admin/near-expiry?days=7&page=1&limit=20
```

#### Search in Date Range
```
GET /api/v1/products/admin/date-range?dateField=productionDate&startDate=2024-01-01&endDate=2024-12-31
```

### Update Benefits
1. **Better inventory management**: Track near expiry products
2. **Reduce waste**: Identify products needing quick sale
3. **Regulatory compliance**: Track production and expiry dates
4. **Performance improvement**: Enhanced indexes for fast search
5. **Usage flexibility**: Optional fields don't affect existing products

### Important Notes
- All date fields are optional and don't affect existing products
- System is backward compatible
- New APIs are available for admins only
- Dates are returned in ISO 8601 format
- Full pagination support in all new APIs

---

## Latest Updates

### 1. Separate Arabic Brand Support (brandAr Support)

#### New Features:
- **Separate `brandAr` field**: Arabic brand can now be sent as separate field
- **Sending flexibility**: Two ways to send brand:
  1. **As object**: `{"brand": {"en": "TechBrand", "ar": "تك براند"}}`
  2. **As separate fields**: `{"brand": "TechBrand", "brandAr": "تك براند"}`
- **Priority for brandAr**: If `brandAr` is sent, it will be used instead of `brand.ar`

#### API Updates:
- **Create product**: Support `brandAr` in `POST /api/v1/products`
- **Update product**: Support `brandAr` in `PATCH /api/v1/products/:id`
- **Data validation**: Added validation rules for `brandAr` (max 50 characters)

### 2. Comprehensive Language Settings

#### New Features:
- **Language support in all GET APIs**: All APIs returning product data now support `language` parameter
- **Supported fields**: `name`, `description`, `brand`, `category`
- **Language options**:
  - `language=ar`: Return texts in Arabic only
  - `language=en`: Return texts in English only
  - Without specification: Return both languages as object

#### Updated APIs with Language Support:
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `GET /api/v1/products/search` - Search products
- `GET /api/v1/products/category/:category` - Products by category
- `GET /api/v1/products/admin/date-range` - Date range search
- `POST /api/v1/products` - Create product (for response)
- `PATCH /api/v1/products/:id` - Update product (for response)

### 3. New Usage Examples

#### Create Product with brandAr:
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
  "category": "64a1b2c3d4e5f6789012345",
  "brand": "TechBrand",
  "brandAr": "تك براند",
  "unitWeight": 2.5
}
```

#### Using Language Settings:
```
# Get products in Arabic
GET /api/v1/products?language=ar

# Search in English
GET /api/v1/products/search?q=laptop&language=en

# Update product with Arabic response
PATCH /api/v1/products/:id?language=ar
```

### 4. Benefits of New Updates

1. **Greater flexibility**: Multiple ways to send brand
2. **Improved user experience**: Responses in required language
3. **Backward compatibility**: Updates don't break existing code
4. **Enhanced performance**: Returning data in required language only reduces response size
5. **Easier development**: Clearer and more flexible APIs

### 5. Compatibility Notes

- **Backward compatibility**: All updates are compatible with existing code
- **Optional fields**: `brandAr` and `language` are optional
- **Default behavior**: Without language specification, both languages are returned
- **Priority**: `brandAr` has priority over `brand.ar` when both exist
- System is compatible with previous versions
- New APIs are available for admins only
- Dates are returned in ISO 8601 format
- Full pagination support in all new APIs