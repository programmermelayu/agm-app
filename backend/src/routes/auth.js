import express from 'express';
import Joi from 'joi';
import UserService from '../services/UserService.js';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * Validation schemas
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Must be a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Must be a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

/**
 * POST /auth/register
 * Register a new user
 */
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.validatedBody;

    try {
      const result = await UserService.register(email, password);

      res.status(201).json({
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      if (error.message === 'Email already registered') {
        return res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'Email already registered',
          },
        });
      }

      if (error.message.includes('Invalid email')) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }

      throw error;
    }
  })
);

/**
 * POST /auth/login
 * Login user and return JWT token
 */
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.validatedBody;

    try {
      const result = await UserService.login(email, password);

      res.status(200).json({
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
          },
        });
      }

      throw error;
    }
  })
);

/**
 * POST /auth/logout
 * Logout user (token-based, so nothing to do server-side)
 * Client should delete localStorage token
 */
router.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    // For JWT, logout is handled client-side by deleting the token
    // This endpoint is here for consistency and future use (e.g., token blacklisting)
    logger.info(`User logged out: ${req.user.email}`);

    res.status(200).json({
      message: 'Successfully logged out',
    });
  })
);

/**
 * GET /auth/me
 * Get current user info (protected route)
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.status(200).json({
      user: User.formatForResponse(user),
    });
  })
);

export default router;
