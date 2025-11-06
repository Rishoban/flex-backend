# Channels and Properties Dropdown API Documentation

## Overview
This document provides detailed information about the Channels and Properties dropdown API endpoints. These endpoints provide data for populating dropdown menus in frontend forms, extracting unique channels and properties from the existing review data.

## Endpoints

### GET /api/v1/channels
Retrieve a list of unique channels from the review data for dropdown population.

#### Authentication
- **Required**: Yes
- **Type**: Bearer Token (JWT)

#### Request
```
GET /api/v1/channels
Authorization: Bearer <jwt_token>
```

#### Response
```json
{
  "status": "success",
  "data": {
    "channels": [
      {
        "value": "airbnb",
        "label": "Airbnb",
        "count": 15,
        "lastReview": "2024-01-15T10:30:00Z",
        "isActive": true
      },
      {
        "value": "booking_com",
        "label": "Booking.com",
        "count": 8,
        "lastReview": "2024-01-14T15:45:00Z",
        "isActive": true
      }
    ],
    "totalChannels": 2,
    "totalReviews": 23,
    "lastUpdated": "2024-01-15T16:20:00Z"
  }
}
```

#### Response Fields
- **channels**: Array of channel objects
  - **value**: Normalized channel identifier (lowercase, underscores)
  - **label**: Display name for the channel
  - **count**: Number of reviews from this channel
  - **lastReview**: ISO timestamp of the most recent review
  - **isActive**: Boolean indicating if channel is active
- **totalChannels**: Total number of unique channels
- **totalReviews**: Total number of reviews across all channels
- **lastUpdated**: ISO timestamp when data was last updated

#### Features
- Channels are sorted by review count (descending)
- Automatic value normalization for consistent frontend usage
- Real-time data extraction from cached reviews

---

### GET /api/v1/properties
Retrieve a list of unique properties from the review data for dropdown population.

#### Authentication
- **Required**: Yes
- **Type**: Bearer Token (JWT)

#### Request
```
GET /api/v1/properties
Authorization: Bearer <jwt_token>
```

#### Response
```json
{
  "status": "success",
  "data": {
    "properties": [
      {
        "value": "2b_n1_a___29_shoreditch_heights",
        "label": "2B N1 A - 29 Shoreditch Heights",
        "listingName": "2B N1 A - 29 Shoreditch Heights",
        "count": 12,
        "channels": ["Airbnb", "Booking.com"],
        "averageRating": 4.7,
        "lastReview": "2024-01-15T10:30:00Z",
        "isActive": true
      },
      {
        "value": "studio_apartment_central_london",
        "label": "Studio Apartment Central London",
        "listingName": "Studio Apartment Central London",
        "count": 8,
        "channels": ["Airbnb"],
        "averageRating": 4.2,
        "lastReview": "2024-01-14T15:45:00Z",
        "isActive": true
      }
    ],
    "totalProperties": 2,
    "totalReviews": 20,
    "lastUpdated": "2024-01-15T16:20:00Z"
  }
}
```

#### Response Fields
- **properties**: Array of property objects
  - **value**: Normalized property identifier (lowercase, alphanumeric + underscores)
  - **label**: Original property name for display
  - **listingName**: Original listing name from review data (same as label)
  - **count**: Number of reviews for this property
  - **channels**: Array of channel names where this property has reviews
  - **averageRating**: Average rating across all reviews (rounded to 1 decimal)
  - **lastReview**: ISO timestamp of the most recent review
  - **isActive**: Boolean indicating if property is active
- **totalProperties**: Total number of unique properties
- **totalReviews**: Total number of reviews across all properties
- **lastUpdated**: ISO timestamp when data was last updated

#### Features
- Properties are sorted by review count (descending)
- Cross-channel property analysis
- Average rating calculation with precision rounding
- Automatic value normalization for consistent frontend usage

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized - Invalid or missing token"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Failed to retrieve [channels/properties] dropdown data"
}
```

---

## Usage Examples

### Frontend Integration (JavaScript)
```javascript
// Fetch channels for dropdown
async function loadChannels() {
  try {
    const response = await fetch('/api/v1/channels', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.status === 'success') {
      const channelOptions = data.data.channels.map(channel => ({
        value: channel.value,
        label: `${channel.label} (${channel.count} reviews)`
      }));
      
      populateDropdown('channel-select', channelOptions);
    }
  } catch (error) {
    console.error('Failed to load channels:', error);
  }
}

// Fetch properties for dropdown
async function loadProperties() {
  try {
    const response = await fetch('/api/v1/properties', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.status === 'success') {
      const propertyOptions = data.data.properties.map(property => ({
        value: property.value,
        label: `${property.label} (⭐${property.averageRating})`
      }));
      
      populateDropdown('property-select', propertyOptions);
    }
  } catch (error) {
    console.error('Failed to load properties:', error);
  }
}
```

### React Integration
```jsx
import { useState, useEffect } from 'react';

function ChannelPropertyDropdowns({ token }) {
  const [channels, setChannels] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDropdownData() {
      try {
        const [channelsRes, propertiesRes] = await Promise.all([
          fetch('/api/v1/channels', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/v1/properties', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const channelsData = await channelsRes.json();
        const propertiesData = await propertiesRes.json();

        if (channelsData.status === 'success') {
          setChannels(channelsData.data.channels);
        }
        
        if (propertiesData.status === 'success') {
          setProperties(propertiesData.data.properties);
        }
      } catch (error) {
        console.error('Failed to load dropdown data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDropdownData();
  }, [token]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <select name="channel">
        <option value="">Select Channel</option>
        {channels.map(channel => (
          <option key={channel.value} value={channel.value}>
            {channel.label} ({channel.count} reviews)
          </option>
        ))}
      </select>

      <select name="property">
        <option value="">Select Property</option>
        {properties.map(property => (
          <option key={property.value} value={property.value}>
            {property.label} (⭐{property.averageRating})
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

## Data Sources
- **Review Data**: Extracted from cached review data in ReviewSyncService
- **Real-time Processing**: Data is processed on-demand from current review cache
- **Synchronization**: Data reflects the latest synced reviews from Hostaway API

## Performance Notes
- Endpoints use in-memory data processing for fast response times
- Data is sorted and filtered efficiently using JavaScript Map operations
- Response caching is handled by review cache synchronization intervals

## Security
- All endpoints require valid JWT authentication
- Rate limiting applied as per global API configuration
- Request logging for audit and monitoring purposes