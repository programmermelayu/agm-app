import logger from '../config/logger.js';

/**
 * Global error handling middleware
 * Should be registered as the last middleware in Express app
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  logger.error({
    message,
    statusCode,
    path: req.path,
    method: req.method,
    error: err.stack,
    userId: req.user?.id,
  });

  // Handle specific error types
  if (err.code === 'ER_DUP_ENTRY' || err.code === 'UNIQUE') {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Resource already exists',
        details: err.detail,
      },
    });
  }

  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable',
      },
    });
  }

  // Default error response
  res.status(statusCode).json({
    error: {
      code: 'SERVER_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * 404 Not Found middleware
 * Register before errorHandler
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};

/**
 * Async error wrapper for route handlers
 * Usage: router.post('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
