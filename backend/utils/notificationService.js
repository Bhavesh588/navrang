const notificationModel = require('../models/notificationModel');
const notificationQueueModel = require('../models/notificationQueueModel');
const deviceTokenModel = require('../models/deviceTokenModel');
const userModel = require('../models/userModel');
const logger = require('./logger');

/**
 * Create a notification record and queue push notifications for delivery.
 *
 * @param {{ type: string, referenceId: number, message: string, recipients?: { userIds?: number[] } }} options
 */
async function notify({ type, referenceId, message, recipients = {} }) {
  const notification = await notificationModel.createNotification({
    type,
    reference_id: referenceId,
    message,
    is_read: false
  });

  const adminIds = Array.isArray(recipients.userIds) && recipients.userIds.length > 0
    ? recipients.userIds
    : (await userModel.getAdmins()).map((u) => u.id);

  const tokenRows = await deviceTokenModel.getTokensForUsers(adminIds);
  const tokens = tokenRows.map((r) => r.push_token).filter(Boolean);

  const payload = {
    title: 'Navrang',
    body: message,
    data: {
      notificationId: notification.id,
      type,
      referenceId
    }
  };

  for (const token of tokens) {
    await notificationQueueModel.createItem({
      notification_id: notification.id,
      push_token: token,
      payload,
      next_retry_at: null
    });
  }

  if (tokens.length === 0) {
    logger.warn('No active push tokens found for notification queue', { notificationId: notification.id, adminIds });
  } else {
    logger.info('Notification queued for push delivery', { notificationId: notification.id, pushTokens: tokens.length });
  }

  return notification;
}

module.exports = {
  notify
};
