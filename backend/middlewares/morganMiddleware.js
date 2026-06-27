const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom morgan token for request ID
morgan.token('id', (req) => req.id || 'unknown');

// Custom morgan format with request ID (use built-in response-time, not custom)
const morganFormat = ':id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Stream to log through our logger
const stream = {
  write: (message) => {
    if (message && message.trim()) {
      logger.http(message.trim());
    }
  }
};

// Morgan middleware setup
const morganMiddleware = morgan(morganFormat, { 
  stream,
  // skip: (req, res) => {
  //   // Skip logging for health check endpoint
  //   return req.path === '/health';
  // }
});

module.exports = morganMiddleware;
