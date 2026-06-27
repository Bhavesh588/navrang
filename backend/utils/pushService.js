const { Expo } = require('expo-server-sdk');
const logger = require('./logger');

// Expo push notifications: https://docs.expo.dev/push-notifications/sending-notifications/
const expo = new Expo();

/**
 * Send a batch of push notifications via Expo.
 *
 * @param {Array<string>} pushTokens
 * @param {{ title: string, body: string, data?: any }} payload
 */
async function sendPushNotifications(pushTokens, payload) {
  if (!Array.isArray(pushTokens) || pushTokens.length === 0) return;

  const messages = pushTokens
    .filter((t) => Expo.isExpoPushToken(t))
    .map((pushToken) => ({
      to: pushToken,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {}
    }));

  if (messages.length === 0) {
    logger.warn('No valid Expo push tokens found', { pushTokens });
    return;
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      logger.error('Error sending push notifications chunk', { error: error.message });
    }
  }

  return tickets;
}

module.exports = {
  sendPushNotifications
};
