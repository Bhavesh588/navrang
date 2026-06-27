const logger = require('../utils/logger');
const { isAdmin, userBelongsToDepartment } = require('../utils/authorization');

// Authentication middleware - verify user exists in request
const authenticate = (req, res, next) => {
  try {
    console.log('Authenticating request for route:', req.user);
    if (!req.user) {
      logger.warn('Authentication failed - no user in request', {
        route: req.originalUrl,
        requestId: req.id
      });

      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        requestId: req.id
      });
    }

    next();
  } catch (error) {
    logger.error('Authentication check failed', {
      error: error.message,
      requestId: req.id
    });

    res.status(500).json({
      success: false,
      message: 'Authentication check failed',
      requestId: req.id
    });
  }
};

// Authorization middleware - check user role
const authorize = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          requestId: req.id
        });
      }

      // Admin has access to everything
      if (isAdmin(req.user.role_name)) {
        return next();
      }

      // Check specific role requirement
      if (requiredRole && req.user.role_name !== requiredRole) {
        logger.warn('Authorization failed - insufficient role', {
          required: requiredRole,
          actual: req.user.role_name,
          userId: req.user.id,
          route: req.path,
          requestId: req.id
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          requestId: req.id
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization check failed', {
        error: error.message,
        requestId: req.id
      });

      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        requestId: req.id
      });
    }
  };
};

// Department access middleware - verify user has access to department
const departmentAccess = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        requestId: req.id
      });
    }

    // Admin has access to all departments
    if (isAdmin(req.user.role_name)) {
      return next();
    }

    const departmentId = req.params.departmentId || req.body.department_id;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required',
        requestId: req.id
      });
    }

    // Check if user belongs to department
    userBelongsToDepartment(req.user.id, departmentId).then((hasAccess) => {
      if (!hasAccess) {
        logger.warn('Department access denied', {
          userId: req.user.id,
          departmentId,
          route: req.path,
          requestId: req.id
        });

        return res.status(403).json({
          success: false,
          message: 'You do not have access to this department',
          requestId: req.id
        });
      }

      next();
    }).catch((error) => {
      logger.error('Department access check failed', {
        error: error.message,
        requestId: req.id
      });

      res.status(500).json({
        success: false,
        message: 'Department access check failed',
        requestId: req.id
      });
    });
  } catch (error) {
    logger.error('Department access middleware error', {
      error: error.message,
      requestId: req.id
    });

    res.status(500).json({
      success: false,
      message: 'Access control check failed',
      requestId: req.id
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  departmentAccess
};
