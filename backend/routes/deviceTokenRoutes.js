const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const deviceTokenController = require('../controllers/deviceTokenController');

// Register / update token for the currently authenticated user
router.post('/', authenticate, deviceTokenController.registerToken);

// Optional: unregister token (set inactive)
router.delete('/', authenticate, deviceTokenController.unregisterToken);

// Optional: list tokens for the current user
router.get('/', authenticate, deviceTokenController.getMyTokens);

module.exports = router;
