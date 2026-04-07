# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build the Muktamar MVP web application for Annual General Meeting (AGM) management, focusing on four core user stories: user authentication, AGM creation/management, invitation management with RSVP tracking, and attendance tracking during meetings. The system must support web browsers (desktop and mobile), handle email invitations with unique RSVP links, track real-time attendance, and scale to 1,000 concurrent users.

## Technical Context

**Language/Version**: Node.js 18+ LTS with Express.js 4.x  
**Primary Dependencies**: 
- Backend: Express.js, Passport.js (JWT auth), Bull (job queue), Socket.io (real-time), Joi/Zod (validation), pg/Knex.js (database)
- Frontend: React 18+ with TypeScript, React Router, TanStack Query, Socket.io client
- Email: SendGrid or Nodemailer with Bull for reliable delivery
- Testing: Jest (backend), Vitest + React Testing Library (frontend)

**Storage**: PostgreSQL 14+ with Knex.js migrations and connection pooling  
**Testing**: Jest for unit/integration tests, React Testing Library for component tests, e2e testing with Playwright or Cypress  
**Target Platform**: Web browsers (desktop and mobile via responsive design with React + Tailwind/Material-UI)
**Project Type**: Full-stack web application (MERN-like stack: MongoDB-free, PostgreSQL alternative)  
**Performance Goals**: 
- Sub-3-second page load times during normal operation (SC-005) → Express response <50ms + React bundle <3s
- Email delivery within 2 minutes of admin request (SC-002) → SendGrid SLA + Bull job queue with retries
- Attendance UI supports marking 10 attendees per minute (SC-004) → Socket.io real-time updates + React re-rendering
- Support 1,000 concurrent users without degradation (SC-008) → Node.js clustering (PM2) + PostgreSQL connection pooling
- User task completion in under 5 minutes (account creation + first AGM creation) (SC-001) → Streamlined UI + fast backend

**Constraints**:
- Secure password hashing (bcrypt via Passport.js) and JWT-based authentication (FR-001, FR-002)
- Email validation with regex/library before sending (FR-013)
- SendGrid bounce/soft bounce handling with graceful user notification (FR-014)
- Real-time RSVP status via Socket.io bidirectional updates (FR-007, FR-008)
- Timestamp recording via database DEFAULT CURRENT_TIMESTAMP (FR-010)
- Data encryption at rest (PostgreSQL password + TLS connections) (FR-012, SC-007)
- HTTPS in production for transit encryption

**Scale/Scope**: MVP with 4 core user stories, 14 functional requirements, 4 data entities (User, AGM, Invitation, Attendance Record), estimated 3-4 weeks for full implementation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Phase 0-1 Gate Evaluation** (Post-Design Review):

### Design Alignment with Specification Requirements

✅ **User Scenarios**: All 4 P1 user stories have corresponding API endpoints and UI components  
✅ **Functional Requirements**: Each FR-001 through FR-014 has implementation path defined in data-model and API contracts  
✅ **Success Criteria**: 
- SC-001 (5-min task completion): Simple, streamlined forms designed  
- SC-002 (2-min email delivery): SendGrid + Bull job queue with retry logic  
- SC-003 (80% RSVP rate): RSVP UI simplified to single-click responses  
- SC-004 (10 attendees/min): Batch attendance marking with real-time Socket.io updates  
- SC-005 (sub-3s page loads): React + Express architecture, database query optimization planned  
- SC-006 (UX satisfaction): Component contracts define intuitive, clean UI  
- SC-007 (data security): Bcrypt passwords, HTTPS, PostgreSQL encryption, JWT tokens  
- SC-008 (1000 concurrent users): Node.js clustering, PostgreSQL connection pooling designed

### Technology Stack Alignment

✅ **Code Quality**: TypeScript in frontend, ESLint configuration required; Express.js structure enforces separation of concerns  
✅ **Testing Standards**: Jest framework selected; testing paths defined in quickstart.md  
✅ **UX Consistency**: Component contract document (ui-components.md) defines:
- Responsive breakpoints (mobile-first from 320px)
- Accessibility (WCAG 2.1 AA compliance)
- Consistent component library (buttons, badges, forms)
- State machine for each component (loading, error, success)

✅ **Performance Requirements**:
- Indexed database queries for O(1) lookups on users, AGMs, invitations
- Response time targets: <50ms for Express endpoints
- Socket.io real-time updates for attendance/RSVP
- Connection pooling for 1,000 concurrent users

### Potential Gaps (To Address in Phase 2 - Implementation)

⏳ **Code Quality Enforcement**:
- ESLint configuration not yet created
- Pre-commit hooks (lint, format) TBD
- Code review guidelines TBD

⏳ **Testing Coverage Standards**:
- Minimum coverage % targets not specified (recommend 80%+ for MVP)
- E2E test strategy (Playwright/Cypress) deferred to phase 2
- Performance profiling/load testing deferred to phase 2

⏳ **Error Handling Strategy**:
- Validation error messages finalized in API implementation
- Rate limiting response codes not yet tested
- Email failure notification flow needs implementation detail

**GATE RESULT**: ✅ **CONDITIONAL PASS** 

**Rationale**: 
- Specification and design align well on functional and non-functional requirements
- Technology choices (Node.js + PostgreSQL + React + Socket.io) support all performance targets
- Architectural decisions (monorepo, REST + WebSocket, real-time updates) enable MVP MVP timelines
- Missing items (linting, coverage targets, E2E testing) are reasonable Phase 2 tasks

**Proceed to Implementation** with the following pre-flight checklist:
1. Constitution to be finalized with explicit code quality, testing, and UX standards (in parallel with implementation)
2. CI/CD pipeline setup (.github/workflows) in parallel with feature development
3. Load testing scheduled for week before release candidate

## Project Structure

### Documentation (this feature)

```text
specs/001-agm-app-mvp/
├── spec.md              # Feature specification with user stories and requirements
├── plan.md              # This file (implementation plan with technical decisions)
├── research.md          # Technology research and decisions (Phase 0 output)
├── data-model.md        # Database schema and entity definitions (Phase 1 output)
├── quickstart.md        # Developer onboarding guide (Phase 1 output)
├── contracts/           # Interface contracts (Phase 1 output)
│   ├── api.md          # REST API endpoint specifications
│   └── ui-components.md # React component specifications
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Implementation tasks (Phase 2 output - /speckit.tasks command)
```

### Source Code Repository Structure

**Selected: Option 2 - Full-stack Web Application** (Frontend + Backend separation)

```text
agm-app/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── routes/            # Express route handlers
│   │   │   ├── auth.js        # Authentication endpoints
│   │   │   ├── agms.js        # AGM CRUD endpoints
│   │   │   ├── invitations.js # Invitation endpoints
│   │   │   └── attendance.js  # Attendance tracking endpoints
│   │   ├── controllers/        # Business logic layer
│   │   ├── models/            # Database access layer (Knex.js queries)
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── services/          # External services (email, JWT, Socket.io)
│   │   └── app.js             # Express app initialization
│   ├── db/
│   │   ├── migrations/        # Knex.js migration files
│   │   └── seeds/             # Development seed data
│   ├── tests/                 # Jest unit & integration tests
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/                   # React/TypeScript web application
│   ├── src/
│   │   ├── pages/             # React page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AGMDetailPage.tsx
│   │   │   └── CreateAGMPage.tsx
│   │   ├── components/        # Reusable UI components
│   │   │   ├── AGMCard.tsx
│   │   │   ├── InvitationList.tsx
│   │   │   ├── AttendanceForm.tsx
│   │   │   └── common/        # Form inputs, buttons, modals
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useAGM.ts
│   │   │   └── useSocket.ts
│   │   ├── services/          # API client and Socket.io setup
│   │   ├── types/             # TypeScript interfaces
│   │   ├── App.tsx            # Root component & routing
│   │   └── index.tsx          # React DOM render
│   ├── public/                # Static assets
│   ├── tests/                 # Jest + React Testing Library tests
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── specs/                     # Planning documentation (this directory)
│   └── 001-agm-app-mvp/      # Feature specifications and plans
│
├── docs/                      # Additional documentation (future)
├── .github/
│   └── workflows/             # CI/CD pipelines (future)
│
├── CLAUDE.md                  # Agent context (updated by /speckit.plan)
├── README.md                  # Project overview
├── package.json              # Root workspace config (optional monorepo)
└── .gitignore

```

**Structure Decision**: 
- **Monorepo approach**: Single Git repository with `/backend` and `/frontend` directories for tight coordination during MVP phase
- **Separation of concerns**: Backend (Node.js/Express API) fully independent from frontend (React SPA); communicate only via REST API + WebSocket
- **Database**: PostgreSQL shared across backend services; no direct database access from frontend
- **Configuration**: Environment variables per environment (.env files); shared secrets via CI/CD (GitHub Actions, etc.)
- **Testing**: Unit tests co-located with source code; integration tests in dedicated `/tests` directories
- **Documentation**: Feature specs and design documents in `/specs` directory; code-level docs in CLAUDE.md and inline comments

## Complexity Tracking

> **No Constitution Check violations identified. All design decisions align with MVP scope.**

**Justification for Selected Approach**:

| Decision | Rationale | Simpler Rejected |
|----------|-----------|-----------------|
| **Monorepo with /backend + /frontend** | Single repo enables tight coordination between API & UI changes, shared documentation, unified CI/CD. Simplifies dependency management for MVP. | Multi-repo would add Git coordination overhead and slow iteration speed for MVP. Monorepo easily splits to microservices in v2 if needed. |
| **PostgreSQL over MongoDB** | Relational model maps perfectly to domain (users → AGMs → invitations → attendance). ACID transactions prevent race conditions in concurrent RSVP/attendance updates. Foreign keys enforce referential integrity at DB level. | NoSQL would require application-level consistency logic, increasing complexity. Document schema changes more fragile during rapid MVP iteration. |
| **Real-time WebSocket (Socket.io)** | Core feature (RSVP tracking, attendance marking) requires live updates. Socket.io provides mature, battle-tested solution with fallback to polling. Minimal added complexity vs. substantial UX improvement. | Polling would increase server load and degrade UX for attendance marking during meeting. WebSocket eliminates 2-5 second delay in status updates. |
| **Separate API + Frontend** | REST API enables future mobile apps, third-party integrations (v2 requirements). Clean separation simplifies testing (API contract tests separate from UI tests). Allows independent scaling/deployment. | Monolithic would be faster for MVP but creates technical debt preventing future growth. API already designed in contracts/, makes separation straightforward. |
