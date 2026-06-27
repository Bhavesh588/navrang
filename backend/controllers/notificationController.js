const notificationModel = require('../models/notificationModel');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

module.exports = {
  // Create notification
  createNotification: asyncHandler(async (req, res) => {
    const { type, title, message, data } = req.body;
    
    logger.info('Creating new notification', { type, title });
    
    if (!type || !title || !message) {
      logger.warn('Notification creation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Type, title, and message are required'
      });
    }
    
    const notification = await notificationModel.createNotification({
      type,
      title,
      message,
      data,
      is_read: false
    });
    
    logger.info('Notification created successfully', { notificationId: notification.id, type });
    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  }),
  
  // Get all notifications
  getAllNotifications: asyncHandler(async (req, res) => {
    const { type, is_read } = req.query;
    
    logger.info('Fetching all notifications', { type, is_read });
    
    const filters = {};
    if (type) filters.type = type;
    if (is_read !== undefined) filters.is_read = is_read === 'true';
    
    const notifications = await notificationModel.getAllNotifications(filters);
    
    logger.info('Notifications fetched successfully', { count: notifications.length });
    res.json({
      success: true,
      data: notifications,
      message: 'Notifications fetched successfully'
    });
  }),

  // Get notification by ID
  getNotificationById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.info('Fetching notification', { notificationId: id });
    const notification = await notificationModel.getNotificationById(id);
    
    if (!notification) {
      logger.warn('Notification not found', { notificationId: id });
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    logger.info('Notification fetched successfully', { notificationId: id, type: notification.type });
    res.json({
      success: true,
      data: notification,
      message: 'Notification fetched successfully'
    });
  }),

  // Get unread notifications count
  getUnreadCount: asyncHandler(async (req, res) => {
    logger.info('Fetching unread notifications count');
    const count = await notificationModel.getUnreadCount();
    
    logger.info('Unread count fetched successfully', { count });
    res.json({
      success: true,
      data: { count },
      message: 'Unread count fetched successfully'
    });
  }),

  // Get unread notifications
  getUnreadNotifications: asyncHandler(async (req, res) => {
    logger.info('Fetching unread notifications');
    const notifications = await notificationModel.getUnreadNotifications();
    
    logger.info('Unread notifications fetched successfully', { count: notifications.length });
    res.json({
      success: true,
      data: notifications,
      message: 'Unread notifications fetched successfully'
    });
  }),

  // Get notifications by type
  getNotificationsByType: asyncHandler(async (req, res) => {
    const { type } = req.params;
    
    logger.info('Fetching notifications by type', { type });
    
    if (!type) {
      logger.warn('Notifications fetch failed - type is required');
      return res.status(400).json({
        success: false,
        message: 'Notification type is required'
      });
    }
    
    const notifications = await notificationModel.getNotificationsByType(type);
    
    logger.info('Notifications by type fetched successfully', { type, count: notifications.length });
    res.json({
      success: true,
      data: notifications,
      message: 'Notifications fetched successfully'
    });
  }),

  // Get recent notifications
  getRecentNotifications: asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;
    logger.info('Fetching recent notifications', { limit });
    const notifications = await notificationModel.getRecentNotifications(parseInt(limit));
    
    logger.info('Recent notifications fetched successfully', { count: notifications.length, limit });
    res.json({
      success: true,
      data: notifications,
      message: 'Recent notifications fetched successfully'
    });
  }),

  // Mark notification as read
  markAsRead: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info('Marking notification as read', { notificationId: id });
    
    const notification = await notificationModel.getNotificationById(id);
    if (!notification) {
      logger.warn('Notification mark as read failed - notification not found', { notificationId: id });
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const updated = await notificationModel.markAsRead(id);
    
    logger.info('Notification marked as read successfully', { notificationId: id });
    res.json({
      success: true,
      data: updated,
      message: 'Notification marked as read'
    });
  }),

  // Mark all notifications as read
  markAllAsRead: asyncHandler(async (req, res) => {
    logger.info('Marking all notifications as read');
    await notificationModel.markAllAsRead();
    
    logger.info('All notifications marked as read successfully');
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  }),

  // Delete notification
  deleteNotification: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info('Deleting notification', { notificationId: id });
    
    const notification = await notificationModel.getNotificationById(id);
    if (!notification) {
      logger.warn('Notification deletion failed - notification not found', { notificationId: id });
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const deleteResult = await notificationModel.deleteNotification(id).catch(err => err)
    if (deleteResult.code === 'ER_ROW_IS_REFERENCED_2') {
      logger.warn('Notification deletion failed - notification in use', { notificationId: id });
      return res.status(409).json({
        success: false,
        code: "NOTIFICATION_IN_USE",
        message: "Cannot delete notification because it is assigned to existing users"
      });
    }
    
    logger.info('Notification deleted successfully', { notificationId: id, type: notification.type });
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  }),

  // Get notification statistics
  getNotificationStats: asyncHandler(async (req, res) => {
    logger.info('Fetching notification statistics');
    const stats = await notificationModel.getNotificationStats();
    
    logger.info('Notification statistics fetched successfully', { totalCount: stats.totalCount, unreadCount: stats.unreadCount });
    res.json({
      success: true,
      data: stats,
      message: 'Notification statistics fetched successfully'
    });
  })
};
