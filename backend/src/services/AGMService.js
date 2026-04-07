import AGM from '../models/AGM.js';
import logger from '../config/logger.js';

/**
 * AGMService - Business logic for AGM operations
 */
class AGMService {
  /**
   * Create a new AGM
   * @throws {Error} if validation fails
   */
  static async createAGM(userId, name, date, time, location) {
    // Validate inputs
    if (!name || name.length < 1 || name.length > 255) {
      throw new Error('AGM name must be 1-255 characters');
    }

    if (!date) {
      throw new Error('Date is required');
    }

    // Validate date is not in the past
    const agmDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    agmDate.setHours(0, 0, 0, 0);

    if (agmDate < today) {
      throw new Error('Date must be today or in the future');
    }

    if (!time) {
      throw new Error('Time is required');
    }

    if (!location || location.length < 1 || location.length > 500) {
      throw new Error('Location must be 1-500 characters');
    }

    // Create AGM
    const agm = await AGM.create(userId, name, date, time, location);

    logger.info(`New AGM created: ${agm.name} (${agm.id}) by user ${userId}`);

    return agm;
  }

  /**
   * Get AGMs for a user with pagination and filtering
   */
  static async getAGMs(userId, filters = {}) {
    const result = await AGM.findByUser(userId, filters);
    return result;
  }

  /**
   * Get specific AGM with full details
   */
  static async getAGM(agmId, userId) {
    const agm = await AGM.findById(agmId);

    if (!agm) {
      throw new Error('AGM not found');
    }

    // Verify ownership
    if (agm.created_by !== userId) {
      throw new Error('Unauthorized: You do not own this AGM');
    }

    return agm;
  }

  /**
   * Get AGM with summary (invitations, RSVP counts, etc.)
   */
  static async getAGMWithSummary(agmId, userId) {
    const agm = await AGM.findById(agmId);

    if (!agm) {
      throw new Error('AGM not found');
    }

    // Verify ownership
    if (agm.created_by !== userId) {
      throw new Error('Unauthorized: You do not own this AGM');
    }

    return await AGM.getWithSummary(agmId);
  }

  /**
   * Update AGM (only allowed in draft status)
   */
  static async updateAGM(agmId, userId, updates) {
    const agm = await AGM.findById(agmId);

    if (!agm) {
      throw new Error('AGM not found');
    }

    // Verify ownership
    if (agm.created_by !== userId) {
      throw new Error('Unauthorized: You do not own this AGM');
    }

    // Only allow edits in draft status
    if (agm.status !== 'draft') {
      throw new Error('Can only edit AGMs in draft status');
    }

    // Validate updates
    const validUpdates = {};

    if (updates.name !== undefined) {
      if (!updates.name || updates.name.length < 1 || updates.name.length > 255) {
        throw new Error('AGM name must be 1-255 characters');
      }
      validUpdates.name = updates.name;
    }

    if (updates.date !== undefined) {
      const agmDate = new Date(updates.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      agmDate.setHours(0, 0, 0, 0);

      if (agmDate < today) {
        throw new Error('Date must be today or in the future');
      }
      validUpdates.date = updates.date;
    }

    if (updates.time !== undefined) {
      if (!updates.time) {
        throw new Error('Time is required');
      }
      validUpdates.time = updates.time;
    }

    if (updates.location !== undefined) {
      if (!updates.location || updates.location.length < 1 || updates.location.length > 500) {
        throw new Error('Location must be 1-500 characters');
      }
      validUpdates.location = updates.location;
    }

    if (updates.status !== undefined) {
      if (!['draft', 'scheduled', 'completed'].includes(updates.status)) {
        throw new Error('Invalid status');
      }
      validUpdates.status = updates.status;
    }

    const updatedAGM = await AGM.update(agmId, validUpdates);

    logger.info(`AGM updated: ${agmId} by user ${userId}`);

    return updatedAGM;
  }

  /**
   * Delete AGM (only allowed in draft status)
   */
  static async deleteAGM(agmId, userId) {
    const agm = await AGM.findById(agmId);

    if (!agm) {
      throw new Error('AGM not found');
    }

    // Verify ownership
    if (agm.created_by !== userId) {
      throw new Error('Unauthorized: You do not own this AGM');
    }

    // Only allow deletion in draft status
    if (agm.status !== 'draft') {
      throw new Error('Can only delete AGMs in draft status');
    }

    const result = await AGM.delete(agmId);

    if (result) {
      logger.info(`AGM deleted: ${agmId} by user ${userId}`);
    }

    return result;
  }
}

export default AGMService;
