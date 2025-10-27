// Role-based authentication: Support multiple users with coordinator/viewer roles
// Coordinators have full access, viewers have read-only access

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get JWT token (supports coordinator and viewer roles)
 * @access  Public
 */
router.post(
  '/login',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { username, password } = req.body;

      // Find user by username
      const user = await User.findOne({
        where: { username, is_active: true },
      });

      // Check if user exists
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Validate password
      const isPasswordValid = await user.validatePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Update last login timestamp
      await user.update({ last_login: new Date() });

      // Get JWT secret from environment
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        console.error('JWT_SECRET not set in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error',
        });
      }

      // Create JWT payload
      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        iat: Date.now(),
      };

      // Sign JWT token with 1 hour expiration
      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      });

      // Return token and user info
      res.json({
        success: true,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          full_name: user.full_name,
          email: user.email,
        },
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during authentication',
      });
    }
  }
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify if token is valid
 * @access  Public
 */
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    res.json({
      success: true,
      valid: true,
      user: {
        username: decoded.username,
        role: decoded.role,
      },
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification',
    });
  }
});

module.exports = router;
