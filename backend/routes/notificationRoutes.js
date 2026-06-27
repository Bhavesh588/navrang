const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middlewares/auth');

// Routes
router.post('/', authenticate, authorize('admin'), notificationController.createNotification);
router.get('/', authenticate, notificationController.getAllNotifications);
router.get('/unread/count', authenticate, notificationController.getUnreadCount);
router.get('/unread/list', authenticate, notificationController.getUnreadNotifications);
router.get('/recent', authenticate, notificationController.getRecentNotifications);
router.get('/stats', authenticate, notificationController.getNotificationStats);
router.get('/type/:type', authenticate, notificationController.getNotificationsByType);
router.get('/:id', authenticate, notificationController.getNotificationById);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, authorize('admin'), notificationController.deleteNotification);

module.exports = router;
