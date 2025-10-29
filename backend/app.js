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
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'],
  credentials: true,
};
app.use(cors(corsOptions));

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
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
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
