// Create Express app with middleware for CORS, body-parser, and routes. 
// Listen on port from env or 5000.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import database
const db = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const driverRoutes = require('./routes/drivers');
const vehicleRoutes = require('./routes/vehicles');
const analyticsRoutes = require('./routes/analytics');
const { router: eventsRoutes } = require('./routes/events');

// Create Express app
const app = express();

// Middleware
// Add morgan logging middleware to log method, path, status, duration in dev format
app.use(morgan('dev'));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// Express v5 doesn't support the '*' path in app.options; handle preflight manually
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const allowedOrigins = corsOptions.origin || [];
    const requestOrigin = req.headers.origin;
    if (Array.isArray(allowedOrigins) && requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    }
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    return res.sendStatus(204);
  }
  next();
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Coach-Link API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/events', eventsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Sync database and start server
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✓ Database connection established successfully');

    // Ensure tables exist (create if missing). In production this is safe on first boot.
    await db.sequelize.sync();
    console.log('✓ Database schema synced');

    // Seed default users if none exist
    try {
      const seedUsers = require('./seeders/seedUsers');
      await seedUsers();
    } catch (seedErr) {
      console.warn('User seeding step skipped or failed:', seedErr?.message || seedErr);
    }

    // Start listening
    const host = '0.0.0.0';
    app.listen(PORT, host, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API available at http://${host}:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
