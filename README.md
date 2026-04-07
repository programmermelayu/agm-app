# Muktamar - AGM Management System

A comprehensive web application for managing Annual General Meetings (AGMs), including user authentication, AGM creation, invitation management, RSVP tracking, and attendance check-in.

## Features

- **User Authentication**: Secure JWT-based authentication with email/password registration and login
- **AGM Management**: Create, read, update, and delete AGMs with status tracking (draft, scheduled, completed)
- **Invitation Management**: Send bulk invitations with secure RSVP tokens
- **RSVP Tracking**: Track attendance confirmations with real-time statistics
- **Attendance Check-in**: Single and bulk check-in with undo functionality
- **Real-time Statistics**: View invitation status, RSVP rates, and attendance metrics
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+ with Knex.js
- **Authentication**: JWT with Passport.js
- **Password Hashing**: bcrypt
- **Email**: Nodemailer with Bull job queue
- **Validation**: Joi
- **Logging**: Winston

### Frontend
- **Framework**: React 18+ with TypeScript
- **Router**: React Router v6
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: pnpm

### Testing & Quality
- **Backend Testing**: Jest
- **Linting**: ESLint
- **Code Formatting**: Prettier

## Project Structure

```
agm-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── db/
│   │   └── migrations/      # Database migrations
│   ├── tests/               # Test files
│   ├── package.json
│   ├── jest.config.js
│   └── knexfile.js
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.tsx          # Root component
│   │   └── index.tsx        # Entry point
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── package.json             # Monorepo workspace config
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL 14+
- Redis (for Bull job queue)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agm-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or npm install
   ```

3. **Setup environment variables**
   
   Backend (.env):
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

   Frontend (.env):
   ```bash
   cp frontend/.env.example frontend/.env
   ```

4. **Setup database**
   ```bash
   pnpm run migrate:latest
   # or npm run migrate:latest (from backend directory)
   ```

5. **Start development servers**
   ```bash
   # From root directory
   pnpm run dev
   
   # Or separately:
   # Terminal 1 - Backend
   cd backend && pnpm run dev
   
   # Terminal 2 - Frontend
   cd frontend && pnpm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api/v1
   - Health check: http://localhost:5000/api/v1/health

## API Documentation

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### AGMs
- `POST /api/v1/agms` - Create AGM
- `GET /api/v1/agms` - List user's AGMs
- `GET /api/v1/agms/:id` - Get AGM details
- `PATCH /api/v1/agms/:id` - Update AGM
- `DELETE /api/v1/agms/:id` - Delete AGM

### Invitations
- `POST /api/v1/agms/:agm_id/invitations` - Send invitation
- `POST /api/v1/agms/:agm_id/invitations/batch` - Send bulk invitations
- `GET /api/v1/agms/:agm_id/invitations` - List invitations
- `GET /api/v1/agms/:agm_id/invitations/summary` - RSVP statistics
- `POST /api/v1/rsvp/:token` - Submit RSVP (public)
- `DELETE /api/v1/invitations/:id` - Delete invitation

### Attendance
- `POST /api/v1/agms/:agm_id/attendance` - Check in attendee
- `POST /api/v1/agms/:agm_id/attendance/bulk` - Bulk check-in
- `GET /api/v1/agms/:agm_id/attendance` - List check-ins
- `GET /api/v1/agms/:agm_id/attendance/stats` - Attendance statistics
- `GET /api/v1/agms/:agm_id/attendance/comparison` - RSVP vs actual
- `DELETE /api/v1/attendance/:id` - Undo check-in

## Development

### Running Tests

```bash
# Backend tests
cd backend
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage report
pnpm run test:coverage
```

### Linting and Formatting

```bash
# Lint code
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format
```

### Database Migrations

```bash
# Create new migration
pnpm run migrate:make <migration_name>

# Run migrations
pnpm run migrate:latest

# Rollback last batch
pnpm run migrate:rollback
```

## Configuration

### Backend Environment Variables

```
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=muktamar_agm_dev
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRY=24h

# Email (Nodemailer)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@ethereal.email
SMTP_PASS=your_password
SMTP_FROM=noreply@muktamar.local

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Deployment

### Production Build

```bash
# Build frontend
cd frontend
pnpm run build

# Output in frontend/dist

# Start backend (with built frontend served)
cd ../backend
NODE_ENV=production pnpm run start
```

### Environment for Production

- Set `NODE_ENV=production`
- Update `JWT_SECRET` to a strong random string
- Configure production database connection
- Setup production email service (SendGrid, Gmail, etc.)
- Enable HTTPS/SSL
- Configure proper CORS origins
- Set up monitoring and logging
- Enable rate limiting
- Configure backups

## Security Considerations

- Passwords are hashed with bcrypt (cost factor 10)
- JWT tokens expire after 24 hours
- RSVP tokens are generated using SHA256
- All API endpoints (except public RSVP) require authentication
- Input validation on all API endpoints with Joi
- CORS configured to allow only frontend domain
- SQL injection prevented through Knex.js parameterized queries
- CSRF protection through stateless JWT

## Performance

- Database connection pooling (10-20 connections)
- Email delivery via background job queue (Bull)
- Pagination on all list endpoints
- Database indexes on frequently queried fields
- Gzip compression on API responses

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DB credentials in .env
- Ensure database exists: `createdb muktamar_agm_dev`

### Email Not Sending
- Verify Redis is running
- Check SMTP credentials
- Review Winston logs in `backend/logs/`

### Frontend Not Connecting to API
- Verify backend is running on port 5000
- Check CORS configuration in backend/.env
- Check browser console for errors

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Commit with descriptive message
5. Push and create pull request

## License

MIT

## Support

For issues or questions, please check the logs or create an issue in the repository.
