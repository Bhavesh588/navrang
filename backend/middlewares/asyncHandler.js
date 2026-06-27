const logger = require('../utils/logger');

// Async handler middleware to catch errors in async route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    try {
      Promise.resolve(fn(req, res, next)).catch((error) => {
        logger.error('Async handler error', {
          error: error.message,
          stack: error.stack,
          route: req.path,
          method: req.method,
          requestId: req.id
        });
        next(error);
      });
    } catch (error) {
      logger.error('Sync error in async handler', {
        error: error.message,
        stack: error.stack,
        route: req.path,
        method: req.method,
        requestId: req.id
      });
      next(error);
    }
  };
};

module.exports = asyncHandler;
