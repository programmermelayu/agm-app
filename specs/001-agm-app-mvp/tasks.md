# Tasks: Muktamar AGM Management MVP

**Feature**: Muktamar Annual General Meeting (AGM) Management MVP  
**Input**: Design documents from `specs/001-agm-app-mvp/`  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.md, contracts/ui-components.md  
**Total Tasks**: 72 | Setup: 8 | Foundational: 13 | US4 (Auth): 14 | US1 (AGM): 16 | US2 (Invitations): 14 | US3 (Attendance): 7

**Tests**: NOT included in this task list (focus on implementation first). Add test tasks after initial implementation if needed.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US4=Auth, US1=AGM, US2=Invitations, US3=Attendance)
- File paths shown are for monorepo structure (backend/src, frontend/src)

---

## Phase 1: Setup & Project Initialization

**Purpose**: Project structure, dependencies, and development environment

**Estimated**: 1-2 hours

- [ ] T001 Create monorepo project structure: `/backend`, `/frontend`, `/specs`, root `package.json` as workspace
- [ ] T002 [P] Initialize backend: `npm init` in `backend/` with Express.js 4.x, Node 18+ target
- [ ] T003 [P] Initialize frontend: `npm init` in `frontend/` with React 18+, TypeScript, Vite/Create React App
- [ ] T004 [P] Install backend dependencies in `backend/package.json`: express, passport, pg, knex, bull, socket.io, jsonwebtoken, bcrypt, joi, dotenv, cors
- [ ] T005 [P] Install frontend dependencies in `frontend/package.json`: react, react-router-dom, tanstack/react-query, socket.io-client, axios, tailwindcss or material-ui
- [ ] T006 [P] Configure ESLint in `backend/.eslintrc.json` and `frontend/.eslintrc.json`
- [ ] T007 [P] Configure Prettier in `backend/.prettierrc` and `frontend/.prettierrc`
- [ ] T008 [P] Create `.env.example` files in `backend/` and `frontend/` with sample configuration values

**Checkpoint**: Project structure initialized with all dependencies installed

---

## Phase 2: Foundational Infrastructure

**Purpose**: Core infrastructure that MUST be complete before ANY user story begins

**⚠️ CRITICAL**: No user story work can begin until this phase is 100% complete

**Estimated**: 3-4 hours

### Backend Foundation

- [ ] T009 Create database configuration in `backend/src/config/database.js`: PostgreSQL connection setup, Knex.js initialization, connection pooling (10-20 connections)
- [ ] T010 [P] Setup Knex.js migrations framework: Create `backend/db/migrations/` directory and configure migration scripts in `backend/package.json`
- [ ] T011 [P] Create authentication framework in `backend/src/middleware/auth.js`: JWT verification, requireAuth middleware, error handling
- [ ] T012 [P] Create validation framework in `backend/src/middleware/validate.js`: Joi schema validation, error response formatting
- [ ] T013 [P] Create error handling middleware in `backend/src/middleware/errorHandler.js`: Catch-all error handler, standardized error response format
- [ ] T014 [P] Create logger setup in `backend/src/config/logger.js`: Console/file logging with Winston or Pino
- [ ] T015 [P] Setup Express app structure in `backend/src/app.js`: CORS configuration, middleware stack, route mounting, error handling
- [ ] T016 Create `backend/src/routes/index.js` as central route registry

### Frontend Foundation

- [ ] T017 [P] Create API client setup in `frontend/src/services/apiClient.ts`: Axios instance, request/response interceptors, token management
- [ ] T018 [P] Create authentication context in `frontend/src/context/AuthContext.tsx`: useAuth hook, login/register/logout functions, token persistence
- [ ] T019 [P] Setup routing structure in `frontend/src/App.tsx`: React Router config, public vs. protected routes, route guards
- [ ] T020 [P] Create shared UI components in `frontend/src/components/common/`: Button, Input, Card, Badge, Modal, Toast notification components
- [ ] T021 [P] Configure Tailwind CSS in `frontend/tailwind.config.js`: Mobile-first breakpoints (sm, md, lg, xl), color palette

### Environment & Database

- [ ] T022 Create `.env.example` variables documentation (DATABASE_URL, JWT_SECRET, SENDGRID_API_KEY, etc.)

**Checkpoint**: Foundation complete - all user story implementation can now begin in parallel or sequentially

---

## Phase 3: User Story 4 - User Authentication & Account Access (Priority: P1) 🎯

**Goal**: Users can create accounts and securely log in. Foundation for all other features.

**Independent Test**: 
- Create account with valid email/password → verify account created and auto-login
- Log out → verify token cleared and redirected to login
- Log in with existing account → verify token returned and dashboard loads

**Acceptance Criteria**: FR-001, FR-002, SC-001 (5-min account creation + login)

### Database & Models

- [ ] T023 [P] [US4] Create User table migration in `backend/db/migrations/001_create_users_table.js`: id (UUID), email (UNIQUE), password_hash, role, created_at, updated_at, indexes
- [ ] T024 [P] [US4] Create User model in `backend/src/models/User.js`: Database access methods (create, findByEmail, updatePassword, delete)

### Backend Services & Authentication

- [ ] T025 [US4] Create UserService in `backend/src/services/UserService.js`: Registration (validate email format, hash password with bcrypt), login (compare password, generate JWT), logout stub
- [ ] T026 [US4] Create JWT utility in `backend/src/utils/jwt.js`: Generate token (user_id, email, role, 24h expiry), verify token, decode token
- [ ] T027 [P] [US4] Create password validation in `backend/src/utils/validation.js`: Min 8 chars, email regex validation

### Backend Endpoints

- [ ] T028 [US4] Implement POST `/api/v1/auth/register` in `backend/src/routes/auth.js`: Accept email/password, validate, create user, return user + token
- [ ] T029 [US4] Implement POST `/api/v1/auth/login` in `backend/src/routes/auth.js`: Accept email/password, authenticate, return user + token
- [ ] T030 [US4] Implement POST `/api/v1/auth/logout` in `backend/src/routes/auth.js`: Accept token, invalidate (or stub for JWT expiry), return success
- [ ] T031 [US4] Add Passport.js strategy setup in `backend/src/config/passport.js`: JWT extraction and verification

### Frontend Pages & Components

- [ ] T032 [P] [US4] Create RegisterPage component in `frontend/src/pages/RegisterPage.tsx`: Form with email/password/confirm password, validation feedback, submit to `/auth/register`
- [ ] T033 [P] [US4] Create LoginPage component in `frontend/src/pages/LoginPage.tsx`: Form with email/password, submit to `/auth/login`, error display
- [ ] T034 [P] [US4] Create useAuth custom hook in `frontend/src/hooks/useAuth.ts`: Login/register/logout functions, token storage, auth state
- [ ] T035 [US4] Create ProtectedRoute component in `frontend/src/components/ProtectedRoute.tsx`: Check auth status, redirect to login if not authenticated
- [ ] T036 [US4] Update App.tsx routing: Integrate LoginPage, RegisterPage, ProtectedRoute, redirect authenticated users from login to dashboard

**Checkpoint**: User Story 4 (Authentication) is complete and independently testable. Users can create accounts and log in.

---

## Phase 4: User Story 1 - Create & Schedule AGMs (Priority: P1) 🎯

**Goal**: Authenticated users can create new AGMs with date/time/location and view them on a dashboard.

**Independent Test**:
- Create AGM with valid details → verify saved and appears on dashboard
- Edit AGM (draft only) → verify changes persisted
- Delete AGM (draft only) → verify removed from dashboard
- Attempt to edit/delete non-draft AGM → verify blocked

**Acceptance Criteria**: FR-003, FR-004, SC-001 (5-min AGM creation)

**Dependencies**: User Story 4 (Auth) must be complete

### Database & Models

- [ ] T037 [P] [US1] Create AGM table migration in `backend/db/migrations/002_create_agms_table.js`: id (UUID), created_by (FK→users), name, date, time, location, status (ENUM: draft/scheduled/completed), created_at, updated_at, indexes on created_by and date
- [ ] T038 [P] [US1] Create AGM model in `backend/src/models/AGM.js`: findByUser(userId), create, update, delete, findById with creator validation

### Backend Services

- [ ] T039 [US1] Create AGMService in `backend/src/services/AGMService.js`: createAGM (validate date >= today), listUserAGMs (with pagination), getAGMDetail, updateAGM (draft only), deleteAGM (draft only)

### Backend Endpoints

- [ ] T040 [US1] Implement POST `/api/v1/agms` in `backend/src/routes/agms.js`: Require auth, accept name/date/time/location, create with status=draft, return created AGM
- [ ] T041 [US1] Implement GET `/api/v1/agms` in `backend/src/routes/agms.js`: Require auth, list user's AGMs with pagination (20 per page), filter by status optional
- [ ] T042 [US1] Implement GET `/api/v1/agms/:agm_id` in `backend/src/routes/agms.js`: Require auth, return AGM detail (verify user owns AGM)
- [ ] T043 [US1] Implement PATCH `/api/v1/agms/:agm_id` in `backend/src/routes/agms.js`: Require auth, allow edit only if draft status, update fields
- [ ] T044 [US1] Implement DELETE `/api/v1/agms/:agm_id` in `backend/src/routes/agms.js`: Require auth, allow delete only if draft status

### Frontend Pages & Components

- [ ] T045 [P] [US1] Create DashboardPage in `frontend/src/pages/DashboardPage.tsx`: Display list of user's AGMs, filter/sort controls, create AGM button
- [ ] T046 [P] [US1] Create AGMCard component in `frontend/src/components/AGMCard.tsx`: Display AGM summary (name, date, time, location, status), click → navigate to detail
- [ ] T047 [P] [US1] Create AGMList component in `frontend/src/pages/DashboardPage.tsx`: Grid/list view, pagination, search by name
- [ ] T048 [P] [US1] Create CreateAGMPage in `frontend/src/pages/CreateAGMPage.tsx`: Form for AGM creation
- [ ] T049 [P] [US1] Create AGMForm component in `frontend/src/components/AGMForm.tsx`: Reusable form with fields: name, date picker, time picker, location, validation feedback
- [ ] T050 [US1] Create AGMDetailPage in `frontend/src/pages/AGMDetailPage.tsx`: Tab navigation (Details, Invitations, Attendance), display AGM info
- [ ] T051 [US1] Create useAGM custom hook in `frontend/src/hooks/useAGM.ts`: Fetch AGMs, create/update/delete AGM functions, error handling

**Checkpoint**: User Story 1 (AGM Management) is complete. Users can create, view, edit, and delete AGMs independently.

---

## Phase 5: User Story 2 - Send Invitations & Track RSVPs (Priority: P1) 🎯

**Goal**: Admins can invite attendees via email and track RSVP responses in real-time.

**Independent Test**:
- Create invitation for valid email → verify email sent (or queued)
- Click RSVP link in email → verify response recorded and appears in admin dashboard
- View RSVP summary → verify accurate count by status (attending/not_attending/maybe/pending)
- Resend invitation to pending attendee → verify duplicate prevention

**Acceptance Criteria**: FR-005, FR-006, FR-007, FR-008, FR-013, FR-014, SC-002 (2-min email delivery), SC-003 (80% RSVP rate)

**Dependencies**: User Story 1 (AGM Management) must be complete

### Database & Models

- [ ] T052 [P] [US2] Create Invitation table migration in `backend/db/migrations/003_create_invitations_table.js`: id (UUID), agm_id (FK→agms), attendee_email, rsvp_status (ENUM), rsvp_token (UNIQUE), created_at, responded_at, indexes on agm_id and rsvp_token
- [ ] T053 [P] [US2] Create Invitation model in `backend/src/models/Invitation.js`: create, findByToken, updateRSVPStatus, findByAGM, countByStatus

### Backend Services & Email

- [ ] T054 [US2] Create Bull job queue setup in `backend/src/config/queue.js`: Redis connection, email job queue with retry logic (3 retries, exponential backoff)
- [ ] T055 [US2] Create email service in `backend/src/services/EmailService.js`: Send invitation email with RSVP link, SendGrid or Nodemailer integration, error logging
- [ ] T056 [US2] Create InvitationService in `backend/src/services/InvitationService.js`: createInvitations (batch), validateEmail, generateRSVPToken (secure random), updateRSVPStatus, getRSVPSummary
- [ ] T057 [P] [US2] Create token generation utility in `backend/src/utils/token.js`: Generate 64-char random token or JWT with agm_id + email

### Backend Endpoints

- [ ] T058 [US2] Implement POST `/api/v1/agms/:agm_id/invitations` in `backend/src/routes/invitations.js`: Accept array of emails, validate, create invitation records, queue emails, return success count
- [ ] T059 [US2] Implement GET `/api/v1/agms/:agm_id/invitations` in `backend/src/routes/invitations.js`: Require auth, list invitations with pagination, filter by status optional
- [ ] T060 [US2] Implement POST `/api/v1/rsvp/:rsvp_token` (PUBLIC) in `backend/src/routes/invitations.js`: Accept rsvp_status, validate token, update invitation, return confirmation
- [ ] T061 [US2] Setup SendGrid webhook in `backend/src/routes/webhooks.js`: Handle bounce/soft bounce events, update invitation status, notify admin

### Frontend Components

- [ ] T062 [P] [US2] Create SendInvitationForm in `frontend/src/components/SendInvitationForm.tsx`: Textarea for emails or add-more pattern, validation, submit
- [ ] T063 [P] [US2] Create RSVPSummary widget in `frontend/src/components/RSVPSummary.tsx`: Pie/bar chart showing attending/not_attending/maybe/pending counts and percentages
- [ ] T064 [P] [US2] Create InvitationList component in `frontend/src/components/InvitationList.tsx`: Table with email, status, response date, resend action, sortable/filterable
- [ ] T065 [US2] Create InvitationsTab in `frontend/src/components/AGMDetailPage/InvitationsTab.tsx`: Combine SendInvitationForm + RSVPSummary + InvitationList

**Checkpoint**: User Story 2 (Invitations & RSVPs) is complete. Admins can invite attendees and track responses. Email delivery functional.

---

## Phase 6: User Story 3 - Track Attendance During AGM (Priority: P1) 🎯

**Goal**: During an AGM, admins can mark attendees as present/absent and view real-time attendance statistics.

**Independent Test**:
- Mark attendee as present → verify recorded with timestamp
- View attendance summary → verify accurate count and percentage
- Real-time update (if Socket.io enabled) → verify other admin sees update immediately
- Attempt to mark attendance before AGM time → verify allowed (defer time restriction to v2)

**Acceptance Criteria**: FR-009, FR-010, FR-011, SC-004 (10 attendees/min marking), SC-005 (sub-3s page loads)

**Dependencies**: User Story 2 (Invitations) must be complete

### Database & Models

- [ ] T066 [P] [US3] Create AttendanceRecord table migration in `backend/db/migrations/004_create_attendance_records_table.js`: id (UUID), agm_id (FK), invitation_id (FK), marked_present (BOOLEAN), timestamp (DEFAULT CURRENT_TIMESTAMP), UNIQUE index on (agm_id, invitation_id)
- [ ] T067 [P] [US3] Create AttendanceRecord model in `backend/src/models/AttendanceRecord.js`: create, findByAGM, updateStatus

### Backend Services & Real-time

- [ ] T068 [US3] Create AttendanceService in `backend/src/services/AttendanceService.js`: markAttendance (create or update record), getAttendanceSummary (count present/absent, calculate percentage)
- [ ] T069 [US3] Setup Socket.io in `backend/src/config/socket.js`: Namespace setup for AGM rooms, broadcast attendance:marked event to connected admins

### Backend Endpoints

- [ ] T070 [US3] Implement POST `/api/v1/agms/:agm_id/attendance` in `backend/src/routes/attendance.js`: Accept invitation_id + marked_present, create/update record, broadcast via Socket.io
- [ ] T071 [US3] Implement GET `/api/v1/agms/:agm_id/attendance` in `backend/src/routes/attendance.js`: Return attendance summary (counts, percentage) + list of all records

### Frontend Components & Real-time

- [ ] T072 [US3] Create Socket.io client setup in `frontend/src/services/socketClient.ts`: Join AGM room on detail page load, listen for attendance:marked events, update local state

**Checkpoint**: User Story 3 (Attendance Tracking) is complete. Real-time attendance marking functional.

---

## ✅ Implementation Complete

All 4 core P1 user stories fully implemented:
1. ✅ User Story 4: Authentication & Account Access
2. ✅ User Story 1: Create & Schedule AGMs
3. ✅ User Story 2: Send Invitations & Track RSVPs
4. ✅ User Story 3: Track Attendance During AGMs

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements, hardening, and optimization across all features

**Estimated**: 2-3 hours

- [ ] T073 [P] Add rate limiting middleware in `backend/src/middleware/rateLimit.js`: 1000 req/15min per user, 10 req/15min for auth endpoints
- [ ] T074 [P] Setup logging for all API endpoints in `backend/src/middleware/requestLogger.js`: Log method, path, response status, duration
- [ ] T075 [P] Add input sanitization in `backend/src/middleware/sanitize.js`: HTML escape, SQL injection prevention
- [ ] T076 [P] Configure CORS properly in `backend/src/app.js`: Restrict to frontend origin in production
- [ ] T077 [P] Add response compression in `backend/src/app.js`: gzip compression for JSON responses
- [ ] T078 Setup performance monitoring in `backend/src/config/monitoring.js`: Log slow queries (>100ms)
- [ ] T079 Create README.md in project root with setup instructions, tech stack overview
- [ ] T080 Create CONTRIBUTING.md with code standards, PR process
- [ ] T081 Setup GitHub Actions CI/CD workflow in `.github/workflows/test.yml`: Run linting, tests on PR
- [ ] T082 [P] Create Swagger/OpenAPI docs in `backend/docs/openapi.yaml`: Document all API endpoints (optional but recommended)
- [ ] T083 Validate quickstart.md works end-to-end: Run setup, create account, create AGM, send invitation, mark attendance
- [ ] T084 Performance testing: Verify sub-3-second page loads, email delivery within 2 minutes
- [ ] T085 Security review: HTTPS enforced, password hashing verified, JWT expiry set, SQL injection prevention

**Checkpoint**: All polish and optimization complete. MVP ready for user testing or deployment.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
  - Parallel: T002-T008 can run together
- **Phase 2 (Foundation)**: Depends on Phase 1 complete
  - Parallel: T009-T022 can run together (backend and frontend in parallel)
- **Phase 3 (User Story 4 - Auth)**: Depends on Phase 2 complete
  - Parallel: T023-T024 (models), T032-T034 (frontend hooks)
  - Sequential: Models → Services → Endpoints → Frontend pages
- **Phase 4 (User Story 1 - AGM)**: Depends on Phase 3 + Phase 2 complete
  - Parallel: T037-T038 (models), T045-T049 (frontend components)
  - Sequential: Models → Services → Endpoints → Pages
- **Phase 5 (User Story 2 - Invitations)**: Depends on Phase 4 complete
  - Parallel: T052-T053 (models), T062-T063 (components)
  - Sequential: Models → Services → Queue/Email → Endpoints → Components
- **Phase 6 (User Story 3 - Attendance)**: Depends on Phase 5 complete
  - Parallel: T066-T067 (models), T072 (Socket.io)
  - Sequential: Models → Services → Endpoints → Socket
- **Phase 7 (Polish)**: Depends on all user stories complete
  - Parallel: All tasks marked [P]

### Dependency Graph

```
Phase 1 (Setup: 1-2h)
    ↓
Phase 2 (Foundation: 3-4h) [BLOCKS all user stories]
    ├→ Phase 3 (US4 Auth: 3h)
    │   ├→ Phase 4 (US1 AGM: 4h)
    │   │   ├→ Phase 5 (US2 Invitations: 4h)
    │   │   │   └→ Phase 6 (US3 Attendance: 2h)
    │   │   └→ Phase 5 & 6 can run in parallel if staffed
    │   └→ Phase 4, 5, 6 can run in parallel after Phase 3
    └→ Phase 3, 4, 5, 6 can run in parallel if staffed

Phase 7 (Polish: 2-3h) [Depends on desired stories complete]
```

### User Story Dependencies

- **User Story 4 (Auth)**: No dependencies on other stories - can start after Phase 2
- **User Story 1 (AGM)**: Depends on US4 - requires authenticated user context
- **User Story 2 (Invitations)**: Depends on US1 - requires AGM existence
- **User Story 3 (Attendance)**: Depends on US2 - requires invitation records to mark

**Key insight**: User stories build on each other but each is independently testable once complete.

### Parallel Opportunities

**Phase 1 (Setup)**: All [P] tasks can run in parallel
- Multiple team members: npm install in backend AND frontend simultaneously

**Phase 2 (Foundation)**: Backend [P] and Frontend [P] tasks can run in parallel
- Dev A: Backend config (T009-T016)
- Dev B: Frontend setup (T017-T021)

**Phase 3 (US4 Auth)**: Limited parallelization
- Model creation [P]: T023 + T024
- Frontend hooks [P]: T032-T034 can code in parallel
- BUT: Services/Endpoints must wait for models

**Phase 4+ (US1-3)**: Maximum parallelization opportunity IF staffed with 3+ developers
- Dev A: US1 (AGM) - 4 hours
- Dev B: US2 (Invitations) - 4 hours (after US1 models complete)
- Dev C: US3 (Attendance) - 2 hours (after US2 models complete)
- Parallel within each story: Models [P], Frontend components [P], etc.

**Phase 7 (Polish)**: All [P] tasks can run in parallel
- Security, logging, monitoring, documentation can work in parallel

---

## MVP Scope & Delivery Strategy

### MVP First: User Story 4 Only (MINIMUM VIABLE)

**Tasks to complete**: T001-T036  
**Duration**: ~8 hours (1 developer, 1 day)  
**Deliverable**: Users can register and log in

To deliver a meaningful MVP, recommend **at least User Stories 4 + 1**:
- T001-T051 (Setup + Foundation + Auth + AGM)
- Duration: ~12 hours (1.5 days)
- Deliverable: Users can create AGMs and see them on a dashboard

### Incremental Delivery Approach (RECOMMENDED)

1. **Week 1**: Phase 1 + Phase 2 + Phase 3 (US4 Auth)
   - Goal: Users can create accounts and log in
   - Deliverable: Working login system
   - Duration: ~8 hours

2. **Week 1-2**: Phase 4 (US1 AGM Management)
   - Goal: Users can create AGMs
   - Deliverable: Dashboard showing user's AGMs
   - Duration: ~4 hours
   - **MVP Feature Stop Here** ✅ - Can deploy if needed

3. **Week 2**: Phase 5 (US2 Invitations & RSVPs)
   - Goal: Admins can invite attendees and track responses
   - Deliverable: Email invitations working, RSVP tracking
   - Duration: ~4 hours

4. **Week 2-3**: Phase 6 (US3 Attendance Tracking)
   - Goal: Real-time attendance marking during AGM
   - Deliverable: Complete AGM management system
   - Duration: ~2 hours

5. **Week 3**: Phase 7 (Polish, Hardening, Docs)
   - Goal: Production-ready, documented, tested
   - Deliverable: Fully polished MVP
   - Duration: ~3 hours

**Total estimated**: 21 hours (2.5-3 developer-weeks)

---

## Notes & Best Practices

- **[P] = Parallelizable**: Can safely run in parallel if different files and no blocking dependencies
- **[Story] = Traceability**: Maps each task to specific user story for impact analysis
- **Task IDs Sequential**: T001-T085 in execution order (not strictly sequential, but grouped logically)
- **File Paths Exact**: Every task includes exact path where code goes - copy/paste ready
- **Verify at Checkpoints**: After each user story phase completes, verify story works independently
- **Commit Frequently**: After each task or logical group (e.g., all models for a story)
- **Stop at Checkpoint**: Can deploy after any checkpoint without waiting for next story
- **Avoid Large Commits**: Keep commits focused (one task or tightly related group)

---

## Task Status Tracking

Use this checklist to track progress:

```
Phase 1 Setup:           [ ] T001-T008  (0/8 complete)
Phase 2 Foundation:      [ ] T009-T022  (0/14 complete)
Phase 3 US4 Auth:        [ ] T023-T036  (0/14 complete)
Phase 4 US1 AGM:         [ ] T037-T051  (0/15 complete)
Phase 5 US2 Invitations: [ ] T052-T065  (0/14 complete)
Phase 6 US3 Attendance:  [ ] T066-T072  (0/7 complete)
Phase 7 Polish:          [ ] T073-T085  (0/13 complete)

TOTAL: 0/85 tasks complete
```

Copy this template and update daily as tasks complete.

