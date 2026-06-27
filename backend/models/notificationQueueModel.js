const db = require('../config/dbConfig');
const logger = require('../utils/logger');

module.exports = {
  async createItem({ notification_id, push_token, payload, next_retry_at = null }) {
    const [id] = await db('notification_queue').insert({
      notification_id,
      push_token,
      payload: JSON.stringify(payload),
      next_retry_at,
      status: 'pending'
    });

    return db('notification_queue').where({ id }).first();
  },

  async getDueItems(limit = 20) {
    return db('notification_queue')
      .where('status', 'pending')
      .andWhere(function() {
        this.whereNull('next_retry_at').orWhere('next_retry_at', '<=', db.fn.now());
      })
      .orderBy('attempts', 'asc')
      .orderBy('created_at', 'asc')
      .limit(limit);
  },

  async markAsSent(id) {
    return db('notification_queue').where({ id }).update({ status: 'sent', updated_at: db.fn.now() });
  },

  async markAsFailed(id, errorMessage, attempts, nextRetryAt) {
    return db('notification_queue')
      .where({ id })
      .update({
        status: attempts >= 3 ? 'failed' : 'pending',
        attempts,
        next_retry_at: nextRetryAt,
        error_message: errorMessage,
        updated_at: db.fn.now()
      });
  },

  async incrementAttempt(id) {
    return db('notification_queue')
      .where({ id })
      .increment('attempts', 1)
      .update({ updated_at: db.fn.now() });
  },

  async pruneOldSent(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return db('notification_queue').where('status', 'sent').andWhere('updated_at', '<', cutoff).del();
  }
};