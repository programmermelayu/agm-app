import Attendance from '../models/Attendance.js';
import Invitation from '../models/Invitation.js';
import AGM from '../models/AGM.js';
import logger from '../config/logger.js';

/**
 * Check in an attendee
 */
export async function checkIn(agmId, attendeeName, attendeeEmail, checkedInBy = null, notes = null) {
  try {
    // Check if AGM exists
    const agm = await AGM.findById(agmId);
    if (!agm) {
      throw new Error('AGM not found');
    }

    // Check if already checked in
    const exists = await Attendance.exists(agmId, attendeeEmail);
    if (exists) {
      throw new Error('Attendee already checked in');
    }

    // Try to find matching invitation
    let invitationId = null;
    const invitation = await Invitation.findByAGM(agmId, { status: 'attending' })
      .then(result => {
        const found = result.invitations.find(
          (inv) => inv.attendee_email === attendeeEmail.toLowerCase()
        );
        return found;
      });

    if (invitation) {
      invitationId = invitation.id;
    }

    // Create attendance record
    const attendance = await Attendance.create(
      agmId,
      attendeeName,
      attendeeEmail,
      invitationId,
      checkedInBy,
      notes
    );

    logger.info('Attendee checked in', {
      attendanceId: attendance.id,
      agmId,
      attendeeEmail,
    });

    return attendance;
  } catch (error) {
    logger.error('Failed to check in attendee', {
      agmId,
      attendeeEmail,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Bulk check-in multiple attendees
 */
export async function bulkCheckIn(agmId, attendees, checkedInBy = null) {
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

    for (const attendee of attendees) {
      try {
        const record = await checkIn(
          agmId,
          attendee.name,
          attendee.email,
          checkedInBy,
          attendee.notes
        );
        results.success.push({
          email: attendee.email,
          attendanceId: record.id,
        });
      } catch (error) {
        results.failed.push({
          email: attendee.email,
          reason: error.message,
        });
      }
    }

    logger.info('Bulk check-in completed', {
      agmId,
      total: attendees.length,
      success: results.success.length,
      failed: results.failed.length,
    });

    return results;
  } catch (error) {
    logger.error('Failed to bulk check in', {
      agmId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get attendance records for an AGM
 */
export async function getAttendance(agmId, options = {}) {
  try {
    const result = await Attendance.findByAGM(agmId, options);
    return result;
  } catch (error) {
    logger.error('Failed to get attendance records', {
      agmId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get attendance statistics for an AGM
 */
export async function getStatistics(agmId) {
  try {
    const stats = await Attendance.getStatistics(agmId);
    return stats;
  } catch (error) {
    logger.error('Failed to get attendance statistics', {
      agmId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get attendance comparison (RSVP vs actual)
 */
export async function getComparisonSummary(agmId) {
  try {
    const rsvpSummary = await Invitation.getRSVPSummary(agmId);
    const attendanceStats = await Attendance.getStatistics(agmId);

    return {
      rsvp: rsvpSummary,
      attendance: attendanceStats,
      comparison: {
        confirmed_attended: 0, // RSVP attending that checked in
        confirmed_no_show: attendanceStats.no_shows, // RSVP attending but not checked in
        uninvited_attended: 0, // Checked in but not invited
      },
    };
  } catch (error) {
    logger.error('Failed to get comparison summary', {
      agmId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Undo check-in
 */
export async function undoCheckIn(attendanceId) {
  try {
    const deleted = await Attendance.delete(attendanceId);
    if (!deleted) {
      throw new Error('Attendance record not found');
    }

    logger.info('Check-in undone', {
      attendanceId,
    });

    return true;
  } catch (error) {
    logger.error('Failed to undo check-in', {
      attendanceId,
      error: error.message,
    });
    throw error;
  }
}

export default {
  checkIn,
  bulkCheckIn,
  getAttendance,
  getStatistics,
  getComparisonSummary,
  undoCheckIn,
};
