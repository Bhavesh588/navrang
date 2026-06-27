const db = require('../config/dbConfig');
const logger = require('../utils/logger');

module.exports = {
  async createOrUpdateToken({ user_id, platform, push_token }) {
    try {
      const existing = await db('device_tokens')
        .where({ user_id, push_token })
        .first();

      if (existing) {
        await db('device_tokens')
          .where({ id: existing.id })
          .update({ is_active: true, last_seen_at: db.fn.now(), platform });
        return { ...existing, is_active: true, last_seen_at: new Date() };
      }

      const [id] = await db('device_tokens').insert({
        user_id,
        platform,
        push_token,
        is_active: true,
        last_seen_at: db.fn.now()
      });

      return db('device_tokens').where({ id }).first();
    } catch (error) {
      logger.error('Error creating/updating device token', { error: error.message, user_id, push_token });
      throw error;
    }
  },

  async deactivateToken(push_token) {
    return db('device_tokens')
      .where({ push_token })
      .update({ is_active: false });
  },

  async getTokensForUsers(userIds) {
    if (!userIds || userIds.length === 0) return [];

    return db('device_tokens')
      .whereIn('user_id', userIds)
      .andWhere({ is_active: true })
      .select('push_token');
  },

  async getTokensForAllActiveUsers() {
    return db('device_tokens')
      .where({ is_active: true })
      .select('push_token');
  },

  async deleteById(id) {
    return db('device_tokens').where({ id }).del();
  }
};
