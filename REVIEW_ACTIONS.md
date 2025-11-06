# Review Action Endpoints

This document describes the action endpoints for managing review statuses in the Flex Backend API.

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## Getting a JWT Token

First, login to get your authentication token:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com", 
    "password": "123456"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@gmail.com",
      "role": "admin"
    }
  }
}
```

## Action Endpoints

### 1. Approve Review

Approves a review by setting its status to "approved".

**Endpoint:** `PATCH /api/v1/reviews/:id/approve`

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/reviews/7453/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review approved successfully",
  "data": {
    "id": 7453,
    "type": "host-to-guest",
    "status": "approved",
    "rating": null,
    "publicReview": "Shane and family are wonderful! Would definitely host again :)",
    "reviewCategory": [...],
    "submittedAt": "2024-08-21 22:45:14",
    "guestName": "Shane Finkelstein",
    "listingName": "2B N1 A - 29 Shoreditch Heights",
    "propertyId": "prop_001",
    "channel": "airbnb",
    "isSelectedForWebsite": true,
    "updatedAt": "2025-11-06T20:38:50.123Z"
  }
}
```

### 2. Publish Review

Publishes a review by setting its status to "published".

**Endpoint:** `PATCH /api/v1/reviews/:id/publish`

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/v1/reviews/7454/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review published successfully",
  "data": {
    "id": 7454,
    "type": "guest-to-host",
    "status": "published",
    "rating": 4,
    "publicReview": "Great location and clean apartment...",
    "reviewCategory": [...],
    "submittedAt": "2024-10-15 14:30:22",
    "guestName": "Emma Thompson",
    "listingName": "1B S2 B - 15 Camden Lock",
    "propertyId": "prop_002",
    "channel": "booking",
    "isSelectedForWebsite": false,
    "flaggedIssues": ["wifi"],
    "updatedAt": "2025-11-06T20:38:50.456Z"
  }
}
```

### 3. Reject Review

Rejects a review by setting its status to "rejected". Optionally includes a rejection reason.

**Endpoint:** `PATCH /api/v1/reviews/:id/reject`

**With Reason:**
```bash
curl -X PATCH http://localhost:3000/api/v1/reviews/7455/reject \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Inappropriate content detected"
  }'
```

**Without Reason:**
```bash
curl -X PATCH http://localhost:3000/api/v1/reviews/7456/reject \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review rejected successfully",
  "data": {
    "id": 7455,
    "type": "guest-to-host",
    "status": "rejected",
    "rating": 5,
    "publicReview": "Perfect stay! Everything was clean and comfortable...",
    "reviewCategory": [...],
    "submittedAt": "2024-11-01 09:15:33",
    "guestName": "Michael Chen",
    "listingName": "3B W1 C - 42 Kensington Gardens",
    "propertyId": "prop_003",
    "channel": "vrbo",
    "isSelectedForWebsite": true,
    "updatedAt": "2025-11-06T20:38:50.789Z",
    "rejectionReason": "Inappropriate content detected"
  }
}
```

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid review ID"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Review not found"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Failed to approve review"
}
```

## Validation Rules

### Rejection Reason
- **Type:** String (optional)
- **Length:** 1-500 characters
- **Example:** "Contains inappropriate language"

## Status Transitions

The review status can be changed to:
- **approved** - Review has been approved for potential publication
- **published** - Review is published and visible to users
- **rejected** - Review has been rejected and will not be published

## Dashboard Statistics Endpoint

### Get Dashboard Stats

Returns comprehensive statistics about reviews and properties.

**Endpoint:** `GET /api/v1/dashboard/stats`

**Example:**
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
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

**Statistics Explained:**
- `totalReviews` - Total number of reviews in the system
- `averageRating` - Average rating across all reviews with ratings (1-10 scale)
- `pendingReviews` - Reviews with status "pending" or "approved" (awaiting publication)
- `publishedReviews` - Reviews with status "published"
- `flaggedIssues` - Number of reviews that have flagged issues
- `propertiesCount` - Number of unique properties with reviews

## Available Review IDs for Testing

The system includes the following mock review IDs for testing:
- `7453` - Host-to-guest review (initially published)
- `7454` - Guest-to-host review (initially pending)
- `7455` - Guest-to-host review (initially approved) 
- `7456` - Guest-to-host review (initially pending)
- `7457` - Guest-to-host review (initially published)

## Swagger Documentation

Complete API documentation with interactive testing is available at:
- **Development:** http://localhost:3000/api-docs

The Swagger UI provides a convenient way to test all endpoints with proper authentication.

## Logging

All action operations are logged with the following information:
- Review ID
- Previous and new status
- User ID (from JWT token)
- Timestamp
- Rejection reason (if applicable)
- Endpoint accessed

Logs can be found in the application console during development.