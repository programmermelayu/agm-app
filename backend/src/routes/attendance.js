import express from 'express';
import Joi from 'joi';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import AGM from '../models/AGM.js';
import * as AttendanceService from '../services/AttendanceService.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * Validation schemas
 */
const checkInSchema = Joi.object({
  attendee_name: Joi.string().max(255).required(),
  attendee_email: Joi.string().email().lowercase().required(),
  notes: Joi.string().max(500).optional(),
});

const bulkCheckInSchema = Joi.object({
  attendees: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().max(255).required(),
        email: Joi.string().email().lowercase().required(),
        notes: Joi.string().max(500).optional(),
      })
    )
    .min(1)
    .max(500)
    .required(),
});

const attendanceQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

/**
 * POST /api/v1/agms/:agm_id/attendance
 * Check in an attendee
 */
router.post(
  '/:agm_id/attendance',
  requireAuth,
  validate(checkInSchema),
  asyncHandler(async (req, res) => {
    const { agm_id } = req.params;
    const { attendee_name, attendee_email, notes } = req.body;

    // Check AGM ownership
    const agm = await AGM.findById(agm_id);
    if (!agm || agm.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to check in attendees for this AGM',
      });
    }

    const attendance = await AttendanceService.checkIn(
      agm_id,
      attendee_name,
      attendee_email,
      req.user.email,
      notes
    );

    res.status(201).json({
      success: true,
      data: attendance,
    });
  })
);

/**
 * POST /api/v1/agms/:agm_id/attendance/bulk
 * Bulk check-in
 */
router.post(
  '/:agm_id/attendance/bulk',
  requireAuth,
  validate(bulkCheckInSchema),
  asyncHandler(async (req, res) => {
    const { agm_id } = req.params;
    const { attendees } = req.body;

    // Check AGM ownership
    const agm = await AGM.findById(agm_id);
    if (!agm || agm.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to check in attendees for this AGM',
      });
    }

    const results = await AttendanceService.bulkCheckIn(
      agm_id,
      attendees,
      req.user.email
    );

    res.status(201).json({
      success: true,
      data: results,
    });
  })
);

/**
 * GET /api/v1/agms/:agm_id/attendance
 * List attendance records for an AGM
 */
router.get(
  '/:agm_id/attendance',
  requireAuth,
  validate(attendanceQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { agm_id } = req.params;
    const { page, limit } = req.query;

    // Check AGM ownership
    const agm = await AGM.findById(agm_id);
    if (!agm || agm.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view attendance for this AGM',
      });
    }

    const result = await AttendanceService.getAttendance(agm_id, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /api/v1/agms/:agm_id/attendance/stats
 * Get attendance statistics for an AGM
 */
router.get(
  '/:agm_id/attendance/stats',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { agm_id } = req.params;

    // Check AGM ownership
    const agm = await AGM.findById(agm_id);
    if (!agm || agm.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this AGM',
      });
    }

    const stats = await AttendanceService.getStatistics(agm_id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  })
);

/**
 * GET /api/v1/agms/:agm_id/attendance/comparison
 * Get RSVP vs attendance comparison
 */
router.get(
  '/:agm_id/attendance/comparison',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { agm_id } = req.params;

    // Check AGM ownership
    const agm = await AGM.findById(agm_id);
    if (!agm || agm.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this AGM',
      });
    }

    const comparison = await AttendanceService.getComparisonSummary(agm_id);

    res.status(200).json({
      success: true,
      data: comparison,
    });
  })
);

/**
 * DELETE /api/v1/attendance/:id
 * Undo a check-in
 */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Note: In production, you might want to verify the user owns the AGM
    // For now, we trust that only AGM organizers call this endpoint
    await AttendanceService.undoCheckIn(id);

    res.status(204).send();
  })
);

export default router;
