# API Contracts: Muktamar AGM Management MVP

**Version**: 1.0.0  
**Base URL**: `/api/v1`  
**Authentication**: JWT Bearer Token  
**Response Format**: JSON  
**Error Handling**: Standard HTTP status codes with error payload

---

## Authentication

All endpoints except `/auth/register` and `/auth/login` require `Authorization: Bearer {token}` header with valid JWT token.

### JWT Token Structure
```json
{
  "userId": "uuid-string",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1680000000,
  "exp": 1680086400
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

**Common Error Codes**:
- `INVALID_REQUEST` - Malformed request (400)
- `UNAUTHORIZED` - Missing or invalid authentication (401)
- `FORBIDDEN` - Authenticated but not authorized (403)
- `NOT_FOUND` - Resource not found (404)
- `CONFLICT` - Resource already exists (409)
- `VALIDATION_ERROR` - Input validation failed (422)
- `SERVER_ERROR` - Internal server error (500)

---

## Endpoints

### Authentication

#### POST /auth/register

Register a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Validations**:
- email: Valid email format, unique in system
- password: Minimum 8 characters

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- 409 CONFLICT: Email already registered
- 422 VALIDATION_ERROR: Invalid email or weak password

---

#### POST /auth/login

Authenticate user and return JWT token.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- 401 UNAUTHORIZED: Invalid email or password
- 422 VALIDATION_ERROR: Missing required fields

---

#### POST /auth/logout

Invalidate current token (optional - JWT TTL handles expiration).

**Request**: Empty body

**Response** (200 OK):
```json
{
  "message": "Successfully logged out"
}
```

---

### AGM Management

#### POST /agms

Create a new AGM.

**Required Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "name": "Annual General Meeting 2026",
  "date": "2026-06-15",
  "time": "14:30:00",
  "location": "Main Conference Hall"
}
```

**Validations**:
- name: 1-255 characters, required
- date: ISO 8601 format (YYYY-MM-DD), must be >= today
- time: 24-hour format (HH:MM:SS), required
- location: 1-500 characters, required

**Response** (201 Created):
```json
{
  "agm": {
    "id": "uuid",
    "name": "Annual General Meeting 2026",
    "date": "2026-06-15",
    "time": "14:30:00",
    "location": "Main Conference Hall",
    "status": "draft",
    "created_by": "uuid",
    "created_at": "2026-04-07T10:30:00Z",
    "updated_at": "2026-04-07T10:30:00Z"
  }
}
```

**Errors**:
- 401 UNAUTHORIZED: Missing or invalid token
- 422 VALIDATION_ERROR: Invalid input format or past date

---

#### GET /agms

List all AGMs created by the authenticated user.

**Required Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (draft/scheduled/completed)
- `date_from` (optional): Filter AGMs >= this date (ISO 8601)
- `date_to` (optional): Filter AGMs <= this date (ISO 8601)

**Response** (200 OK):
```json
{
  "agms": [
    {
      "id": "uuid",
      "name": "Annual General Meeting 2026",
      "date": "2026-06-15",
      "time": "14:30:00",
      "location": "Main Conference Hall",
      "status": "scheduled",
      "created_at": "2026-04-07T10:30:00Z",
      "invitation_count": 45,
      "rsvp_summary": {
        "pending": 10,
        "attending": 25,
        "not_attending": 5,
        "maybe": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

---

#### GET /agms/{agm_id}

Retrieve details of a specific AGM.

**Required Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "agm": {
    "id": "uuid",
    "name": "Annual General Meeting 2026",
    "date": "2026-06-15",
    "time": "14:30:00",
    "location": "Main Conference Hall",
    "status": "scheduled",
    "created_at": "2026-04-07T10:30:00Z",
    "updated_at": "2026-04-07T10:30:00Z"
  }
}
```

**Errors**:
- 404 NOT_FOUND: AGM does not exist
- 403 FORBIDDEN: User does not own this AGM

---

#### PATCH /agms/{agm_id}

Update AGM details (only allowed in draft status).

**Required Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "name": "Updated AGM Title",
  "date": "2026-06-20",
  "time": "15:00:00",
  "location": "New Location"
}
```

**Response** (200 OK): Updated AGM object (same format as POST /agms)

**Errors**:
- 403 FORBIDDEN: AGM not in draft status or user does not own AGM
- 404 NOT_FOUND: AGM does not exist

---

#### DELETE /agms/{agm_id}

Delete an AGM (only in draft status).

**Required Headers**: `Authorization: Bearer {token}`

**Response** (204 No Content)

**Errors**:
- 403 FORBIDDEN: AGM not in draft status or user does not own AGM
- 404 NOT_FOUND: AGM does not exist

---

### Invitation Management

#### POST /agms/{agm_id}/invitations

Send invitations to attendees for a specific AGM.

**Required Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "attendees": [
    "attendee1@example.com",
    "attendee2@example.com"
  ]
}
```

**Validations**:
- attendees: Array of valid email addresses, min 1
- Email addresses must be unique within request (no duplicates)
- AGM status must be draft or scheduled

**Response** (201 Created):
```json
{
  "invitations": [
    {
      "id": "uuid",
      "agm_id": "uuid",
      "attendee_email": "attendee1@example.com",
      "rsvp_status": "pending",
      "rsvp_token": "secure_token_string",
      "created_at": "2026-04-07T10:30:00Z",
      "responded_at": null
    }
  ],
  "sent_count": 2,
  "failed_count": 0
}
```

**Side Effects**:
- Sends invitation emails asynchronously (via Bull job queue)
- Email contains RSVP link: `https://app.muktamar.com/rsvp/{rsvp_token}`
- Email delivery tracked; failures logged for admin follow-up

**Errors**:
- 404 NOT_FOUND: AGM does not exist
- 403 FORBIDDEN: User does not own AGM
- 422 VALIDATION_ERROR: Invalid email addresses

---

#### GET /agms/{agm_id}/invitations

List invitations for an AGM.

**Required Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `status` (optional): Filter by RSVP status (pending/attending/not_attending/maybe)

**Response** (200 OK):
```json
{
  "invitations": [
    {
      "id": "uuid",
      "attendee_email": "attendee1@example.com",
      "rsvp_status": "attending",
      "responded_at": "2026-04-08T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 45,
    "total_pages": 1
  }
}
```

---

#### POST /rsvp/{rsvp_token}

Respond to RSVP invitation (public endpoint, no authentication required).

**Request**:
```json
{
  "rsvp_status": "attending"
}
```

**Validations**:
- rsvp_status: Must be one of (attending/not_attending/maybe)
- rsvp_token: Must be valid and not expired

**Response** (200 OK):
```json
{
  "message": "Thank you! Your response has been recorded.",
  "rsvp_status": "attending",
  "agm_name": "Annual General Meeting 2026"
}
```

**Errors**:
- 404 NOT_FOUND: Invalid or expired RSVP token
- 422 VALIDATION_ERROR: Invalid RSVP status

---

### Attendance Tracking

#### POST /agms/{agm_id}/attendance

Mark attendee as present or absent during AGM.

**Required Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "invitation_id": "uuid",
  "marked_present": true
}
```

**Validations**:
- invitation_id: Must exist and belong to this AGM
- marked_present: Boolean value required

**Response** (201 Created):
```json
{
  "attendance_record": {
    "id": "uuid",
    "agm_id": "uuid",
    "invitation_id": "uuid",
    "marked_present": true,
    "timestamp": "2026-06-15T14:35:00Z"
  }
}
```

**Real-time Update**:
- WebSocket event emitted to all connected admin users for this AGM
- Event: `attendance:marked`
- Payload: Same as attendance_record object

**Errors**:
- 404 NOT_FOUND: AGM or invitation does not exist
- 403 FORBIDDEN: User does not own AGM
- 409 CONFLICT: Attendance already marked for this invitation

---

#### GET /agms/{agm_id}/attendance

Get attendance summary for an AGM.

**Required Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "attendance_summary": {
    "agm_id": "uuid",
    "total_invited": 45,
    "marked_count": 42,
    "present_count": 38,
    "absent_count": 4,
    "attendance_percentage": 88.37,
    "records": [
      {
        "invitation_id": "uuid",
        "attendee_email": "attendee1@example.com",
        "rsvp_status": "attending",
        "marked_present": true,
        "timestamp": "2026-06-15T14:35:00Z"
      }
    ]
  }
}
```

---

## WebSocket Events

Real-time updates via Socket.io for attendance and RSVP tracking.

### Connection

```javascript
const socket = io('https://api.muktamar.com', {
  auth: {
    token: jwtToken
  }
});

socket.emit('join:agm', { agm_id: 'uuid' });
```

### Events Emitted by Server

#### `attendance:marked`
Fired when attendance is marked for an attendee.
```json
{
  "agm_id": "uuid",
  "attendance_record": {
    "id": "uuid",
    "invitation_id": "uuid",
    "marked_present": true,
    "timestamp": "2026-06-15T14:35:00Z"
  }
}
```

#### `rsvp:updated`
Fired when RSVP status changes.
```json
{
  "agm_id": "uuid",
  "invitation_id": "uuid",
  "attendee_email": "attendee@example.com",
  "rsvp_status": "attending",
  "responded_at": "2026-04-08T15:30:00Z"
}
```

---

## Rate Limiting

- **Standard endpoints**: 1000 requests per 15 minutes per user
- **Authentication endpoints**: 10 requests per 15 minutes per IP
- Response includes `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers

---

## Pagination

List endpoints support offset-based pagination:

**Parameters**:
- `page`: Page number (1-indexed, default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Metadata**:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 250,
    "total_pages": 13
  }
}
```

