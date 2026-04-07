import db from '../config/database.js';

/**
 * AGM Model - Database access layer for Annual General Meetings
 */
class AGM {
  /**
   * Create a new AGM
   */
  static async create(createdBy, name, date, time, location) {
    const [agm] = await db('agms')
      .insert({
        created_by: createdBy,
        name,
        date,
        time,
        location,
        status: 'draft',
      })
      .returning('*');

    return agm;
  }

  /**
   * Find AGM by ID
   */
  static async findById(id) {
    const agm = await db('agms')
      .where({ id })
      .first();

    return agm;
  }

  /**
   * Find AGMs by user (with pagination and filtering)
   */
  static async findByUser(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      dateFrom,
      dateTo,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    let query = db('agms').where({ created_by: userId });

    // Filter by status
    if (status) {
      query = query.where({ status });
    }

    // Filter by date range
    if (dateFrom) {
      query = query.where('date', '>=', dateFrom);
    }
    if (dateTo) {
      query = query.where('date', '<=', dateTo);
    }

    // Get total count
    const { count } = await query
      .clone()
      .count('* as count')
      .first();

    // Pagination
    const offset = (page - 1) * limit;

    // Get paginated results
    const agms = await query
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      agms,
      total: parseInt(count),
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Update AGM
   */
  static async update(id, updates) {
    const [agm] = await db('agms')
      .where({ id })
      .update({
        ...updates,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return agm;
  }

  /**
   * Delete AGM
   */
  static async delete(id) {
    const result = await db('agms')
      .where({ id })
      .del();

    return result > 0;
  }

  /**
   * Get AGM with RSVP summary (for dashboard)
   */
  static async getWithSummary(id) {
    const agm = await db('agms')
      .where({ id })
      .first();

    if (!agm) return null;

    // Get RSVP summary (to be used in Phase 5)
    const rsvpSummary = await db('invitations')
      .where({ agm_id: id })
      .groupBy('rsvp_status')
      .select('rsvp_status', db.raw('count(*) as count'));

    const summary = {
      pending: 0,
      attending: 0,
      not_attending: 0,
      maybe: 0,
    };

    rsvpSummary.forEach((row) => {
      summary[row.rsvp_status] = parseInt(row.count);
    });

    return {
      ...agm,
      invitation_count: Object.values(summary).reduce((a, b) => a + b, 0),
      rsvp_summary: summary,
    };
  }

  /**
   * Count AGMs by user
   */
  static async countByUser(userId) {
    const result = await db('agms')
      .where({ created_by: userId })
      .count('* as count')
      .first();

    return result.count;
  }
}

export default AGM;
