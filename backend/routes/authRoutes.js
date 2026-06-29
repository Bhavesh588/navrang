const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const logger = require('../utils/logger');
const userModel = require('../models/userModel');
const roleModel = require('../models/roleModel');
const { authenticate } = require('../middlewares/auth');

/**
 * POST /auth/login
 * Issues JWT token for given credentials
 * Validates credentials against database with bcrypt
 * 
 * Request body:
 * {
 *   "email": "admin@test.com",
 *   "password": "password123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "token": "eyJhbGciOiJIUzI1NiIs...",
 *   "user": { "id", "name", "email", "role" }
 * }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // const new_password = "password123";

    // bcrypt.hash(new_password, 10, (err, hash) => {
    //   console.log("Hash: ", hash);
    // });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
        requestId: req.id
      });
    }

    // Look up user in database
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email, requestId: req.id });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        requestId: req.id
      });
    }

    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      logger.warn('Login attempt with wrong password', { email, userId: user.id, requestId: req.id });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        requestId: req.id
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
        role_name: user.role_name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    logger.info('User login successful', {
      email,
      userId: user.id,
      requestId: req.id
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role: user.role_name
      }
    });
  } catch (error) {
    logger.error('Login failed', {
      error: error.message,
      requestId: req.id
    });

    res.status(500).json({
      success: false,
      message: 'Login failed',
      requestId: req.id
    });
  }
});

/**
 * GET /auth/me
 * Returns current authenticated user from JWT token
 * Used on app start to verify session
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role_id: req.user.role_id,
        role: req.user.role_name
      },
      message: 'Current user retrieved successfully'
    });
  } catch (error) {
    logger.error('Error getting current user', {
      error: error.message,
      requestId: req.id
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get current user',
      requestId: req.id
    });
  }
});

module.exports = router;
