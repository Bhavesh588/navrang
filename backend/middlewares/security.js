const logger = require('../utils/logger');

// Request body size limit middleware
const requestSizeLimit = (limit = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.get('content-length');
    const maxSize = parseSize(limit);

    if (contentLength && parseInt(contentLength) > maxSize) {
      logger.warn('Request payload too large', {
        contentLength,
        limit,
        route: req.path,
        requestId: req.id
      });

      return res.status(413).json({
        success: false,
        message: `Request payload too large. Maximum size: ${limit}`,
        requestId: req.id
      });
    }

    next();
  };
};

// Parse size string to bytes
const parseSize = (size) => {
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };

  const match = size.toLowerCase().match(/^(\d+)\s*(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB

  const value = parseInt(match[1]);
  const unit = match[2] || 'b';

  return value * (units[unit] || 1);
};

// Sanitize request data
const sanitizeRequest = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    // Sanitize query
    if (req.query && typeof req.query === 'object') {
      sanitizeObject(req.query);
    }

    next();
  } catch (error) {
    logger.error('Request sanitization failed', {
      error: error.message,
      requestId: req.id
    });

    res.status(400).json({
      success: false,
      message: 'Invalid request data',
      requestId: req.id
    });
  }
};

// Recursively sanitize object values
const sanitizeObject = (obj) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        // Remove potential XSS vectors
        obj[key] = obj[key]
          .replace(/[<>]/g, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
};

module.exports = {
  requestSizeLimit,
  sanitizeRequest
};
