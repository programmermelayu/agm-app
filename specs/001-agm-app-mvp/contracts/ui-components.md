# UI Component Contracts: Muktamar AGM Management MVP

**Version**: 1.0.0  
**Framework**: React 18+ with TypeScript  
**Styling**: Tailwind CSS + Material-UI or shadcn/ui  
**Responsive**: Mobile-first design (320px and up)

---

## Component Hierarchy

```
App
├── AuthLayout
│   ├── LoginPage
│   └── RegisterPage
└── MainLayout (requires auth)
    ├── Navigation
    ├── Sidebar
    └── ContentArea
        ├── DashboardPage
        │   ├── AGMList
        │   └── AGMCard
        ├── AGMDetailPage
        │   ├── AGMHeader
        │   ├── AGMTabs
        │   │   ├── DetailsTab
        │   │   ├── InvitationsTab
        │   │   │   ├── InvitationList
        │   │   │   ├── SendInvitationForm
        │   │   │   └── RSVPSummary
        │   │   └── AttendanceTab
        │   │       ├── AttendanceForm
        │   │       ├── AttendanceList
        │   │       └── AttendanceSummary
        │   └── AGMActions
        └── CreateAGMPage
            └── AGMForm
```

---

## Page Components

### LoginPage

**Purpose**: Authenticate existing users

**Props**: None (reads from URL params for redirect)

**State**:
- Form inputs: email, password
- Loading state during submission
- Error messages

**Layout**:
- Mobile: Full width, centered form
- Desktop: Left sidebar (branding) + right form section
- Responsive breakpoint: 768px

**Form Fields**:
1. Email input
   - Type: email
   - Placeholder: "user@example.com"
   - Validation: Real-time email validation
   - Error display: Below field

2. Password input
   - Type: password
   - Placeholder: "••••••••"
   - Show/hide toggle
   - Validation: Required, minimum 8 chars
   - Error display: Below field

3. Submit button
   - Text: "Sign In"
   - State: Disabled while loading
   - Loading indicator: Spinner inside button

4. Links
   - "Create Account" → RegisterPage
   - "Forgot Password?" → Future v2 feature

**Success Flow**:
- Validate inputs client-side
- Submit to POST /auth/login
- Store token in localStorage (or httpOnly cookie if backend supports)
- Redirect to DashboardPage
- Show success toast: "Welcome back!"

**Error Flow**:
- Display API errors: "Invalid email or password"
- Rate limit error: "Too many login attempts. Try again in 5 minutes."

**Accessibility**:
- Label elements linked to inputs (htmlFor)
- ARIA attributes for form validation
- Keyboard navigation (Tab through fields)
- Enter key submits form

---

### RegisterPage

**Purpose**: Create new user account

**Props**: None

**Form Fields**:
1. Email input (same validation as LoginPage)
2. Password input (same as LoginPage)
3. Confirm password input
   - Type: password
   - Validation: Must match password field
   - Real-time validation feedback

4. I agree to Terms checkbox
   - Link to terms (can be placeholder in MVP)
   - Required to submit

5. Submit button
   - Text: "Create Account"
   - Disabled: If any validation fails or terms not checked

**Success Flow**:
- Validate all inputs
- Submit to POST /auth/register
- Auto-login with returned token
- Redirect to Dashboard
- Show welcome message: "Account created successfully!"

**Error Flow**:
- Email already exists: "This email is already registered. Sign in instead."
- Password too weak: "Password must be at least 8 characters"
- Show error toast for other issues

**Links**:
- "Already have an account?" → LoginPage

---

### DashboardPage

**Purpose**: Display list of user's AGMs and quick actions

**Layout**:
- Header: "My AGMs" + Create AGM button
- Two view options: List view (default), Grid view
- Filter/search section (above list)

**Components**:
1. **AGMListHeader**
   - View toggle buttons: List/Grid
   - Search box: Real-time filter by AGM name
   - Filter dropdown: By status (All, Draft, Scheduled, Completed)
   - Sort dropdown: By date (Upcoming, Recent)

2. **AGMList/AGMGrid**
   - Responsive: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
   - Pagination: 20 items per page

3. **AGMCard**
   - Displays one AGM with:
     - AGM name (title)
     - Date & time (formatted for user's timezone)
     - Location
     - Status badge (Draft/Scheduled/Completed)
     - Invitation count: "45 invited"
     - RSVP summary: Visual breakdown (bars or donut chart)
     - Action buttons: View Details, Edit (if draft), Delete (if draft)
   - Hover state: Subtle shadow increase
   - Click: Navigate to AGMDetailPage

**Empty State**:
- When no AGMs exist
- Icon + message: "No AGMs yet"
- Call-to-action button: "Create your first AGM"

**Loading State**:
- Skeleton loaders for AGMCard placeholders

---

### AGMDetailPage

**Purpose**: View and manage a specific AGM

**Layout**:
- AGMHeader (sticky at top)
- Tab navigation: Details, Invitations, Attendance
- Content area changes based on selected tab

**AGMHeader Component**:
- AGM name (large heading)
- Date, time, location (formatted)
- Status badge with color coding:
  - Draft: Gray
  - Scheduled: Blue
  - Completed: Green
- Action menu:
  - Edit (if draft)
  - Mark as Scheduled (if draft)
  - Mark as Completed (if scheduled)
  - Delete (if draft)
  - Export Attendees (CSV) - optional for MVP

---

### DetailsTab

**Purpose**: View and edit AGM details

**Content**:
- Read-only display:
  - Name
  - Date
  - Time
  - Location
  - Created date
  - Created by (current user's email)

- Edit section (if draft):
  - Same AGMForm fields
  - Save button
  - Cancel button
  - Confirmation on change: "Are you sure? Changes are permanent."

---

### InvitationsTab

**Purpose**: Send invitations and track RSVPs

**Components**:

#### SendInvitationForm
- Textarea for email input: "attendee1@example.com\nattendee2@example.com"
- Or single email field with "Add more" button
- Validation:
  - Valid email format
  - No duplicate emails in list
  - No duplicate emails against already-invited attendees
- Submit button: "Send Invitations"
- Success message: "✓ Invitations sent to 3 attendees"
- Email delivery status indicator (optional): Shows count of emails sent

#### RSVPSummary (Card/Widget)
- Visual breakdown of responses:
  - Pie chart or stacked bar chart
  - Sections: Attending, Not Attending, Maybe, No Response
  - Percentages
  - Click to filter list

#### InvitationList
- Table or card list showing:
  - Attendee email
  - RSVP status with icon:
    - ✓ Attending (green)
    - ✗ Not Attending (red)
    - ? Maybe (yellow)
    - ⏳ Pending (gray)
  - Response date (if responded)
  - Time since invited
  - Actions: Resend email (if pending)
- Sortable by: Email, Status, Response date
- Filterable by: Status
- Pagination: 50 items per page

---

### AttendanceTab

**Purpose**: Mark attendance and view summary

**Layout**:
- Left panel: AttendanceForm + AttendanceSummary
- Right panel: AttendanceList

#### AttendanceSummary (Widget)
- Key metrics:
  - Total invited: "45"
  - Marked present: "38"
  - Marked absent: "4"
  - Not marked: "3"
  - Attendance percentage: "88.37%" (color-coded: green if >80%, yellow if >50%, red if <50%)

#### AttendanceForm
- Purpose: Mark single attendee as present or absent
- Two input methods:
  1. Dropdown/Searchable select: "Select attendee to mark present"
  2. Barcode scanner input (future feature, can be text field for MVP)
- Buttons:
  - "Mark Present"
  - "Mark Absent"
- Clear after submission for continuous marking during meeting
- Real-time feedback: "✓ Attendee marked present" (green toast)

#### AttendanceList
- Table format:
  - Attendee email
  - RSVP status (colored badge)
  - Marked present checkbox (toggle-able)
  - Time marked (if marked)
  - Undo button (optional)
- Searchable: Filter by email
- Sortable: By email, status, time marked
- Real-time updates: New marks appear immediately (via Socket.io)

---

### CreateAGMPage

**Purpose**: Create new AGM

**Layout**:
- Header: "Create AGM"
- Form centered on page
- Back button to Dashboard

**AGMForm Component**:
- Fields:
  1. AGM Name
     - Input type: text
     - Placeholder: "Annual General Meeting 2026"
     - Validation: 1-255 characters, required
     - Character counter: "0/255"

  2. Date
     - Input type: date picker
     - Validation: Cannot be in past
     - Show calendar widget
     - Display selected date in readable format

  3. Time
     - Input type: time picker
     - Format: 24-hour (14:30)
     - Or dropdown with 30-minute intervals
     - Validation: Valid time range

  4. Location
     - Input type: text or textarea
     - Placeholder: "Conference Room A" or "https://zoom.us/j/..."
     - Validation: 1-500 characters, required

- Submit button: "Create AGM"
  - Disabled if form invalid
  - Loading state during submission

- Success flow:
  - POST /agms with form data
  - Redirect to AGMDetailPage
  - Show success toast: "AGM created! You can now invite attendees."

- Error flow:
  - Display validation errors inline
  - Show API error toast

---

## Shared UI Components

### AGMStatusBadge
- Props: status (draft | scheduled | completed)
- Renders: Colored badge with status text
- Colors:
  - Draft: Gray (#808080)
  - Scheduled: Blue (#0066FF)
  - Completed: Green (#00AA44)

### RSVPStatusIcon
- Props: rsvp_status (pending | attending | not_attending | maybe)
- Renders: Icon + status name
- Icons:
  - ✓ Attending (green checkmark)
  - ✗ Not Attending (red X)
  - ? Maybe (yellow question)
  - ⏳ Pending (gray hourglass)

### LoadingSpinner
- Props: size (sm | md | lg)
- Renders: Animated spinner
- Usage: During API calls

### Toast Notifications
- Props: type (success | error | warning | info), message, duration
- Auto-dismiss after 5 seconds
- Stack multiple toasts

### FormField
- Props: label, error, required
- Children: Input element
- Renders: Label + input + error message

### Button
- Variants: primary, secondary, danger
- States: normal, hover, disabled, loading
- Sizes: sm, md, lg
- Props: onClick, disabled, loading, children

---

## Responsive Breakpoints

Using Tailwind CSS breakpoints:
- `sm`: 640px (small phones)
- `md`: 768px (tablets)
- `lg`: 1024px (small laptops)
- `xl`: 1280px (desktops)

**Mobile-First Strategy**:
- Base styles optimized for 320px (iPhone SE)
- Expand to tablet/desktop using responsive utilities

**Key Responsive Changes**:
- AGMCard grid: 1 col → 2 cols (md) → 3 cols (lg)
- Tables: Convert to card-based view on mobile
- Sidebar: Collapse to hamburger menu on mobile
- Modals: Full width on mobile, centered on desktop

---

## Accessibility Requirements

- WCAG 2.1 Level AA compliance
- Keyboard navigation: Tab, Shift+Tab, Enter, Escape
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: Always visible (outline or underline)
- ARIA labels: For icons, buttons, form fields
- Semantic HTML: Use `<button>`, `<input>`, `<form>` properly
- Error messages: Associated with fields (aria-invalid, aria-describedby)

