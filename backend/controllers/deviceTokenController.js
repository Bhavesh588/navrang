const deviceTokenModel = require('../models/deviceTokenModel');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

module.exports = {
  // Register or update a device push token
  registerToken: asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { token, platform } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!token || !platform) {
      return res.status(400).json({ success: false, message: 'Token and platform are required' });
    }

    const record = await deviceTokenModel.createOrUpdateToken({
      user_id: userId,
      platform,
      push_token: token
    });

    logger.info('Registered device push token', {
      userId,
      platform,
      tokenPrefix: token.substring(0, 24)
    });

    res.json({ success: true, data: record, message: 'Push token registered' });
  }),

  // Deactivate a push token
  unregisterToken: asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    await deviceTokenModel.deactivateToken(token);

    res.json({ success: true, message: 'Push token unregistered' });
  }),

  // Optional: list tokens for the current user
  getMyTokens: asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const tokens = await deviceTokenModel
      .getTokensForUsers([userId]);

    res.json({ success: true, data: tokens, message: 'Tokens fetched' });
  })
};
