const logger = require('../utils/logger');

// Request logging middleware with detailed information
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.debug('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    requestId: req.id,
    userId: req.user?.id
  });

  // Capture original end function
  const originalEnd = res.end;

  // Override end to log response
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;

    logger.debug('Outgoing response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.id,
      userId: req.user?.id
    });

    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1e6; // Convert to milliseconds

    if (duration > 1000) {
      logger.warn('Slow request detected', {
        duration: `${duration.toFixed(2)}ms`,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        requestId: req.id
      });
    }
  });

  next();
};

module.exports = {
  requestLogger,
  performanceMonitor
};
