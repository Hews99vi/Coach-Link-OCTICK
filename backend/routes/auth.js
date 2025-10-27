// Implement POST /auth/login: Check username 'coordinator', compare password with bcrypt. 
// On success, sign JWT with secret from env, expire 1h. Return {token}. 
// On fail, 401 {message: 'Invalid credentials'}.

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Hardcoded coordinator credentials
const COORDINATOR_USERNAME = 'coordinator';

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate coordinator and get JWT token
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

      // Check if username matches coordinator
      if (username !== COORDINATOR_USERNAME) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Get hashed password from environment variable
      const hashedPassword = process.env.COORDINATOR_PASSWORD;

      if (!hashedPassword) {
        console.error('COORDINATOR_PASSWORD not set in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error',
        });
      }

      // Compare password with hashed password
      const isPasswordValid = await bcrypt.compare(password, hashedPassword);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

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
        username: COORDINATOR_USERNAME,
        role: 'coordinator',
        iat: Date.now(),
      };

      // Sign JWT token with 1 hour expiration
      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      });

      // Return token
      res.json({
        success: true,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        user: {
          username: COORDINATOR_USERNAME,
          role: 'coordinator',
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
