import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token and extract user information
 * Expects token in Authorization header: "Bearer {token}"
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid Authorization header',
        },
      });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user info to request
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token has expired',
          },
        });
      }
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Authentication error',
      },
    });
  }
};

/**
 * Middleware to require authentication
 * Use after verifyToken to ensure user is authenticated
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }
  next();
};

/**
 * Middleware to require specific role
 * Usage: roleRequired('admin')
 */
export const roleRequired = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Role '${requiredRole}' required`,
        },
      });
    }

    next();
  };
};

export default {
  verifyToken,
  requireAuth,
  roleRequired,
};
