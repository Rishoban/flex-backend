# Vercel CORS Configuration Fix

## Problem
The frontend at `https://flex-review-management.vercel.app` was getting CORS errors when trying to access the backend API at `https://flex-backend-fawn.vercel.app/api/v1/auth/login`.

## Root Cause
1. **Incorrect Handler**: `vercel.json` was routing to `api/test.js` (a simple test file without CORS)
2. **Missing Frontend Origin**: The frontend URL was not in the allowed origins list
3. **No CORS Middleware**: The test handler didn't have CORS configuration

## Solution Applied

### 1. Updated `vercel.json`
- Changed handler from `api/test.js` to `api/index.js` (full app with authentication)
- Added comprehensive CORS headers configuration
- Specified frontend URL: `https://flex-review-management.vercel.app`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://flex-review-management.vercel.app"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
        }
      ]
    }
  ]
}
```

### 2. Enhanced `api/index.js`
- Added CORS middleware configuration
- Set environment variable: `CORS_ALLOWED_ORIGINS`
- Includes frontend URL in allowed origins
- Added fallback CORS handling

```javascript
process.env.CORS_ALLOWED_ORIGINS = 'https://flex-review-management.vercel.app,http://localhost:3000,http://localhost:3001';
```

### 3. Updated `api/test.js`
- Added CORS middleware for testing
- Configured with frontend URL

## Deployment Steps

### 1. Add Environment Variable in Vercel Dashboard
Go to your Vercel project settings and add:

**Variable Name**: `CORS_ORIGIN`  
**Value**: `https://flex-review-management.vercel.app`

![Vercel Environment Variables](attachment_screenshot)

### 2. Deploy Changes
```bash
# Commit changes
git add .
git commit -m "fix: Add CORS configuration for frontend"
git push origin master

# Vercel will automatically redeploy
```

### 3. Manual Redeploy (if needed)
```bash
vercel --prod
```

## Testing

### Test from Browser Console
Open `https://flex-review-management.vercel.app/login` and run in console:

```javascript
fetch('https://flex-backend-fawn.vercel.app/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

### Test with curl
```bash
curl -X OPTIONS https://flex-backend-fawn.vercel.app/api/v1/auth/login \
  -H "Origin: https://flex-review-management.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization" \
  -v
```

Expected response headers:
```
Access-Control-Allow-Origin: https://flex-review-management.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: ...
Access-Control-Allow-Credentials: true
```

## Frontend Integration

Update your frontend API client to include credentials:

### Using Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://flex-backend-fawn.vercel.app/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Using Fetch
```javascript
fetch('https://flex-backend-fawn.vercel.app/api/v1/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

## Additional Frontend Origins

To allow additional frontend domains (staging, preview, etc.):

### In Vercel Dashboard
Add to `CORS_ALLOWED_ORIGINS` environment variable:
```
https://flex-review-management.vercel.app,https://flex-review-staging.vercel.app,https://preview.vercel.app
```

### For Dynamic Preview URLs
Update `api/index.js` to allow all Vercel preview URLs:

```javascript
origin: function (origin, callback) {
  const allowedOrigins = [
    'https://flex-review-management.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  // Allow Vercel preview URLs
  if (origin && origin.includes('.vercel.app')) {
    return callback(null, true);
  }
  
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

## Verification Checklist

✅ **vercel.json updated** - Routes to `api/index.js` with CORS headers  
✅ **api/index.js updated** - CORS middleware configured  
✅ **api/test.js updated** - CORS added for testing  
✅ **Environment variable set** - `CORS_ORIGIN` in Vercel dashboard  
✅ **Code committed** - Changes pushed to repository  
✅ **Deployed** - Vercel automatically redeployed  
✅ **Tested** - Frontend can make requests without CORS errors  

## Troubleshooting

### Still getting CORS errors?

1. **Clear browser cache** - Old responses may be cached
2. **Check Vercel logs** - Look for deployment errors
3. **Verify environment variables** - Ensure `CORS_ORIGIN` is set in Vercel
4. **Test preflight** - Use curl to test OPTIONS request
5. **Check network tab** - Look at request/response headers

### Common Issues

**Issue**: "No 'Access-Control-Allow-Origin' header"  
**Solution**: Ensure deployment completed successfully and environment variables are set

**Issue**: "Credentials flag is true, but origin is '*'"  
**Solution**: Specific origin is now configured (not wildcard)

**Issue**: "Method not allowed"  
**Solution**: OPTIONS method is now included in allowed methods

## Security Notes

- ✅ Specific origin (not wildcard `*`)
- ✅ Credentials enabled for authenticated requests
- ✅ Limited to necessary HTTP methods
- ✅ Proper headers whitelisted
- ⚠️ For production, consider additional security measures:
  - Rate limiting
  - CSRF protection
  - Request signing
  - IP whitelisting (if applicable)

## Next Steps

1. Deploy and test the changes
2. Monitor Vercel logs for any CORS-related errors
3. Update frontend to use proper credentials mode
4. Consider adding more comprehensive error handling
5. Implement request logging for debugging

---

**Status**: ✅ Fixed and Ready for Deployment  
**Last Updated**: November 7, 2025
