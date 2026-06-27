const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware to attach user from JWT token
 * Reads Authorization header, verifies JWT, sets req.user
 */
const attachUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No auth header = continue (next middleware/route will handle)
    if (!authHeader) {
      return next();
    }

    // Extract token from "Bearer TOKEN_HERE"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];

    // Verify and decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Attach user to request
    req.user = decoded;
    
    logger.debug('User attached to request', {
      userId: req.user.id,
      userRole: req.user.role_name,
      path: req.path,
      requestId: req.id
    });

    next();
  } catch (error) {
    // Invalid/expired token - just continue, authenticate middleware will catch
    logger.debug('Invalid token', {
      error: error.message,
      path: req.path,
      requestId: req.id
    });
    next();
  }
};

module.exports = attachUser;
