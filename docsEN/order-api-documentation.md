# Order API Documentation

## Overview
The Order API provides a comprehensive set of endpoints for managing orders in the e-commerce system. The system supports order creation, order tracking, order status management, and order statistics.

## Base URL
```
http://localhost:3000/api/v1/orders
```

## Authentication
All endpoints require authentication using JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

## Order Status Flow
```
pending → confirmed → processing → shipped → delivered
                   ↘ cancelled (from pending/confirmed only)
```

### Available Order Statuses:
- **pending**: Order created and waiting for confirmation
- **confirmed**: Order confirmed and ready for processing
- **processing**: Order being prepared
- **shipped**: Order shipped to customer
- **delivered**: Order successfully delivered
- **cancelled**: Order cancelled (stock restored)

---

## User Endpoints

### 1. Create New Order
**POST** `/api/v1/orders`

#### Description
Create a new order with multiple items and shipping address.

#### Headers
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

#### Request Body
```json
{
  "items": [
    {
      "product": "60d5ecb74b24a1234567890a",
      "quantity": 2
    },
    {
      "product": "60d5ecb74b24a1234567890b",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 King Fahd Street",
    "city": "Riyadh",
    "state": "Riyadh",
    "zipCode": "12345",
    "country": "Saudi Arabia"
  },
  "paymentMethod": "credit_card",
  "notes": "Please deliver during business hours"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "60d5ecb74b24a1234567890c",
    "user": "60d5ecb74b24a1234567890d",
    "items": [
      {
        "product": {
          "_id": "60d5ecb74b24a1234567890a",
          "name": "Sample Product",
          "price": 100
        },
        "quantity": 2,
        "price": 100,
        "total": 200
      }
    ],
    "totalAmount": 250,
    "status": "pending",
    "shippingAddress": {
      "street": "123 King Fahd Street",
      "city": "Riyadh",
      "state": "Riyadh",
      "zipCode": "12345",
      "country": "Saudi Arabia"
    },
    "paymentMethod": "credit_card",
    "notes": "Please deliver during business hours",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

#### Postman Setup
1. Method: **POST**
2. URL: `http://localhost:3000/api/v1/orders`
3. Headers:
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer YOUR_JWT_TOKEN`
4. Body: Raw JSON (copy the request body above)

---

### 2. Get User Orders
**GET** `/api/v1/orders`

#### Description
Get all orders for the current user with filtering and pagination options.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by order status
- `sortBy` (optional): Sort by field (default: createdAt)
- `sortOrder` (optional): Sort direction (asc/desc, default: desc)

#### Headers
```
Authorization: Bearer <your_jwt_token>
```

#### Example Request
```
GET /api/v1/orders?page=1&limit=10&status=pending&sortBy=createdAt&sortOrder=desc
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "60d5ecb74b24a1234567890c",
        "items": [...],
        "totalAmount": 250,
        "status": "pending",
        "createdAt": "2023-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalOrders": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Postman Setup
1. Method: **GET**
2. URL: `http://localhost:3000/api/v1/orders`
3. Headers:
   - `Authorization`: `Bearer YOUR_JWT_TOKEN`
4. Params (Query Parameters):
   - `page`: `1`
   - `limit`: `10`
   - `status`: `pending`
   - `sortBy`: `createdAt`
   - `sortOrder`: `desc`

---

### 3. Get Specific Order
**GET** `/api/v1/orders/:id`

#### Description
Get details of a specific order (owner or admin only).

#### Headers
```
Authorization: Bearer <your_jwt_token>
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "_id": "60d5ecb74b24a1234567890c",
    "user": {
      "_id": "60d5ecb74b24a1234567890d",
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com"
    },
    "items": [
      {
        "product": {
          "_id": "60d5ecb74b24a1234567890a",
          "name": "Sample Product",
          "price": 100,
          "image": "product-image.jpg"
        },
        "quantity": 2,
        "price": 100,
        "total": 200
      }
    ],
    "totalAmount": 250,
    "status": "pending",
    "shippingAddress": {
      "street": "123 King Fahd Street",
      "city": "Riyadh",
      "state": "Riyadh",
      "zipCode": "12345",
      "country": "Saudi Arabia"
    },
    "paymentMethod": "credit_card",
    "notes": "Please deliver during business hours",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

#### Postman Setup
1. Method: **GET**
2. URL: `http://localhost:3000/api/v1/orders/60d5ecb74b24a1234567890c`
3. Headers:
   - `Authorization`: `Bearer YOUR_JWT_TOKEN`

---

### 4. Cancel Order
**POST** `/api/v1/orders/:id/cancel`

#### Description
Cancel a specific order (owner or admin only). Stock is automatically restored.

#### Headers
```
Authorization: Bearer <your_jwt_token>
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "_id": "60d5ecb74b24a1234567890c",
    "status": "cancelled",
    "cancelledAt": "2023-12-01T11:00:00.000Z",
    "stockRestored": true
  }
}
```

#### Postman Setup
1. Method: **POST**
2. URL: `http://localhost:3000/api/v1/orders/60d5ecb74b24a1234567890c/cancel`
3. Headers:
   - `Authorization`: `Bearer YOUR_JWT_TOKEN`

---

## Admin Endpoints

### 5. Get All Orders (Admin)
**GET** `/api/v1/orders/admin/all`

#### Description
Get all orders in the system (admin only) with advanced filtering options.

#### Query Parameters
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by order status
- `userId` (optional): Filter by user ID
- `sortBy` (optional): Sort by field
- `sortOrder` (optional): Sort direction

#### Headers
```
Authorization: Bearer <admin_jwt_token>
```

#### Example Request
```
GET /api/v1/orders/admin/all?page=1&limit=20&status=confirmed&userId=60d5ecb74b24a1234567890d
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "All orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "60d5ecb74b24a1234567890c",
        "user": {
          "_id": "60d5ecb74b24a1234567890d",
          "name": "Ahmed Mohamed",
          "email": "ahmed@example.com"
        },
        "totalAmount": 250,
        "status": "confirmed",
        "createdAt": "2023-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalOrders": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Postman Setup
1. Method: **GET**
2. URL: `http://localhost:3000/api/v1/orders/admin/all`
3. Headers:
   - `Authorization`: `Bearer ADMIN_JWT_TOKEN`
4. Params:
   - `page`: `1`
   - `limit`: `20`
   - `status`: `confirmed`
   - `userId`: `60d5ecb74b24a1234567890d`

---

### 6. Update Order Status (Admin)
**PATCH** `/api/v1/orders/:id/status`

#### Description
Update status of a specific order (admin only).

#### Headers
```
Content-Type: application/json
Authorization: Bearer <admin_jwt_token>
```

#### Request Body
```json
{
  "status": "shipped"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "60d5ecb74b24a1234567890c",
    "status": "shipped",
    "previousStatus": "processing",
    "updatedAt": "2023-12-01T12:00:00.000Z",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2023-12-01T10:00:00.000Z"
      },
      {
        "status": "confirmed",
        "timestamp": "2023-12-01T10:30:00.000Z"
      },
      {
        "status": "processing",
        "timestamp": "2023-12-01T11:00:00.000Z"
      },
      {
        "status": "shipped",
        "timestamp": "2023-12-01T12:00:00.000Z"
      }
    ]
  }
}
```

#### Postman Setup
1. Method: **PATCH**
2. URL: `http://localhost:3000/api/v1/orders/60d5ecb74b24a1234567890c/status`
3. Headers:
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer ADMIN_JWT_TOKEN`
4. Body: Raw JSON
   ```json
   {
     "status": "shipped"
   }
   ```

---

### 7. Order Statistics (Admin)
**GET** `/api/v1/orders/admin/stats`

#### Description
Get comprehensive order and revenue statistics (admin only).

#### Headers
```
Authorization: Bearer <admin_jwt_token>
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalOrders": 1250,
    "totalRevenue": 125000,
    "averageOrderValue": 100,
    "ordersByStatus": {
      "pending": 45,
      "confirmed": 120,
      "processing": 80,
      "shipped": 200,
      "delivered": 750,
      "cancelled": 55
    },
    "monthlyStats": {
      "currentMonth": {
        "orders": 150,
        "revenue": 15000,
        "growth": "+12%"
      },
      "previousMonth": {
        "orders": 134,
        "revenue": 13400
      }
    },
    "topProducts": [
      {
        "productId": "60d5ecb74b24a1234567890a",
        "productName": "Popular Product",
        "totalOrdered": 500,
        "revenue": 25000
      }
    ],
    "recentOrders": [
      {
        "_id": "60d5ecb74b24a1234567890c",
        "user": "Ahmed Mohamed",
        "totalAmount": 250,
        "status": "pending",
        "createdAt": "2023-12-01T10:00:00.000Z"
      }
    ]
  }
}
```

#### Postman Setup
1. Method: **GET**
2. URL: `http://localhost:3000/api/v1/orders/admin/stats`
3. Headers:
   - `Authorization`: `Bearer ADMIN_JWT_TOKEN`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid data",
  "errors": [
    {
      "field": "items",
      "message": "Must contain at least one item"
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
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Order not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## Postman Collection Setup

### 1. Create Environment
1. In Postman, go to **Environments**
2. Click **Create Environment**
3. Add the following variables:
   - `base_url`: `http://localhost:3000/api/v1`
   - `jwt_token`: `your_jwt_token_here`
   - `admin_token`: `admin_jwt_token_here`

### 2. Setup Authorization
For each request:
1. Go to **Authorization** tab
2. Select **Bearer Token**
3. In Token field, enter: `{{jwt_token}}` or `{{admin_token}}`

### 3. Setup Headers
For requests that need JSON body:
1. Go to **Headers** tab
2. Add: `Content-Type`: `application/json`

### 4. Test Workflow
To test complete workflow:
1. **Create Order** → POST `/orders`
2. **View Orders** → GET `/orders`
3. **View Specific Order** → GET `/orders/:id`
4. **Update Order Status (Admin)** → PATCH `/orders/:id/status`
5. **Cancel Order** → POST `/orders/:id/cancel`

---

## Important Notes

### 1. Authentication
- All endpoints require valid JWT token
- Admin endpoints require token for user with admin privileges
- Token must be included in Authorization header

### 2. Validation
- All input data is validated
- Product IDs must be valid ObjectIds
- Quantities must be positive numbers
- Shipping address is required for all orders

### 3. Stock Management
- When creating order, quantity is deducted from stock
- When cancelling order, quantity is returned to stock
- Cannot order quantity greater than available stock

### 4. Order Status Rules
- Orders can only be cancelled in pending or confirmed status
- Status updates follow the defined sequence
- Only admin can update order statuses

### 5. Performance
- Use pagination for better results
- Use filters to reduce retrieved data
- Cache JWT tokens to avoid re-login

---

## Advanced Examples

### Create Order with Multiple Products
```json
{
  "items": [
    {
      "product": "60d5ecb74b24a1234567890a",
      "quantity": 2
    },
    {
      "product": "60d5ecb74b24a1234567890b",
      "quantity": 1
    },
    {
      "product": "60d5ecb74b24a1234567890c",
      "quantity": 3
    }
  ],
  "shippingAddress": {
    "street": "456 Al-Olaya Street",
    "city": "Jeddah",
    "state": "Makkah",
    "zipCode": "23456",
    "country": "Saudi Arabia"
  },
  "paymentMethod": "cash_on_delivery",
  "notes": "Urgent order - please deliver same day"
}
```

### Search Orders with Multiple Filters
```
GET /api/v1/orders/admin/all?page=2&limit=15&status=shipped&sortBy=totalAmount&sortOrder=desc&userId=60d5ecb74b24a1234567890d
```

This documentation covers all aspects of the Order API with detailed examples for using Postman. Make sure to update JWT tokens and Object IDs according to your development environment.