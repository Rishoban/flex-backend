# Authentication System

## Overview
All API endpoints (except `/auth/login`) now require JWT token authentication. Users must login first to get a token, then include it in the Authorization header for all subsequent requests.

## Authentication Flow

### 1. Login (No Auth Required)
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "email": "admin@gmail.com",
      "role": "admin"
    },
    "expiresIn": "7d"
  }
}
```

### 2. Access Protected Endpoints
Include the JWT token in the Authorization header:

```bash
GET /api/v1/reviews
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Protected Endpoints

All these endpoints require authentication:

### **Reviews API**
- `GET /api/v1/reviews` - Get all reviews
- `GET /api/v1/reviews/stats` - Get review statistics  
- `GET /api/v1/reviews/:id` - Get review by ID
- `POST /api/v1/reviews/sync` - Manual sync trigger

### **General API**
- `GET /api/v1/status` - API status
- `GET /api/v1/hello` - Hello endpoint

### **Health Endpoints (No Auth Required)**
- `GET /health` - Health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

## Error Responses

### **No Token (401)**
```json
{
  "success": false,
  "message": "Access token required",
  "error": "401"
}
```

### **Invalid Token (401)**
```json
{
  "success": false,
  "message": "Invalid token",
  "error": "401"
}
```

### **Expired Token (401)**
```json
{
  "success": false,
  "message": "Token expired",
  "error": "401"
}
```

## Token Details
- **Type**: JWT (JSON Web Token)
- **Expires**: 7 days
- **Algorithm**: HS256
- **Payload**: Contains user ID, email, and role

## Swagger Documentation
The API documentation at http://localhost:3000/api-docs now includes:
- **Bearer Authentication** scheme
- **Security requirements** for all protected endpoints
- **Authorize button** to add your token

## Testing with Different Tools

### **curl**
```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123456"}' \
  | jq -r '.data.token')

# 2. Use token for protected endpoints
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/reviews
```

### **Postman**
1. Login via `POST /api/v1/auth/login`
2. Copy the token from response
3. Go to Authorization tab → Type: Bearer Token
4. Paste the token
5. All requests will now include the token

### **JavaScript/Fetch**
```javascript
// 1. Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@gmail.com',
    password: '123456'
  })
});
const { data } = await loginResponse.json();
const token = data.token;

// 2. Use token for protected endpoints
const response = await fetch('/api/v1/reviews', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Security Features
- **JWT Verification**: Validates token signature and expiration
- **Request Logging**: Logs all authentication attempts
- **User Context**: Adds user info to request object for controllers
- **Role-Based Access**: Framework ready for role-based permissions
- **Error Handling**: Comprehensive error responses and logging

## Current Status
✅ **Authentication Required**: All API endpoints protected  
✅ **JWT Tokens**: 7-day expiration with refresh tokens  
✅ **Swagger Integration**: Bearer auth in API docs  
✅ **Test Coverage**: All tests updated and passing (20/20)  
✅ **Error Handling**: Proper 401 responses for unauthorized access  

**Login Credentials**: `admin@gmail.com` / `123456`