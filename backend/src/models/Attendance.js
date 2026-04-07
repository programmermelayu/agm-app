import db from '../config/database.js';

/**
 * Attendance Model - Database access layer for AGM attendance
 */
class Attendance {
  /**
   * Create a new attendance record (check-in)
   */
  static async create(agmId, attendeeName, attendeeEmail, invitationId = null, checkedInBy = null, notes = null) {
    const [attendance] = await db('attendance')
      .insert({
        agm_id: agmId,
        invitation_id: invitationId,
        attendee_name: attendeeName,
        attendee_email: attendeeEmail.toLowerCase(),
        checked_in_by: checkedInBy,
        notes,
      })
      .returning('*');

    return attendance;
  }

  /**
   * Find attendance record by ID
   */
  static async findById(id) {
    const attendance = await db('attendance')
      .where({ id })
      .first();

    return attendance;
  }

  /**
   * Find attendance record by email and AGM
   */
  static async findByEmail(agmId, email) {
    const attendance = await db('attendance')
      .where({
        agm_id: agmId,
        attendee_email: email.toLowerCase(),
      })
      .first();

    return attendance;
  }

  /**
   * Find all attendance records for an AGM
   */
  static async findByAGM(agmId, options = {}) {
    const { page = 1, limit = 50 } = options;

    let query = db('attendance').where({ agm_id: agmId });

    // Get total count
    const { count } = await query
      .clone()
      .count('* as count')
      .first();

    // Pagination
    const offset = (page - 1) * limit;

    const attendance = await query
      .orderBy('checked_in_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      attendance,
      total: parseInt(count),
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get attendance statistics for an AGM
   */
  static async getStatistics(agmId) {
    const [totalAttendance] = await db('attendance')
      .where({ agm_id: agmId })
      .count('* as count');

    const totalAttendanceCount = parseInt(totalAttendance.count);

    // Get attendance by status (attended vs no-show from invitations)
    const [totalInvitations] = await db('invitations')
      .where({ agm_id: agmId })
      .count('* as count');

    const totalInvitationsCount = parseInt(totalInvitations.count);

    // Calculate no-shows (RSVP attending but not checked in)
    const attendedAndRSVPed = await db('attendance as a')
      .leftJoin('invitations as i', 'a.invitation_id', 'i.id')
      .where({ 'a.agm_id': agmId })
      .where({ 'i.rsvp_status': 'attending' })
      .count('* as count')
      .first();

    const noShowCount = Math.max(
      0,
      (await db('invitations')
        .where({ agm_id: agmId, rsvp_status: 'attending' })
        .count('* as count')
        .first()
        .then((r) => parseInt(r.count))) - parseInt(attendedAndRSVPed.count)
    );

    return {
      total_checked_in: totalAttendanceCount,
      total_invited: totalInvitationsCount,
      no_shows: noShowCount,
      attendance_rate:
        totalInvitationsCount > 0
          ? Math.round((totalAttendanceCount / totalInvitationsCount) * 100)
          : 0,
    };
  }

  /**
   * Update attendance record
   */
  static async update(id, data) {
    const [attendance] = await db('attendance')
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return attendance;
  }

  /**
   * Check if attendee is already checked in
   */
  static async exists(agmId, email) {
    const attendance = await db('attendance')
      .where({
        agm_id: agmId,
        attendee_email: email.toLowerCase(),
      })
      .first();

    return !!attendance;
  }

  /**
   * Delete attendance record
   */
  static async delete(id) {
    const result = await db('attendance').where({ id }).del();
    return result > 0;
  }

  /**
   * Bulk check-in
   */
  static async bulkCreate(agmId, attendees) {
    const records = attendees.map((attendee) => ({
      agm_id: agmId,
      invitation_id: attendee.invitation_id || null,
      attendee_name: attendee.name,
      attendee_email: attendee.email.toLowerCase(),
      checked_in_by: attendee.checked_in_by || null,
      notes: attendee.notes || null,
    }));

    const results = await db('attendance').insert(records).returning('*');
    return results;
  }
}

export default Attendance;
