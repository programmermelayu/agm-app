import db from '../config/database.js';

/**
 * Invitation Model - Database access layer for AGM invitations
 */
class Invitation {
  /**
   * Create a new invitation
   */
  static async create(agmId, attendeeEmail, rsvpToken) {
    const [invitation] = await db('invitations')
      .insert({
        agm_id: agmId,
        attendee_email: attendeeEmail.toLowerCase(),
        rsvp_token: rsvpToken,
        rsvp_status: 'pending',
      })
      .returning('*');

    return invitation;
  }

  /**
   * Create multiple invitations (batch)
   */
  static async createBatch(agmId, emails, tokenGenerator) {
    const invitations = await Promise.all(
      emails.map((email) =>
        this.create(agmId, email, tokenGenerator(agmId, email))
      )
    );

    return invitations;
  }

  /**
   * Find invitation by ID
   */
  static async findById(id) {
    const invitation = await db('invitations')
      .where({ id })
      .first();

    return invitation;
  }

  /**
   * Find invitation by RSVP token
   */
  static async findByToken(token) {
    const invitation = await db('invitations')
      .where({ rsvp_token: token })
      .first();

    return invitation;
  }

  /**
   * Find invitations for an AGM
   */
  static async findByAGM(agmId, options = {}) {
    const { page = 1, limit = 50, status } = options;

    let query = db('invitations').where({ agm_id: agmId });

    if (status) {
      query = query.where({ rsvp_status: status });
    }

    // Get total count
    const { count } = await query
      .clone()
      .count('* as count')
      .first();

    // Pagination
    const offset = (page - 1) * limit;

    const invitations = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      invitations,
      total: parseInt(count),
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Update RSVP status
   */
  static async updateRSVP(token, rsvpStatus) {
    const [invitation] = await db('invitations')
      .where({ rsvp_token: token })
      .update({
        rsvp_status: rsvpStatus,
        responded_at: db.fn.now(),
      })
      .returning('*');

    return invitation;
  }

  /**
   * Get RSVP summary for an AGM
   */
  static async getRSVPSummary(agmId) {
    const summary = await db('invitations')
      .where({ agm_id: agmId })
      .groupBy('rsvp_status')
      .select('rsvp_status', db.raw('count(*) as count'));

    const result = {
      pending: 0,
      attending: 0,
      not_attending: 0,
      maybe: 0,
      total: 0,
    };

    summary.forEach((row) => {
      result[row.rsvp_status] = parseInt(row.count);
      result.total += parseInt(row.count);
    });

    return result;
  }

  /**
   * Check if email already invited to AGM
   */
  static async exists(agmId, email) {
    const invitation = await db('invitations')
      .where({
        agm_id: agmId,
        attendee_email: email.toLowerCase(),
      })
      .first();

    return !!invitation;
  }

  /**
   * Delete invitation (for cleanup)
   */
  static async delete(id) {
    const result = await db('invitations').where({ id }).del();
    return result > 0;
  }
}

export default Invitation;
