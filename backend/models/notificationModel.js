const db = require('../config/dbConfig');
const logger = require('../utils/logger');

module.exports = {
  // Get all notifications
  async getAllNotifications(filters = {}) {
    let query = db('notifications');
    
    if (filters.type) query = query.where({ type: filters.type });
    if (filters.is_read !== undefined) query = query.where({ is_read: filters.is_read });
    
    return query.orderBy('created_at', 'desc');
  },

  // Get notification by ID
  async getNotificationById(id) {
    return db('notifications').where({ id }).first();
  },

  // Create new notification
  async createNotification(data) {
    const [id] = await db('notifications').insert(data);
    return this.getNotificationById(id);
  },

  // Update notification
  async updateNotification(id, data) {
    await db('notifications').where({ id }).update(data);
    return this.getNotificationById(id);
  },

  // Delete notification
  async deleteNotification(id) {
    return db('notifications').where({ id }).del();
  },

  // Mark notification as read
  async markAsRead(id) {
    return this.updateNotification(id, { is_read: true });
  },

  // Mark all notifications as read
  async markAllAsRead() {
    return db('notifications').update({ is_read: true });
  },

  // Get unread notifications count
  async getUnreadCount() {
    const result = await db('notifications')
      .where({ is_read: false })
      .count('* as count')
      .first();
    
    return result.count;
  },

  // Get unread notifications
  async getUnreadNotifications() {
    return db('notifications')
      .where({ is_read: false })
      .orderBy('created_at', 'desc');
  },

  // Get notifications by type
  async getNotificationsByType(type) {
    return db('notifications')
      .where({ type })
      .orderBy('created_at', 'desc');
  },

  // Get recent notifications
  async getRecentNotifications(limit = 20) {
    return db('notifications')
      .orderBy('created_at', 'desc')
      .limit(limit);
  },

  // Delete old notifications (older than days)
  async deleteOldNotifications(days = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return db('notifications')
      .where(db.raw(`created_at < ?`, [date]))
      .del();
  },

  // Get notification statistics
  async getNotificationStats() {
    const unread = await db('notifications')
      .where({ is_read: false })
      .count('* as count')
      .first();
    
    const byType = await db('notifications')
      .select('type')
      .count('* as count')
      .groupBy('type');
    
    return {
      unread_count: unread.count,
      by_type: byType
    };
  }
};
