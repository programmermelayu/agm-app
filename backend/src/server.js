import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './config/database.js';
import { initializeTransporter, verifyTransporter } from './services/EmailService.js';
import { processEmailQueue } from './config/queue.js';
import { sendInvitationEmail, sendRSVPConfirmationEmail } from './services/EmailService.js';
import logger from './config/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Email processor for Bull queue
 */
const emailProcessor = async (jobData) => {
  const { to, template, data } = jobData;

  if (template === 'invitation') {
    return await sendInvitationEmail({
      to,
      agmName: data.agmName,
      agmDate: data.agmDate,
      agmTime: data.agmTime,
      rsvpToken: data.rsvpToken,
    });
  }

  if (template === 'rsvp-confirmation') {
    return await sendRSVPConfirmationEmail({
      to,
      agmName: data.agmName,
      rsvpStatus: data.rsvpStatus,
    });
  }

  throw new Error(`Unknown email template: ${template}`);
};

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Initialize email transporter
    initializeTransporter();
    const isEmailVerified = await verifyTransporter();
    if (!isEmailVerified) {
      logger.warn('Email transporter verification failed - emails may not send');
    }

    // Setup email queue processor
    processEmailQueue(emailProcessor);

    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`✅ Server running on http://localhost:${PORT}`);
      logger.info(`📚 API available at http://localhost:${PORT}/api/v1`);
      logger.info(`🏥 Health check at http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();
