# User Management APIs Guide

## Overview
This system provides a comprehensive set of APIs for managing users, roles, and permissions. All these APIs require admin login and permissions.

## Basic Requirements
- Login as admin (role: "admin")
- Send JWT token in Authorization header
- Content-Type: application/json

## Available Roles
- `user`: Regular user
- `admin`: System administrator

## API List

### 1. Get All Users
**GET** `/api/v1/users`

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search in name or email
- `role`: Filter by role (user/admin)
- `isActive`: Filter by status (true/false)
- `sortBy`: Sort by (name, email, createdAt, role)
- `sortOrder`: Sort direction (asc/desc)

#### Postman Example:
```
GET http://localhost:3000/api/v1/users?page=1&limit=10&search=john&role=user&isActive=true&sortBy=createdAt&sortOrder=desc

Headers:
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
Accept-Language: en
```

#### Response:
```json
{
  "status": "success",
  "message": "Users retrieved successfully.",
  "data": {
    "users": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "Ahmed Mohamed",
        "email": "ahmed@example.com",
        "role": "user",
        "isActive": true,
        "isVerified": true,
        "createdAt": "2023-07-01T10:30:00.000Z",
        "updatedAt": "2023-07-01T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Get Specific User
**GET** `/api/v1/users/:id`

#### Postman Example:
```
GET http://localhost:3000/api/v1/users/64a1b2c3d4e5f6789012345

Headers:
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
Accept-Language: en
```

#### Response:
```json
{
  "status": "success",
  "message": "User retrieved successfully.",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "role": "user",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2023-07-01T10:30:00.000Z",
      "updatedAt": "2023-07-01T10:30:00.000Z"
    }
  }
}
```

### 3. Change User Role
**PUT** `/api/v1/users/:id/role`

#### Postman Example:
```
PUT http://localhost:3000/api/v1/users/64a1b2c3d4e5f6789012345/role

Headers:
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
Accept-Language: en

Body (JSON):
{
  "role": "admin"
}
```

#### Response:
```json
{
  "status": "success",
  "message": "User role updated successfully.",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "role": "admin",
      "isActive": true,
      "isVerified": true,
      "updatedAt": "2023-07-01T11:30:00.000Z"
    }
  }
}
```

### 4. Activate/Deactivate User
**PUT** `/api/v1/users/:id/status`

#### Postman Example (Deactivation):
```
PUT http://localhost:3000/api/v1/users/64a1b2c3d4e5f6789012345/status

Headers:
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
Accept-Language: en

Body (JSON):
{
  "isActive": false
}
```

#### Response:
```json
{
  "status": "success",
  "message": "User deactivated successfully.",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "role": "user",
      "isActive": false,
      "isVerified": true,
      "updatedAt": "2023-07-01T12:30:00.000Z"
    }
  }
}
```

### 5. Delete User (Soft Delete)
**DELETE** `/api/v1/users/:id`

#### Postman Example:
```
DELETE http://localhost:3000/api/v1/users/64a1b2c3d4e5f6789012345

Headers:
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
Accept-Language: en
```

#### Response:
```json
{
  "status": "success",
  "message": "User deleted successfully.",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "role": "user",
      "isActive": false,
      "deletedAt": "2023-07-01T13:30:00.000Z"
    }
  }
}
```

### 6. User Statistics
**GET** `/api/v1/users/statistics`

#### Postman Example:
```
GET http://localhost:3000/api/v1/users/statistics

Headers:
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
Accept-Language: en
```

#### Response:
```json
{
  "status": "success",
  "message": "User statistics retrieved successfully.",
  "data": {
    "statistics": {
      "totalUsers": 150,
      "activeUsers": 120,
      "inactiveUsers": 20,
      "deletedUsers": 10,
      "adminUsers": 5,
      "regularUsers": 145,
      "verifiedUsers": 140,
      "unverifiedUsers": 10
    }
  }
}
```

## Common Error Messages

### 401 - Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized access."
}
```

### 403 - Forbidden
```json
{
  "status": "error",
  "message": "Access forbidden."
}
```

### 404 - Not Found
```json
{
  "status": "error",
  "message": "User not found."
}
```

### 400 - Bad Request
```json
{
  "status": "error",
  "message": "You cannot change your own role.",
  "errors": [
    {
      "field": "role",
      "message": "Role must be 'user' or 'admin'."
    }
  ]
}
```

## Important Notes

### Self-Protection
- Admin cannot change their own role
- Admin cannot change their own activation status
- Admin cannot delete their own account

### Soft Delete
- Deleted users are not actually removed from the database
- `deletedAt` is set with deletion date
- `isActive` is set to `false`

### Search and Filtering
- Search works on name and email
- Multiple filters can be combined
- Sorting is available for all basic fields

## Postman Collection Setup

### 1. Create Environment
```
Variable Name: base_url
Initial Value: http://localhost:3000
Current Value: http://localhost:3000

Variable Name: auth_token
Initial Value: 
Current Value: YOUR_JWT_TOKEN_HERE
```

### 2. Global Headers Setup
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
Accept-Language: en
```

### 3. Pre-request Script to Get Token
```javascript
// If you don't have a token, login first
if (!pm.environment.get("auth_token")) {
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/api/v1/auth/login",
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: "admin@example.com",
                password: "your_admin_password"
            })
        }
    }, function (err, response) {
        if (response.json().data && response.json().data.token) {
            pm.environment.set("auth_token", response.json().data.token);
        }
    });
}
```

## Testing APIs

### 1. Login as Admin
```
POST {{base_url}}/api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

### 2. Copy Token from Response
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Use Token in All Requests
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Test All APIs in Order
1. View statistics
2. View all users
3. View specific user
4. Change user role
5. Activate/deactivate user
6. Delete user

This guide provides everything you need to effectively use the User Management APIs!