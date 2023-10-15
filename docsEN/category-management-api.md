# Category Management API Documentation

## Overview

This system provides a comprehensive set of APIs for managing product categories, including both public and administrative operations.

## API List

### Public Operations
1. **GET /api/v1/categories/public** - View active categories
2. **GET /api/v1/categories/public/:id** - View specific category
3. **GET /api/v1/categories/public/stats** - Category statistics

### Protected Operations
4. **GET /api/v1/categories** - View all categories (admin)
5. **GET /api/v1/categories/:id** - View specific category

### Administrative Operations
6. **POST /api/v1/categories** - Create new category
7. **PUT /api/v1/categories/:id** - Update category
8. **DELETE /api/v1/categories/:id** - Delete category
9. **PATCH /api/v1/categories/:id/restore** - Restore category
10. **GET /api/v1/categories/admin/statistics** - Detailed statistics
11. **PATCH /api/v1/categories/admin/sort-order** - Update sort order

---

## API Details

### 1. View Active Categories
**GET /api/v1/categories/public**

**Purpose:** Display a list of active categories with search and filtering capabilities

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in name or description
- `sortBy` (optional): Sort by field (default: sortOrder)
- `sortOrder` (optional): Sort direction (asc/desc)

**Postman Example:**
```
GET {{base_url}}/api/v1/categories/public?page=1&limit=10&search=electronics
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Category retrieved successfully.",
  "data": {
    "categories": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "Electronics",
        "nameAr": "إلكترونيات",
        "description": "Electronic devices and gadgets",
        "descriptionAr": "الأجهزة الإلكترونية والأدوات",
        "slug": "electronics",
        "isActive": true,
        "sortOrder": 1,
        "createdAt": "2023-07-01T10:00:00.000Z",
        "updatedAt": "2023-07-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCategories": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. View Specific Category
**GET /api/v1/categories/public/:id**

**Purpose:** Display details of a specific category with product count

**Postman Example:**
```
GET {{base_url}}/api/v1/categories/public/64a1b2c3d4e5f6789012345
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Category retrieved successfully.",
  "data": {
    "category": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Electronics",
      "nameAr": "إلكترونيات",
      "description": "Electronic devices and gadgets",
      "descriptionAr": "الأجهزة الإلكترونية والأدوات",
      "slug": "electronics",
      "isActive": true,
      "sortOrder": 1,
      "productCount": 25,
      "createdAt": "2023-07-01T10:00:00.000Z",
      "updatedAt": "2023-07-01T10:00:00.000Z"
    }
  }
}
```

### 3. Create New Category
**POST /api/v1/categories**

**Purpose:** Create a new category (requires admin privileges)

**Required Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
Accept-Language: en (or ar)
```

**Required Data:**
```json
{
  "name": "Electronics",
  "nameAr": "إلكترونيات",
  "description": "Electronic devices and gadgets",
  "descriptionAr": "الأجهزة الإلكترونية والأدوات",
  "sortOrder": 1
}
```

**Postman Example:**
```
POST {{base_url}}/api/v1/categories
Headers:
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json
  Accept-Language: en

Body (JSON):
{
  "name": "Electronics",
  "nameAr": "إلكترونيات",
  "description": "Electronic devices and gadgets",
  "descriptionAr": "الأجهزة الإلكترونية والأدوات",
  "sortOrder": 1
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Category created successfully.",
  "data": {
    "category": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Electronics",
      "nameAr": "إلكترونيات",
      "description": "Electronic devices and gadgets",
      "descriptionAr": "الأجهزة الإلكترونية والأدوات",
      "slug": "electronics",
      "isActive": true,
      "sortOrder": 1,
      "createdBy": {
        "_id": "64a1b2c3d4e5f6789012346",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2023-07-01T10:00:00.000Z",
      "updatedAt": "2023-07-01T10:00:00.000Z"
    }
  }
}
```

### 4. Update Category
**PUT /api/v1/categories/:id**

**Purpose:** Update existing category data

**Required Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Required Data:**
```json
{
  "name": "Updated Electronics",
  "nameAr": "إلكترونيات محدثة",
  "description": "Updated description",
  "descriptionAr": "وصف محدث",
  "sortOrder": 2,
  "isActive": true
}
```

**Postman Example:**
```
PUT {{base_url}}/api/v1/categories/64a1b2c3d4e5f6789012345
Headers:
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json

Body (JSON):
{
  "name": "Updated Electronics",
  "nameAr": "إلكترونيات محدثة",
  "description": "Updated description",
  "descriptionAr": "وصف محدث",
  "sortOrder": 2,
  "isActive": true
}
```

### 5. Delete Category
**DELETE /api/v1/categories/:id**

**Purpose:** Delete category (soft delete - disable category)

**Required Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Postman Example:**
```
DELETE {{base_url}}/api/v1/categories/64a1b2c3d4e5f6789012345
Headers:
  Authorization: Bearer {{admin_token}}
```

**Important Note:** Cannot delete a category that contains active products

### 6. Restore Category
**PATCH /api/v1/categories/:id/restore**

**Purpose:** Restore deleted category (activate category)

**Required Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Postman Example:**
```
PATCH {{base_url}}/api/v1/categories/64a1b2c3d4e5f6789012345/restore
Headers:
  Authorization: Bearer {{admin_token}}
```

### 7. Detailed Category Statistics
**GET /api/v1/categories/admin/statistics**

**Purpose:** Get detailed statistics about categories

**Required Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Postman Example:**
```
GET {{base_url}}/api/v1/categories/admin/statistics
Headers:
  Authorization: Bearer {{admin_token}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Category statistics retrieved successfully.",
  "data": {
    "totalCategories": 50,
    "activeCategories": 45,
    "inactiveCategories": 5,
    "topCategories": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "Electronics",
        "nameAr": "إلكترونيات",
        "productCount": 25
      }
    ],
    "emptyCategories": 3,
    "emptyCategoriesList": [
      {
        "_id": "64a1b2c3d4e5f6789012346",
        "name": "Empty Category",
        "nameAr": "فئة فارغة"
      }
    ]
  }
}
```

### 8. Update Categories Sort Order
**PATCH /api/v1/categories/admin/sort-order**

**Purpose:** Update category display order

**Required Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Required Data:**
```json
{
  "categories": [
    {
      "id": "64a1b2c3d4e5f6789012345",
      "sortOrder": 1
    },
    {
      "id": "64a1b2c3d4e5f6789012346",
      "sortOrder": 2
    }
  ]
}
```

**Postman Example:**
```
PATCH {{base_url}}/api/v1/categories/admin/sort-order
Headers:
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json

Body (JSON):
{
  "categories": [
    {
      "id": "64a1b2c3d4e5f6789012345",
      "sortOrder": 1
    },
    {
      "id": "64a1b2c3d4e5f6789012346",
      "sortOrder": 2
    }
  ]
}
```

---

## Common Error Messages

### Authentication Errors
- `401`: "Access token is required" - Token required
- `401`: "Invalid access token" - Invalid token
- `403`: "Admin access required" - Admin privileges required

### Validation Errors
- `400`: "Category name is required" - Category name required
- `400`: "Category name must be between 2 and 50 characters" - Name length
- `400`: "Invalid category ID" - Invalid category ID

### Operation Errors
- `404`: "Category not found" - Category not found
- `400`: "Category with this name already exists" - Category already exists
- `400`: "Cannot delete category that has active products" - Cannot delete category with products
- `400`: "Category is already active" - Category already active

---

## Postman Collection Setup

### 1. Environment Variables
```json
{
  "base_url": "http://localhost:3000",
  "admin_token": "your_admin_jwt_token_here",
  "user_token": "your_user_jwt_token_here"
}
```

### 2. Global Headers
```json
{
  "Content-Type": "application/json",
  "Accept-Language": "en"
}
```

### 3. Pre-request Script for Token Management
```javascript
// For requests requiring admin privileges
if (pm.request.url.path.includes('admin') || 
    pm.request.method === 'POST' || 
    pm.request.method === 'PUT' || 
    pm.request.method === 'DELETE' || 
    pm.request.method === 'PATCH') {
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + pm.environment.get('admin_token')
    });
}
```

### 4. Test Script to Save Response Data
```javascript
// Save created category ID
if (pm.response.code === 201 && pm.response.json().data.category) {
    pm.environment.set('category_id', pm.response.json().data.category._id);
}

// Verify operation success
pm.test('Status code is success', function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test('Response has success field', function () {
    pm.expect(pm.response.json()).to.have.property('success', true);
});
```

---

## Test Scenarios

### 1. Create and Manage New Category
1. Create new category - `POST /api/v1/categories`
2. View created category - `GET /api/v1/categories/:id`
3. Update category - `PUT /api/v1/categories/:id`
4. View updated category - `GET /api/v1/categories/:id`

### 2. Category Status Management
1. Delete category - `DELETE /api/v1/categories/:id`
2. Verify it doesn't appear in public list - `GET /api/v1/categories/public`
3. Restore category - `PATCH /api/v1/categories/:id/restore`
4. Verify it appears again - `GET /api/v1/categories/public`

### 3. Category Ordering Management
1. Create multiple categories with different orders
2. View categories and verify order - `GET /api/v1/categories/public`
3. Update category order - `PATCH /api/v1/categories/admin/sort-order`
4. Verify new order - `GET /api/v1/categories/public`

### 4. Statistics Testing
1. Create various categories
2. Create products in some categories
3. View statistics - `GET /api/v1/categories/admin/statistics`
4. Verify accuracy of numbers

---

## Important Notes

### Security
- All administrative operations require valid JWT token with admin privileges
- All input data is validated
- Soft delete maintains data integrity

### Performance
- MongoDB indexing for fast search
- Optimized queries for best performance
- Pagination support to reduce memory usage

### Language Support
- Full support for Arabic and English
- Error and success messages available in both languages
- Search capability in both languages

### Updates
- Slug automatically generated from category name
- Duplicate name checking
- Creation and update timestamp tracking
- Category linked to creator

### Product Integration
- Product model updated to link to categories via ObjectId
- Category existence verification when creating new product
- Prevention of deleting categories with active products
- Product count statistics for each category