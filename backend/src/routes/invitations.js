import express from 'express';
import Joi from 'joi';
import { verifyToken, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import AGM from '../models/AGM.js';
import Invitation from '../models/Invitation.js';
import * as InvitationService from '../services/InvitationService.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * Validation schemas
 */
const createInvitationSchema = Joi.object({
  attendee_email: Joi.string().email().lowercase().required(),
});

const batchInvitationSchema = Joi.object({
  emails: Joi.array()
    .items(Joi.string().email().lowercase())
    .min(1)
    .max(100)
    .required(),
});

const rsvpSchema = Joi.object({
  rsvp_status: Joi.string()
    .valid('attending', 'not_attending', 'maybe')
    .required(),
});

const invitationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  status: Joi.string().valid('pending', 'attending', 'not_attending', 'maybe'),
});

/**
 * POST /api/v1/agms/:agm_id/invitations
 * Create a single invitation
 */
router.post(
  '/:agm_id/invitations',
  requireAuth,
  validate(createInvitationSchema),
  asyncHandler(async (req, res) => {
    const { agm_id } = req.params;
    const { attendee_email } = req.body;

    // Check AGM ownership
    const agm = await AGM.findById(agm_id);
    if (!agm || agm.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to invite for this AGM',
      });
    }

    const invitation = await InvitationService.createInvitation(
      agm_id,
      attendee_email
    );

    res.status(201).json({
      success: true,
      data: invitation,
    });
  })
);

/**
 * POST /api/v1/agms/:agm_id/invitations/batch
 * Create multiple invitations (batch)
 */
router.post(
  '/:agm_id/invitations/batch',
  requireAuth,
  validate(batchInvitationSchema),
  asyncHandler(async (req, res) => {
    const { agm_id } = req.params;
    const { emails } = req.body;

    // Check AGM ownership
    const agm = await AGM.findById(agm_id);
    if (!agm || agm.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to invite for this AGM',
      });
    }

    const results = await InvitationService.createInvitationsBatch(
      agm_id,
      emails
    );

    res.status(201).json({
      success: true,
      data: results,
    });
  })
);

/**
 * GET /api/v1/agms/:agm_id/invitations
 * List invitations for an AGM
 */
router.get(
  '/:agm_id/invitations',
  requireAuth,
  validate(invitationQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { agm_id } = req.params;
    const { page, limit, status } = req.query;

    // Check AGM ownership
    const agm = await AGM.findById(agm_id);
    if (!agm || agm.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view invitations for this AGM',
      });
    }

    const result = await InvitationService.getInvitations(agm_id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /api/v1/agms/:agm_id/invitations/summary
 * Get RSVP summary for an AGM
 */
router.get(
  '/:agm_id/invitations/summary',
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

    const summary = await InvitationService.getRSVPSummary(agm_id);

    res.status(200).json({
      success: true,
      data: summary,
    });
  })
);

/**
 * Create public RSVP router (exported separately for root-level mounting)
 */
export function createPublicRSVPRouter() {
  const publicRouter = express.Router();

  publicRouter.post(
    '/:token',
    validate(rsvpSchema),
    asyncHandler(async (req, res) => {
      const { token } = req.params;
      const { rsvp_status } = req.body;

      const invitation = await InvitationService.updateRSVP(token, rsvp_status);

      res.status(200).json({
        success: true,
        data: invitation,
      });
    })
  );

  return publicRouter;
}

/**
 * DELETE /api/v1/invitations/:id
 * Delete an invitation
 */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify the user has permission to delete (owns the AGM)
    const invitation = await Invitation.findById(id);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found',
      });
    }

    const agm = await AGM.findById(invitation.agm_id);
    if (!agm || agm.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this invitation',
      });
    }

    await InvitationService.deleteInvitation(id);

    res.status(204).send();
  })
);

export default router;
