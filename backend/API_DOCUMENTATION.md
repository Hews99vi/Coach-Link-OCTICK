# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Response Format

All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "field_name",
      "message": "Error description",
      "value": "invalid_value"
    }
  ]
}
```

---

## Service Requests Endpoints

### Create Service Request
**Public endpoint** - No authentication required

```http
POST /api/requests
```

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "phone": "555-1234",
  "pickup_location": "123 Main St",
  "dropoff_location": "456 Oak Ave",
  "pickup_time": "2025-10-28T10:00:00Z",
  "passengers": 2,
  "notes": "Optional notes"
}
```

**Validations:**
- `customer_name`: Required, 2-100 characters
- `phone`: Required, valid phone format
- `pickup_time`: Required, must be in the future, ISO8601 format
- `passengers`: Optional, integer 1-100
- `pickup_location`, `dropoff_location`, `notes`: Optional

**Response: 201 Created**
```json
{
  "success": true,
  "message": "Service request created successfully",
  "data": {
    "id": 1,
    "customer_name": "John Doe",
    "phone": "555-1234",
    "status": "pending",
    "created_at": "2025-10-27T...",
    ...
  }
}
```

---

### List Service Requests
**Admin endpoint** - Authentication required (future implementation)

```http
GET /api/requests?page=1&limit=10&search=John&status=pending
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10, max: 100)
- `search`: Search by customer name or phone
- `status`: Filter by status (pending, approved, rejected, scheduled)

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_name": "John Doe",
      "status": "scheduled",
      "assignment": {
        "driver": { "name": "John Driver" },
        "vehicle": { "plate": "ABC123" }
      },
      ...
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### Get Single Service Request

```http
GET /api/requests/:id
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_name": "John Doe",
    "phone": "555-1234",
    "status": "scheduled",
    "assignment": {
      "driver": {...},
      "vehicle": {...},
      "scheduled_time": "2025-10-28T10:00:00Z"
    },
    ...
  }
}
```

**Response: 404 Not Found**
```json
{
  "success": false,
  "message": "Service request not found"
}
```

---

### Update Service Request

```http
PUT /api/requests/:id
```

**Request Body (Approve/Reject):**
```json
{
  "status": "approved"
}
```

**Request Body (Schedule):**
```json
{
  "status": "scheduled",
  "driver_id": 1,
  "vehicle_id": 1,
  "scheduled_time": "2025-10-28T10:00:00Z"
}
```

**Validations:**
- When `status` is "scheduled", `driver_id`, `vehicle_id`, and `scheduled_time` are required
- Driver and vehicle must exist
- Vehicle capacity must accommodate passengers

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Service request updated successfully",
  "data": { /* updated request with assignment */ }
}
```

---

### Delete Service Request

```http
DELETE /api/requests/:id
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Service request deleted successfully"
}
```

---

## Drivers Endpoints

### List All Drivers

```http
GET /api/drivers
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "123-456-7890",
      "assignments": [...]
    }
  ],
  "count": 3
}
```

---

### Get Single Driver

```http
GET /api/drivers/:id
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "phone": "123-456-7890",
    "assignments": [
      {
        "serviceRequest": {...},
        "vehicle": {...},
        "scheduled_time": "2025-10-28T10:00:00Z"
      }
    ]
  }
}
```

---

## Vehicles Endpoints

### List All Vehicles

```http
GET /api/vehicles
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "plate": "ABC123",
      "capacity": 50,
      "assignments": [...]
    }
  ],
  "count": 3
}
```

---

### Get Single Vehicle

```http
GET /api/vehicles/:id
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "plate": "ABC123",
    "capacity": 50,
    "assignments": [...]
  }
}
```

---

## Analytics Endpoints

### Daily Analytics

```http
GET /api/analytics/daily?days=7
```

**Query Parameters:**
- `days`: Number of days to retrieve (default: 7)

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    { "date": "2025-10-21", "count": 5 },
    { "date": "2025-10-22", "count": 3 },
    { "date": "2025-10-23", "count": 0 },
    { "date": "2025-10-24", "count": 8 },
    { "date": "2025-10-25", "count": 4 },
    { "date": "2025-10-26", "count": 6 },
    { "date": "2025-10-27", "count": 2 }
  ],
  "summary": {
    "totalRequests": 28,
    "averagePerDay": "4.00",
    "period": "Last 7 days"
  }
}
```

---

### Status Analytics

```http
GET /api/analytics/status
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "pending": 15,
    "approved": 8,
    "rejected": 3,
    "scheduled": 12
  },
  "total": 38
}
```

---

### Overview Analytics

```http
GET /api/analytics/overview
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "totalRequests": 38,
    "totalDrivers": 3,
    "totalVehicles": 3,
    "totalAssignments": 12,
    "pendingRequests": 15,
    "scheduledRequests": 12,
    "utilizationRate": "31.58%"
  }
}
```

---

## Health Check

```http
GET /health
```

**Response: 200 OK**
```json
{
  "status": "ok",
  "message": "Coach-Link API is running",
  "timestamp": "2025-10-27T12:00:00.000Z"
}
```

---

## Error Responses

### 400 Bad Request
Validation errors or invalid data

```json
{
  "success": false,
  "message": "Invalid data",
  "errors": [
    {
      "field": "customer_name",
      "message": "Customer name is required"
    }
  ]
}
```

### 404 Not Found
Resource doesn't exist

```json
{
  "success": false,
  "message": "Service request not found"
}
```

### 500 Internal Server Error
Server error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Testing the API

### Using cURL

**Create a request:**
```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "phone": "555-1234",
    "pickup_location": "123 Main St",
    "dropoff_location": "456 Oak Ave",
    "pickup_time": "2025-10-28T10:00:00Z",
    "passengers": 2
  }'
```

**List all requests:**
```bash
curl http://localhost:5000/api/requests
```

**Schedule a request:**
```bash
curl -X PUT http://localhost:5000/api/requests/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "scheduled",
    "driver_id": 1,
    "vehicle_id": 1,
    "scheduled_time": "2025-10-28T10:00:00Z"
  }'
```

### Using the Test Script

```bash
cd backend
node scripts/testAPI.js
```

---

## Notes

- All timestamps are in ISO8601 format (UTC)
- Pagination is 1-indexed
- Soft deletes are not implemented (records are permanently deleted)
- Authentication middleware is not yet implemented (marked as "Admin" for future)
- CORS is configured to allow requests from `http://localhost:3000` by default
