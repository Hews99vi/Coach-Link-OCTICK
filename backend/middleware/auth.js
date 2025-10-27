// Create auth middleware: Extract Bearer token, verify with jsonwebtoken. 
// On fail, 401 {message: 'Unauthorized'}. Attach user to req.

const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT tokens
 * Protects routes that require coordinator authentication
 * Supports token from Authorization header or query parameter (for SSE)
 */
const authMiddleware = (req, res, next) => {
  try {
    let token = null;
    
    // Try to get token from Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // If no header token, try query parameter (for SSE connections)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided',
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

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Attach user information to request object
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    // Continue to next middleware or route handler
    next();

  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Token expired',
      });
    }

    // Handle other errors
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

/**
 * Optional middleware to check if user is coordinator
 * Use after authMiddleware
 */
const requireCoordinator = (req, res, next) => {
  if (!req.user || req.user.role !== 'coordinator') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden - Coordinator access required',
    });
  }
  next();
};

/**
 * Middleware to check if user has any of the allowed roles
 * Use after authMiddleware
 * @param {Array<string>} roles - Array of allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden - Requires one of these roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

/**
 * Middleware to check if user is viewer
 * Use after authMiddleware
 */
const requireViewer = (req, res, next) => {
  if (!req.user || req.user.role !== 'viewer') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden - Viewer access required',
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireCoordinator,
  requireRole,
  requireViewer,
};
