# ExpressGo Bus Booking API Documentation

Complete API documentation for the ExpressGo Bus Booking System.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Routes Endpoints](#routes-endpoints)
  - [Schedules Endpoints](#schedules-endpoints)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

## Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints require JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

1. Register a new user account using `POST /api/auth/register`
2. Login using `POST /api/auth/login` to receive a JWT token
3. Use the token in subsequent requests

## Endpoints

### Health Check

#### GET /health

Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Bus Booking System API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+250788123456",
  "password": "Password123"
}
```

**Validation Rules:**
- `full_name`: Required, non-empty string
- `email`: Required, valid email format
- `phone_number`: Required, non-empty string
- `password`: Required, minimum 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please login to continue.",
  "data": {
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone_number": "+250788123456",
      "role": "user",
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error or email already exists
- `500 Internal Server Error`: Server error

---

### POST /api/auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required, non-empty string

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone_number": "+250788123456",
      "role": "user",
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid email or password
- `500 Internal Server Error`: Server error

---

### POST /api/auth/logout

Logout user and invalidate JWT token.

**Authentication:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided or invalid token
- `500 Internal Server Error`: Server error

---

### GET /api/auth/profile

Get authenticated user's profile.

**Authentication:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone_number": "+250788123456",
      "role": "user",
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided or invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

### PUT /api/auth/profile

Update authenticated user's profile.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "full_name": "John Smith",
  "email": "johnsmith@example.com",
  "phone_number": "+250788654321"
}
```

**Validation Rules:**
- All fields are optional
- `full_name`: If provided, must be non-empty
- `email`: If provided, must be valid email format
- `phone_number`: If provided, must be non-empty

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 1,
      "full_name": "John Smith",
      "email": "johnsmith@example.com",
      "phone_number": "+250788654321",
      "role": "user",
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: No token provided or invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

## Routes Endpoints

### GET /api/routes

Get all available bus routes.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "departure_city": "Kigali",
      "arrival_city": "Musanze",
      "distance_km": 105.5,
      "estimated_duration_minutes": 120,
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### GET /api/routes/:id

Get a specific route by ID.

**Parameters:**
- `id` (path): Route ID (integer)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "departure_city": "Kigali",
    "arrival_city": "Musanze",
    "distance_km": 105.5,
    "estimated_duration_minutes": 120,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Route not found

---

### GET /api/routes/departure/:departure

Get all routes from a specific departure city.

**Parameters:**
- `departure` (path): Departure city name (string)

**Example:** `GET /api/routes/departure/Kigali`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "departure_city": "Kigali",
      "arrival_city": "Musanze",
      "distance_km": 105.5,
      "estimated_duration_minutes": 120,
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### POST /api/routes

Create a new bus route.

**Authentication:** Required (Bearer Token - Admin only)

**Request Body:**
```json
{
  "departure_city": "Kigali",
  "arrival_city": "Musanze",
  "distance_km": 105.5,
  "estimated_duration_minutes": 120
}
```

**Validation Rules:**
- `departure_city`: Required, non-empty string
- `arrival_city`: Required, non-empty string
- `distance_km`: Optional, must be a positive number
- `estimated_duration_minutes`: Optional, must be a positive integer

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Route created successfully",
  "data": {
    "id": 1,
    "departure_city": "Kigali",
    "arrival_city": "Musanze",
    "distance_km": 105.5,
    "estimated_duration_minutes": 120,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Admin access required
- `500 Internal Server Error`: Server error

---

### PUT /api/routes/:id

Update an existing route.

**Authentication:** Required (Bearer Token - Admin only)

**Parameters:**
- `id` (path): Route ID (integer)

**Request Body:**
```json
{
  "departure_city": "Kigali",
  "arrival_city": "Musanze",
  "distance_km": 110.0,
  "estimated_duration_minutes": 125
}
```

**Validation Rules:** Same as POST /api/routes

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Route updated successfully",
  "data": {
    "id": 1,
    "departure_city": "Kigali",
    "arrival_city": "Musanze",
    "distance_km": 110.0,
    "estimated_duration_minutes": 125,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Admin access required
- `404 Not Found`: Route not found
- `500 Internal Server Error`: Server error

---

### DELETE /api/routes/:id

Delete an existing route.

**Authentication:** Required (Bearer Token - Admin only)

**Parameters:**
- `id` (path): Route ID (integer)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Route deleted successfully",
  "data": {}
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Admin access required
- `404 Not Found`: Route not found
- `500 Internal Server Error`: Server error

---

## Schedules Endpoints

### GET /api/schedules

Get all available bus schedules.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bus_id": 1,
      "route_id": 1,
      "departure_time": "08:00",
      "arrival_time": "10:00",
      "price": 5000.0,
      "available_days": "Monday,Tuesday,Wednesday",
      "is_active": true,
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### GET /api/schedules/:id

Get a specific schedule by ID.

**Parameters:**
- `id` (path): Schedule ID (integer)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bus_id": 1,
    "route_id": 1,
    "departure_time": "08:00",
    "arrival_time": "10:00",
    "price": 5000.0,
    "available_days": "Monday,Tuesday,Wednesday",
    "is_active": true,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Schedule not found

---

### GET /api/schedules/route/:routeId

Get all schedules for a specific route.

**Parameters:**
- `routeId` (path): Route ID (integer)

**Example:** `GET /api/schedules/route/1`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bus_id": 1,
      "route_id": 1,
      "departure_time": "08:00",
      "arrival_time": "10:00",
      "price": 5000.0,
      "available_days": "Monday,Tuesday,Wednesday",
      "is_active": true,
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### GET /api/schedules/:scheduleId/available-seats

Get available seats for a specific schedule.

**Parameters:**
- `scheduleId` (path): Schedule ID (integer)

**Example:** `GET /api/schedules/1/available-seats`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "available_seats": 45,
    "total_seats": 50
  }
}
```

**Error Responses:**
- `404 Not Found`: Schedule not found

---

### POST /api/schedules

Create a new bus schedule.

**Authentication:** Required (Bearer Token - Admin only)

**Request Body:**
```json
{
  "bus_id": 1,
  "route_id": 1,
  "departure_time": "08:00",
  "arrival_time": "10:00",
  "price": 5000.0,
  "available_days": "Monday,Tuesday,Wednesday",
  "is_active": true
}
```

**Validation Rules:**
- `bus_id`: Required, must be a positive integer
- `route_id`: Required, must be a positive integer
- `departure_time`: Required, format: HH:MM (24-hour format)
- `arrival_time`: Required, format: HH:MM (24-hour format)
- `price`: Required, must be a positive number
- `available_days`: Optional, string
- `is_active`: Optional, boolean

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Schedule created successfully",
  "data": {
    "id": 1,
    "bus_id": 1,
    "route_id": 1,
    "departure_time": "08:00",
    "arrival_time": "10:00",
    "price": 5000.0,
    "available_days": "Monday,Tuesday,Wednesday",
    "is_active": true,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Admin access required
- `500 Internal Server Error`: Server error

---

### PUT /api/schedules/:id

Update an existing schedule.

**Authentication:** Required (Bearer Token - Admin only)

**Parameters:**
- `id` (path): Schedule ID (integer)

**Request Body:**
```json
{
  "departure_time": "09:00",
  "arrival_time": "11:00",
  "price": 5500.0,
  "is_active": false
}
```

**Validation Rules:**
- All fields are optional
- `departure_time`: If provided, format: HH:MM (24-hour format)
- `arrival_time`: If provided, format: HH:MM (24-hour format)
- `price`: If provided, must be a positive number
- `is_active`: If provided, must be boolean

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedule updated successfully",
  "data": {
    "id": 1,
    "bus_id": 1,
    "route_id": 1,
    "departure_time": "09:00",
    "arrival_time": "11:00",
    "price": 5500.0,
    "available_days": "Monday,Tuesday,Wednesday",
    "is_active": false,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Admin access required
- `404 Not Found`: Schedule not found
- `500 Internal Server Error`: Server error

---

### DELETE /api/schedules/:id

Delete an existing schedule.

**Authentication:** Required (Bearer Token - Admin only)

**Parameters:**
- `id` (path): Schedule ID (integer)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedule deleted successfully",
  "data": {}
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided or invalid token
- `403 Forbidden`: Admin access required
- `404 Not Found`: Schedule not found
- `500 Internal Server Error`: Server error

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation error or bad request
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions (Admin required)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data
  }
}
```

## Interactive API Documentation

The API includes interactive Swagger documentation available at:

```
http://localhost:3000/api-docs
```

Visit this URL in your browser to explore and test the API endpoints interactively.

## Example cURL Commands

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+250788123456",
    "password": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Get Profile (with token)
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Routes
```bash
curl http://localhost:3000/api/routes
```

### Create Route (Admin only)
```bash
curl -X POST http://localhost:3000/api/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "departure_city": "Kigali",
    "arrival_city": "Musanze",
    "distance_km": 105.5,
    "estimated_duration_minutes": 120
  }'
```

### Get Schedules by Route
```bash
curl http://localhost:3000/api/schedules/route/1
```

---

**Last Updated:** 2024
