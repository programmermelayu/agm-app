# API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All endpoints except `/auth/register`, `/auth/login`, and `/rsvp/:token` require authentication via JWT Bearer token.

Include in header:
```
Authorization: Bearer <token>
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "attendee",
    "token": "jwt_token"
  }
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "attendee",
    "token": "jwt_token"
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "attendee"
  }
}
```

---

## AGM Endpoints

### Create AGM
```http
POST /agms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Annual Meeting 2026",
  "date": "2026-05-15",
  "time": "14:00",
  "location": "Conference Room A"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "created_by": "uuid",
    "name": "Annual Meeting 2026",
    "date": "2026-05-15",
    "time": "14:00",
    "location": "Conference Room A",
    "status": "draft",
    "created_at": "2026-04-07T10:00:00Z",
    "updated_at": "2026-04-07T10:00:00Z"
  }
}
```

### List AGMs
```http
GET /agms?page=1&limit=20&status=draft&sort_by=created_at&sort_order=desc
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (draft, scheduled, completed)
- `date_from` (optional): Filter by date (ISO format)
- `date_to` (optional): Filter by date (ISO format)
- `sort_by` (optional): Sort field (created_at, date, name)
- `sort_order` (optional): Sort order (asc, desc)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "agms": [ ... ],
    "total": 42,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

### Get AGM Details
```http
GET /agms/:agm_id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "created_by": "uuid",
    "name": "Annual Meeting 2026",
    "date": "2026-05-15",
    "time": "14:00",
    "location": "Conference Room A",
    "status": "draft",
    "created_at": "2026-04-07T10:00:00Z",
    "updated_at": "2026-04-07T10:00:00Z"
  }
}
```

### Update AGM
```http
PATCH /agms/:agm_id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Meeting Name",
  "date": "2026-05-20",
  "time": "15:00",
  "location": "Room B"
}
```

**Note:** Only draft AGMs can be updated

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

### Delete AGM
```http
DELETE /agms/:agm_id
Authorization: Bearer <token>
```

**Note:** Only draft AGMs can be deleted

**Response (204):** No content

---

## Invitation Endpoints

### Send Single Invitation
```http
POST /agms/:agm_id/invitations
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendee_email": "guest@example.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "agm_id": "uuid",
    "attendee_email": "guest@example.com",
    "rsvp_status": "pending",
    "rsvp_token": "sha256_token",
    "created_at": "2026-04-07T10:00:00Z",
    "responded_at": null
  }
}
```

### Send Bulk Invitations
```http
POST /agms/:agm_id/invitations/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "emails": [
    "guest1@example.com",
    "guest2@example.com",
    "guest3@example.com"
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "success": [
      { "email": "guest1@example.com", "invitationId": "uuid" }
    ],
    "failed": [
      { "email": "invalid@", "reason": "Invalid email" }
    ]
  }
}
```

### List Invitations
```http
GET /agms/:agm_id/invitations?page=1&limit=50&status=pending
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `status` (optional): Filter by status (pending, attending, not_attending, maybe)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invitations": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### Get RSVP Summary
```http
GET /agms/:agm_id/invitations/summary
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pending": 50,
    "attending": 75,
    "not_attending": 15,
    "maybe": 10,
    "total": 150
  }
}
```

### Submit RSVP (Public - No Auth)
```http
POST /rsvp/:token
Content-Type: application/json

{
  "rsvp_status": "attending"
}
```

**Valid statuses:** `attending`, `not_attending`, `maybe`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "agm_id": "uuid",
    "attendee_email": "guest@example.com",
    "rsvp_status": "attending",
    "responded_at": "2026-04-07T12:00:00Z"
  }
}
```

### Delete Invitation
```http
DELETE /invitations/:id
Authorization: Bearer <token>
```

**Response (204):** No content

---

## Attendance Endpoints

### Check In Single Attendee
```http
POST /agms/:agm_id/attendance
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendee_name": "John Doe",
  "attendee_email": "john@example.com",
  "notes": "VIP attendee"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "agm_id": "uuid",
    "invitation_id": "uuid",
    "attendee_name": "John Doe",
    "attendee_email": "john@example.com",
    "checked_in_at": "2026-05-15T14:05:00Z",
    "checked_in_by": "organizer@example.com",
    "notes": "VIP attendee"
  }
}
```

### Bulk Check-In
```http
POST /agms/:agm_id/attendance/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendees": [
    { "name": "John Doe", "email": "john@example.com" },
    { "name": "Jane Smith", "email": "jane@example.com" }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "success": [
      { "email": "john@example.com", "attendanceId": "uuid" }
    ],
    "failed": [
      { "email": "jane@example.com", "reason": "Already checked in" }
    ]
  }
}
```

### List Attendance
```http
GET /agms/:agm_id/attendance?page=1&limit=50
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attendance": [ ... ],
    "total": 95,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### Get Attendance Statistics
```http
GET /agms/:agm_id/attendance/stats
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_checked_in": 85,
    "total_invited": 150,
    "no_shows": 15,
    "attendance_rate": 57
  }
}
```

### Get RSVP vs Attendance Comparison
```http
GET /agms/:agm_id/attendance/comparison
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rsvp": {
      "pending": 50,
      "attending": 75,
      "not_attending": 15,
      "maybe": 10,
      "total": 150
    },
    "attendance": {
      "total_checked_in": 85,
      "total_invited": 150,
      "no_shows": 15,
      "attendance_rate": 57
    },
    "comparison": {
      "confirmed_attended": 85,
      "confirmed_no_show": 15,
      "uninvited_attended": 0
    }
  }
}
```

### Undo Check-In
```http
DELETE /attendance/:id
Authorization: Bearer <token>
```

**Response (204):** No content

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 500 | Server Error |

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Current page (default: 1)
- `limit`: Items per page (default: varies by endpoint)

**Response includes:**
- `total`: Total number of items
- `page`: Current page
- `limit`: Items per page
- `totalPages` or `total_pages`: Total number of pages

---

## Sorting

List endpoints support sorting via query parameters:

- `sort_by`: Field to sort by
- `sort_order`: `asc` or `desc`

Example: `GET /agms?sort_by=created_at&sort_order=desc`

---

## Filtering

Most list endpoints support filtering:

Example: `GET /agms?status=draft&date_from=2026-05-01&date_to=2026-05-31`

---

## Examples

### Create AGM and Send Invitations

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}' \
  | jq -r '.data.token')

# 2. Create AGM
AGM_ID=$(curl -X POST http://localhost:5000/api/v1/agms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 Board Meeting",
    "date": "2026-05-15",
    "time": "14:00",
    "location": "Board Room"
  }' | jq -r '.data.id')

# 3. Send invitations
curl -X POST http://localhost:5000/api/v1/agms/$AGM_ID/invitations/batch \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emails": ["guest1@example.com", "guest2@example.com"]
  }'

# 4. Get RSVP summary
curl -X GET http://localhost:5000/api/v1/agms/$AGM_ID/invitations/summary \
  -H "Authorization: Bearer $TOKEN"
```
