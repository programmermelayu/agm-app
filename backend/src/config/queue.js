import Queue from 'bull';
import logger from './logger.js';

// Get Redis connection config - support Railway's REDIS_URL or individual env vars
const getRedisConfig = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  };
};

// Email queue for background job processing
const emailQueue = new Queue('email', {
  redis: getRedisConfig(),
});

// Queue event handlers
emailQueue.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`, {
    jobId: job.id,
    jobData: job.data,
  });
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed`, {
    jobId: job.id,
    error: err.message,
    attempts: job.attemptsMade,
    maxAttempts: job.opts.attempts,
  });
});

emailQueue.on('error', (err) => {
  logger.error('Queue error', {
    error: err.message,
  });
});

/**
 * Add email job to queue
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} template - Email template name
 * @param {object} data - Template data
 * @returns {Promise<Job>} - Bull job
 */
export async function addEmailJob(to, subject, template, data) {
  try {
    const job = await emailQueue.add(
      {
        to,
        subject,
        template,
        data,
      },
      {
        attempts: 3, // Retry up to 3 times
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 second delay, exponential backoff
        },
        removeOnComplete: true, // Remove job after completion
        removeOnFail: false, // Keep failed jobs for debugging
      }
    );

    logger.info(`Email job added to queue`, {
      jobId: job.id,
      to,
      template,
    });

    return job;
  } catch (error) {
    logger.error('Failed to add email job to queue', {
      error: error.message,
      to,
      template,
    });
    throw error;
  }
}

/**
 * Process email jobs
 * @param {function} emailProcessor - Function to process email job
 */
export function processEmailQueue(emailProcessor) {
  emailQueue.process(1, async (job) => {
    try {
      const result = await emailProcessor(job.data);
      return result;
    } catch (error) {
      logger.error(`Email processor error for job ${job.id}`, {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  });
}

/**
 * Close queue connection
 */
export async function closeQueue() {
  await emailQueue.close();
}

export default emailQueue;
