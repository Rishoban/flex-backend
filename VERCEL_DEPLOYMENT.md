# Flex Backend API - Vercel Deployment Guide

## 🚀 Vercel Deployment Configuration

This application has been configured for Vercel serverless deployment with the following modifications:

### 📁 **Files Added/Modified for Vercel:**

1. **`vercel.json`** - Vercel configuration
2. **`.vercelignore`** - Files to ignore during deployment  
3. **`package.json`** - Added `vercel-build` script and Node.js engines
4. **Logger** - Disabled file logging (read-only filesystem)
5. **Background Sync** - Disabled for serverless environment

### ⚙️ **Serverless Adaptations:**

#### **Background Sync Disabled**
```typescript
// Background sync is automatically disabled on Vercel
// Use manual sync endpoint instead: POST /api/v1/reviews/sync
```

#### **File Logging Disabled**
```typescript
// File transports disabled for Vercel (read-only filesystem)
// All logs go to console (visible in Vercel dashboard)
```

### 🌐 **Environment Variables to Set in Vercel:**

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=7d
API_PREFIX=/api/v1
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 🚀 **Deployment Steps:**

1. **Push to GitHub:**
```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Manual Sync Usage:**
```bash
# Since background sync is disabled, use manual endpoint:
curl -X POST https://your-app.vercel.app/api/v1/reviews/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 📊 **API Endpoints Available:**

- `GET /health` - Health check
- `POST /api/v1/auth/login` - Authentication
- `GET /api/v1/reviews` - Get reviews (from cache)
- `POST /api/v1/reviews/sync` - Manual sync trigger
- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/channels` - Channels dropdown
- `GET /api/v1/properties` - Properties dropdown
- `GET /api-docs` - Swagger documentation

### ⚡ **Performance Notes:**

- **Cold starts:** ~1-2 seconds for first request
- **Warm requests:** <100ms response time
- **Function timeout:** 30 seconds maximum
- **Memory limit:** 1GB per function

### 🔄 **Scheduled Sync Alternative:**

Since Vercel doesn't support background processes, consider:

1. **GitHub Actions Cron Job** (Free):
```yaml
# .github/workflows/sync.yml
on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours
```

2. **Vercel Cron Jobs** (Pro plan):
```json
{
  "crons": [{
    "path": "/api/v1/reviews/sync",
    "schedule": "0 */4 * * *"
  }]
}
```

3. **External Service** (Uptime Robot, etc.)

### 🐛 **Troubleshooting:**

- **Build fails:** Check TypeScript compilation with `npm run build`
- **Function timeout:** Optimize external API calls
- **Memory issues:** Reduce data processing in single function
- **CORS errors:** Update `CORS_ORIGIN` environment variable

Your API will be available at: `https://your-project-name.vercel.app`