const logger = require('../utils/logger');
const { validateRequiredFields } = require('../utils/validators');

// Validate request body has required fields
const validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    if (requiredFields.length === 0) return next();

    const missing = validateRequiredFields(req.body, requiredFields);
    
    if (missing.length > 0) {
      logger.warn('Validation failed - missing fields', {
        missing,
        route: req.path,
        requestId: req.id
      });

      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missing,
        requestId: req.id
      });
    }

    next();
  };
};

// Validate query parameters
const validateQuery = (requiredParams = []) => {
  return (req, res, next) => {
    if (requiredParams.length === 0) return next();

    const missing = validateRequiredFields(req.query, requiredParams);
    
    if (missing.length > 0) {
      logger.warn('Validation failed - missing query params', {
        missing,
        route: req.path,
        requestId: req.id
      });

      return res.status(400).json({
        success: false,
        message: 'Missing required query parameters',
        missing,
        requestId: req.id
      });
    }

    next();
  };
};

module.exports = {
  validateBody,
  validateQuery
};
