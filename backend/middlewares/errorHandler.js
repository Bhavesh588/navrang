const logger = require('../utils/logger');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Error occurred', {
    statusCode,
    message,
    stack: err.stack,
    route: req.path,
    method: req.method,
    requestId: req.id,
    userId: req.user?.id
  });

  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation failed',
      errors: err.errors || [{ message }],
      requestId: req.id
    });
  }

  // Database error
  if (err.name === 'DatabaseError' || err.code === 'PROTOCOL_ERROR') {
    return res.status(503).json({
      success: false,
      statusCode: 503,
      message: 'Database connection error',
      requestId: req.id
    });
  }

  // Authentication error
  if (err.name === 'UnauthorizedError' || statusCode === 401) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Unauthorized access',
      requestId: req.id
    });
  }

  // Authorization error
  if (statusCode === 403) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Access forbidden',
      requestId: req.id
    });
  }

  // Default error response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: process.env.NODE_ENV === 'development' ? message : 'An error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    requestId: req.id
  });
};

module.exports = errorHandler;
