# Feature Specification: Muktamar AGM Management MVP

**Feature Branch**: `001-agm-app-mvp`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: Create a web application for AGM (Annual General Meeting) management with core MVP features

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Schedule an AGM (Priority: P1)

An organization administrator needs to quickly set up a new Annual General Meeting with basic details so they can begin inviting attendees.

**Why this priority**: This is the foundational feature that enables all downstream capabilities (invitations, attendance tracking). Without the ability to create AGMs, no other features have value.

**Independent Test**: Can be fully tested by creating a new AGM with date, time, and location, and storing it persistently - the system should retrieve and display the AGM details correctly.

**Acceptance Scenarios**:

1. **Given** an authenticated user with admin role, **When** they navigate to "Create AGM", **Then** they see a form with fields for AGM name, date, time, and location
2. **Given** an admin has filled in all required AGM details, **When** they click "Create", **Then** the AGM is saved and they receive confirmation with a unique AGM ID
3. **Given** an AGM has been created, **When** an admin views their dashboard, **Then** the newly created AGM appears in their list of AGMs

---

### User Story 2 - Send Invitations to Attendees (Priority: P1)

An organization administrator needs to invite specific people to the AGM via email so they can see who plans to attend and track RSVPs.

**Why this priority**: Invitations are critical for collecting attendance information and building the attendee list. This directly enables the success of the meeting.

**Independent Test**: Can be fully tested by creating an invitation, sending it to an attendee, and verifying the attendee receives a notification and can RSVP.

**Acceptance Scenarios**:

1. **Given** an AGM has been created, **When** an admin accesses the invitation section, **Then** they can enter attendee email addresses one or multiple at a time
2. **Given** the admin has entered attendee emails and submitted, **When** invitations are processed, **Then** emails are sent to all attendees with a link to RSVP
3. **Given** an attendee receives an invitation email, **When** they click the RSVP link, **Then** they can select "Attending", "Not Attending", or "Maybe" and their response is recorded
4. **Given** invitations have been sent, **When** the admin views the AGM, **Then** they see a real-time count of RSVPs by status (Attending/Not Attending/Maybe/No Response)

---

### User Story 3 - Track Attendance During AGM (Priority: P1)

An organization administrator needs to mark attendees as present during the AGM so they can maintain an accurate attendance record for official documentation.

**Why this priority**: Attendance tracking is a core legal requirement for Annual General Meetings. It's essential for compliance and record-keeping.

**Independent Test**: Can be fully tested by marking several attendees as present/absent during an AGM and generating an attendance report.

**Acceptance Scenarios**:

1. **Given** an AGM is scheduled and in progress, **When** an admin opens the attendance tracking interface, **Then** they see a list of all invited attendees with their RSVP status
2. **Given** the attendance list is open, **When** an admin marks an attendee as "Present", **Then** the system records the timestamp and the attendee's status changes immediately
3. **Given** some attendees are marked present and others absent, **When** the admin views the attendance summary, **Then** they see total attendance count and percentage present

---

### User Story 4 - User Authentication and Account Access (Priority: P1)

Users need to create accounts and securely log in so that each organization can manage their own AGMs independently and maintain privacy.

**Why this priority**: Authentication is foundational - without it, there's no way to isolate data between organizations or prevent unauthorized access to sensitive meeting information.

**Independent Test**: Can be fully tested by creating a new user account, logging out, and successfully logging back in.

**Acceptance Scenarios**:

1. **Given** a user is on the login page, **When** they click "Create Account", **Then** they see a registration form asking for email and password
2. **Given** a user has entered valid email and password, **When** they click "Sign Up", **Then** their account is created and they are automatically logged in
3. **Given** an authenticated user, **When** they click "Log Out", **Then** they are logged out and returned to the login page
4. **Given** a user logged out, **When** they return to the home page, **Then** they are redirected to the login page

---

### Edge Cases

- What happens when an invitation email bounces or is invalid (invalid format)?
- How does the system handle if an attendee receives multiple invitations for the same AGM?
- What happens if an admin tries to mark attendance before the AGM start time?
- How does the system handle duplicate user registrations with the same email address?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create an account with email and password
- **FR-002**: System MUST authenticate users on login and prevent unauthorized access
- **FR-003**: System MUST allow authenticated users to create a new AGM with name, date, time, and location
- **FR-004**: System MUST display all AGMs created by the logged-in user on their dashboard
- **FR-005**: System MUST allow admins to add attendee email addresses to an AGM
- **FR-006**: System MUST send invitation emails to attendees with a unique RSVP link
- **FR-007**: System MUST track attendee RSVP responses (Attending, Not Attending, Maybe)
- **FR-008**: System MUST allow users to view RSVP status summary for each AGM
- **FR-009**: System MUST allow admins to mark attendees as present during the AGM
- **FR-010**: System MUST maintain an attendance record with timestamp for each attendee marked present
- **FR-011**: System MUST calculate and display attendance statistics (count, percentage)
- **FR-012**: System MUST securely store all user data and AGM information with appropriate access controls
- **FR-013**: System MUST validate email addresses before sending invitations
- **FR-014**: System MUST handle invalid or bounced invitation emails gracefully and notify the admin

### Key Entities

- **User**: Email address, password hash, created_at, role (admin/attendee)
- **AGM (Annual General Meeting)**: Name, date, time, location, created_by_user_id, status (draft/scheduled/completed)
- **Invitation**: Attendee email, AGM_id, RSVP status (pending/attending/not_attending/maybe), created_at, responded_at
- **Attendance Record**: Attendee email, AGM_id, marked_present (boolean), timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account creation and first AGM creation in under 5 minutes from landing page
- **SC-002**: Invitation emails are delivered within 2 minutes of being sent by the admin
- **SC-003**: 80% of invited attendees respond to RSVP requests within 7 days of receiving invitation
- **SC-004**: Attendance tracking UI allows admin to mark attendees as present at a rate of at least 10 attendees per minute
- **SC-005**: System remains accessible and responsive with sub-3-second page load times during normal operations
- **SC-006**: Users report intuitive experience in initial user testing (7 out of 10 or higher satisfaction rating)
- **SC-007**: All user passwords are securely hashed and user data is encrypted at rest
- **SC-008**: System successfully handles at least 1,000 concurrent users without performance degradation

## Assumptions

- Users will primarily access the application via web browsers (desktop and mobile)
- Email is the primary communication channel for invitations and notifications
- AGMs are typically scheduled with at least 1-2 weeks advance notice
- Attendees will have access to email and can click links in emails to RSVP
- Data protection will follow standard industry practices (password hashing, encryption at rest, HTTPS in transit)
- Initial user base will be organizational administrators setting up AGMs for their respective organizations
- The system does not need to support complex permission hierarchies in MVP (simple admin/attendee roles)
