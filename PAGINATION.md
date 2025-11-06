# Reviews API Pagination

## Overview
The `/api/v1/reviews` endpoint now supports comprehensive pagination, sorting, and filtering capabilities.

## URL Structure
```
GET /api/v1/reviews?page=1&limit=10&sortBy=submittedAt&sortOrder=desc&status=published&channel=airbnb
```

## Query Parameters

### **Pagination**
- `page` - Page number (default: 1, minimum: 1)
- `limit` - Items per page (default: 10, minimum: 1, maximum: 100)

### **Sorting**
- `sortBy` - Field to sort by (default: submittedAt)
  - Options: `submittedAt`, `rating`, `guestName`, `status`
- `sortOrder` - Sort direction (default: desc)
  - Options: `asc`, `desc`

### **Filtering**
- `status` - Filter by review status
  - Options: `published`, `pending`, `approved`
- `channel` - Filter by booking channel
  - Options: `airbnb`, `booking`, `direct`, `google`

## Example URLs

### **Basic Pagination**
```bash
# Get first page with 10 reviews (default)
GET /api/v1/reviews

# Get page 2 with 5 reviews per page
GET /api/v1/reviews?page=2&limit=5

# Get page 1 with maximum 100 reviews
GET /api/v1/reviews?page=1&limit=100
```

### **Sorting Examples**
```bash
# Sort by guest name (ascending)
GET /api/v1/reviews?sortBy=guestName&sortOrder=asc

# Sort by rating (descending)
GET /api/v1/reviews?sortBy=rating&sortOrder=desc

# Sort by submission date (newest first - default)
GET /api/v1/reviews?sortBy=submittedAt&sortOrder=desc
```

### **Filtering Examples**
```bash
# Get only published reviews
GET /api/v1/reviews?status=published

# Get only Airbnb reviews
GET /api/v1/reviews?channel=airbnb

# Get published Airbnb reviews, sorted by rating
GET /api/v1/reviews?status=published&channel=airbnb&sortBy=rating&sortOrder=desc
```

### **Combined Examples**
```bash
# Page 2, 3 reviews per page, published status, sorted by guest name
GET /api/v1/reviews?page=2&limit=3&status=published&sortBy=guestName&sortOrder=asc

# First 20 Booking.com reviews sorted by latest submission
GET /api/v1/reviews?limit=20&channel=booking&sortBy=submittedAt&sortOrder=desc
```

## Response Format

```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "id": 7453,
        "type": "host-to-guest",
        "status": "published",
        "rating": null,
        "publicReview": "Shane and family are wonderful!",
        "reviewCategory": [
          { "category": "cleanliness", "rating": 10 }
        ],
        "submittedAt": "2024-08-21 22:45:14",
        "guestName": "Shane Finkelstein",
        "listingName": "2B N1 A - 29 Shoreditch Heights",
        "propertyId": "prop_001",
        "channel": "airbnb",
        "isSelectedForWebsite": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

## Pagination Object Properties

- `page` - Current page number
- `limit` - Items per page requested
- `total` - Total number of reviews (after filtering)
- `pages` - Total number of pages available
- `hasNext` - Boolean indicating if there's a next page
- `hasPrev` - Boolean indicating if there's a previous page

## Authentication Required

All requests must include a valid JWT token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/v1/reviews?page=1&limit=5"
```

## Testing Examples

### **Get Auth Token**
```bash
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123456"}' \
  | jq -r '.data.token')
```

### **Test Pagination**
```bash
# Basic pagination
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/reviews?page=1&limit=2"

# With sorting
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/reviews?sortBy=guestName&sortOrder=asc"

# With filtering
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/reviews?status=published&channel=airbnb"
```

## JavaScript Example

```javascript
const getReviews = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'submittedAt',
    sortOrder = 'desc',
    status,
    channel
  } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder
  });

  if (status) params.append('status', status);
  if (channel) params.append('channel', channel);

  const response = await fetch(`/api/v1/reviews?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

// Usage examples
const firstPage = await getReviews();
const secondPage = await getReviews({ page: 2, limit: 5 });
const publishedReviews = await getReviews({ status: 'published' });
const sortedByRating = await getReviews({ sortBy: 'rating', sortOrder: 'desc' });
```

## Swagger Documentation

Visit http://localhost:3000/api-docs to see the interactive API documentation with all pagination parameters and examples.

## Current Features
✅ **Pagination**: Page-based with configurable limit  
✅ **Sorting**: Multiple fields with asc/desc order  
✅ **Filtering**: By status and channel  
✅ **Validation**: Parameter validation and limits  
✅ **Swagger Docs**: Complete API documentation  
✅ **Test Coverage**: Comprehensive test suite  
✅ **Performance**: Efficient in-memory operations  

## Performance Notes
- Maximum 100 items per page to prevent performance issues
- Sorting and filtering performed in-memory for fast response times
- Pagination metadata calculated efficiently
- Comprehensive logging for monitoring and debugging