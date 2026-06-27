const { v4: uuidv4 } = require('uuid');

// Middleware to set request context
const setRequestContext = (req, res, next) => {
  const requestId = req.id || uuidv4();
  const requestContext = {
    requestId,
    startTime: Date.now(),
    userId: req.user?.id,
    userRole: req.user?.role_name,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  };

  // Store context on request object
  req.context = requestContext;
  
  // Store in response locals for template use
  res.locals.context = requestContext;
  res.locals.requestId = requestId;
  
  next();
};

// Get current request context from req
const getRequestContext = (req) => {
  if (req && req.context) {
    return req.context;
  }
  return {};
};

// Get request ID from req
const getRequestId = (req) => {
  if (req && req.id) {
    return req.id;
  }
  if (req && req.context && req.context.requestId) {
    return req.context.requestId;
  }
  return 'unknown';
};

// Get user from context
const getUserFromContext = (req) => {
  const context = getRequestContext(req);
  return {
    id: context.userId,
    role: context.userRole
  };
};

// Get request duration
const getRequestDuration = (req) => {
  const context = getRequestContext(req);
  if (!context.startTime) return 0;
  return Date.now() - context.startTime;
};

module.exports = {
  setRequestContext,
  getRequestContext,
  getRequestId,
  getUserFromContext,
  getRequestDuration
};
