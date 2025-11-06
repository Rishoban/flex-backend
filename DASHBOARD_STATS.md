# Dashboard Statistics API

This document describes the dashboard statistics endpoint that provides comprehensive review and property metrics.

## Overview

The dashboard stats endpoint returns key metrics that would typically be displayed on an administrative dashboard, including review counts, ratings, and property information.

## Authentication

All endpoints require JWT authentication:

```bash
Authorization: Bearer <your-jwt-token>
```

## Endpoint

### GET /api/v1/dashboard/stats

Returns comprehensive dashboard statistics about reviews and properties.

**URL:** `http://localhost:3000/api/v1/dashboard/stats`

**Method:** GET

**Authentication:** Required

## Example Usage

### 1. Get Auth Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "123456"
  }'
```

### 2. Get Dashboard Stats
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalReviews": 55,
    "averageRating": 4.4,
    "pendingReviews": 8,
    "publishedReviews": 42,
    "flaggedIssues": 4,
    "propertiesCount": 3
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalReviews` | number | Total number of reviews in the system |
| `averageRating` | number | Average rating across all reviews (1-10 scale) |
| `pendingReviews` | number | Reviews awaiting action (pending + approved status) |
| `publishedReviews` | number | Reviews that are published and visible |
| `flaggedIssues` | number | Reviews that have been flagged with issues |
| `propertiesCount` | number | Number of unique properties with reviews |

## Sample Mock Data Response

Based on the current mock data in the system:

```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalReviews": 5,
    "averageRating": 4.5,
    "pendingReviews": 2,
    "publishedReviews": 2,
    "flaggedIssues": 1,
    "propertiesCount": 3
  }
}
```

## Calculation Logic

### Average Rating
- Only includes reviews that have a non-null rating
- Calculated as: `sum of all ratings / count of reviews with ratings`
- Rounded to 1 decimal place
- Returns 0 if no reviews have ratings

### Pending Reviews
- Includes reviews with status: `"pending"` OR `"approved"`
- These are reviews that need administrative action

### Published Reviews
- Includes only reviews with status: `"published"`
- These are reviews visible to end users

### Flagged Issues
- Counts reviews that have the `flaggedIssues` array with at least one item
- Example: `"flaggedIssues": ["wifi", "cleanliness"]`

### Properties Count
- Counts unique `propertyId` values across all reviews
- Uses Set to ensure uniqueness

## Error Responses

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve dashboard statistics"
}
```

## Use Cases

### Dashboard Display
Perfect for displaying key metrics on an administrative dashboard:

```javascript
// Example frontend usage
const fetchDashboardStats = async () => {
  const response = await fetch('/api/v1/dashboard/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  
  // Update dashboard components
  setTotalReviews(data.data.totalReviews);
  setAverageRating(data.data.averageRating);
  setPendingCount(data.data.pendingReviews);
  // ... etc
};
```

### Monitoring & Alerts
Can be used to monitor system health:
- Alert when flagged issues increase
- Monitor average rating trends
- Track pending review backlog

### Reporting
Provides data for:
- Performance reports
- Quality metrics
- Property management insights

## Performance Notes

- Data is calculated in real-time from the in-memory cache
- Very fast response time (< 10ms typically)
- Scales with the number of reviews in the system
- Consider caching for high-traffic scenarios

## Testing

The endpoint is fully tested with:
- Authentication validation
- Response format verification  
- Data type checking
- Calculation accuracy tests
- Error handling scenarios

Run tests with:
```bash
npm test
```

## Swagger Documentation

Interactive API documentation available at:
- **Development:** http://localhost:3000/api-docs

Look for the "Dashboard" section in the Swagger UI for detailed endpoint documentation and testing capabilities.