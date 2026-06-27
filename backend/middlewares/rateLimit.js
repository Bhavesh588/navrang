const logger = require('../utils/logger');

// Rate limiting middleware
const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    keyGenerator = (req) => req.ip
  } = options;

  const store = new Map();

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request history for this key
    if (!store.has(key)) {
      store.set(key, []);
    }

    const requests = store.get(key);

    // Remove old requests outside the window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    store.set(key, recentRequests);

    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      logger.warn('Rate limit exceeded', {
        key,
        requests: recentRequests.length,
        limit: maxRequests,
        route: req.path,
        requestId: req.id
      });

      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000),
        requestId: req.id
      });
    }

    // Add current request
    recentRequests.push(now);
    store.set(key, recentRequests);

    // Set Retry-After header
    res.set('Retry-After', Math.ceil(windowMs / 1000));

    next();
  };
};

module.exports = rateLimit;
