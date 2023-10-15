# Authentication and Authorization APIs Guide

## Overview
This system provides a comprehensive set of APIs for authentication and authorization, including registration, login, logout, and password management.

## Available APIs List

### 1. Register New User
**POST** `/api/v1/auth/register`

#### Required Data:
```json
{
  "name": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "password": "Password123!"
}
```

#### Postman Example:
```
POST http://localhost:3000/api/v1/auth/register

Headers:
Content-Type: application/json
Accept-Language: en

Body (raw JSON):
{
  "name": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "password": "Password123!"
}
```

#### Response:
```json
{
  "status": "success",
  "message": "Registration successful. Please check your email for verification code.",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "role": "user",
      "isVerified": false
    }
  }
}
```

### 2. Email Verification
**POST** `/api/v1/auth/verify-email`

#### Required Data:
```json
{
  "email": "ahmed@example.com",
  "otp": "123456"
}
```

#### Postman Example:
```
POST http://localhost:3000/api/v1/auth/verify-email

Headers:
Content-Type: application/json
Accept-Language: en

Body (raw JSON):
{
  "email": "ahmed@example.com",
  "otp": "123456"
}
```

### 3. Login
**POST** `/api/v1/auth/login`

#### Required Data:
```json
{
  "email": "ahmed@example.com",
  "password": "Password123!"
}
```

#### Postman Example:
```
POST http://localhost:3000/api/v1/auth/login

Headers:
Content-Type: application/json
Accept-Language: en

Body (raw JSON):
{
  "email": "ahmed@example.com",
  "password": "Password123!"
}
```

#### Response:
```json
{
  "status": "success",
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "role": "user",
      "isVerified": true
    }
  }
}
```

### 4. Logout 🔐
**POST** `/api/v1/auth/logout`

#### Requirements:
- User must be logged in
- Send JWT token in Authorization header

#### Postman Example:
```
POST http://localhost:3000/api/v1/auth/logout

Headers:
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
Accept-Language: en

Body: (empty - no data needed)
```

#### Response:
```json
{
  "status": "success",
  "message": "Logout successful."
}
```

#### Important Notes about Logout:
- In JWT systems, logout is primarily handled client-side
- The application should delete the token from local storage
- This API provides confirmation of the operation only
- For additional security, a token blacklist can be implemented

### 5. View Profile
**GET** `/api/v1/auth/profile`

#### Postman Example:
```
GET http://localhost:3000/api/v1/auth/profile

Headers:
Authorization: Bearer YOUR_JWT_TOKEN
Accept-Language: en
```

### 6. Update Profile
**PATCH** `/api/v1/auth/profile`

#### Required Data:
```json
{
  "name": "Ahmed Mohamed Updated"
}
```

### 7. Change Password
**POST** `/api/v1/auth/change-password`

#### Required Data:
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

### 8. Forgot Password
**POST** `/api/v1/auth/forgot-password`

#### Required Data:
```json
{
  "email": "ahmed@example.com"
}
```

### 9. Reset Password
**POST** `/api/v1/auth/reset-password`

#### Required Data:
```json
{
  "email": "ahmed@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123!"
}
```

### 10. Resend Verification Code
**POST** `/api/v1/auth/resend-verification`

#### Required Data:
```json
{
  "email": "ahmed@example.com"
}
```

### 11. Verify Token
**GET** `/api/v1/auth/verify-token`

#### Postman Example:
```
GET http://localhost:3000/api/v1/auth/verify-token

Headers:
Authorization: Bearer YOUR_JWT_TOKEN
Accept-Language: en
```

## Postman Collection Setup

### 1. Create Environment
Create a new environment in Postman with the following variables:
```
baseUrl: http://localhost:3000
token: (will be set automatically after login)
language: en
```

### 2. Setup Global Headers
Add these headers for all requests:
```
Content-Type: application/json
Accept-Language: {{language}}
```

### 3. Pre-request Script for Login
Add this code in Pre-request Script for protected requests:
```javascript
// For requests that need authentication
if (pm.request.url.path.includes('profile') || 
    pm.request.url.path.includes('logout') || 
    pm.request.url.path.includes('change-password')) {
    
    const token = pm.environment.get('token');
    if (token) {
        pm.request.headers.add({
            key: 'Authorization',
            value: 'Bearer ' + token
        });
    }
}
```

### 4. Test Script to Save Token
Add this code in Test Script for login request:
```javascript
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    if (responseJson.data && responseJson.data.token) {
        pm.environment.set('token', responseJson.data.token);
        console.log('Token saved:', responseJson.data.token);
    }
}
```

## Common Error Messages

### Authentication Errors:
- `"Access token required"` - Token not sent
- `"Invalid access token"` - Token is invalid or expired
- `"Invalid email or password"` - Incorrect login credentials

### Verification Errors:
- `"Invalid or expired verification code"` - Incorrect OTP
- `"Please verify your email before logging in"` - Account not activated

## Important Notes

### Security:
- All passwords are encrypted using bcrypt
- JWT tokens expire after 30 days
- Rate limiting is implemented to prevent attacks
- Comprehensive data validation is in place

### Languages:
- The system supports Arabic and English
- Use `Accept-Language: ar` for Arabic
- Use `Accept-Language: en` for English

### Secure Logout:
1. Call the logout API
2. Delete the token from local storage
3. Redirect user to login page
4. Clear any saved user data

## Testing Scenarios

### 1. Complete New User Flow:
1. Register new user
2. Verify email
3. Login
4. View profile
5. Update profile
6. Change password
7. Logout

### 2. Forgot Password Test:
1. Request password reset
2. Receive OTP
3. Reset password
4. Login with new password

### 3. Security Testing:
1. Try accessing profile without token
2. Try using expired token
3. Try logging in with unverified account

This system provides secure and comprehensive authentication for e-commerce applications with full support for both Arabic and English languages.