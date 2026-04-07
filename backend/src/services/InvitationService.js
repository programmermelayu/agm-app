import Invitation from '../models/Invitation.js';
import AGM from '../models/AGM.js';
import { addEmailJob } from '../config/queue.js';
import { generateRSVPToken } from '../utils/token.js';
import logger from '../config/logger.js';

/**
 * Create and send invitation
 */
export async function createInvitation(agmId, attendeeEmail) {
  try {
    // Check if AGM exists
    const agm = await AGM.findById(agmId);
    if (!agm) {
      throw new Error('AGM not found');
    }

    // Check if invitation already exists
    const exists = await Invitation.exists(agmId, attendeeEmail);
    if (exists) {
      throw new Error('Invitation already sent to this email');
    }

    // Generate RSVP token
    const rsvpToken = generateRSVPToken(agmId, attendeeEmail);

    // Create invitation
    const invitation = await Invitation.create(agmId, attendeeEmail, rsvpToken);

    // Queue email job
    await addEmailJob(attendeeEmail, `Invitation: ${agm.name}`, 'invitation', {
      agmName: agm.name,
      agmDate: agm.date,
      agmTime: agm.time,
      rsvpToken,
    });

    logger.info('Invitation created and email queued', {
      invitationId: invitation.id,
      agmId,
      attendeeEmail,
    });

    return invitation;
  } catch (error) {
    logger.error('Failed to create invitation', {
      agmId,
      attendeeEmail,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Create multiple invitations (batch)
 */
export async function createInvitationsBatch(agmId, emails) {
  try {
    // Check if AGM exists
    const agm = await AGM.findById(agmId);
    if (!agm) {
      throw new Error('AGM not found');
    }

    const results = {
      success: [],
      failed: [],
    };

    for (const email of emails) {
      try {
        const invitation = await createInvitation(agmId, email);
        results.success.push({
          email,
          invitationId: invitation.id,
        });
      } catch (error) {
        results.failed.push({
          email,
          reason: error.message,
        });
      }
    }

    logger.info('Batch invitations processed', {
      agmId,
      total: emails.length,
      success: results.success.length,
      failed: results.failed.length,
    });

    return results;
  } catch (error) {
    logger.error('Failed to create batch invitations', {
      agmId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get invitations for AGM
 */
export async function getInvitations(agmId, options = {}) {
  try {
    const result = await Invitation.findByAGM(agmId, options);
    return result;
  } catch (error) {
    logger.error('Failed to get invitations', {
      agmId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Update RSVP status
 */
export async function updateRSVP(token, rsvpStatus) {
  try {
    // Validate RSVP status
    const validStatuses = ['attending', 'not_attending', 'maybe'];
    if (!validStatuses.includes(rsvpStatus)) {
      throw new Error(
        `Invalid RSVP status. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    // Find invitation by token
    const invitation = await Invitation.findByToken(token);
    if (!invitation) {
      throw new Error('Invalid RSVP token');
    }

    // Check if already responded
    if (invitation.responded_at) {
      throw new Error('RSVP already submitted for this invitation');
    }

    // Update RSVP status
    const updated = await Invitation.updateRSVP(token, rsvpStatus);

    // Queue confirmation email
    const agm = await AGM.findById(invitation.agm_id);
    await addEmailJob(
      invitation.attendee_email,
      `RSVP Confirmed: ${agm.name}`,
      'rsvp-confirmation',
      {
        agmName: agm.name,
        rsvpStatus,
      }
    );

    logger.info('RSVP updated and confirmation email queued', {
      invitationId: invitation.id,
      rsvpStatus,
    });

    return updated;
  } catch (error) {
    logger.error('Failed to update RSVP', {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get RSVP summary for AGM
 */
export async function getRSVPSummary(agmId) {
  try {
    const summary = await Invitation.getRSVPSummary(agmId);
    return summary;
  } catch (error) {
    logger.error('Failed to get RSVP summary', {
      agmId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Delete invitation
 */
export async function deleteInvitation(invitationId) {
  try {
    const deleted = await Invitation.delete(invitationId);
    if (!deleted) {
      throw new Error('Invitation not found');
    }

    logger.info('Invitation deleted', {
      invitationId,
    });

    return true;
  } catch (error) {
    logger.error('Failed to delete invitation', {
      invitationId,
      error: error.message,
    });
    throw error;
  }
}

export default {
  createInvitation,
  createInvitationsBatch,
  getInvitations,
  updateRSVP,
  getRSVPSummary,
  deleteInvitation,
};
