// Set up Sequelize with SQLite. Include connection to a file-based DB 'app.db', 
// enable logging false in prod. Use dotenv for env vars.

require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

// Determine the database path - use env var or default to app.db in backend root
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'app.db');

// Create Sequelize instance with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  define: {
    // Use snake_case for automatically added timestamp fields
    underscored: true,
    // Add timestamps to all models by default
    timestamps: true,
    // Use createdAt and updatedAt instead of created_at and updated_at
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection has been established successfully.');
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error);
  }
};

// Only test connection if not in test environment
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

module.exports = sequelize;
