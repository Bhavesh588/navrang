const notificationQueueModel = require('../models/notificationQueueModel');
const { sendPushNotifications } = require('./pushService');
const logger = require('./logger');

const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_INTERVAL_MS = 15000; // 15 seconds

async function processQueue() {
  const items = await notificationQueueModel.getDueItems(DEFAULT_BATCH_SIZE);

  if (!items || items.length === 0) {
    return;
  }

  for (const item of items) {
    const payload = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;

    try {
      const tickets = await sendPushNotifications([item.push_token], payload);
      const hasError = Array.isArray(tickets) && tickets.some(ticket => ticket.status === 'error');

      if (hasError) {
        const errReason = tickets
          .filter(ticket => ticket.status === 'error')
          .map(ticket => ticket.details?.error || ticket.message)
          .join('; ');

        await handleFailure(item, errReason || 'Expo push ticket error');
      } else {
        await notificationQueueModel.markAsSent(item.id);
        logger.info('Push notification sent successfully from queue', { queueId: item.id, notificationId: item.notification_id });
      }
    } catch (error) {
      await handleFailure(item, error.message);
    }
  }
}

async function handleFailure(item, errorMessage) {
  const attempts = (item.attempts || 0) + 1;
  const max_attempts = item.max_attempts || 3;

  let nextRetryAt = null;
  if (attempts < max_attempts) {
    const delayMs = Math.pow(2, attempts - 1) * 60 * 1000; // 1m,2m,4m...
    nextRetryAt = new Date(Date.now() + delayMs);
  }

  await notificationQueueModel.markAsFailed(item.id, errorMessage, attempts, nextRetryAt);

  logger.warn('Queued notification delivery failed', {
    queueId: item.id,
    notificationId: item.notification_id,
    attempts,
    max_attempts,
    nextRetryAt,
    errorMessage
  });
}

let queueInterval;

function startProcessor({ intervalMs = DEFAULT_INTERVAL_MS } = {}) {
  if (queueInterval) {
    logger.info('Notification processor already running');
    return;
  }

  queueInterval = setInterval(async () => {
    try {
      await processQueue();
    } catch (error) {
      logger.error('Notification processor crashed', { error: error.message });
    }
  }, intervalMs);

  logger.info('Notification processor started', { intervalMs });
}

function stopProcessor() {
  if (queueInterval) {
    clearInterval(queueInterval);
    queueInterval = null;
    logger.info('Notification processor stopped');
  }
}

module.exports = {
  startProcessor,
  stopProcessor,
  processQueue
};