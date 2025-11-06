# Login API Usage

## POST /api/v1/auth/login

Simple hardcoded login endpoint that returns a JWT token.

### Hardcoded Credentials
- **Email**: `admin@gmail.com`
- **Password**: `123456`

### Request Example

```bash
# Using curl
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "123456"
  }'
```

```javascript
// Using fetch
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@gmail.com',
    password: '123456'
  })
});

const data = await response.json();
console.log(data);
```

### Success Response (200)

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

### Error Responses

#### Invalid Credentials (401)
```json
{
  "success": false,
  "message": "Invalid email or password",
  "error": "401"
}
```

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "400",
  "validationErrors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Please provide a valid email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Features
- Input validation using express-validator
- JWT token generation with 7-day expiration
- Refresh token with 30-day expiration
- Comprehensive error handling
- Swagger documentation integration
- Full test coverage

### Testing
Run the test suite to verify the login functionality:
```bash
npm test
```

### Access Points
- **API Endpoint**: http://localhost:3000/api/v1/auth/login
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health