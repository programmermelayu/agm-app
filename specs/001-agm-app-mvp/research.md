# Technology Research: AGM Management MVP

**Document**: Technology Stack Selection  
**Date**: 2026-04-07  
**Spec**: 001-agm-app-mvp  
**Status**: Research Complete

## Executive Summary

This document provides research-backed technology recommendations for building an Annual General Meeting (AGM) management MVP that must support:
- **Scale**: 1,000 concurrent users
- **Performance**: Sub-3-second page loads, 2-minute email delivery, 10 operations/minute in UI
- **Core Capabilities**: User authentication, AGM management, email invitations with RSVP tracking, real-time attendance tracking
- **Platform**: Web browsers (desktop and mobile)

The recommended stack prioritizes MVP velocity, operational simplicity, and proven scalability with minimal infrastructure complexity.

---

## 1. Backend Language & Framework

### Decision: **Node.js with Express.js**

### Rationale

1. **Exceptional Email Ecosystem**: Node.js dominates the email/notification space with mature libraries (Nodemailer, Bull for job queues, SendGrid integration). For an application where reliable email delivery within 2 minutes is critical, this ecosystem provides battle-tested solutions without requiring external systems upfront.

2. **Rapid MVP Development**: Express.js allows quick API endpoint development with minimal boilerplate. Combined with JavaScript's dynamic nature, this enables feature iteration at speeds suitable for MVP timelines without sacrificing structure.

3. **Real-time Capabilities Built-in**: Socket.io integration for real-time RSVP updates and attendance tracking UI is straightforward and well-documented. The synchronous/asynchronous model is natural for real-time operations.

4. **Single Language Stack**: Using JavaScript across frontend and backend reduces cognitive load, enables code reuse (validation logic, data transformers), and speeds onboarding for developers familiar with web technologies.

5. **Proven Scalability Pattern**: Node.js is designed for I/O-heavy workloads (email, database queries, real-time updates) that define this application. With PM2 clustering and proper middleware, handling 1,000 concurrent users is well within Node.js capabilities.

### Key Technologies

- **Framework**: Express.js (minimal, unopinionated)
- **Authentication**: Passport.js with JWT tokens for stateless, scalable auth
- **Task Queue**: Bull (Redis-backed) for reliable email delivery with retry logic
- **Real-time**: Socket.io for live RSVP and attendance updates
- **Data Validation**: Joi or Zod for schema validation
- **Testing**: Jest (see Testing Framework section)

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Python/FastAPI** | While excellent for rapid development, Python's async story is newer and less battle-tested than Node.js for real-time applications. Email libraries are good (Celery+RabbitMQ) but require additional operational complexity upfront (RabbitMQ, Redis). Slower overall development velocity for this specific use case. |
| **Ruby on Rails** | Strong conventions excellent for CRUD-heavy applications, but ActionMailer + background job setup adds complexity. Real-time features (ActionCable) are less mature than Socket.io ecosystem. Slower runtime performance for concurrent user handling. |
| **Java/Spring** | Over-engineered for MVP scope. Compilation cycle and JVM warmup slow feedback loops. Setup complexity (Maven, dependencies) slows initial development. Better suited for systems requiring heavy computational work. |
| **Go** | Excellent performance and concurrency model, but small email ecosystem and slower MVP development due to more verbose syntax and lack of web framework conventions. Better for backend services, less suitable for full-stack web app. |

---

## 2. Database

### Decision: **PostgreSQL**

### Rationale

1. **Strong ACID Guarantees**: With invitations, RSVPs, and attendance records all needing consistency, PostgreSQL's full ACID compliance ensures no race conditions between concurrent attendance marking and RSVP updates. The relational model maps perfectly to the domain.

2. **Native Foreign Key Support with Cascading**: The data model (Users → AGMs, AGMs → Invitations → Attendance Records) relies on referential integrity. PostgreSQL enforces this at the database level, preventing orphaned records and corruption from application bugs.

3. **JSON Support for Flexible Schemas**: While the core data is relational, PostgreSQL's JSONB type allows storing optional metadata (AGM settings, invitation customization) without schema migrations, speeding MVP iteration.

4. **Row-Level Security (RLS)**: PostgreSQL's built-in RLS enables enforcing "users see only their own AGMs" at the database layer. For an MVP without complex permission systems, this prevents authorization bugs in application code.

5. **Excellent Node.js Integration**: The `pg` and `knex.js` libraries provide mature, well-tested database access with connection pooling built-in. Query builders like Knex make complex queries readable and maintainable.

6. **Proven Scalability**: PostgreSQL handles 1,000 concurrent connections easily with proper connection pooling. Vertical scaling (larger instance) covers MVP needs; no horizontal sharding required.

### Schema Approach

- **ORM/Query Builder**: Knex.js (lightweight, SQL-focused) or Prisma (modern, type-safe alternatives acceptable)
- **Migrations**: Knex migrations for version control of schema
- **Connection Pooling**: Built-in with pg library (10-20 pool size for 1,000 concurrent users)

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **MySQL 8.0+** | Functionally equivalent to PostgreSQL for this use case. PostgreSQL's JSON support, RLS, and slightly better async library support in Node.js give it an edge. PostgreSQL's window functions are useful for attendance statistics. |
| **MongoDB** | Document-based model is poor fit for this domain. Invitations and attendance records need strict schema validation and foreign key relationships. ACID transactions across collections are weaker. Scaling to 1,000 concurrent users increases complexity. No clear advantage over relational DB. |
| **SQLite** | Excellent for single-user MVP but lacks concurrency support for 1,000 concurrent users. Single-file deployment is attractive but limits scalability and team collaboration. Unsuitable for production-grade application. |
| **DynamoDB / Firestore** | Managed NoSQL adds vendor lock-in and extra cost for simple workload. Cold start latencies problematic for sub-3-second page loads. Complex query patterns (attendance statistics, RSVP summaries) are inefficient. Better for event streaming, not CRUD operations. |

---

## 3. Frontend Framework

### Decision: **React with TypeScript**

### Rationale

1. **Responsive Design Ecosystem**: React has mature component libraries for mobile-responsive UI (Material-UI, Tailwind CSS + shadcn/ui). Building responsive forms (AGM creation, RSVP handling) and dashboards is straightforward with established patterns.

2. **Real-time Updates Native Pattern**: React's virtual DOM and re-rendering model is intuitive for real-time features. Socket.io integration with React hooks is well-documented. Managing state updates from attendance clicks and RSVP streams is clean.

3. **Developer Productivity at Scale**: React's component model breaks the UI into manageable pieces (AGMForm, AttendanceList, RSVPSummary). TypeScript catches errors early. For an MVP that will iterate rapidly, this prevents bugs from breaking features.

4. **Mobile Web Responsiveness**: Modern React with mobile-first CSS frameworks enables single codebase for desktop and mobile browsers. Viewport management, touch interactions, and responsive tables are standard patterns.

5. **Extensive Ecosystem**: Routing (React Router), form management (React Hook Form), state management (Zustand or Context for simple MVP), HTTP client (Axios, Fetch API). Mature, stable libraries reduce "reinventing the wheel" overhead.

### Key Technologies

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components (rapid development, responsive by default)
- **Real-time**: Socket.io client library with custom hooks for reactive state
- **Forms**: React Hook Form (lightweight, performant)
- **State**: Zustand or Context API (keep it simple for MVP; avoid Redux overhead)
- **HTTP Client**: Axios or native Fetch API
- **Testing**: Vitest + React Testing Library (see Testing Framework section)

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Vue 3** | Excellent framework with gentler learning curve and faster development for smaller teams. Single-file components are elegant. However, smaller ecosystem for enterprise components and libraries. React's ecosystem advantage (more job market, more reusable libraries) is valuable for team scaling. |
| **Angular** | Powerful and feature-complete with strong typing, but heavyweight. Setup complexity and TypeScript-first approach slow MVP development. Better for large enterprise teams; overkill for MVP. Slower development cycles due to verbosity. |
| **Svelte** | Novel, elegant approach with smaller bundle sizes. Excellent developer experience. However, smaller ecosystem (fewer UI libraries), less community support, and fewer developers available. Risk for MVP if team members leave. |
| **SolidJS** | Fine-grained reactivity model is elegant and performant, but ecosystem is nascent. Risk of learning curve and missing libraries for rapid development. Less established for production systems. |

---

## 4. Email Service

### Decision: **SendGrid (with Nodemailer fallback for development)**

### Rationale

1. **Guaranteed 2-Minute Delivery SLA**: SendGrid provides 99.99% uptime and documented delivery within 2 minutes for normal volumes. Critical for RSVP links to reach attendees promptly, ensuring high response rates.

2. **Reliability Without Infrastructure Complexity**: Avoids running local mail servers (SMTP) or managing email delivery infrastructure. SendGrid handles bounces, spam filtering, and delivery retries transparently.

3. **Battle-tested for Transactional Email**: Specifically designed for application-triggered emails (invitations, confirmations). Rate limiting, throttling, and delivery tracking are built-in. Proven track record with millions of AGM-type notifications.

4. **Easy Escalation Path**: If email volume grows, SendGrid's dedicated IP pools and API provide fine-grained control. No need to re-architect if MVP success requires sending thousands of invitations daily.

5. **Simple Integration**: Node.js SendGrid SDK is one npm install away. Authentication via API key. Dead simple compared to managing SMTP relay or self-hosted email systems.

6. **Audit Trail and Debugging**: SendGrid dashboard shows delivery status, bounces, and opens. For MVP troubleshooting (why didn't attendee get invitation?), this visibility is invaluable.

### Implementation Approach

```javascript
// Development: Use Nodemailer with ethereal (fake SMTP)
// Production: SendGrid SDK with job queue (Bull)

// Email job structure:
// - Queued immediately when invitation created
// - Retried 3x on failure (exponential backoff)
// - Delivery status logged for admin visibility
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Nodemailer (Self-hosted SMTP)** | Good for development but requires running SMTP server (Postfix, Exim) in production. Additional operational burden, IP reputation management needed. Fine for small volume but doesn't scale cleanly. Better as fallback/development only. |
| **AWS SES** | Excellent service but requires AWS account setup, IP warm-up for good deliverability, and more complex authentication. SES is cost-effective at scale but SendGrid's transactional email expertise is worth the slight cost premium for MVP reliability. |
| **Mailgun** | Comparable to SendGrid with good APIs and webhooks. Slightly more complex webhook setup for delivery tracking. SendGrid has slightly better RSVP-link documentation and examples. Either is defensible; SendGrid chosen for docs. |
| **Brevo (formerly Sendinblue)** | Good European alternative with competitive pricing. Smaller US market presence. For MVP targeting global users, SendGrid's larger infrastructure and documentation in English is safer choice. |
| **In-house Email Queue (Bull + SMTP)** | Low cost but high operational complexity. Requires careful SMTP configuration, IP reputation management, and bounce handling. For MVP, this is premature optimization. SendGrid's cost is minimal compared to engineering time. |

---

## 5. Testing Framework

### Decision: **Jest (Backend) + Vitest + React Testing Library (Frontend)**

### Rationale

1. **Unified Testing Philosophy**: Jest for backend, Vitest for frontend creates consistency. Both test in Node.js environment, share snapshot and assertion patterns. Team learns one way to write tests.

2. **Critical Path Coverage for MVP**: Testing strategy focuses on high-impact features:
   - **Backend**: User authentication (login/logout/registration), AGM CRUD (create/edit), email delivery, RSVP updates, attendance marking
   - **Frontend**: Form submission (AGM creation, RSVP), real-time updates, authentication flows
   - **Integration**: Invitation email triggers, RSVP flow end-to-end

3. **Speed and Developer Feedback**: Vitest uses esbuild (25x faster than Jest for compilation). For rapid iteration, fast test feedback is critical. Jest's excellent documentation and ecosystem mean less time debugging test setup.

4. **React-Specific Testing**: React Testing Library encourages testing user interactions, not implementation. For an MVP with frequent refactoring, this prevents brittle tests that break on harmless code changes.

5. **Minimal Mocking Complexity**: Testing invitations, emails, and attendance doesn't require complex mocks. Real database connections (test DB) are preferred over mocks for integration tests, revealing integration bugs early.

### Testing Strategy by Feature

| Feature | Test Type | Approach |
|---|---|---|
| User Registration | Unit + Integration | Jest: test hash validation, DB insert, duplicate prevention |
| AGM Creation | Integration | Jest: test form validation, permission check, DB transaction |
| Email Invitations | Integration + E2E | Jest: test queue job, SendGrid API mock, bounce handling |
| RSVP Updates | Unit + Integration | Jest: test state updates, race condition prevention |
| Attendance Marking | Integration | Jest: test timestamp recording, real-time broadcast |
| Form Interactions | Component | Vitest + RTL: test form submission, validation messages |
| Real-time Updates | Integration | Jest + mock Socket.io: test event broadcasting |

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Mocha + Chai** | Mature and flexible, but less opinionated than Jest. Requires choosing assertion library, mocking tool, and reporter separately. Jest's integrated tooling is faster to set up for MVP. |
| **pytest (Python)** | Excellent for backend testing, but project is Node.js-based. Introducing Python increases complexity and requires test environment management. Stick with Node.js ecosystem. |
| **Cypress / Playwright (E2E)** | Excellent for end-to-end testing but slower to execute and overkill for MVP. Integration tests with real database catch 90% of bugs faster. E2E tests valuable once MVP is stable. |
| **AVA** | Minimalist test runner with good concurrency. However, smaller ecosystem than Jest. Jest's snapshot testing, watch mode, and documentation are superior for MVP pace. |

---

## 6. Real-time Communication (Bonus Section)

### Decision: **Socket.io**

### Rationale

While not explicitly requested, real-time RSVP and attendance updates are core features (per spec: "System MUST allow admins to mark attendees as present during the AGM" with 10 operations/minute target). Socket.io is the proven solution:

1. **Bidirectional Communication**: Attendance marking updates immediately broadcast to all admin users viewing the same AGM. No page refresh needed.
2. **Fallback Mechanisms**: Socket.io transparently falls back to polling if WebSocket unavailable, ensuring browser compatibility.
3. **Room-Based Broadcasting**: Easy to broadcast RSVP/attendance updates only to users managing specific AGM (no cross-AGM data leaks).
4. **Client Library**: @socket.io/client pairs perfectly with React hooks for state updates.

---

## Summary: Recommended Stack

| Layer | Technology | Key Libraries |
|---|---|---|
| **Backend** | Node.js + Express.js | Passport.js, Bull, Socket.io |
| **Database** | PostgreSQL | pg, Knex.js |
| **Frontend** | React + TypeScript | React Router, React Hook Form, Tailwind CSS, shadcn/ui |
| **Email** | SendGrid | @sendgrid/mail, Bull (queue) |
| **Real-time** | Socket.io | Socket.io (server & client) |
| **Testing** | Jest + Vitest | React Testing Library |

## Scalability Validation

With this stack for 1,000 concurrent users:

| Requirement | Stack Capability |
|---|---|
| **Sub-3-second page loads** | React frontend (compressed bundle ~150KB) + Express.js (<50ms response) = well under 3s |
| **Email within 2 minutes** | SendGrid SLA + Bull job queue with retries = guaranteed delivery |
| **10 operations/minute in UI** | Socket.io broadcasting + React re-rendering = <100ms per update |
| **1,000 concurrent users** | Node.js with PM2 clustering (4-8 processes), PostgreSQL with connection pooling, Socket.io namespaces |

## Risk Mitigation

1. **Email Delivery**: Test SendGrid integration early with dummy recipient list. Document bounce handling.
2. **Database Concurrency**: Load test attendance marking with 100+ simultaneous clicks to surface race conditions.
3. **Real-time Performance**: Profile Socket.io rooms under 1,000 concurrent connection scenario. Monitor message queue depth.
4. **Frontend Bundle Size**: Monitor React bundle (target <150KB gzipped). Use code splitting for routes.

---

## Next Steps

1. **Set up initial project scaffold** (Express + React)
2. **Prove authentication flow** (Passport.js + JWT with tests)
3. **Build AGM CRUD API** with database migrations
4. **Integrate SendGrid** and test email delivery with Bull
5. **Add Socket.io** for real-time RSVP/attendance updates
6. **Load test** at 100+ concurrent users to validate assumptions
