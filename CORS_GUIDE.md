# CORS Configuration Guide

This document explains how to fix CORS (Cross-Origin Resource Sharing) issues when accessing the Flex Backend API from frontend applications.

## What is CORS?

CORS is a security feature implemented by web browsers that blocks requests from one domain to another unless the server explicitly allows it. For example, if your frontend runs on `http://localhost:3001` and tries to access your API on `http://localhost:3000`, the browser will block the request unless CORS is properly configured.

## CORS Configuration Applied

The server has been updated with comprehensive CORS configuration that:

### ✅ **Development Mode**
- **Allows ALL origins** when `NODE_ENV=development`
- **Allows requests without origin** (mobile apps, Postman, curl)
- **Supports all common HTTP methods**
- **Includes proper preflight handling**

### ✅ **Production Mode**
- **Whitelist specific origins** from configuration
- **Secure by default** with explicit origin checking
- **Configurable via environment variables**

## Current CORS Settings

```typescript
// Allowed HTTP Methods
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

// Allowed Headers
allowedHeaders: [
  'Content-Type', 
  'Authorization', 
  'X-Requested-With', 
  'Accept', 
  'Origin'
]

// Credentials Support
credentials: true

// Default Allowed Origins (Development)
[
  'http://localhost:3000',  // API server itself
  'http://localhost:3001',  // Common React dev server
  'http://localhost:4200',  // Angular dev server
  'http://localhost:5173',  // Vite dev server
  'http://localhost:8080'   // Vue/Webpack dev server
]
```

## Environment Configuration

### .env File Setup

Create or update your `.env` file:

```bash
# Environment
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3001,http://localhost:4200,http://localhost:5173,http://localhost:8080
```

### Multiple Origins

To allow multiple origins in production:

```bash
CORS_ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com,https://admin.myapp.com
```

## Testing CORS

### 1. Browser Console Test

Open your browser console and test a simple request:

```javascript
fetch('http://localhost:3000/api/v1/health')
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('CORS Error:', error));
```

### 2. With Authentication

```javascript
// First login to get token
fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@gmail.com',
    password: '123456'
  })
})
.then(response => response.json())
.then(data => {
  const token = data.data.token;
  
  // Then use token to access protected endpoint
  return fetch('http://localhost:3000/api/v1/dashboard/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
})
.then(response => response.json())
.then(data => console.log('Protected data:', data))
.catch(error => console.error('Error:', error));
```

### 3. Frontend Framework Examples

#### React (axios)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
const getStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    console.log(response.data);
  } catch (error) {
    console.error('CORS or API error:', error);
  }
};
```

#### Angular (HttpClient)
```typescript
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }),
  withCredentials: true
};

this.http.get('http://localhost:3000/api/v1/dashboard/stats', httpOptions)
  .subscribe(
    data => console.log(data),
    error => console.error('CORS error:', error)
  );
```

#### Vue (fetch/axios)
```javascript
// In Vue component
async fetchData() {
  try {
    const response = await fetch('http://localhost:3000/api/v1/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    const data = await response.json();
    this.stats = data.data;
  } catch (error) {
    console.error('CORS error:', error);
  }
}
```

## Common CORS Issues & Solutions

### Issue 1: "Access-Control-Allow-Origin" Error

**Error Message:**
```
Access to fetch at 'http://localhost:3000/api/v1/...' from origin 'http://localhost:3001' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**Solution:**
- Ensure `NODE_ENV=development` in your `.env` file
- Or add your frontend origin to `CORS_ALLOWED_ORIGINS`
- Restart the server after changing `.env`

### Issue 2: Preflight OPTIONS Requests Failing

**Error Message:**
```
Access to fetch at '...' has been blocked by CORS policy: Response to preflight request 
doesn't pass access control check.
```

**Solution:**
- This is already handled by our `app.options('*', cors(corsOptions))` configuration
- Ensure you're not blocking OPTIONS requests in any middleware

### Issue 3: Credentials/Cookies Issues

**Error Message:**
```
Access to fetch has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' 
header must not be the wildcard '*' when the request's credentials mode is 'include'.
```

**Solution:**
- Our configuration uses specific origins, not wildcards
- Ensure `credentials: true` is set in your frontend requests
- Use `withCredentials: true` for axios or `credentials: 'include'` for fetch

### Issue 4: Custom Headers Blocked

**Error Message:**
```
Request header field 'authorization' is not allowed by Access-Control-Allow-Headers.
```

**Solution:**
- We've included all common headers in `allowedHeaders`
- If you need additional headers, add them to the configuration

## Troubleshooting Steps

### 1. Check Browser Network Tab
- Open DevTools → Network
- Look for failed OPTIONS (preflight) requests
- Check response headers for CORS headers

### 2. Verify Server Logs
- Check server console for CORS-related errors
- Look for successful preflight OPTIONS requests

### 3. Test with curl/Postman
```bash
# Test preflight request
curl -X OPTIONS http://localhost:3000/api/v1/dashboard/stats \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization" \
  -v

# Test actual request
curl -X GET http://localhost:3000/api/v1/dashboard/stats \
  -H "Origin: http://localhost:3001" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v
```

### 4. Temporary Development Override

For quick testing during development, you can temporarily disable CORS in your browser:

**Chrome:**
```bash
chrome --disable-web-security --user-data-dir=/tmp/chrome-cors-disabled
```

**Note:** Only use this for development testing, never in production!

## Production Considerations

### 1. Specific Origins Only
```bash
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Environment-Specific Configuration
```bash
# Development
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Production  
NODE_ENV=production
CORS_ORIGIN=https://api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

### 3. Security Headers
The server includes Helmet.js for additional security headers that work with CORS.

## Verification

After applying the CORS configuration, you should be able to:

✅ Access API from any localhost port in development  
✅ Make authenticated requests with JWT tokens  
✅ Use any common HTTP method (GET, POST, PUT, PATCH, DELETE)  
✅ Include custom headers like Authorization  
✅ Handle preflight OPTIONS requests automatically  

The CORS issue should now be resolved! 🎉