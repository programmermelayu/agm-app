# Developer Quickstart: Muktamar AGM Management MVP

**Tech Stack**: Node.js + Express.js (backend), React + TypeScript (frontend), PostgreSQL (database)  
**Duration**: 15 minutes setup + 30 minutes first run  
**Prerequisites**: Node.js 18+, PostgreSQL 14+, Git

---

## Quick Setup

### 1. Clone Repository
```bash
git clone https://github.com/muktamar/agm-app.git
cd agm-app
```

### 2. Environment Setup

Create `.env` file in project root:
```env
# Backend
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=muktamar_agm_dev
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_jwt_secret_key_min_32_chars_long
SENDGRID_API_KEY=your_sendgrid_key_or_empty_for_dev
REDIS_URL=redis://localhost:6379

# Frontend
REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
REACT_APP_WS_URL=http://localhost:5000
```

### 3. Database Setup

```bash
# Install PostgreSQL (if not installed)
# macOS: brew install postgresql@14
# Ubuntu: sudo apt-get install postgresql-14
# Windows: https://www.postgresql.org/download/windows/

# Create database
createdb muktamar_agm_dev

# Run migrations
cd backend
npm install
npm run migrate:latest

# (Optional) Seed test data
npm run seed:dev
```

### 4. Backend Installation & Run

```bash
cd backend
npm install

# Start development server (with auto-reload)
npm run dev

# Server runs on http://localhost:5000
```

### 5. Frontend Installation & Run

```bash
cd frontend
npm install

# Start development server
npm run dev

# Opens http://localhost:3000 in browser
```

### 6. Verify Setup

- Backend API health check: `curl http://localhost:5000/api/v1/health`
  - Response: `{ "status": "ok" }`
- Frontend loads: Visit `http://localhost:3000`
  - Should see login page

---

## Project Structure

```
agm-app/
├── backend/
│   ├── src/
│   │   ├── routes/          # Express route handlers
│   │   │   ├── auth.js      # POST /auth/register, /auth/login
│   │   │   ├── agms.js      # AGM CRUD endpoints
│   │   │   ├── invitations.js # Invitation endpoints
│   │   │   └── attendance.js # Attendance endpoints
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database models & Knex schemas
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── services/        # Email, JWT, socket handlers
│   │   └── app.js           # Express app setup
│   ├── db/
│   │   ├── migrations/      # Knex migration files
│   │   └── seeds/           # Test data seeds
│   ├── tests/               # Jest test files
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages (LoginPage, DashboardPage, etc.)
│   │   ├── components/      # Reusable components
│   │   ├── hooks/           # Custom React hooks (useAuth, useAGM, etc.)
│   │   ├── services/        # API client, Socket.io client
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Root component
│   │   └── index.tsx        # React render
│   ├── public/              # Static assets
│   ├── tailwind.config.js   # Tailwind CSS config
│   ├── package.json
│   └── .env.example
│
└── specs/                   # Planning documents (this directory)
    └── 001-agm-app-mvp/
        ├── spec.md          # Feature specification
        ├── plan.md          # Implementation plan
        ├── research.md      # Technology decisions
        ├── data-model.md    # Database schema
        ├── quickstart.md    # This file
        └── contracts/
            ├── api.md       # API endpoints
            └── ui-components.md # Component specs
```

---

## Development Workflow

### Starting Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3 (optional): Watch tests
cd backend
npm test -- --watch
```

### Making Changes

#### Backend (Node.js/Express)

1. Add new endpoint in `backend/src/routes/agms.js`:
```javascript
// Example: Create AGM
router.post('/', requireAuth, async (req, res) => {
  const { name, date, time, location } = req.body;
  
  try {
    const agm = await db('agms').insert({
      created_by: req.user.id,
      name,
      date,
      time,
      location,
      status: 'draft'
    }).returning('*');
    
    res.status(201).json({ agm: agm[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

2. Add corresponding test in `backend/tests/agms.test.js`:
```javascript
test('POST /agms creates new AGM', async () => {
  const res = await request(app)
    .post('/api/v1/agms')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test AGM',
      date: '2026-06-15',
      time: '14:30:00',
      location: 'Hall A'
    });
  
  expect(res.status).toBe(201);
  expect(res.body.agm.name).toBe('Test AGM');
});
```

3. Run tests: `npm test`

#### Frontend (React/TypeScript)

1. Create new component in `frontend/src/components/AGMCard.tsx`:
```typescript
import React from 'react';
import { AGM } from '../types';

interface Props {
  agm: AGM;
  onClick: () => void;
}

export const AGMCard: React.FC<Props> = ({ agm, onClick }) => {
  return (
    <div className="p-4 border rounded-lg cursor-pointer hover:shadow-lg" onClick={onClick}>
      <h3 className="font-bold text-lg">{agm.name}</h3>
      <p className="text-gray-600">{agm.date} at {agm.time}</p>
      <p className="text-sm text-gray-500">{agm.location}</p>
    </div>
  );
};
```

2. Use in page (e.g., `frontend/src/pages/DashboardPage.tsx`):
```typescript
import { AGMCard } from '../components/AGMCard';

export const DashboardPage = () => {
  const [agms, setAgms] = useState<AGM[]>([]);

  useEffect(() => {
    // Fetch AGMs from API
    apiClient.get('/agms').then(res => setAgms(res.data.agms));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agms.map(agm => (
        <AGMCard key={agm.id} agm={agm} onClick={() => navigate(`/agms/${agm.id}`)} />
      ))}
    </div>
  );
};
```

### Database Migrations

When schema changes are needed:

```bash
# Generate new migration
cd backend
npm run migrate:make add_column_to_agms

# Edit generated file in db/migrations/
# Example: Add 'notes' field to AGMs
exports.up = function(knex) {
  return knex.schema.table('agms', table => {
    table.text('notes').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('agms', table => {
    table.dropColumn('notes');
  });
};

# Run migration
npm run migrate:latest

# Rollback if needed
npm run migrate:rollback
```

---

## Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### End-to-End Tests (optional)
```bash
cd backend/e2e

# Run E2E tests (requires both servers running)
npm run test:e2e

# Test specific scenario
npm run test:e2e -- --grep "Create AGM"
```

---

## API Testing with cURL

### Register & Login

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# Login (get token)
TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }' | jq -r '.token')

# Create AGM
curl -X POST http://localhost:5000/api/v1/agms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Annual Meeting 2026",
    "date": "2026-06-15",
    "time": "14:30:00",
    "location": "Main Hall"
  }'

# List AGMs
curl -X GET http://localhost:5000/api/v1/agms \
  -H "Authorization: Bearer $TOKEN"
```

---

## Debugging

### Backend Debugging

1. **Enable debug logs**:
```bash
DEBUG=muktamar:* npm run dev
```

2. **VSCode debugger**:
   - Add breakpoint in code
   - Run: `npm run debug`
   - Debugger attaches automatically

3. **Check database**:
```bash
psql muktamar_agm_dev
SELECT * FROM agms;
SELECT * FROM users;
```

### Frontend Debugging

1. **React DevTools**: Install browser extension
2. **Chrome DevTools**: F12 → Sources tab
3. **Logs**: `console.log()` or use debugger statement
4. **Network tab**: Monitor API calls

---

## Common Issues

### Database connection error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running
```bash
# Start PostgreSQL
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux
# Windows: Start PostgreSQL service in Services app
```

### Port already in use (5000 or 3000)
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001  # Backend
REACT_APP_API_BASE_URL=http://localhost:5001/api/v1
```

### Module not found error
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Socket.io connection error
Ensure WebSocket URL in frontend matches backend:
```javascript
// frontend/.env
REACT_APP_WS_URL=http://localhost:5000
```

---

## Next Steps

1. **Read the full specification**: `specs/001-agm-app-mvp/spec.md`
2. **Review data model**: `specs/001-agm-app-mvp/data-model.md`
3. **API documentation**: `specs/001-agm-app-mvp/contracts/api.md`
4. **UI component specs**: `specs/001-agm-app-mvp/contracts/ui-components.md`
5. **Create first feature branch**: `git checkout -b feat/auth-backend`
6. **Start implementing** based on priority order from specification

---

## Resources

- **Express.js Documentation**: https://expressjs.com/
- **React Documentation**: https://react.dev/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Knex.js Migrations**: https://knexjs.org/#Migrations
- **Tailwind CSS**: https://tailwindcss.com/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

