# Data Model: Muktamar AGM Management MVP

**Phase**: 1 - Design & Contracts  
**Date**: 2026-04-07  
**Database**: PostgreSQL 14+  
**ORM/Query Builder**: Knex.js with migrations

---

## Overview

The data model consists of four core entities with relational integrity enforced at the database level:
1. **User** - Application users (administrators and attendees)
2. **AGM** - Annual General Meeting events
3. **Invitation** - Invitation records linking attendees to AGMs with RSVP tracking
4. **AttendanceRecord** - Actual attendance marks during AGMs with timestamps

---

## Entity Diagrams

```
┌─────────┐
│  User   │
├─────────┤
│ id (PK) │
│ email   │◄──────────────┐
│ role    │               │
└─────────┘               │
     │                    │
     │ 1:N                │
     │ (creates)          │
     │                    │
     ▼                    │
┌──────────────┐          │
│     AGM      │          │
├──────────────┤          │
│ id (PK)      │          │
│ name         │          │
│ created_by ──┼──────────┘
│ date         │
│ time         │
│ location     │
│ status       │
│ created_at   │
└──────────────┘
     │
     │ 1:N
     │ (invited_to)
     │
     ▼
┌──────────────────┐
│   Invitation     │
├──────────────────┤
│ id (PK)          │
│ agm_id (FK)      │
│ attendee_email   │
│ rsvp_status      │
│ rsvp_token       │
│ created_at       │
│ responded_at     │
└──────────────────┘

┌──────────────────┐
│ AttendanceRecord │
├──────────────────┤
│ id (PK)          │
│ agm_id (FK)      │
│ invitation_id    │
│ marked_present   │
│ timestamp        │
└──────────────────┘
```

---

## Entity Definitions

### 1. User

Represents application users who create and manage AGMs.

**Table Name**: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL, CHECK(email ~* '^[^@]+@[^@]+\.[^@]+$') | User's email address, validated with regex, unique per system |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt-hashed password (cost: 10) |
| role | ENUM('admin', 'attendee') | NOT NULL, DEFAULT 'admin' | User role; 'admin' can create AGMs, 'attendee' receives invitations |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last profile update timestamp |

**Indexes**:
- `UNIQUE INDEX idx_users_email ON users(email)` - Fast email lookups during login
- `INDEX idx_users_created_at ON users(created_at)` - Support user analytics queries

**Validations**:
- Email format: RFC 5322 simplified regex `^[^@]+@[^@]+\.[^@]+$`
- Password: Minimum 8 characters, must be hashed with bcrypt before storage
- Role: Restricted to enum values

**State Transitions**: None - User record is persistent once created

---

### 2. AGM (Annual General Meeting)

Represents scheduled AGM events created by administrators.

**Table Name**: `agms`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique AGM identifier |
| created_by | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | User who created this AGM |
| name | VARCHAR(255) | NOT NULL | AGM title/name (e.g., "Annual Meeting 2026") |
| date | DATE | NOT NULL, CHECK(date >= CURRENT_DATE) | Scheduled date of AGM |
| time | TIME | NOT NULL | Scheduled time of AGM (e.g., "14:30:00") |
| location | VARCHAR(500) | NOT NULL | AGM location (physical address or video link) |
| status | ENUM('draft', 'scheduled', 'completed') | NOT NULL, DEFAULT 'draft' | AGM lifecycle state |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last modification timestamp |

**Indexes**:
- `INDEX idx_agms_created_by ON agms(created_by)` - Retrieve user's AGMs quickly
- `INDEX idx_agms_date ON agms(date)` - Filter AGMs by date range
- `INDEX idx_agms_status ON agms(status)` - Filter by status for dashboard views

**Validations**:
- date must be >= today (for MVP; past dates could indicate completed AGMs)
- name: 1-255 characters, required
- time: Valid 24-hour format (HH:MM:SS)
- location: 1-500 characters, required
- status: Restricted to enum values

**State Transitions**:
```
draft → scheduled (when invitations sent)
scheduled → completed (after AGM date passes or admin marks complete)
draft ↔ scheduled (editable before invitations sent)
completed → read-only
```

**Row-Level Security** (PostgreSQL RLS):
- Users can only view/edit AGMs where `created_by = auth.user_id`

---

### 3. Invitation

Represents invitation records for attendees, tracking RSVP status per attendee.

**Table Name**: `invitations`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique invitation identifier |
| agm_id | UUID | NOT NULL, FOREIGN KEY → agms(id) ON DELETE CASCADE | Reference to AGM |
| attendee_email | VARCHAR(255) | NOT NULL, CHECK(attendee_email ~* '^[^@]+@[^@]+\.[^@]+$') | Email of invited attendee |
| rsvp_status | ENUM('pending', 'attending', 'not_attending', 'maybe') | NOT NULL, DEFAULT 'pending' | RSVP response status |
| rsvp_token | VARCHAR(255) | UNIQUE, NOT NULL | Secure token for anonymous RSVP link (e.g., JWT or random string) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Invitation send timestamp |
| responded_at | TIMESTAMP | DEFAULT NULL | Timestamp when attendee responded to RSVP (NULL if pending) |

**Indexes**:
- `UNIQUE INDEX idx_invitations_agm_email ON invitations(agm_id, attendee_email)` - Prevent duplicate invitations to same attendee
- `INDEX idx_invitations_rsvp_token ON invitations(rsvp_token)` - Fast token validation during RSVP click
- `INDEX idx_invitations_agm_status ON invitations(agm_id, rsvp_status)` - Retrieve RSVP summary stats

**Validations**:
- attendee_email: Valid email format, required
- rsvp_status: Restricted to enum (pending/attending/not_attending/maybe)
- rsvp_token: Unique, non-null, 64+ character random string or JWT
- No duplicate invitations: Composite unique constraint on (agm_id, attendee_email)

**State Transitions**:
```
pending → attending | not_attending | maybe
attending → maybe (attendee can change response)
not_attending → attending | maybe (attendee can change response)
maybe → attending | not_attending (attendee can change response)
(once responded_at is set, further changes update responded_at timestamp)
```

**RSVP Token Generation**:
- Generate secure random token: `crypto.randomBytes(32).toString('hex')` or JWT with agm_id + email
- Token expires: No expiration for MVP (or optional 90-day expiration for enhanced security)
- Used in RSVP link: `https://app.muktamar.com/rsvp/{rsvp_token}`

---

### 4. AttendanceRecord

Represents attendance marks recorded during the AGM.

**Table Name**: `attendance_records`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique attendance record identifier |
| agm_id | UUID | NOT NULL, FOREIGN KEY → agms(id) ON DELETE CASCADE | Reference to AGM |
| invitation_id | UUID | NOT NULL, FOREIGN KEY → invitations(id) ON DELETE CASCADE | Reference to invitation (for linking to attendee) |
| marked_present | BOOLEAN | NOT NULL, DEFAULT true | true = marked present, false = marked absent |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when attendance was recorded |

**Indexes**:
- `INDEX idx_attendance_agm ON attendance_records(agm_id)` - Retrieve attendance summary for AGM
- `INDEX idx_attendance_invitation ON attendance_records(invitation_id)` - Retrieve records per attendee
- `UNIQUE INDEX idx_attendance_agm_invitation ON attendance_records(agm_id, invitation_id)` - Prevent duplicate attendance marks

**Validations**:
- marked_present: Boolean (true/false)
- timestamp: Automatically set to current time; cannot be manually overridden
- No duplicate attendance records: Composite unique constraint on (agm_id, invitation_id)

**State Transitions**:
```
(initial: no record)
→ marked_present = true (marked present)
→ marked_present = false (marked absent; can update if mistake)
```

**Attendance Statistics Query** (for dashboard):
```sql
SELECT 
  agm_id,
  COUNT(*) as total_invited,
  COUNT(ar.id) as marked,
  SUM(CASE WHEN marked_present THEN 1 ELSE 0 END) as present_count,
  ROUND(100.0 * SUM(CASE WHEN marked_present THEN 1 ELSE 0 END) / COUNT(ar.id), 2) as attendance_percentage
FROM invitations i
LEFT JOIN attendance_records ar ON i.id = ar.invitation_id
WHERE i.agm_id = $1
GROUP BY agm_id;
```

---

## Migration Strategy

**Knex.js Migration Files** (in `db/migrations/`):

1. `001_create_users_table.js` - User table with bcrypt validation
2. `002_create_agms_table.js` - AGM table with foreign key to users
3. `003_create_invitations_table.js` - Invitation table with unique constraint
4. `004_create_attendance_records_table.js` - Attendance table with indexes

Each migration includes:
- Table creation with constraints
- Index creation for query optimization
- Rollback procedures

**Seed Data** (for development testing):
- Sample user (test@example.com)
- Sample AGM
- Sample invitations with various RSVP statuses
- Sample attendance records

---

## Assumptions & Constraints

- **No User Deletion**: User records are soft-deleted or retained for audit trail (design decision pending)
- **Single AGM per Company**: MVP assumes single-user org structure; multi-org support deferred to v2
- **Email as Attendee Identifier**: No separate "attendee" user accounts; identified only by email
- **No Concurrent Attendance Editing**: Only one admin editing attendance at a time (optimistic locking deferred to v2)
- **UTC Timestamps**: All timestamps stored in UTC; client converts to local time
- **Data Retention**: No automatic purging; compliance retention policies TBD in v2

---

## Performance Considerations

- **Connection Pooling**: PostgreSQL `pg` library with pool size 10-20 for 1,000 concurrent users
- **Query Optimization**: 
  - Composite indexes on frequently filtered fields (agm_id, status, created_by)
  - Use `EXPLAIN ANALYZE` for slow queries
  - Leverage window functions for attendance statistics
- **Caching**: Cache AGM list per user; invalidate on update (Redis optional for v2)
- **Pagination**: Limit AGM list queries to 20 items per page with offset-based pagination

