const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const logger = require('./utils/logger');
const requestId = require("./middlewares/requestId")
const { setRequestContext } = require("./utils/requestContext");
const attachUser = require('./middlewares/attachUser');
const morganMiddleware = require('./middlewares/morganMiddleware')
const { requestSizeLimit, sanitizeRequest } = require('./middlewares/security');
const rateLimit = require('./middlewares/rateLimit');

const { startProcessor, stopProcessor } = require('./utils/notificationProcessor');

const app = express();

// ========================
// HEALTH CHECK ENDPOINT (BEFORE ALL MIDDLEWARE)
// ========================

// Health check endpoint - must be before middleware to avoid any interference
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========================
// MIDDLEWARE SETUP
// ========================

// Request ID - must be first
app.use(requestId);

// Request Context - establish async context
app.use(setRequestContext);

// Security & Logging
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// HTTP Logging
app.use(morganMiddleware);

// Rate Limiting (100 requests per 15 minutes)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // max 100 requests per window
}));

// Security: Request validation & sanitization
app.use(requestSizeLimit()); // Default 10mb limit
app.use(sanitizeRequest);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ========================
// AUTH MIDDLEWARE (ATTACH USER)
// ========================

// Attach user from JWT token BEFORE routes
app.use(attachUser);

// ========================
// API ROUTES
// ========================

// Auth routes (login endpoint) - /auth endpoints at root level
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Main API routes (all models) - versioned to /api/v1
app.use('/api/v1', require('./routes'));

// File routes for uploads
const fileRoutes = require('./routes/fileRoutes');
app.use('/api/v1/files', fileRoutes);

// Report routes for exports
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/v1/reports', reportRoutes);

// ========================
// STATIC FILES & EXPORTS
// ========================

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// ========================
// ERROR HANDLING
// ========================

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error in route', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    requestId: req.id
  });
});

// Global Process-Level Handlers
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason });
  process.exit(1);
});

// ========================
// SERVER STARTUP
// ========================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    environment: NODE_ENV,
    timezone: process.env.TZ || 'UTC'
  });

  startProcessor();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  stopProcessor();
  logger.warn('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.warn('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
