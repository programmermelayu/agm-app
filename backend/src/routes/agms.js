import express from 'express';
import Joi from 'joi';
import AGMService from '../services/AGMService.js';
import { validate, validateQuery, validateParams, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * Validation schemas
 */
const createAGMSchema = Joi.object({
  name: schemas.agmName,
  date: schemas.date,
  time: schemas.time,
  location: schemas.location,
});

const updateAGMSchema = Joi.object({
  name: schemas.agmName.optional(),
  date: schemas.date.optional(),
  time: schemas.time.optional(),
  location: schemas.location.optional(),
  status: Joi.string()
    .enum('draft', 'scheduled', 'completed')
    .optional(),
}).min(1); // At least one field must be provided

const listAGMsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().enum('draft', 'scheduled', 'completed').optional(),
  date_from: Joi.date().iso().optional(),
  date_to: Joi.date().iso().optional(),
  sort_by: Joi.string().default('created_at'),
  sort_order: Joi.string().enum('asc', 'desc').default('desc'),
});

const paramSchema = Joi.object({
  agm_id: schemas.uuid,
});

/**
 * POST /agms
 * Create a new AGM
 */
router.post(
  '/',
  requireAuth,
  validate(createAGMSchema),
  asyncHandler(async (req, res) => {
    const { name, date, time, location } = req.validatedBody;

    try {
      const agm = await AGMService.createAGM(
        req.user.userId,
        name,
        date,
        time,
        location
      );

      res.status(201).json({
        agm,
      });
    } catch (error) {
      if (error.message.includes('must be') || error.message.includes('required')) {
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
 * GET /agms
 * List user's AGMs with pagination and filtering
 */
router.get(
  '/',
  requireAuth,
  validateQuery(listAGMsQuerySchema),
  asyncHandler(async (req, res) => {
    const { page, limit, status, date_from, date_to, sort_by, sort_order } =
      req.query;

    const result = await AGMService.getAGMs(req.user.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      dateFrom: date_from,
      dateTo: date_to,
      sortBy: sort_by,
      sortOrder: sort_order,
    });

    res.status(200).json({
      agms: result.agms,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: result.totalPages,
      },
    });
  })
);

/**
 * GET /agms/:agm_id
 * Get AGM details
 */
router.get(
  '/:agm_id',
  requireAuth,
  validateParams(paramSchema),
  asyncHandler(async (req, res) => {
    const { agm_id } = req.params;

    try {
      const agm = await AGMService.getAGM(agm_id, req.user.userId);

      res.status(200).json({
        agm,
      });
    } catch (error) {
      if (error.message === 'AGM not found') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'AGM not found',
          },
        });
      }
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: error.message,
          },
        });
      }
      throw error;
    }
  })
);

/**
 * PATCH /agms/:agm_id
 * Update AGM (draft status only)
 */
router.patch(
  '/:agm_id',
  requireAuth,
  validateParams(paramSchema),
  validate(updateAGMSchema),
  asyncHandler(async (req, res) => {
    const { agm_id } = req.params;
    const updates = req.validatedBody;

    try {
      const agm = await AGMService.updateAGM(agm_id, req.user.userId, updates);

      res.status(200).json({
        agm,
      });
    } catch (error) {
      if (error.message === 'AGM not found') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'AGM not found',
          },
        });
      }
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: error.message,
          },
        });
      }
      if (error.message.includes('draft') || error.message.includes('must be')) {
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
 * DELETE /agms/:agm_id
 * Delete AGM (draft status only)
 */
router.delete(
  '/:agm_id',
  requireAuth,
  validateParams(paramSchema),
  asyncHandler(async (req, res) => {
    const { agm_id } = req.params;

    try {
      const success = await AGMService.deleteAGM(agm_id, req.user.userId);

      if (!success) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'AGM not found',
          },
        });
      }

      res.status(204).send();
    } catch (error) {
      if (error.message === 'AGM not found') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'AGM not found',
          },
        });
      }
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: error.message,
          },
        });
      }
      if (error.message.includes('draft')) {
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

export default router;
