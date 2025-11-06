# Form Dropdown API

This document describes the form dropdown endpoint that provides hardcoded data for form fields, specifically review status options with detailed metadata.

## Overview

The form dropdown endpoint returns configuration data for form fields, including status options with colors, icons, permissions, and other UI-related metadata. This data is typically used to populate dropdown menus, status badges, and form controls in frontend applications.

## Authentication

Authentication is required for this endpoint:

```bash
Authorization: Bearer <your-jwt-token>
```

## Endpoint

### GET /api/v1/form/dropdowns

Returns hardcoded form dropdown data including review statuses.

**URL:** `http://localhost:3000/api/v1/form/dropdowns`

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

### 2. Get Form Dropdown Data
```bash
curl -X GET http://localhost:3000/api/v1/form/dropdowns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Format

### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "statuses": [
      {
        "value": "Pending",
        "label": "Pending Review",
        "description": "Review is awaiting manager approval",
        "color": "#ff9800",
        "icon": "schedule",
        "sortOrder": 1,
        "isActive": true,
        "permissions": ["view", "update"]
      },
      {
        "value": "Approved",
        "label": "Approved",
        "description": "Review has been approved by manager",
        "color": "#2196f3",
        "icon": "check_circle",
        "sortOrder": 2,
        "isActive": true,
        "permissions": ["view", "update", "publish"]
      },
      {
        "value": "Published",
        "label": "Published",
        "description": "Review is live on the website",
        "color": "#4caf50",
        "icon": "visibility",
        "sortOrder": 3,
        "isActive": true,
        "permissions": ["view", "unpublish"]
      },
      {
        "value": "Rejected",
        "label": "Rejected",
        "description": "Review has been rejected",
        "color": "#f44336",
        "icon": "cancel",
        "sortOrder": 4,
        "isActive": true,
        "permissions": ["view", "reapprove"]
      },
      {
        "value": "Flagged",
        "label": "Flagged",
        "description": "Review requires attention",
        "color": "#ff5722",
        "icon": "flag",
        "sortOrder": 5,
        "isActive": true,
        "permissions": ["view", "update", "resolve"]
      }
    ],
    "metadata": {
      "totalCount": 5,
      "activeCount": 5,
      "lastUpdated": "2025-11-06T21:34:05.123Z"
    }
  }
}
```

## Data Structure

### Status Object Properties

| Field | Type | Description |
|-------|------|-------------|
| `value` | string | Internal status value used for data processing |
| `label` | string | Human-readable label for display |
| `description` | string | Detailed description of what this status means |
| `color` | string | Hex color code for UI styling (#rrggbb format) |
| `icon` | string | Material Design icon name for UI |
| `sortOrder` | number | Order for sorting/displaying statuses |
| `isActive` | boolean | Whether this status is currently active/available |
| `permissions` | string[] | Array of allowed actions for this status |

### Metadata Properties

| Field | Type | Description |
|-------|------|-------------|
| `totalCount` | number | Total number of status options |
| `activeCount` | number | Number of active status options |
| `lastUpdated` | string | ISO timestamp of when data was last updated |

## Status Details

### 1. Pending
- **Purpose:** Initial state for new reviews
- **Color:** Orange (#ff9800) - indicates waiting/caution
- **Icon:** schedule - represents waiting/time
- **Permissions:** view, update

### 2. Approved  
- **Purpose:** Manager has approved the review
- **Color:** Blue (#2196f3) - indicates approved/ready
- **Icon:** check_circle - represents approval
- **Permissions:** view, update, publish

### 3. Published
- **Purpose:** Review is live and visible to users
- **Color:** Green (#4caf50) - indicates success/live
- **Icon:** visibility - represents public visibility
- **Permissions:** view, unpublish

### 4. Rejected
- **Purpose:** Review has been rejected and won't be published
- **Color:** Red (#f44336) - indicates error/rejection
- **Icon:** cancel - represents rejection
- **Permissions:** view, reapprove

### 5. Flagged
- **Purpose:** Review needs attention or has issues
- **Color:** Deep Orange (#ff5722) - indicates attention needed
- **Icon:** flag - represents flagged content
- **Permissions:** view, update, resolve

## Available Permissions

- `view` - Can view the review
- `update` - Can modify review details
- `publish` - Can publish the review
- `unpublish` - Can unpublish a published review
- `reapprove` - Can move a rejected review back to approved
- `resolve` - Can resolve flagged issues

## Frontend Usage Examples

### React/JavaScript
```javascript
// Fetch dropdown data
const fetchDropdownData = async () => {
  const response = await fetch('/api/v1/form/dropdowns', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data.statuses;
};

// Create dropdown options
const statusOptions = statuses.map(status => ({
  value: status.value,
  label: status.label,
  color: status.color
}));

// Sort by sortOrder
const sortedStatuses = statuses.sort((a, b) => a.sortOrder - b.sortOrder);
```

### Status Badge Component
```javascript
const StatusBadge = ({ status }) => {
  const statusConfig = statuses.find(s => s.value === status);
  return (
    <span 
      style={{ 
        backgroundColor: statusConfig.color,
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px'
      }}
    >
      <i className="material-icons">{statusConfig.icon}</i>
      {statusConfig.label}
    </span>
  );
};
```

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
  "status": "error",
  "message": "Failed to retrieve form dropdown data"
}
```

## Use Cases

### Form Controls
- Populate status dropdown menus
- Create radio button groups
- Build multi-select filters

### UI Components
- Status badges with proper colors
- Icon displays
- Progress indicators

### Permission Systems
- Show/hide actions based on status permissions
- Enable/disable buttons
- Filter available operations

## Testing

The endpoint includes comprehensive tests for:
- Authentication validation
- Response structure verification
- Data type validation
- Status value verification
- Sort order validation
- Color format validation
- Permission validation
- Metadata accuracy

## Performance

- **Response Time:** < 5ms (hardcoded data)
- **Payload Size:** ~1.5KB
- **Caching:** Consider client-side caching since data is static
- **Rate Limiting:** Subject to standard API rate limits

## Swagger Documentation

Interactive API documentation available at:
- **Development:** http://localhost:3000/api-docs

Look for the "Form Data" section in the Swagger UI for detailed endpoint documentation and testing capabilities.