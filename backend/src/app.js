import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import agmRoutes from './routes/agms.js';
import invitationRoutes, { createPublicRSVPRouter } from './routes/invitations.js';
import attendanceRoutes from './routes/attendance.js';

dotenv.config();

const app = express();

// Middleware: CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware: Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware: Request logging
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/agms', agmRoutes);
app.use('/api/v1/agms', invitationRoutes);
app.use('/api/v1/agms', attendanceRoutes);
app.use('/api/v1/rsvp', createPublicRSVPRouter());

// 404 Handler (must be before errorHandler)
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

export default app;
